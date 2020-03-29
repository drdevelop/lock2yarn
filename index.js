const root = process.cwd();

const path = require('path');
const logger = require('./lib/util/logger');

// command handle
const migrate = require('./lib/migrate');
const restore = require('./lib/restore');
const pkgSyncLock = require('./lib/sync');

/**
 * @param {*} pkgPath package.json file path
 */
async function lock2yarn(pkgPath) {
  let realPkgPath = pkgPath;
  if (!realPkgPath) {
    logger.error('please input package.json file path');
  }
  if (!path.isAbsolute(realPkgPath)) {
    realPkgPath = path.join(root, realPkgPath);
  }
  const pkg = require(realPkgPath);
  logger.info('migrate start...');
  await migrate(pkg, root);
  await restore(pkgPath, JSON.stringify(pkg, null, 2));
  await pkgSyncLock(path.join(root, './yarn.lock'), pkg);
  logger.success('migrate npm lock to yarn lock for all package success!!! 🎉🎉🎉');
}

module.exports = lock2yarn;
