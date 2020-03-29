const { exec } = require('child_process');
const logger = require('./util/logger');

const excluePkg = ['npm-lock2yarn'];

/**
 * @param {*} pkgNameAndVersion will be download package list str
 * @param {*} sign what's type of dependencies? D —— devDependencies S - dependencies
 */
function downloadPkg(pkgNameAndVersion, sign) {
  return new Promise((resolve, reject) => {
    exec(`yarn add ${pkgNameAndVersion} -${sign}`, (error, stdout) => {
      if (error) {
        logger.warn('download fail');
        reject(error);
        return;
      }
      logger.log(stdout);
      resolve();
    });
  });
}

/**
 * @param {*} list object package dependencies
 * @param {*} sign what's type of dependencies? D —— devDependencies S - dependencies
 */
async function downloadList(list, sign) {
  if (!list) {
    return;
  }

  const pkgAndVersionArr = Object.keys(list).map((key) => {
    // exclue package arr
    if (excluePkg.includes(key)) {
      return '';
    }
    const pkgName = key;
    const version = list[key].replace(/^(\^|~)/, () => '');
    return `${pkgName}@${version}`;
  });
  // filter exclue package with return empty string
  const pkgAndVersionStr = pkgAndVersionArr
    .filter((str) => str !== '')
    .join(' ');
  await downloadPkg(pkgAndVersionStr, sign);
}

async function migrate(pkg) {
  if (typeof pkg !== 'object') {
    logger.error('please execute this command in the directory containing package.json');
  }
  // read package devDependcies and dependencies
  const devPkg = pkg.devDependencies;
  const prodPkg = pkg.dependencies;
  await downloadList(devPkg, 'D');
  await downloadList(prodPkg, 'S');
}

module.exports = migrate;
