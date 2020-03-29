const { exec } = require('child_process');
const path = require('path');
const logger = require('./util/logger');
const selfPkg = require('../package.json');
const { writeFile } = require('./util/fs-extra');

const excludePkg = [selfPkg.name || 'lock2yarn'];

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
    const pkgName = key;
    const version = list[key].replace(/^(\^|~)/, () => '');
    return `${pkgName}@${version}`;
  });
  // filter exclue package with return empty string
  const pkgAndVersionStr = pkgAndVersionArr
    .filter((str) => str !== '')
    .join(' ');
  if (!pkgAndVersionStr.trim()) return;
  await downloadPkg(pkgAndVersionStr, sign);
}

function clearExcludePkg(devPkg = {}, prodPkg = {}) {
  for (let i = 0; i < excludePkg.length; i++) {
    if (devPkg[excludePkg[i]]) {
      // eslint-disable-next-line
      delete devPkg[excludePkg[i]];
    }
    if (prodPkg[excludePkg[i]]) {
      // eslint-disable-next-line
      delete prodPkg[excludePkg[i]];
    }
  }
}

async function migrate(oldPkg, root) {
  const pkg = {
    ...oldPkg,
    devDependencies: { ...oldPkg.devDependencies },
    dependencies: { ...oldPkg.dependencies },
  };
  if (typeof pkg !== 'object') {
    logger.error('please execute this command in the directory containing package.json');
  }
  // read package devDependcies and dependencies
  const devPkg = pkg.devDependencies;
  const prodPkg = pkg.dependencies;
  clearExcludePkg(devPkg, prodPkg);
  const pkgPath = path.join(root, './package.json');
  const pkgStr = JSON.stringify(pkg);
  await writeFile(pkgPath, pkgStr);
  await downloadList(devPkg, 'D');
  await downloadList(prodPkg, 'S');
}

module.exports = migrate;
