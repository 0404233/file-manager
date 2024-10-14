import { homedir, EOL, cpus } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chdir, cwd } from 'process';
import { readdir, stat, readFile, writeFile, unlink, rename, copyFile } from 'fs/promises';

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

    case 'cat':
      const showFile = files[0];
      try {
        console.log(await readFile(showFile, 'utf-8'));
      } catch {
        console.log('Invalid input');
      }

      break;

    case 'add':
      try {
        await writeFile(join(currentLocation, files[0]), '');
        console.log(`Add new file - ${files[0]}`)
      } catch {
        console.log('Invalid input');
      }

      break;

    case 'rn':
      const [name, newName] = files;
      try {
        await rename(name, newName);
        console.log(`File ${name} rename to ${newName}`)
      } catch {
        console.log('Invalid input');
      }

      break;

    case 'cp':
      const [file, pathToCopy] = files;
      try {
        await copyFile(file, pathToCopy);
        console.log(`File ${file} copied to ${pathToCopy}`);
      } catch {
        console.log('Invalid input');
      }

      break;

    case 'mv':
      const [fileMove, placeToMove] = files;
      try {
        await copyFile(fileMove, placeToMove);
        await unlink(fileMove);
        console.log(`File ${fileMove} moved to ${placeToMove}`);
      } catch {
        console.log('Invalid input');
      }

      break;

    case 'rm':
      try {
        await unlink(files[0]);
        console.log(`${files[0]} delete.`);
      } catch {
        console.log('Invalid input');
      }

      break;

    case 'os':
      switch (files[0]) {
        case '--EOL':
          console.log(`EOL: ${JSON.stringify(EOL)}`);
          break;

        case '--cpus':
          console.log(`Number of CPUs: ${cpus().length}`);
          cpus().forEach(cpu => console.log(`CPU: ${cpu.model}, Speed: ${cpu.speed}`));
          break;

        case '--homedir':
          console.log(`Home directory: ${homedir()}`);
          break;

        case '--username':
          console.log(`Username: ${process.env.USERNAME}`);
          break;

        case '--architecture':
          console.log(`Architecture: ${process.arch}`);
          break;

        default:
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