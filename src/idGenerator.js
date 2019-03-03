const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

exports.generate = () => {
  const id = new ObjectId();
  return id.toHexString();
};
