// eslint-disable-next-line
const root = process.cwd();

const path = require('path');

const pkgPath = path.join(root, './package.json');
const pkg = require(pkgPath);
const { program } = require('commander');
const logger = require('./util/logger');

// command handle
const migrate = require('./migrate');
const restore = require('./restore');
const pkgSyncLock = require('./sync');

const config = {
  defaultCommand: 'migrate',
};

program.version(pkg.version, '-v, --version', 'output th current version');

program
  .option('-m, --migrate', 'migrate npm lock to yarn')
  .option('-t, --verify', 'verify yarn.lock');
// eslint-disable-next-line
program.parse(process.argv);

function checkInputOpts() {
  const opts = program.opts();
  let hasOpt = false;
  Object.keys(opts).forEach((opt) => {
    if (opt !== 'version' && opts[opt]) {
      hasOpt = true;
    }
  });
  return hasOpt;
}

async function lock2yarn() {
  logger.info('migrate start...');
  await migrate(pkg, root);
  logger.log('restore package.json file');
  await restore(pkgPath, JSON.stringify(pkg, null, 2));
  logger.log('sync package.json dependency version with yarn.lock');
  await pkgSyncLock(path.join(root, './yarn.lock'), pkg);
  logger.success('migrate npm lock to yarn lock for all package success!!! 🎉🎉🎉');
}

async function verify() {
  logger.info('verify start...');
  logger.warn('verify lock.yarn is not unsupported now');
}

const commands = new Map();
commands.set('migrate', lock2yarn);
commands.set('verify', verify);
// eslint-disable-next-line
!function start() {
  if (checkInputOpts()) {
    // eslint-disable-next-line
    for (let [command, fn] of commands) {
      if (program[command]) {
        // eslint-disable-next-line
        typeof fn === 'function' && fn();
      }
    }
  } else {
    // user not input opt, use default command
    const fn = commands.get(config.defaultCommand);
    if (!fn) {
      logger.error('please set correct default command');
    }
    fn();
  }
}() // eslint-disable-line
