
# Node Mongo

[![Auxilin.com — Production ready Node, React starter kit for building products at a warp speed](https://raw.githubusercontent.com/auxilincom/component-template/master/assets/cover-black.png)](https://github.com/auxilincom/auxilin)

[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)
[![npm version](https://badge.fury.io/js/%40auxilin%2Fnode-mongo.svg)](https://badge.fury.io/js/%40auxilin%2Fnode-mongo) 
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)](https://github.com/auxilincom/node-mongo/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Build Status](http://ci.auxilin.com/api/badges/auxilincom/node-mongo/status.svg)](http://ci.auxilin.com/auxilincom/node-mongo)
[![David Dependancy Status](https://david-dm.org/auxilincom/node-mongo.svg)](https://david-dm.org/auxilincom/node-mongo)
[![Coverage Status](https://coveralls.io/repos/github/auxilincom/node-mongo/badge.svg?branch=master)](https://coveralls.io/github/auxilincom/node-mongo?branch=master)


[![Watch on GitHub](https://img.shields.io/github/watchers/auxilincom/node-mongo.svg?style=social&label=Watch)](https://github.com/auxilincom/node-mongo/watchers)
[![Star on GitHub](https://img.shields.io/github/stars/auxilincom/node-mongo.svg?style=social&label=Stars)](https://github.com/auxilincom/node-mongo/stargazers)
[![Follow](https://img.shields.io/twitter/follow/auxilin.svg?style=social&label=Follow)](https://twitter.com/auxilin)
[![Tweet](https://img.shields.io/twitter/url/https/github.com/auxilincom/node-mongo.svg?style=social)](https://twitter.com/intent/tweet?text=I%27m%20using%20Auxilin%20components%20to%20build%20my%20next%20product%20🚀.%20Check%20it%20out:%20https://github.com/auxilincom/node-mongo)
[![@auxilin](https://img.shields.io/badge/%F0%9F%92%AC%20Telegram-t.me/auxilin-blue.svg)](https://t.me/auxilin)

Node Mongo — is reactive extension to MongoDB API. It provides few usability improvements to the [mongoose](https://github.com/Automattic/mongoose) API. 

## Features

* ️️🚀 **Reactive** fires events as document stored, updated or deleted from database. That helps to keep your database updates for different entities weakly coupled with each other
* 🔥 **Paging** implements high level paging API
* ⚡️ **Schema validation** based on [mongoose schema](https://mongoosejs.com/docs/guide.html) 

## Installation

```
npm i @auxilin/node-mongo
```

## Quick example

Connect to the database:
```javascript
const connectionString = `mongodb://localhost:27017/home-db`;
const db = require('node-mongo').connect(connectionString);
```

Short API overview, for more details see [Full API reference](https://github.com/auxilincom/node-mongo/blob/master/API.md)
```javascript
const userSchema = {
  name: String,
};

//create a service to work with specific database collection
const usersService = db.createService('users', userSchema);

// find a single document
const user = await usersService.findById('123');

// sample paging
const result = await usersService.find({ name: 'Bob' }, { page: 1, perPage: 30 });
// returns object like this:
// {
//   results: [], // array of user entities
//   pagesCount, // total number of pages
//   count, // total count of documents found by query
// }

//update document
const updatedUser = await usersService.update({ _id: '1'}, (doc) => {
  doc.name = 'Alex';
});

// subscribe to document updates
userService.on('updated', ({ doc, prevDoc }) => {
});
```

## Full API Reference

[API Reference](https://github.com/auxilincom/node-mongo/blob/master/API.md).

## Change Log

This project adheres to [Semantic Versioning](http://semver.org/).
Every release is documented on the Github [Releases](https://github.com/auxilincom/node-mongo/releases) page.

## License

Node-mongo is released under the [MIT License](https://github.com/auxilincom/node-mongo/blob/master/LICENSE).

## Contributing

Please read [CONTRIBUTING.md](https://github.com/auxilincom/node-mongo/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars2.githubusercontent.com/u/6461311?v=4" width="100px;"/><br /><sub><b>Evgeny Zhivitsa</b></sub>](https://github.com/ezhivitsa)<br />[💬](#question-ezhivitsa "Answering Questions") [💻](https://github.com/auxilin/node-mongo/commits?author=ezhivitsa "Code") [🎨](#design-ezhivitsa "Design") [📖](https://github.com/auxilin/node-mongo/commits?author=ezhivitsa "Documentation") [💡](#example-ezhivitsa "Examples") [🤔](#ideas-ezhivitsa "Ideas, Planning, & Feedback") [👀](#review-ezhivitsa "Reviewed Pull Requests") [⚠️](https://github.com/auxilin/node-mongo/commits?author=ezhivitsa "Tests") | [<img src="https://avatars3.githubusercontent.com/u/681396?v=4" width="100px;"/><br /><sub><b>Andrew Orsich</b></sub>](https://github.com/anorsich)<br />[📖](https://github.com/auxilin/node-mongo/commits?author=anorsich "Documentation") [🤔](#ideas-anorsich "Ideas, Planning, & Feedback") |
| :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
