const chai = require('chai');

global.logger = console;

const MongoService = require('./MongoService');
const config = require('./config');

chai.should();

const db = require('./').connect(config.mongo.connection);

db.setServiceMethod('createByName', async (service, name) => {
  const res = await service.create({ name });
  return res;
});

const userSchema = {
  _id: String,
  name: {
    type: String,
    required: true,
  },
};

const userSchema2 = {
  _id: String,
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
    minlength: 1,
  },
};

const userSchemaWithDate = {
  _id: String,
  name: {
    type: String,
  },
  createdOn: Date,
  updatedOn: Date,
};

let userService;
let userService2;
let userServiceWithDate;

describe('MongoService', () => {
  before(async () => {
    userService = db.createService(`users-${Date.now()}`, userSchema);
    userService2 = db.createService(`users2-${Date.now()}`, userSchema2);

    userServiceWithDate = db.createService(
      `users-${Date.now() + 2}`,
      userSchemaWithDate,
      {
        addCreatedOnField: true,
        addUpdatedOnField: true,
      },
    );
  });

  after(async () => {
    await Promise.all([
      userService._model.collection.drop(),
      userServiceWithDate._model.collection.drop(),
    ]);
  });

  it('should create a document', async () => {
    const doc = await userService.create({ name: 'Bob' });
    doc.name.should.be.equal('Bob');
  });

  it('should create multiple documents', async () => {
    const docs = await userService.create([{ name: 'Bob' }, { name: 'Alice' }]);
    docs[0].name.should.be.equal('Bob');
    docs[1].name.should.be.equal('Alice');
  });

  it('should emit `created` event when document saved to the database', (done) => {
    userService.create([{ name: 'Bob' }])
      .catch((err) => {
        throw err;
      });

    userService.once('created', (evt) => {
      evt.doc.name.should.be.equal('Bob');
      done();
    });
  });

  it('should emit `removed` event when document removed from the database', (done) => {
    userService.once('removed', (evt) => {
      evt.doc.name.should.be.equal('Bob');
      done();
    });

    userService.create([{ name: 'Bob' }])
      .then((doc) => {
        return userService.remove({ _id: doc._id });
      })
      .catch((err) => {
        throw err;
      });
  });

  it('should update a document in a database', async () => {
    let doc = await userService.create([{ name: 'Bob' }]);
    doc = await userService.update({ _id: doc._id }, (u) => {
      const user = u;
      user.name = 'Alice';
    });
    doc.name.should.be.equal('Alice');
  });

  it('should emit `updated` event when document updated in the database', async () => {
    const doc = await userService.create([{ name: 'Bob' }]);
    userService.update({ _id: doc._id }, (u) => {
      const user = u;
      user.name = 'Alice';
    })
      .catch((err) => {
        throw err;
      });

    await new Promise((resolve, reject) => {
      userService.once('updated', (evt) => {
        evt.doc.name.should.be.equal('Alice');
        evt.prevDoc.name.should.be.equal('Bob');
        resolve();
      });
    });
  });

  it('should create a document', async () => {
    const user = { name: 'Bob' };
    const doc = await userService.createOrUpdate({ _id: '1' }, (dbUser) => {
      Object.assign(dbUser, user);
    });
    doc._id.should.be.equal('1');
    doc.name.should.be.equal('Bob');
  });

  it('should create two documents', async () => {
    const user1 = { name: 'Bob' };
    let doc = await userService.createOrUpdate({ _id: '1' }, (dbUser) => {
      Object.assign(dbUser, user1);
    });
    doc._id.should.be.equal('1');
    doc.name.should.be.equal('Bob');

    const user2 = { name: 'Alice' };
    doc = await userService.createOrUpdate({ _id: '2' }, (dbUser) => {
      Object.assign(dbUser, user2);
    });

    doc._id.should.be.equal('2');
    doc.name.should.be.equal('Alice');
  });

  it('should update document', async () => {
    const user1 = { name: 'Bob' };
    let doc = await userService.createOrUpdate({ _id: '1' }, (dbUser) => {
      Object.assign(dbUser, user1);
    });
    doc._id.should.be.equal('1');
    doc.name.should.be.equal('Bob');

    const user2 = { name: 'Alice' };
    doc = await userService.createOrUpdate({ _id: '1' }, (dbUser) => {
      Object.assign(dbUser, user2);
    });
    doc._id.should.be.equal('1');
    doc.name.should.be.equal('Alice');
  });

  it('should perform atomic document update', async () => {
    const _id = 'atomic_update';
    await userService.create({ _id, name: 'Bob' });
    await userService.atomic.update({ _id }, {
      $set: {
        name: 'Alice',
      },
    });
    const userDoc = await userService.findOne({ _id });
    userDoc.name.should.be.equal('Alice');
  });

  it('should deepCompare nested properties passed as an Array', () => {
    const data = { user: { firstName: 'Bob' } };
    const initialData = { user: { firstName: 'John' } };

    const changed = MongoService.deepCompare(data, initialData, ['user.firstName']);
    changed.should.be.equal(true);
  });

  it('should _deepCompare nested properties passed as an Object', () => {
    const data = { user: { firstName: 'Bob' } };
    const initialData = { user: { firstName: 'John' } };

    const changed = MongoService.deepCompare(data, initialData, { 'user.firstName': 'Bob' });
    changed.should.be.equal(true);
  });

  it('should update document using atomic modifiers', async () => {
    const _id = 'find_one_and_update';
    await userService.create({ _id, name: 'Bob' });
    await userService.findOneAndUpdate({ _id }, {
      $set: {
        name: 'Alice',
      },
    });
    const userDoc = await userService.findOne({ _id });
    userDoc.name.should.be.equal('Alice');
  });

  it('should return an error that the data does not satisfy the specified schema', async () => {
    let errors;
    try {
      await userService2.create({
        firstName: 'Evgeny',
        lastName: '',
      });
    } catch (err) {
      errors = err.error.errors;
    }

    errors.lastName.kind.should.be.equal('minlength');
  });

  it('should return an error that update function must be specified', async () => {
    try {
      await userService.update({ name: 'Magneto' }, { name: 'Professor X' });
    } catch (err) {
      err.message.should.be.equal('updateFn must be a function');
    }
  });

  it('should return an error that document not found', async () => {
    try {
      await userService.update({ name: 'Magneto' }, () => {});
    } catch (err) {
      err.message.should.be.equal('Document not found while updating. Query: {"name":"Magneto"}');
    }
  });

  it('should create user using custom method createByName', async () => {
    const user = await userService.createByName('Quicksilver');
    user.name.should.be.equal('Quicksilver');
  });

  it('should handle changes of the specified properties', (done) => {
    const name = 'Wanda Marya Maximoff';
    const pseudonym = 'Scarlet Witch';

    const propertiesObject = { name: pseudonym };
    userService.onPropertiesUpdated(propertiesObject, ({ doc, prevDoc }) => {
      doc.name.should.be.equal(pseudonym);
      done();
    });

    userService.createByName(name)
      .then(() => {
        userService.update({ name }, (doc) => {
          Object.assign(doc, { name: pseudonym });
        });
      });
  });

  it('should add field createdOn to the document', async () => {
    const laura = await userServiceWithDate.create({
      name: 'Laura',
      pseudonym: 'x23',
    });
    laura.createdOn.should.be.an.instanceof(Date);
  });

  it('should add field updatedOn to the document', async () => {
    const beast = await userServiceWithDate.create({
      name: 'Henry Philip Hank McCoy',
      pseudonym: 'Henry',
    });
    await userServiceWithDate.update({ _id: beast._id }, (d) => {
      const document = d;
      document.pseudonym = 'Beast';
    });
    const updatedBeast = await userServiceWithDate.findOne({
      _id: beast._id,
    });
    updatedBeast.updatedOn.should.be.an.instanceof(Date);
  });
});
