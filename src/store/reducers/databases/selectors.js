const dbSelector = (state, connectionString) => state.databases[connectionString];

const databaseSelector = (state, connectionString) => {
  const database = dbSelector(state, connectionString);
  if (!database) {
    return null;
  }

  return database.db;
};

const mongoClientDbSelector = (state, connectionString) => {
  const database = dbSelector(state, connectionString);
  if (!database) {
    return null;
  }

  return database.mongoClientDb;
};

const collectionSelector = (state, connectionString, collectionName) => {
  const database = dbSelector(state, connectionString);
  if (!database) {
    return null;
  }

  return database.collections[collectionName];
};

exports.databaseSelector = databaseSelector;
exports.mongoClientDbSelector = mongoClientDbSelector;
exports.collectionSelector = collectionSelector;
