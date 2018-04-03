# `@sugarcube/plugin-googlesheets`

A plugin to handle operations based around adding or updating unit data in
google sheets.

## Usage

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

### `sheets_export`

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
  from. Requires `google.copy_from_spreadsheet` as well.
- `google.skip_empty` Use this option to only export data pipelines that contain
  any data.

### `sheets_import`

Import data from a Google Spreadsheet.

- `google.client_id`: The identifier for this client.
- `google.client_secret`: A secret that is used by this client.
- `google.spreadsheet_id`: The ID of the spreadsheet to import from.
- `google.sheet`: The name of the sheet to use as import source. Defaults to
  *Sheet1*.

### `sheets_queries`

Fetch queries from a Google spreadsheet. The first column is the query type,
and the second column is the query term. The plugin looks up the
`sheets_query` query type to determine the sheet in which to look.

- `google.client_id`: The identifier for this client.
- `google.client_secret`: A secret that is used by this client.
- `google.spreadsheet_id`: The ID of the spreadsheet to fetch from.

### `sheets_append`

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

## API

### `withSession`

```hs
withSession :: (
  f: Function,
  {client: String, secret: String, tokens: Object}
): [Promise, Object]
```

The module exports the `withSession` function, which creates a context to
interact with the Google Sheets API. The context takes a function as a first
argument, which is executed within a single Google Sheets API session. It
receives a complete API object as it's argument. The second argument is an
object containing all parts required to authenticate the session.

```js
import {withSession, rowsToUnits} from "@sugarcube/plugin-googlesheets";

const data = withSession(
  async ({getValues}) => {
    const rows = await getValues(spreadsheet, sheet);
    return rowsToUnits(fields, rows);
  },
  {client, secret, tokens}
);
```

#### `createSpreadsheet`

#### `getSpreadsheet`

#### `createSheet`

#### `deleteSheet`

#### `getSheet`

#### `getOrCreateSheet`

#### `updateSheet`

#### `duplicateSheet`

#### `createRows`

#### `getRows`

#### `clearRows`

#### `appendRows`

#### `deleteRows`

```hs
deleteRows :: (spreadsheetId: String, sheetId: Number, rows: Array): ()
```

Delete rows of a spreadsheet by index number. `rows` is an array of index
numbers. Indexing is zero based. an Index of `1` actually deletes the row that
is labeled as row `2` in the spreadsheet.

```js
withSession(await ({getOrCreateSheet, deleteRows}) => {
  const {sheetId} = await getOrCreateSheet(id, sheetName);
  const indexes = rows.reduce((memo, row, i) => {
    if (row[3] === "Yes") return memo.concat(i);
    return memo;
  }, []);
  await deleteRows(id, sheetId, indexes);
}, {client, secret, tokens});
```

#### `getAndRemoveRowsByField`

```hs
getAndRemoveRowsByField :: (id: String, sheet: String, field: String, value: String): Array
```

Fetch and remove rows from a spreadsheet based on an equality match. It
returns an array of rows where the `field` matches `value`. The first row of
the return array is the header of the spreadsheet.

### `unitsToRows`

```hs
unitsToRows :: (fields: Array, units: Array): Array
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
rowsToUnits :: (fields: Array, rows: Array): Array
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
rowsToQueries :: (rows: Array): Array
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
