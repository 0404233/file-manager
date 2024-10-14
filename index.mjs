import { homedir } from 'os';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { chdir, cwd } from 'process';

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

let currentLocation = homedir();
chdir(currentLocation);

process.on('SIGINT', () => {
  console.log(`\nThank you for using File Manager, ${username}, goodbye!`);
  console.log(`You are currently in ${cwd()}`);
  process.exit();
});

const doCommand = async (input) => {
  if (input === '.exit') {
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
    console.log(`You are currently in ${cwd()}`);
    process.exit();
  }
}

const createInputLine = () => {
  console.log(`You are currently in ${cwd()}`);

  process.stdin.on('data', (input) => {
    doCommand(input.toString().trim());
    createInputLine();
  });
};

createInputLine();