# `@sugarcube/plugin-fs`

Interact with the file system.

## Installation

```
npm install --save @sugarcube/plugin-fs
```

## Usage

### `fs_unfold` plugin

The query type is `glob_pattern`. It expands the glob pattern and turns every
file into an unit.

## API

### unfold

Unfold a glob pattern into a list of file objects.

`unfold :: String -> Future [a]`

**Parameters**

-   `pattern` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A glob file pattern.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>>** A list of file objects. Contains
location, sha256 and md5 sums.
