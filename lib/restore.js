const { writeFile } = require('./util/fs-extra');

async function restore(path, oldPkg) {
  await writeFile(path, oldPkg);
}

module.exports = restore;
