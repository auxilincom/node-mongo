const mongoose = require('mongoose');

const { Schema } = mongoose;

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
  // options docs: https://mongoosejs.com/docs/api.html#mongoose_Mongoose-connect
  const db = mongoose.createConnection(connectionString, {
    connectTimeoutMS: 20000,
    useNewUrlParser: true,
  });

  db.on('connected', () => {
    logger.info(`Connected to the mongodb: ${connectionString}`);
  });

  db.on('error', (err) => {
    logger.error(err, 'Failed to connect to the mongodb on start');
    throw err;
  });

  // When the mongodb server goes down, mongoose emits a 'disconnected' event
  db.on('disconnected', () => {
    logger.warn(`Lost connection with mongodb: ${connectionString}`);
  });

  // The driver tries to automatically reconnect by default, so when the
  // server starts the driver will reconnect and emit a 'reconnect' event.
  db.on('reconnected', () => {
    logger.warn(`Reconnected with mongodb: ${connectionString}`);
  });

  db.on('reconnectFailed', () => {
    logger.warn(`Reconnected with mongodb failed: ${connectionString}`);
  });

  // Add factory methods to the database object
  db.createService = (collectionName, schema, options = {}) => {
    const collectionSchema = schema instanceof Schema ? schema : new Schema(schema);
    const model = db.model(collectionName, collectionSchema);

    return new MongoService(model, collectionSchema, options);
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

  db.createQueryService = (collectionName, schema, options) => {
    const collectionSchema = schema instanceof Schema ? schema : new Schema(schema);
    const model = db.model(collectionName, collectionSchema);

    return new MongoQueryService(model, collectionSchema, options);
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
