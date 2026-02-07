#!/usr/bin/env node
/**
 * YouTube Player for Aria Node
 * Downloads audio from YouTube and plays it on the connected phone.
 * Zero token cost — all local tooling.
 * 
 * Usage:
 *   node scripts/youtube-player.js <youtube-url> [--duration 30] [--start 0:00]
 *   node scripts/youtube-player.js "https://youtu.be/OjsUaunN81c"
 *   node scripts/youtube-player.js "https://youtu.be/OjsUaunN81c" --duration 60
 *   node scripts/youtube-player.js "https://youtu.be/OjsUaunN81c" --full
 */

const http = require('http');
const https = require('https');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Config
const VOICE_RECEIVER_PORT = 9999;
const VOICE_RECEIVER_HOST = 'localhost';
const OPENCLAW_CMD = 'C:\\Users\\ARIA_PRIME\\AppData\\Roaming\\npm\\openclaw.cmd';
const YTDLP = 'C:\\Users\\ARIA_PRIME\\AppData\\Local\\Microsoft\\WinGet\\Links\\yt-dlp.exe';
const FFMPEG_DIR = 'C:\\Users\\ARIA_PRIME\\AppData\\Local\\Microsoft\\WinGet\\Links';
const TEMP_DIR = 'C:\\tmp';

// Ensure yt-dlp and ffmpeg are in PATH
process.env.PATH = FFMPEG_DIR + ';' + process.env.PATH;
const TAILSCALE_AUDIO_URL = 'https://aria-palace.tail7b3df7.ts.net/voice/audio.mp3';

// Parse args
const args = process.argv.slice(2);
const url = args.find(a => !a.startsWith('--'));
const fullSong = args.includes('--full');
const durationIdx = args.indexOf('--duration');
const duration = durationIdx !== -1 ? parseInt(args[durationIdx + 1]) : (fullSong ? 0 : 60);
const startIdx = args.indexOf('--start');
const startTime = startIdx !== -1 ? args[startIdx + 1] : '0:00';

if (!url) {
  console.log('🎵 Aria YouTube Player');
  console.log('');
  console.log('Usage: node youtube-player.js <url> [options]');
  console.log('');
  console.log('Options:');
  console.log('  --full          Play entire track');
  console.log('  --duration <s>  Duration in seconds (default: 60)');
  console.log('  --start <time>  Start time (e.g. 1:30)');
  console.log('');
  console.log('Examples:');
  console.log('  node youtube-player.js "https://youtu.be/OjsUaunN81c" --full');
  console.log('  node youtube-player.js "https://youtu.be/OjsUaunN81c" --duration 30');
  process.exit(1);
}

