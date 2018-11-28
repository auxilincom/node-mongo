const monk = require('monk');

const MongoService = require('./MongoService');
const MongoQueryService = require('./MongoQueryService');

const idGenerator = require('./idGenerator');

const logger = global.logger || console;

/**
* Inits connection with mongodb, manage reconnects, create factory methods
*
* @return {Object} with a factory method {createService}, that creates a
* mongodb service
*/
const connect = (connectionString) => {
  // options docs: http://mongodb.github.io/node-mongodb-native/2.1/reference/connecting/connection-settings/
  const db = monk(connectionString, {
    connectTimeoutMS: 20000,
  });

  db.on('error-opening', (err) => {
    logger.error(err, 'Failed to connect to the mongodb on start');
    throw err;
  });

  db.on('open', () => {
    logger.info(`Connected to mongodb: ${connectionString}`);
  });

  db.on('close', (err) => {
    if (err) {
      logger.error(err, `Lost connection with mongodb: ${connectionString}`);
    } else {
      logger.warn(`Closed connection with mongodb: ${connectionString}`);
    }
  });

  db.on('connected', (err) => {
    if (err) {
      logger.error(err);
    } else {
      logger.info(`Connected to mongodb: ${connectionString}`);
    }
  });

  // Add factory methods to the database object
  db.createService = (collectionName, validateSchema, options = {}) => {
    const opt = options;
    if (validateSchema) {
      opt.validateSchema = validateSchema;
    }

    const collection = db.get(collectionName, { castIds: false });
    return new MongoService(collection, opt);
  };

  /**
   * @desc Add additional methods for mongo service
   * @param {string} name
   * @param {Function} method
   */
  db.setServiceMethod = (name, method) => {
    MongoService.prototype[name] = function customMethod(...args) {
      return method.apply(this, [this, ...args]);
    };
  };

  db.createQueryService = (collectionName, options = {}) => {
    const collection = db.get(collectionName, { castIds: false });

    return new MongoQueryService(collection, options);
  };

  /**
   * @desc Add additional methods for mongo query service
   * @param {string} name
   * @param {Function} method
   */
  db.setQueryServiceMethod = (name, method) => {
    MongoQueryService.prototype[name] = function customMethod(...args) {
      return method.apply(this, [this, ...args]);
    };
  };

  return db;
};


module.exports.connect = connect;
module.exports.idGenerator = idGenerator;
module.exports.MongoService = MongoService;
module.exports.MongoQueryService = MongoQueryService;
