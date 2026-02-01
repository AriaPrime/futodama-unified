/**
 * Philips Hue Control Script
 * Usage: node hue.js <command> [options]
 * 
 * Commands:
 *   list                    - List all lights
 *   on [id|name|all]        - Turn on light(s)
 *   off [id|name|all]       - Turn off light(s)
 *   brightness <id> <0-254> - Set brightness
 *   color <id> <r> <g> <b>  - Set color (color lights only)
 *   scene                   - List scenes
 */

const https = require('https');
const path = require('path');
const config = require(path.join(__dirname, '../../credentials/hue-bridge.json'));

const BASE_URL = `https://${config.ip}/api/${config.username}`;
const command = process.argv[2] || 'list';
const args = process.argv.slice(3);

// Disable SSL verification for local bridge
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function apiCall(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function findLight(query) {
  const lights = await apiCall('/lights');
  
  // By ID
  if (lights[query]) return { id: query, ...lights[query] };
  
  // By name (partial match)
  for (const [id, light] of Object.entries(lights)) {
    if (light.name.toLowerCase().includes(query.toLowerCase())) {
      return { id, ...light };
    }
  }
  return null;
}

async function main() {
  try {
    switch (command) {
      case 'list': {
        const lights = await apiCall('/lights');
        console.log('\n💡 Lights:\n');
        for (const [id, light] of Object.entries(lights)) {
          const status = light.state.on ? '🟢 ON' : '⚫ OFF';
          const bri = Math.round((light.state.bri / 254) * 100);
          console.log(`  [${id}] ${light.name}`);
          console.log(`      ${status} | Brightness: ${bri}% | ${light.productname}`);
        }
        break;
      }
      
      case 'on': {
        const target = args[0] || 'all';
        if (target === 'all') {
          const lights = await apiCall('/lights');
          for (const id of Object.keys(lights)) {
            await apiCall(`/lights/${id}/state`, 'PUT', { on: true });
          }
          console.log('✅ All lights ON');
        } else {
          const light = await findLight(target);
          if (light) {
            await apiCall(`/lights/${light.id}/state`, 'PUT', { on: true });
            console.log(`✅ ${light.name} ON`);
          } else {
            console.log('❌ Light not found:', target);
          }
        }
        break;
      }
      
      case 'off': {
        const target = args[0] || 'all';
        if (target === 'all') {
          const lights = await apiCall('/lights');
          for (const id of Object.keys(lights)) {
            await apiCall(`/lights/${id}/state`, 'PUT', { on: false });
          }
          console.log('✅ All lights OFF');
        } else {
          const light = await findLight(target);
          if (light) {
            await apiCall(`/lights/${light.id}/state`, 'PUT', { on: false });
            console.log(`✅ ${light.name} OFF`);
          } else {
            console.log('❌ Light not found:', target);
          }
        }
        break;
      }
      
      case 'brightness': {
        const [target, level] = args;
        const light = await findLight(target);
        if (light) {
          const bri = Math.min(254, Math.max(1, parseInt(level)));
          await apiCall(`/lights/${light.id}/state`, 'PUT', { on: true, bri });
          console.log(`✅ ${light.name} brightness: ${Math.round((bri/254)*100)}%`);
        } else {
          console.log('❌ Light not found:', target);
        }
        break;
      }
      
      case 'scene': {
        const scenes = await apiCall('/scenes');
        console.log('\n🎬 Scenes:\n');
        for (const [id, scene] of Object.entries(scenes)) {
          console.log(`  [${id}] ${scene.name}`);
        }
        break;
      }
      
      default:
        console.log('Unknown command. Use: list, on, off, brightness, scene');
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

main();
