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
