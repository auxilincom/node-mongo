const { EventEmitter } = require('events');

const { MongoClient } = require('mongodb');

const Collection = require('./collection');

const store = require('./store');
const {
  databaseSelector,
  collectionSelector,
} = require('./store/reducers/databases/selectors');
const {
  addDatabase,
  addCollection,
  addMongoClientDb,
} = require('./store/reducers/databases/actions');

const defaultOptions = {
  useNewUrlParser: true,
};

class Database extends EventEmitter {
  constructor(url, options) {
    super();

    this._url = url;
    this._options = Object.assign({}, defaultOptions, options);

    this._db = null;
    this._dbPromise = null;
  }

  async connect() {
    this._dbPromise = MongoClient.connect(this._url, this._options);
    try {
      const db = await this._dbPromise;
      this._db = db.db();

      store.dispatch(addMongoClientDb(this._url, this._db));

      this.emit('connected');

      this._db.on('reconnect', this.onReconnect);
      this._db.on('close', this.onClose);
    } catch (e) {
      this.emit('error', e);
    }
  }

  onReconnect(data) {
    this.emit('reconnected', data);
  }

  onClose(error) {
    this.emit('disconnected', error);
  }

  get(collectionName, options) {
    const state = store.getState();

    let collection = collectionSelector(state, this._url, collectionName);

    if (!collection) {
      collection = new Collection(this._url, collectionName, options);
      store.dispatch(addCollection(this._url, collectionName, collection));
    }

    return collection;
  }
}

exports.connect = (url, options) => {
  const state = store.getState();

  let database = databaseSelector(state, url);

  if (!database) {
    database = new Database(url, options);
    store.dispatch(addDatabase(url, database));

    database.connect();
  }

  return database;
};
