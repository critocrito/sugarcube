# `@sugarcube/plugin-fs`

Interact with the file system.

## Installation

```
npm install --save @sugarcube/plugin-fs
```

## Plugins

### `fs_unfold` plugin

The query type is `glob_pattern`. It expands the glob pattern and turns every
file into an unit.

### `fs_media_type` plugin

Populate the `_sc_media` field from a location field of the unit. Successive plugins can therefore operate on files that were imported using `fs_unfold`.

**Configuration:**

- `fs.location_field`: Specify the name of the field that contains the file path. Defaults to `location`.

## API

### unfold

Unfold a glob pattern into a list of file objects.

`unfold :: String -> Future [a]`

**Parameters**

-   `pattern` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A glob file pattern.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>>** A list of file objects. Contains
location, sha256 and md5 sums.

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