async function main() {
  try {
    console.log('🎵 Aria YouTube Player');
    console.log('═══════════════════════════════');
    
    // Step 1: Get video info
    console.log('\n📋 Fetching video info...');
    const infoJson = execSync(`${YTDLP} --dump-json --no-download "${url}"`, { 
      encoding: 'utf-8',
      timeout: 30000 
    });
    const info = JSON.parse(infoJson);
    console.log(`   Title: ${info.title}`);
    console.log(`   Channel: ${info.channel || info.uploader}`);
    console.log(`   Duration: ${formatDuration(info.duration)}`);
    
    // Step 2: Download thumbnail
    const thumbnailUrl = info.thumbnail;
    console.log(`\n🖼️  Thumbnail: ${thumbnailUrl}`);
    const thumbPath = path.join(TEMP_DIR, 'now-playing-thumb.jpg');
    try {
      execSync(`curl.exe -sL -o "${thumbPath}" "${thumbnailUrl}"`, { timeout: 15000 });
      console.log(`   Saved to: ${thumbPath}`);
    } catch (e) {
      console.log('   (thumbnail download failed, continuing without)');
    }
    
    // Step 3: Download audio
    console.log('\n🔽 Downloading audio...');
    const outputFile = path.join(TEMP_DIR, 'now-playing.%(ext)s');
    const outputMp3 = path.join(TEMP_DIR, 'now-playing.mp3');
    
    // Clean up old file
    try { fs.unlinkSync(outputMp3); } catch {}
    
    let dlCmd = `${YTDLP} -x --audio-format mp3 --audio-quality 192K`;
    
    if (!fullSong && duration > 0) {
      const endTime = addTime(startTime, duration);
      dlCmd += ` --download-sections "*${startTime}-${endTime}"`;
      console.log(`   Section: ${startTime} to ${endTime} (${duration}s)`);
    }
    
    dlCmd += ` -o "${outputFile}" "${url}"`;
    
    execSync(dlCmd, { stdio: 'pipe', timeout: 120000 });
    
    if (!fs.existsSync(outputMp3)) {
      throw new Error('MP3 file not created');
    }
    
    const fileSize = fs.statSync(outputMp3).size;
    console.log(`   ✅ Downloaded: ${(fileSize / 1024).toFixed(0)}KB`);
    
    // Step 4: Load into voice receiver
    console.log('\n📤 Loading into voice receiver...');
    const audioBase64 = fs.readFileSync(outputMp3).toString('base64');
    
    await postJson(`http://${VOICE_RECEIVER_HOST}:${VOICE_RECEIVER_PORT}/push-tts`, {
      audioBase64,
      // Don't auto-play via push-tts, we'll invoke manually for better control
    });
    console.log('   ✅ Audio loaded');
    
    // Step 5: Find connected node
    console.log('\n📱 Finding connected phone...');
    const nodeId = await findConnectedNode();
    if (!nodeId) {
      console.log('   ❌ No phone connected! Open Aria Node app.');
      console.log('   Audio is still available at: ' + TAILSCALE_AUDIO_URL);
      process.exit(1);
    }
    console.log(`   ✅ Found: ${nodeId.substring(0, 16)}...`);
    
    // Step 6: Send screen display (thumbnail + title)
    console.log('\n🖼️  Updating phone display...');
    const displayParams = {
      title: info.title,
      subtitle: info.channel || info.uploader,
      imageUrl: thumbnailUrl,
      isPlaying: true,
    };
    const displayCmd = `"${OPENCLAW_CMD}" nodes invoke --node ${nodeId} --command screen.display --params "${JSON.stringify(displayParams).replace(/"/g, '\\"')}" --invoke-timeout 10000`;
    
    try {
      execSync(displayCmd, { timeout: 15000, stdio: 'pipe' });
      console.log('   ✅ Display updated');
    } catch (e) {
      console.log('   ⚠️  Display update timed out (continuing to play)');
    }

    // Step 7: Play!
    console.log('\n🔊 Playing on phone...');
    const playCmd = `"${OPENCLAW_CMD}" nodes invoke --node ${nodeId} --command audio.play --params "{\\"url\\": \\"${TAILSCALE_AUDIO_URL}\\"}" --invoke-timeout 30000`;
    
    try {
      execSync(playCmd, { timeout: 35000, stdio: 'pipe' });
      console.log('   ✅ Playing!');
    } catch (e) {
      // Invoke might "timeout" but still play (known behavior)
      console.log('   ⚠️  Invoke timed out (audio may still be playing — this is normal)');
    }
    
    // Print now-playing card
    console.log('\n═══════════════════════════════');
    console.log(`🎵 NOW PLAYING`);
    console.log(`   ${info.title}`);
    console.log(`   ${info.channel || info.uploader}`);
    if (!fullSong && duration > 0) {
      console.log(`   ${startTime} → +${duration}s`);
    } else {
      console.log(`   Full track (${formatDuration(info.duration)})`);
    }
    console.log('═══════════════════════════════');
    
    // Output JSON for programmatic use
    const result = {
      title: info.title,
      channel: info.channel || info.uploader,
      duration: info.duration,
      thumbnailUrl,
      thumbnailPath: fs.existsSync(thumbPath) ? thumbPath : null,
      audioPath: outputMp3,
      audioUrl: TAILSCALE_AUDIO_URL,
      nodeId,
    };
    
    // Write now-playing state
    fs.writeFileSync(path.join(TEMP_DIR, 'now-playing.json'), JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function addTime(startStr, durationSec) {
  const parts = startStr.split(':').map(Number);
  let totalSec;
  if (parts.length === 3) totalSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
  else if (parts.length === 2) totalSec = parts[0] * 60 + parts[1];
  else totalSec = parts[0];
  
  totalSec += durationSec;
  
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const parsed = new URL(url);
    
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 30000,
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
    
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(body);
    req.end();
  });
}

async function findConnectedNode() {
  return new Promise((resolve) => {
    const cmd = `"${OPENCLAW_CMD}" nodes status --json`;
    const proc = spawn(cmd, [], { shell: true, timeout: 10000 });
    
    let stdout = '';
    proc.stdout.on('data', d => stdout += d);
    
    proc.on('close', () => {
      try {
        const json = JSON.parse(stdout);
        const nodes = json.nodes || json;
        const connected = (Array.isArray(nodes) ? nodes : [])
          .find(n => n.connected && n.caps && n.caps.includes('audio'));
        resolve(connected ? connected.nodeId : null);
      } catch {
        resolve(null);
      }
    });
    
    proc.on('error', () => resolve(null));
  });
}

main();
