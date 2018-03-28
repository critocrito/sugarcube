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

Export data to a Google spreadsheet.

- `google.client_id`: The identifier for this client.
- `google.client_secret`: A secret that is used by this client.
- `google.spreadsheet_id`: The ID of the spreadsheet to export to.
- `google.sheet`: The name of the sheet to export to.
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
- `google.sheet`: The name of the sheet to use as import source.

### `sheets_queries`

Fetch queries from a Google spreadsheet. The first column is the query type,
and the second column is the query term. The plugin looks up the
`sheets_query` query type to determine the sheet in which to look.

- `google.client_id`: The identifier for this client.
- `google.client_secret`: A secret that is used by this client.
- `google.spreadsheet_id`: The ID of the spreadsheet to fetch from.
- `google.sheet`: The name of the sheet to query from.
