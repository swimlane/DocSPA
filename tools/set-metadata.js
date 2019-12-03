/* The following code is from https://github.com/ngxs/store/blob/master/tools/set-metadata.ts */

const { writeFile } = require('fs');
const { getProjects } = require('./utils');

const pkg = require('../package.json');

async function main() {
  const keysToCopy = [
    'version',
    'repository',
    'keywords',
    'author',
    'authors',
    'contributors',
    'license',
    'bugs',
    'homepage'
  ];

  const packages = getProjects();
  for (const pack of packages) {
    const packPath = `${pack.path}/package.json`;
    const packPackage = require(packPath);

    // copy all meta data from the root package.json into all packages
    for (const key of keysToCopy) {
      packPackage[key] = pkg[key];
    }

    // save the package file after we have updated the keys and peerDependencies
    await writeFile(packPath, JSON.stringify(packPackage, null, 2), err => {
      if (err) {
        console.error('Write failed!');
      }
    });
  }

  console.log(`package version set to ${pkg.version}`);
}

main();
