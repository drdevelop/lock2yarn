// get package dependency version prefix
// for example: gulp: ^4.0.0 ——> gulp: ^
const logger = require('./logger');

/**
 * @param {{}} pkg package.json info
 * @returns - {gulp: {prefix: '^', version: '2.0.0'}
 */
function getPrefix(pkg) {
  if (!pkg) {
    logger.error('请传入正确的包信息');
    return {};
  }
  const prefixes = {};
  const { devDependencies = {}, dependencies = {} } = pkg;
  const pkgs = { ...devDependencies, ...dependencies };
  Object.keys(pkgs).forEach((pkgName) => {
    prefixes[pkgName] = {};
    prefixes[pkgName].version = pkgs[pkgName].replace(/^[\^|~]/, (match) => {
      prefixes[pkgName].prefix = match;
      return '';
    });
  });
  return prefixes;
}

module.exports = getPrefix;
