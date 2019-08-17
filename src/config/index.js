const path = require('path');
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';

let base = {
  env,
  isDev: env === 'development',
  isTest: env === 'test',
};

const envConfig = require(`./${env}.js`); // eslint-disable-line

base = {
  ...base,
  ...envConfig,
};

const loadLocalConfig = (name) => {
  const localConfigPath = path.join(__dirname, name);
  if (fs.existsSync(localConfigPath)) {
    base = Object.assign({}, base, require(localConfigPath)); // eslint-disable-line
    console.log(`loaded ${localConfigPath} config`); // eslint-disable-line
  }
};

// local file can be used to customize any config values during development
if (base.env === 'test') {
  loadLocalConfig('test-local.js');
} else {
  loadLocalConfig('local.js');
}
module.exports = base;
