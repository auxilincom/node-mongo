const ADD_DATABASE = 'ADD_DATABASE';
const ADD_DATABASE_COLLECTION = 'ADD_DATABASE_COLLECTION';
const ADD_MONGO_CLIENT_DB = 'ADD_MONGO_CLIENT_DB';

exports.events = {
  ADD_DATABASE,
  ADD_DATABASE_COLLECTION,
  ADD_MONGO_CLIENT_DB,
};

exports.addDatabase = (connectionString, database) => ({
  type: ADD_DATABASE,
  connectionString,
  database,
});

exports.addMongoClientDb = (connectionString, mongoClientDb) => ({
  type: ADD_MONGO_CLIENT_DB,
  connectionString,
  mongoClientDb,
});

exports.addCollection = (connectionString, collectionName, collection) => ({
  type: ADD_DATABASE_COLLECTION,
  connectionString,
  collectionName,
  collection,
});
