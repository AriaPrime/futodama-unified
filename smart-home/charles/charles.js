/**
 * Charles the Roomba - Control Script
 * Usage: node charles.js <command>
 * Commands: status, start, stop, pause, resume, dock, find
 */

const dorita980 = require('dorita980');
const path = require('path');
const config = require(path.join(__dirname, '../../credentials/charles-roomba.json'));

const command = process.argv[2] || 'status';

console.log(`🤖 Connecting to ${config.name}...`);

const charles = new dorita980.Local(config.blid, config.password, config.ip);

charles.on('connect', async () => {
  try {
    switch (command) {
      case 'status':
        const state = await charles.getRobotState([
          'batPct', 'cleanMissionStatus', 'dock', 'bin', 'pose'
        ]);
        console.log(`\n📊 ${config.name} Status:`);
        console.log(`   🔋 Battery: ${state.batPct}%`);
        console.log(`   📍 Phase: ${state.cleanMissionStatus?.phase || 'unknown'}`);
        console.log(`   🏠 Docked: ${state.dock ? 'Yes' : 'No'}`);
        console.log(`   🗑️  Bin: ${state.bin?.present ? 'Present' : 'Missing'}${state.bin?.full ? ' (FULL!)' : ''}`);
        console.log(`   📈 Total missions: ${state.cleanMissionStatus?.nMssn || '?'}`);
        break;
        
      case 'start':
        await charles.start();
        console.log('✅ Cleaning started!');
        break;
        
      case 'stop':
        await charles.stop();
        console.log('✅ Stopped!');
        break;
        
      case 'pause':
        await charles.pause();
        console.log('✅ Paused!');
        break;
        
      case 'resume':
        await charles.resume();
        console.log('✅ Resumed!');
        break;
        
      case 'dock':
        await charles.dock();
        console.log('✅ Returning to dock!');
        break;
        
      case 'find':
        await charles.find();
        console.log('✅ Charles is making noise so you can find him!');
        break;
        
      default:
        console.log('Unknown command. Use: status, start, stop, pause, resume, dock, find');
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
  
  charles.end();
  process.exit(0);
});

charles.on('error', (err) => {
  console.log('❌ Connection error:', err.message);
  process.exit(1);
});

// Timeout safety
setTimeout(() => {
  console.log('⏰ Timeout - Charles may be busy or unreachable');
  process.exit(1);
}, 30000);
