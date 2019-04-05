const store = require('./store');

const { mongoClientDbSelector } = require('./store/reducers/databases/selectors');

class Collection {
  constructor(connectionString, collectionName, options = {}) {
    this._connectionString = connectionString;
    this._collectionName = collectionName;
    this._options = options;

    this._actions = [];

    this._onUpdateStore = this.onUpdateStore.bind(this);
    this.init();
  }

  get name() {
    return this._collectionName;
  }

  init() {
    const state = store.getState();
    const mongoClient = mongoClientDbSelector(state, this._connectionString);

    if (mongoClient) {
      this._collection = mongoClient.collection(this._collectionName, this._options);
    } else {
      store.subscribe(this._onUpdateStore);
    }
  }

  onUpdateStore(state, oldState) {
    const mongoClient = mongoClientDbSelector(state, this._connectionString);
    if (!mongoClient) {
      return;
    }

    this._collection = mongoClient.collection(this._collectionName, this._options);
    store.unsubscribe(this._onUpdateStore);

    this.executeActions();
  }

  executeActions() {
    while (this._actions.length) {
      const [action] = this._actions;

      const result = action.callback();
      if (result instanceof Promise) {
        result
          .then(action.resolve)
          .catch(action.reject);
      } else {
        action.resolve(result);
      }

      this._actions.splice(0, 1);
    }
  }

  addPromiseAction(resolve, reject, callback) {
    this._actions.push({ resolve, reject, callback });
  }

  waitInitCollection(callback) {
    if (this._collection) {
      return callback();
    }

    return new Promise((resolve, reject) => {
      this.addPromiseAction(resolve, reject, callback);
    });
  }

  find(query, options) {
    return this.waitInitCollection(() => {
      return this._collection.find(query, options).toArray();
    });
  }

  count(query, options) {
    return this.waitInitCollection(() => {
      return this._collection.countDocuments(query, options);
    });
  }

  distinct(field, query, options) {
    return this.waitInitCollection(() => {
      return this._collection.distinct(field, query, options);
    });
  }

  aggregate(pipeline, options) {
    return this.waitInitCollection(() => {
      return this._collection.aggregate(pipeline, options).toArray();
    });
  }

  insert(entities) {
    return this.waitInitCollection(() => {
      return this._collection.insertMany(entities);
    });
  }

  drop() {
    return this.waitInitCollection(() => {
      return this._collection.drop();
    });
  }

  remove(query) {
    return this.waitInitCollection(() => {
      return this._collection.removeMany(query);
    });
  }

  update(selector, update, options) {
    const updateQuery = Object.prototype.hasOwnProperty.call(update, '$set')
      ? update
      : { $set: update };

    return this.waitInitCollection(() => {
      return this._collection.updateMany(selector, updateQuery, options);
    });
  }

  findOneAndUpdate(filter, update, options) {
    return this.waitInitCollection(() => {
      return this._collection.findOneAndUpdate(filter, update, options);
    });
  }

  createIndex(fieldOrSpec, options) {
    return this.waitInitCollection(() => {
      return this._collection.createIndex(fieldOrSpec, options);
    });
  }

  indexes(options) {
    return this.waitInitCollection(() => {
      return this._collection.indexes(options);
    });
  }
}

module.exports = Collection;
