const {
  events: {
    ADD_DATABASE,
    ADD_DATABASE_COLLECTION,
    ADD_MONGO_CLIENT_DB,
  },
} = require('../actions');

const defaultState = {
  db: null,
  mongoClientDb: null,
  collections: {},
};

module.exports = (state = defaultState, action) => {
  switch (action.type) {
    case ADD_DATABASE:
      return {
        ...state,
        db: action.database,
      };

    case ADD_DATABASE_COLLECTION:
      return {
        ...state,
        collections: {
          ...state.collections,
          [action.collectionName]: action.collection,
        },
      };

    case ADD_MONGO_CLIENT_DB:
      return {
        ...state,
        mongoClientDb: action.mongoClientDb,
      };

    default:
      return state || defaultState;
  }
};
