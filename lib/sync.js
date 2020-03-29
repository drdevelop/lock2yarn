// The principle of this plugin is read package.json's devDependencies and dependencies
// then install exact version with package
// for example gulp: ^4.0.0 ————> yarn add gulp@4.0.0
// when yarn install，it will compare yarn.lock file about package version dependency info

// exec yarn add gulp@4.0.0 command will add these info in yarn.lock
// but when yarn install, it compare 4.0.0 same as in ^4.0.0 package.json
// if that is difference, it will install newest version about ^4.0.0
// so gulp@4.0.0 need force modify to gulp@^4.0.0
// This install will detect the consistency,
// the lock will take effect,
// and then download the address version of the resolved field
/**
  gulp@4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/gulp/-/gulp-4.0.0.tgz#95766c601dade4a77ed3e7b2b6dc03881b596366"
  integrity sha1-lXZsYB2t5Kd+0+eyttwDiBtZY2Y=
  dependencies:
    glob-watcher "^5.0.0"
    gulp-cli "^2.0.0"
    undertaker "^1.0.0"
    vinyl-fs "^3.0.0"
*/

const lockfile = require('@yarnpkg/lockfile');
const { readFile, writeFile } = require('./util/fs-extra');
const getPrefix = require('./util/prefix');

// parse yarn.lock file into object tree,
// and modify each package's pkgName@version
// same as package.json's package version info
async function pkgSyncLock(yarnLockPath, pkg) {
  const file = await readFile(yarnLockPath, 'utf8');
  const json = lockfile.parse(file);
  const prefixes = getPrefix(pkg);
  const pkgNames = Object.keys(prefixes);
  for (let i = 0; i < pkgNames.length; i++) {
    const { prefix, version } = prefixes[pkgNames[i]];
    json.object[`${pkgNames[i]}@${prefix}${version}`] = json.object[`${pkgNames[i]}@${version}`];
    delete json.object[`${pkgNames[i]}@${version}`];
  }
  const fileAgain = lockfile.stringify(json.object);

  await writeFile('./yarn.lock', fileAgain);
}

module.exports = pkgSyncLock;
