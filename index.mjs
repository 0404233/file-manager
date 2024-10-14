import { homedir } from 'os';
import { dirname, join, parse } from 'path';
import { fileURLToPath } from 'url';
import { chdir, cwd } from 'process';
import { readdir, stat } from 'fs/promises';

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
console.log(`You are currently in ${cwd()}`);

process.on('SIGINT', () => {
  console.log(`\nThank you for using File Manager, ${username}, goodbye!`);
  console.log(`You are currently in ${cwd()}`);
  process.exit();
});

const doCommand = async (input) => {

  const [operation, ...files] = input.split(' ');

  switch (operation) {
    case 'up':
      const upFolder = join(currentLocation, '..');
      chdir(upFolder);
      currentLocation = cwd();
      console.log(`You are currently in ${cwd()}`);
    break;

    case 'cd':
      const chooseFolder = files[0];
      try {
        chdir(chooseFolder);
        currentLocation = cwd();
        console.log(`You are currently in ${cwd()}`);
      } catch {
        console.log('Invalid input');
      }
    
    break;

    case 'ls':
      try {
        const files = await readdir(currentLocation);
        const formatOfFile = await Promise.all(files.map(async file => {
          const format = await stat(join(currentLocation, file));

          return {
            name: file,
            type: format.isDirectory() ? 'directory' : 'file'
          };
        }));
        
        formatOfFile.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
        formatOfFile.forEach(file => {
          console.log(`${file.name} : ${file.type}`);
        })
      } catch {
        console.log('Invalid input');
      }
    
      break;

    case '.exit':
      console.log(`Thank you for using File Manager, ${username}, goodbye!`);
      console.log(`You are currently in ${cwd()}`);
      process.exit();
  }
}

const createInputLine = () => {

  process.stdin.on('data', (input) => {
    doCommand(input.toString().trim());
    createInputLine();
  });
};

createInputLine();