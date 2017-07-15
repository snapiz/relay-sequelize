const sequelize = require('./data/sequelize');
const sequelize_fixtures = require('sequelize-fixtures');

before(function () {
  return sequelize.sync({ force: true }).then(function () {
    return sequelize_fixtures.loadFile('./test/data/fixtures.yml', sequelize.models);
  })
});