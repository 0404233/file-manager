import { homedir } from 'os';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
let username = '';

args.forEach(arg => {
  if (arg.startsWith('--username=')) {
    username = arg.split('=')[1];
  }
});

if (username === '%npm_config_username%') {
  console.log('Username not provided!');
  process.exit(1);
}

console.log(`Welcome to the File Manager, ${username}!`);
console.log(`You are currently in ${homedir()}`);