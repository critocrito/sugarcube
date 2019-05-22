---
path: "/api/development"
title: "developers Guide"
---
# The SugarCube guide for developers

SugarCube is written in JavaScript and runs on NodeJS. Packages can be
obtained from [NPM](https://npmjs.org). SugarCube is split in several
packages:

- [`sugarcube`](https://npmjs.org/package/sugarcube)

  The core of SugarCube. It provides the machinery to run plugins and an API
  to make the life of plugin developers easier.

- [`sugarcube-cli`](https://npmjs.org/package/sugarcube-cli)

  A command line interface for SugarCube. It wraps the core and provides the
  `sugarcube` executable.

- [`sugarcube-api`](https://npmjs.org/package/sugarcube-api)

  A RESTful HTTP API, that wraps the core. It allows to control SugarCube
  using HTTP requests.

- [`@sugarcube/plugin-*`](https://www.npmjs.org/browse/keyword/@sugarcube/plugin)

  All the functionality that SugarCube provides is encapsulated in plugins.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Plugins](#plugins)
- [The Envelope](#the-envelope)
  - [Data](#data)
  - [Queries](#queries)
- [Tutorial: Developing plugins](#tutorial-developing-plugins)
  - [Bootstraping a new plugin module](#bootstraping-a-new-plugin-module)
  - [A look at the boilerplate plugin](#a-look-at-the-boilerplate-plugin)
- [Npm scripts](#npm-scripts)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Plugins

A plugin is a function that takes an envelope as input, and returns an
envelope as output. The exact signature of a SugarCube plugin is the
following:

`plugin(Envelope, {log, cfg}) -> Envelope`

The envelope contains all data and queries and every plugin has to return data
with the same interface. We will look at the envelope in more detail
later.

The second argument is a bag of different objects. Currently it provides the
whole configuration object of the run and a logger object. In the future this
can be extended.

Plugins can return either an envelope or a promise that resolves to an
envelope. The SugarCube core accepts both return types. Internally if the
return type is a value, it will be turned into a resolved promise.

Plugins implement an interface for functors and applicatives and offers a few
combinators on top of those abstractions. See the [API guide](./api#plugins)
for details.

## The Envelope

Data and queries are wrapped in an envelope, which is just an object. This is
a minimal valid envelope.

```
{
  data: [],
  queries: []
}
```

Both `data` and `queries` are a list of objects.

The envelope as well as `data` and `queries` implement various interfaces such
as monoids and functors. See the API guide [here](./api#units)
and [here](./api#envelope) for details.

### Data

Plugins create units of data and they are free to extend the format of a data
unit with whatever field they want. Certain fields gold meaning across the
whole of SugarCube, and plugins should not change their meaning. Some fields
are understood only by a few plugins.

- `_sc_id_hash` - A unique identifier for this data unit. It is usually a
  SHA256 hash. If the `_sc_id_fields` field is set, the SugarCube core
  automatically calculates the `_sc_id_hash` for every unit. This is the
  recommended way. Otherwise the plugin has to provide the hash by itself.

- `_sc_id_fields` - A list of field names, that specify the significant fields
  to form an identifier for this unit. SugarCube will take the values for
  those fields to calculate a unique identifier.

  `_sc_id_fields: ['tweet_id']`

- `_sc_content_hash` - A SHA256 hash of the content of the data
  unit. SugarCube uses this field to see if a particular piece of data
  changed. If the `_sc_content_fields` field is et, the SugarCube core
  automatically calculates the `_sc_content_hash` for every unit. This is the
  recommended way. Otherwise the plugin has to provide the hash by
  itself.

- `_sc_content_fields` - A list of field names, that specify the significant
  fields to form the content for this unit. SugarCube will take the values
  for those fields to calculate content integrity.

  `_sc_content_fields: ['tweet']`

- `_sc_pubdates` - An object, that contains various dates around this
  unit. Possible date types are `fetch`, the date and time when the unit was
  fetched, and `source`, the date and time that the unit was created. In the
  future more types of dates can be added. The dates should be JavaScript
  `Date` objects.

  ```
  _sc_pubdates: {
    fetch: Date("2017-03-21T23:22:35.426Z"),
    source: Date("2016-08-14T12:00:35Z")
  }
  ```

- `_sc_media`
- `_sc_relations`
- `_sc_downloads`
_ `_sc_markers`

### Queries

Queries are, the same as data, a list of objects. Each object must have two
fields:

- `type` - What kind of query it is. Plugins will pick all queries they wanna
  operate on based on the type.

- `term` - The actual query. The format of the term depends on the
  type. Queries of type `ddg_search` are simple strings, whereas queries of
  type `mongodb_query` are a MongoDB query description.

Plugins document which query types they expect.

### Stats

Plugins receive a `stats` object as part of it's arguments:

```js
const plugin = (envelope, {stats}) => {
  // ...
};
```

It is updated in place and can be used to collect stats that persist over the
lifetime of a pipeline. To put and retrieve data into `stats` use `get` and
`update`:

```js
const plugin = (envelops, {stats}) => {
  stats.update(merge({a: 23}));
  stats.update("b.c", {b: 42});
  stats.get();
  stats.get("b");
};
```

Both `update`and `get` can be called with an optional path argument that
specifies the path into the nested data. `update` additionally takes a
transition function as a second argument. This function is called with the
stats data, or just a nested structure specified by the path. If this path
doesn't exist, always produce an empty object.

```js
const plugin = (envelope, {stats}) => {
  stats.get(); // => {}  the empty object is the default state
  stats.get("a.b.c"); // => {}  always produce an empty object

  stats.update(merge({a: 23}));
  stats.get(); // => {a: 23}

  stats.update("a.b.c", merge({d: 42})); // Update nested.
  stats.get(); // => {a: 23, b: {c: {d: 42}}}
};
```

At the end on any pipeline the final stats are published by the runner on the
stream under the `stats` type.

```js
const run = runner(plugins, config, queries);

run.stream.onValue(msg => {
  switch (msg.type) {
    // ...
    case "stats":
      // msg.stats hold the final stats
      break;
    // ..
  }
})
```

## Tutorial: Developing plugins

We will develop an example plugin for SugarCube. The plugin will list files
in a directory (specified by a glob pattern) and turn each file into an unit
of data.

### Bootstraping a new plugin module

There is
a [boilerplate](https://gitlab.com/sugarcube/sugarcube-boilerplate-plugin)
repository, which is a good start. The commands below create a new plugin, and
inside the plugin there is a minimal SugarCube project, that can be used to
test the module itself.

```
git clone https://gitlab.com/sugarcube/sugarcube-boilerplate-plugin @sugarcube/plugin-fs
cd @sugarcube/plugin-fs
sed -i -e 's/boilerplate-plugin/plugin-fs/g' package.json
sed -i -e 's/\(^[ ]*"description": "\).*\(",$\)/\1Provide file system related plugins for SugarCube.\2/g' package.json
rm -rf .git && git init && git add -A && git commit -m "Initial commit."
npm link
cd project
npm link @sugarcube/plugin-fs
```

You might wanna edit the `package.json` and change other fields as well:

- `name`
- `description`
- `repository`
- `keywords`
- `author`
- `bugs`
- `homepage`

The boilerplate repository has the following structure:

- `lib` :: The location of your ES6 source code. The actual plugin.
- `_dist` :: The compiled ES5 version of `lib`.
- `test` :: All unit and property tests go here. Files ending with `spec.js`
  are part of the test suite.
- `project` :: A minimal SugarCube project, to easily test the module under
  development.

The ES6 sources have to be compiled to ES5 before they can be used. Run `npm
run build` to do that. It's handy to run `npm run watch` during
development. See below for a list of all available npm scripts.

### A look at the boilerplate plugin

The entry point of the module can be found in `lib/index.js`. In order to
export a SugarCube plugin, the module has to export the `plugins` attribute,
which is a map with the plugin name as key, and the plugin function as value.

We will write a little plugin, that reads all files in a directory, and turns
each file into a unit of data.

This is a minimal `lib/index.js`.

```
import passPlugin from './pass';

const plugins = {
  pass: passPlugin,
};

export {plugins};
export default {plugins};
```

This module exports one plugin, that is called `fs_list`. Next step is to
implement the actual plugin. A plugin is simply a function that receives an
`Envelope` and a context, and returns either an `Envelope`, or a `Promise` for
an `Envelope`.

A minimal `lib/pass.js` can look like this:

```
const plugin = envelope => envelope;

export default plugin;
```

## Npm scripts

The `package.json` defines several tasks, that can be executed with `npm run`.

- `npm run test` :: Run all mocha unit tests in `test/**/*.spec.js`.
- `npm run lint` :: Run eslint on your ES6 sources in `lib` and your tests in
  `test`. It also lints [JSDoc](http://usejsdoc.org/) in `lib`.
- `npm run docs` :: Build the API docs of the module. Places the result into
  the Readme.
- `npm run compile` :: Compile the ES6 sources to ES5
  using [Babel](https://babeljs.io/).
- `npm run build` :: Test, lint, document and compile. Runs the former `npm`
  scripts and fails on error.
- `npm run watch` :: Watch the sources in `lib` and `test` and build the
  module whenever a single file changes.
- `npm run publish` :: When publishing a module to
  [npmjs.org](https://www.npmjs.com/), as a initial step, it builds the whole
  package using `npm run build`. Only the readme and `_dist` are published.
- `npm run clean` :: Delete the compiled sources in `_dist`.
