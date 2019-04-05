const { ObjectID } = require('mongodb');

exports.generate = () => {
  const objectId = new ObjectID();
  objectId.generate();
  return objectId.toHexString();
};
