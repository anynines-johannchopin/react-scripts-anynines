const fs = require('fs');
const paths = require('react-scripts/config/paths');
const package = require(`${paths.appPackageJson}`)

const CORE = 'core';
const IMPLEMENTATION = 'implementation';

/**
 * Checks if happy-mobile is present as a package dependency,
 * otherwise assumes to be running happy-mobile itself.
 * 
 * @returns {String}
 */
function evaluateHappyMode() {
  if (
    package.dependencies
    && typeof package.dependencies['happy-mobile'] === 'string'
  ) {
    return IMPLEMENTATION;
  } else {
    return CORE
  }
}

/**
 * Returns the absolute path to the happy source files
 * based on the result of evaluateHappyMode.
 * 
 * @returns path: String
 */
function getHappySrcPath() {
  if (evaluateHappyMode() === IMPLEMENTATION) {
    return `${paths.appNodeModules}/happy-mobile/src/*`
  } else {
    return `${paths.appSrc}/*`
  }
}

const tsPaths = {
  '@root/*': [`${paths.appPath}/*`],
  '@rootSrc/*': [`${paths.appPath}/src/*`],
  '@src/*': [getHappySrcPath()]
}

/**
 * Creates a new tsconfig.paths.json
 */
function create() {
  const tsOptions = {
    compilerOptions: {
      baseUrl: `${paths.appPath}`,
      paths: tsPaths
    }
  };

  const config = JSON.stringify(tsOptions, null, 2)
  console.log('Created path aliases: ', config);
  const configPath = `${paths.appPath}/tsconfig.paths.json`;
  fs.writeFileSync(configPath, config)
}

/**
 * Writes the current happy-mobile aias parameters into tsconfig.paths.json 
 * or creates a new file in case of an error.
 */
function rewrite() {
  const configPath = `${paths.appPath}/tsconfig.paths.json`;
  let configFileContent = fs.readFileSync(configPath, { encoding: 'utf-8' });

  try {
    const config = JSON.parse(configFileContent)

    config.paths = {
      ...config.paths,
      ...tsPaths
    }

    console.log(config);
    configFileContent = JSON.stringify(config, null, 2)
    fs.writeFileSync(configPath, config);

  } catch {
    console.log('ERROR: Could not parse TypeScript aliases. Creating new tsconfig.paths.json...');
    create();
  }
}

create()

module.exports = {
  create: create,
  rewrite: rewrite
}