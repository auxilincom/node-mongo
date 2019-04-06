const {
  events: {
    ADD_DATABASE,
    ADD_DATABASE_COLLECTION,
    ADD_MONGO_CLIENT_DB,
  },
} = require('./actions');

const databaseReducer = require('./database');

const defaultState = {};

module.exports = (state = defaultState, action) => {
  let database;

  switch (action.type) {
    case ADD_DATABASE:
    case ADD_DATABASE_COLLECTION:
    case ADD_MONGO_CLIENT_DB:
      database = state[action.connectionString];
      return {
        ...state,
        [action.connectionString]: databaseReducer(database, action),
      };

    default:
      return state || defaultState;
  }
};
