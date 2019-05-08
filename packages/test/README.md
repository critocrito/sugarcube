# `@sugarcube/test`

Test helpers for SugarCube.

## Installation

```
npm install --save @sugarcube/test
```

## API

### generators.listArb

An arbitrary that can be used in `jsverify` based property tests.
It produces a single object that resembles a list.

### generators.listsArb

An arbitrary that can be used in `jsverify` based property tests.
It produces an array of objects, where each object is a list.

### generators.lists

Randonly generate a list of lists.

**Parameters**

-   `size` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** The number of lists to generate.

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>** A list of list objects.

### generators.queryArb

An arbitrary that can be used in `jsverify` based property tests.
It produces a single object that resembles a query.

### generators.queriesArb

An arbitrary that can be used in `jsverify` based property tests.
It produces an array of objects, where each object is a list.

### generators.queries

Randonly generate a list of queries.

**Parameters**

-   `size` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** The number of queries to generate.

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>** A list of queries.

### generators.unitArb

An arbitrary that can be used in `jsverify` based property tests.
It produces a single object that resembles a unit of data.

### generators.unit

Randomly generate a single unit of data.

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** A unit of data.

### generators.dataArb

An arbitrary that can be used in `jsverify` based property tests.
It produces an array of objects, where each object is a unit of data.

### generators.data

Randonly generate units of data..

**Parameters**

-   `size` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** The number of data units to generate.

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>** A list of data units.

### generators.envelopeArb

An arbitrary that can be used in `jsverify` based property tests.
It produces an object that is an envelope..

### generators.envelope

Randomly generate a envelope with data and queries.

**Parameters**

-   `sizeData` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** The number of data units in the envelope.
-   `sizeQueries` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** The number of queries in the envelope.

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** A unit of data.

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
