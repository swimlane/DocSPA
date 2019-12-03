const { resolve } = require('path');

module.exports.getProjects = function getProjects() {
  const { projects } = require('../angular.json');
  return Object.keys(projects).map(key => {
    const path = resolve(__dirname, '../', projects[key].root);
    return {
      ...projects[key],
      path
    };
  }).filter(project => project.root !== '');
}
