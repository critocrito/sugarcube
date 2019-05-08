# `@sugarcube/plugin-googlesheets`

A plugin to handle operations based around adding or updating unit data in
google sheets.

## Installation

```
npm install --save @sugarcube/plugin-googlesheets
```

## Authentication

This plugin uses the Google API Oauth. In order to use this plugin you need
the following:

- A [Google account](https://gmail.com).
- A spreadsheet ID. Logged in as your user, create a new spreadsheet, and copy
  the spreadsheet ID from the URL.
- A client ID, a client secret and a token.

  - Go to the [Developers Console](https://console.developers.google.com) and
    login with your account.
  - Create a new project.
  - Enable the Google Sheets API.
  - Under the "Credentials" page (click on the left bar):

    - Configure the OAuth consent screen and use "other" as the application
      type.
    - Create new credentials and select `OAuth client ID`, this will generate
      a client ID and the client secret.

![Google Developer Console](developer-console.jpg?raw=true "Google Developer Console")

Your current config looks like this:

```
{
  "google": {
    "client_id": "<CLIENT ID>",
    "client_secret": "<CLIENT SECRET>",
    "spreadsheet_id": "<SPREADSHEET ID>"
  }
}
```

When running the first time it will ask you to visit an URL to authorize your
Google account. On success you will receive an OAuth token, which you have to
paste in your terminal.

The retrieved credentials are stored using the cache facility of SugarCube. In
case of the CLI interface the tokens are stored in `.sugarcube_cache.json`.

## Plugins

### `sheets_export` plugin

Export data to a Google spreadsheet. This plugin merges existing data with new
data. Duplicates are removed. If a sheet doesn't exist yet, a new one will be
created. Before any values are exported a backup of the target sheet is
created with the name of `<sheet-name>-bkp`. If the export succeeds, the
backup sheet is deleted.

By specifying `google.copy_from_spreadsheet` and `google.copy_from_sheet` the
new sheet will be copied from a template. Both of those options have to be
provided if a new sheet should be create from a template.

- `google.client_id`: The identifier for this client.
- `google.client_secret`: A secret that is used by this client.
- `google.spreadsheet_id`: The ID of the spreadsheet to export to.
- `google.sheet`: The name of the sheet to export to. Defaults to the run
  marker of the current pipeline run.
- `google.sheet_fields`: Specify the field names, which should be exported to
  the spreadsheet.
- `google.copy_from_spreadsheet`: Specify the spreadsheet ID to copy the
  template from. Requires `google.copy_from_sheet` as well.
- `google.copy_from_sheet`: Specify a sheet name to copy the template
  from. Requires `google.copy_from_spreadsheet` as well. Multiple sheets can be specified as an array. The first is assumed to be the template for the data sheet, and any subsequent source sheet as a supporting sheet.

  The following configuration snippet exports data to a spreadsheet where three sheets are copied from a template sheet. The `template` sheet is renamed to `Collection`, the `meta` sheet will be renamed to `Meta` and the `locations` sheet keeps it's name.
  ```
  {
    "google": {
      "sheet": "Collection,Meta",
      "copy_from_sheet": ["template", "meta", "locations"],
      ...
    }
  }
  ```

- `google.skip_empty` Use this option to only export data pipelines that contain
  any data.
- `google.selection_list`: Enable a drop down selection list for a field. It
  validates that input can only be one of the specified options. The selection
  list is specified using the following format:
  `<field-name>:opt1,opt2,opt3`. This will validate the input of
  `<field-name>` to be one of `opt1`, `opt2` or `opt3`. This option is an
  array and can be specified multiple times.

### `sheets_import` plugin

Import data from a Google Spreadsheet.

- `google.client_id`: The identifier for this client.
- `google.client_secret`: A secret that is used by this client.
- `google.spreadsheet_id`: The ID of the spreadsheet to import from.
- `google.sheet`: The name of the sheet to use as import source. Defaults to
  *Sheet1*.
- `google.sheet_fields`: Specify the field names, which should be imported from
  the spreadsheet. Defaults to all fields.
- `google.id_fields`: Specify a list of field names that are used to calculate
  the `_sc_id_hash`. The `_sc_id_fields` field is populated with those fields.

The `sheets_import` plugin can take optional queries of type
`sheets_condition` which specifies which rows to import based on a field
match. The format of the query term is `<field>:<value>`. Currently only exact
matches are supported. When specified, only rows matching the field will be
imported from the sheets.

```sh
sugarcube -Q sheets_condition:aa:23 -Q sheets_condition:bb:42 -p sheets_import
```

### `sheets_queries` plugin

Fetch queries from a Google spreadsheet. The first column is the query type,
and the second column is the query term. The plugin looks up the
`sheets_query` query type to determine the sheet in which to look.

- `google.client_id`: The identifier for this client.
- `google.client_secret`: A secret that is used by this client.
- `google.spreadsheet_id`: The ID of the spreadsheet to fetch from.
- `google.query_default_type`: Specify a default query type if none is provided. The plugin looks up query types in a column named `type`. If this column is missing, or the cell is empty, us the value of this option instead.
- `google.query_fields`: The `sheets_query` plugin will always look for columns named `type` and `term`. Using this option, additional fields can be added into the query extraction. This is useful to enhance queries with additional meta data. The fields `type` and `term` are always queried, so there is no need to specify them separately.

### `sheets_append` plugin

Append data to a Google spreadsheet. This plugin is similar to
`sheets_export`, only that data isn't merged, but just appended to the end of
the spreadsheet. This allows for rows with duplicated `_sc_id_hash`. A new
sheet will be created if it doesn't exist yet. If the sheet contains no rows
yet, the header will be exported as well. If there are already rows existing,
no extra header will be exported.

This plugin does not validate the order or number of existing cells. It's up
to the user to make sure that the shape of the data that is appended matches
the shape of the data that is already stored in the spreadsheet. The order of
fields is controlled by the order of fields declared in `google.sheet_fields`.

- `google.client_id`: The identifier for this client.
- `google.client_secret`: A secret that is used by this client.
- `google.spreadsheet_id`: The ID of the spreadsheet to export to.
- `google.sheet`: The name of the sheet to export to. Defaults to the run
  marker of the current pipeline run.
- `google.sheet_fields`: Specify the field names, which should be exported to
  the spreadsheet.
- `google.copy_from_spreadsheet`: Specify the spreadsheet ID to copy the
  template from. Requires `google.copy_from_sheet` as well.
- `google.copy_from_sheet`: Specify a sheet name to copy the template
  from. Requires `google.copy_from_spreadsheet` as well.
- `google.skip_empty` Use this option to only export data pipelines that contain
  any data.
- `google.selection_list`: Enable a drop down selection list for a field. It
  validates that input can only be one of the specified options. The selection
  list is specified using the following format:
  `<field-name>:opt1,opt2,opt3`. This will validate the input of
  `<field-name>` to be one of `opt1`, `opt2` or `opt3`. This option is an
  array and can be specified multiple times.

### `sheets_move` plugin

Move data from one spreadsheet to another. If a sheet doesn't exist yet, a new
one will be created. Before any values are exported a backup of the target
sheet is created with the name of `<sheet-name>-bkp`. If the export succeeds,
the backup sheet is deleted.

By specifying `google.copy_from_spreadsheet` and `google.copy_from_sheet` the
new sheet will be copied from a template. Both of those options have to be
provided if a new sheet should be create from a template.

- `google.client_id`: The identifier for this client.
- `google.client_secret`: A secret that is used by this client.
- `google.spreadsheet_id`: The ID of the spreadsheet to move from.
- `google.sheet`: The name of the sheet to move from. Defaults to the run
  marker of the current pipeline run.
- `google.to_spreadsheet_id`: The ID of the spreadsheet to move to.
- `google.to_sheet`: The name of the sheet to move to. Defaults to the run
  marker of the current pipeline run.
- `google.copy_from_spreadsheet`: Specify the spreadsheet ID to copy the
  template from. Requires `google.copy_from_sheet` as well.
- `google.copy_from_sheet`: Specify a sheet name to copy the template
  from. Requires `google.copy_from_spreadsheet` as well.
- `google.skip_empty` Use this option to only move data if any exists in the
  source.
- `google.selection_list`: Enable a drop down selection list for a field. It
  validates that input can only be one of the specified options. The selection
  list is specified using the following format:
  `<field-name>:opt1,opt2,opt3`. This will validate the input of
  `<field-name>` to be one of `opt1`, `opt2` or `opt3`. This option is an
  array and can be specified multiple times.

The `sheets_move` plugin can take optional queries of type `sheets_condition`
which specifies which rows to move based on a field match. The format of the
query term is `<field>:<value>`. Currently only exact matches are
supported. When specified, only rows matching the field will be moved to
another sheet. Rows that don't match the conditions remain on the source
sheets.

```sh
sugarcube -Q sheets_condition:aa:23 -Q sheets_condition:bb:42 -p sheets_move
```

### `sheets_move_queries` plugin

Move queries in the pipeline from one sheet to another. The plugin will look up queries defined through the `sheets_queries` query type, and move the queries to a spreadsheet defined with `google.to_spreadsheet_id` and `google.to_sheet`.

By specifying `google.copy_from_spreadsheet` and `google.copy_from_sheet` the new sheet will be copied from a template if it doesn't yet exist. Both of those options have to be provided if a new sheet should be create from a template.

- `google.client_id`: The identifier for this client.
- `google.client_secret`: A secret that is used by this client.
- `google.spreadsheet_id`: The ID of the spreadsheet to move from.
- `google.to_spreadsheet_id`: The ID of the spreadsheet to move to.
- `google.to_sheet`: The name of the sheet to move to. Defaults to the run marker of the current pipeline run.
- `google.copy_from_spreadsheet`: Specify the spreadsheet ID to copy the template from. Requires `google.copy_from_sheet` as well.
- `google.copy_from_sheet`: Specify a sheet name to copy the template from. Requires `google.copy_from_spreadsheet` as well.
- `google.skip_empty` Use this option to only move data if any exists in the source.
- `google.selection_list`: Enable a drop down selection list for a field. It validates that input can only be one of the specified options. The selection list is specified using the following format: `<field-name>:opt1,opt2,opt3`. This will validate the input of `<field-name>` to be one of `opt1`, `opt2` or `opt3`. This option is an array and can be specified multiple times.
- `google.query_default_type`: Specify a default query type if none is provided. The plugin looks up query types in a column named `type`. If this column is missing, or the cell is empty, us the value of this option instead.
- `google.query_fields`: The `sheets_query` plugin will always look for columns named `type` and `term`. Using this option, additional fields can be added into the query extraction. This is useful to enhance queries with additional meta data. The fields `type` and `term` are always included, so there is no need to specify them separately.
- `google.query_types_to_move`: Specify the types of queries to move from one sheet to another. This is useful if one sheet contains queries of multiple types, but an individual pipeline only operates on a sub set of those queries. Specify multiple query types by separating them with a comma.

```sh
sugarcube -p sheets_queries,youtube_channel,sheets_move_queries \
          -Q sheets_queries:HistoricScrapes \
          --google.to_sheet DailyScrapes \
          --google.query_default_type youtube_channel \
          --google.query_types_to_move youtube_channel,youtube_video
```

## API

### Types

Most types are equivalent to types returned by the [Google Sheets
API](https://developers.google.com/sheets/api/reference/rest/). More details
can be found there.

#### `Rows`

An array of arrays. It's a tabular structure that contains data from a
spreadsheet. The first row always contains the header, all consecutive rows
are data. The `Rows` structure is zero-indexed, while the labels in the UI are
one-indexed.

```js
const [header, ...data] = await getRows(id, sheet);
console.log(header);
// ["a", "b", "c"]
console.log(data);
// [
//  [1, 2, 3],
//  [4, 5, 6],
// ]
```

### `SheetsDo`

```hs
SheetsDo :: (
  f: Generator,
  {client: String, secret: String, tokens: Object}
): [result, tokens, history]
```

The module exports the `SheetsDo` function, which creates a context to
interact with the Google Sheets API. The context takes a generator as a first
argument, which is executed within a single Google Sheets API session. It
receives a complete API object as it's argument. The second argument is an
object containing all parts required to authenticate the session.

`SheetsDo` returns a triplet consisting of the data returned in the generator
or, if the generator doesn't return data, the result of the last yield, a set
of tokens and an array containing the history of the interactions with the
sheets API.

```js
import {SheetsDo, rowsToUnits} from "@sugarcube/plugin-googlesheets";

const [data] = await SheetsDo(
  function* ({getRows}) => {
    const rows = yield getRows(id, sheet);
    return rowsToUnits(fields, rows);
  },
  {client, secret, tokens}
);
```

All functions within the session yield to the result of the operation. The
generator manages the promise resolution and no special care has to be taken
to the asynchronous nature of the operations.

All operations are implemented in [`sheets.js`](./lib/sheets.js). See that
file for a complete list of all API operations.

#### `createSpreadsheet`

```hs
createSpreadsheet :: (): F Spreadsheet
```

Creates a new spreadsheet. It takes no arguments and returns an instance of
[`Spreadsheet`](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#Spreadsheet).

#### `getSpreadsheet`

```hs
getSpreadsheet :: (id: String): F Spreadsheet
```

Retrieve an existing spreadsheet. It takes the spreadsheet ID as an argument
and returns an instance of
[`Spreadsheet`](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#Spreadsheet).

#### `createSheet`

```hs
createSheet :: (id: String, sheet: String): F Sheet
```

Create a new named sheet on a spreadsheet. It takes the spreadsheet ID as
first argument and the sheet name as second. Returns the properties part of
the
[`Sheet`](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#Sheet)
object which also contains the `sheetUrl`.

```js
const {sheetUrl} = await createSheet(id, sheet);
console.log(sheetUrl);
```

#### `deleteSheet`

```hs
deleteSheet :: (id: String, sheet: String): F ()
```

Delete a sheet on a spreadsheet. It takes the spreadsheet ID as first
argument, and the sheet name as second argument.

```js
await deleteSheet(id, sheet);
```

#### `getSheet`

```hs
getSheet :: (id: String, sheet: String): F Sheet
```

Retrieve the properties of a single sheet on a spreadsheet. Returns the
properties part of the
[`Sheet`](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#Sheet)
object which also contains the `sheetUrl`.

```js
const {sheetUrl} = await getSheet(id, sheet);
console.log(sheetUrl);
```

#### `getOrCreateSheet`

```hs
getOrCreateSheet :: (id: String, sheet: String): F Sheet
```

Get an existing sheet on a spreadsheet or create it if it doesn't yet
exist. Returns the properties part of the
[`Sheet`](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#Sheet)
object which also contains the `sheetUrl`.

```js
const {sheetUrl} = await getOrCreateSheet(id, sheet);
console.log(sheetUrl);
```

#### `updateSheetProps`

```hs
updateSheetProps :: (id: String, sheet: String, props: Object): F Sheet
```

Update the properties of a sheet on a spreadsheet. It takes the spreadsheet ID
as first argument, the sheet name as second argument and an [sheet
properties](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#SheetProperties)
object as third argument. Returns the properties part of the
[`Sheet`](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#Sheet)
object which also contains the `sheetUrl`.

```js
const props = {title: "New Name"};
const {title, sheetUrl} = await updateSheetProps(id, sheet, props);
console.log(title, sheetUrl);
```

#### `duplicateSheet`

```hs
duplicateSheet :: (id: String, sheet: String, toId: String, toSheet: String): F Sheet
```

Make a clone of an existing sheet on a spreadsheet. The target spreadsheet can
also be different than the source spreadsheet. It takes the source spreadsheet
ID and source sheet name as first two argument and the target spreadsheet ID
and target sheet name as third and fourth argument. Returns the properties part of the
[`Sheet`](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#Sheet)
object which also contains the `sheetUrl`.

```js
const {sheetUrl} = await duplicateSheet(sourceId, sourceSheet, targetId, targetSheet);
console.log(sheetUrl);
```

#### `getRows`

```hs
getRows :: (id: String, sheet: String): F Rows
```

Return the content of a spreadsheet. It takes the spreadsheet ID as first
argument and the sheet name as second argument. It returns the content of a
spreadsheet as [`Rows`](#rows).

```js
const [header, ...rows] = await getRows(id, sheet);
```

#### `clearRows`

```hs
clearRows :: (id: String, sheet: String): F ()
```

Delete all rows in a sheet of a spreadsheet. It takes the spreadsheet ID as
first argument and the sheet name as second argument.

```js
await clearRows(id, sheet);
```

#### `appendRows`

```hs
appendRows :: (id: String, sheet: String, rows: Rows): F Updates
```

Appends `rows` to the end of a sheet of a spreadsheet. It takes the
spreadsheet ID and sheet name as first two arguments and a `Rows` type as
third argument. It returns an [`Updates
object`](https://developers.google.com/sheets/api/reference/rest/v4/UpdateValuesResponse)
describing all changes.

```js
const {updatedRange} = await appendRows(id, sheet, rows);
console.log(updatedRange);
```

#### `deleteRows`

```hs
deleteRows :: (id: String, sheet: String, indexes: Array): F ()
```

Delete rows of a spreadsheet by index number. `indexes` is an array of index
numbers. Indexing is zero based. an Index of `1` actually deletes the row that
is labeled as row `2` in the spreadsheet. Rows are emptied and removed, which
will shrink the number of total rows in the sheet.

```js
const indexes = rows.reduce((memo, row, i) => {
  if (row[3] === "Yes") return memo.concat(i);
  return memo;
}, []);
await deleteRows(id, sheet, indexes);
```

#### `replaceRows`

```hs
replaceRows :: (id: String, sheet: String, rows: Rows): F Updates
```

Replace all rows in a spreadsheet with new rows. It takes the spreadsheet ID
and sheet name as first two arguments and the replacement [`rows`](#rows) as
third. It returns an [`Updates
object`](https://developers.google.com/sheets/api/reference/rest/v4/UpdateValuesResponse)
describing all changes.

```js
const {updatedRange} = aweait replaceRows(id, sheet, rows);
console.log(updatedRange);
```

#### `safeReplaceRows`

```hs
safeReplaceRows :: (id: String, sheet: String, rows: Rows): F [Updates, Error]
```

Like `replaceRows`, replace the rows of a spreadsheet with a new list of
rows. In order to avoid any data loss, the original sheet is duplicated before
any destructive operation. This function returns a tuple, where the first
element is an [`Updates
object`](https://developers.google.com/sheets/api/reference/rest/v4/UpdateValuesResponse)
if the function succeeds, or in case of any error, holds an error object as
the second element. The error object has the properties `spreadsheet`, `sheet`
and `sheetUrl`, which is the location of the data backup.

```js
const [updates, e] = await safeReplaceRows(spreadsheetId, sheetName, rows);
if (e) {
  console.log(e.sheetUrl);
  throw e;
} else {
  console.log(updates);
}
```

#### `getAndRemoveRowsByField`

```hs
getAndRemoveRowsByField :: (id: String, sheet: String, field: String, value: String): F Rows
```

Fetch and remove rows from a spreadsheet based on an equality match. It
returns [`Rows`](#rows) where the `field` matches `value`. The matched rows
are removed from the sheet.

```js
const [header, ...data] = await getAndRemoveRowsByField(id, sheet, "enabled", "Yes");
console.log(header);
console.log(data);
```

### `unitsToRows`

```hs
unitsToRows :: (fields: Array, units: Array): Rows
```

Transform SugarCube data units to table rows. It takes a list of field paths
and a list of data units and returns a list of rows. The resulting rows will
always contain `_sc_id_hash` and `_sc_content_hash`, so there is no need to
include those two fields into the fields array. The first row of the resulting
rows is an array containing all header fields. Every consecutive row is
equivalent to a single unit.

```js
import {unitsToRows} from "@sugarcube/plugin-googlesheets";

const units = [
  {_sc_id_hash: "one", _sc_content_hash: "one", a: 1, b: 2, c: 3},
  {_sc_id_hash: "two", _sc_content_hash: "two", a: 4, b: 5, c: 6},
  {_sc_id_hash: "three", _sc_content_hash: "three", a: 7, b: 8, c: 9},
];
const fields = ["a", "b"];
const rows = unitsToRows(fields, units);
console.log(rows);
// [
//  ["_sc_id_hash", "_sc_content_hash", "a", "b"],
//  ["one", "one", 1, 2],
//  ["two", "two", 4, 5],
//  ["three", "three", 7, 8],
// ]
```

### `rowsToUnits`

```hs
rowsToUnits :: (fields: Array, rows: Rows): Array
```

Transform rows of data to SugarCube units of data. This function acts as the
inverse to `unitsToRows`. The `fields` array specifies which header fields to
convert. It will always convert `_sc_id_hash` and `_sc_content_hash`.

```js
import {rowsToUnits} from "@sugarcube/plugin-googlesheets";

const rows = [
  ["_sc_id_hash", "_sc_content_hash", "a", "b"],
  ["one", "one", 1, 2],
  ["two", "two", 4, 5],
];
const fields = ["a"];
const units = rowsToUnits(fields, rows);
console.log(units);
// [
//  {_sc_id_hash: "one", _sc_content_hash: "one", a: "1"},
//  {_sc_id_hash: "two", _sc_content_hash: "two", a: 4},
// ]
```

### `rowsToQueries`

```hs
rowsToQueries :: (rows: Rows): Array
```

Convert rows of queries to a list of queries usable by SugarCube. Each query
has a `type` and a `term`.

```js
import {rowsToQueries} from "@sugarcube/plugin-googlesheets";

const rows = [
  ["type", "term"],
  ["ddg_search", "Keith Johnstone"],
];
const queries = rowsToQueries(rows);
console.log(queries);
// [
//  {type: "ddg_search", term: "Keith Johnstone"},
// ]
```

### `concatEnvelopeAndRows`

```hs
concatEnvelopeAndRows :: (envelope: Envelope, rows: Rows): Envelope
```

Concat the data of an envelope and rows to return a new envelope with the two
sets merged.

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
