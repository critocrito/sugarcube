# `@sugarcube/plugin-googlesheets`

A plugin to handle operations based around adding or updating unit data in
google sheets.

## Usage

```
npm install --save @sugarcube/plugin-googlesheets
```

## Authentication

This plugin uses the Google API Oauth. This means you have to

In order to use this plugin you need the following:

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
    - Create new credentials, this will generate a client ID and the client
      secret.

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

When running the first time, it will throw an error and interrupt to provide a
link, which can be used to authenticate and authorize. Visit this link in the
browser and note the authorization token. Add this token to your configuration.

```
{
  "google": {
    "client_id": "<CLIENT ID>",
    "client_secret": "<CLIENT SECRET>",
    "spreadsheet_id": "<SPREADSHEET ID>",
    "token": "<TOKEN>"
  }
}
```

## Plugins

**Configuration Options**:

- `google.client_id`: The identifier for this client.
- `google.client_secret`: A secret that is used by this client.
- `google.token`: The refresh token, that will be used to request an access token.

### `sheets_export`

Export data to a Google spreadsheet.

- `google.spreadsheet_id`: The ID of the spreadsheet to export to.
- `google.sheet_fields`: A list of field names, which get exported to the
  spreadsheet.

### `sheets_import`

Import data from a Google Spreadsheet.

- `google.spreadsheet_id`: The ID of the spreadsheet to import from.
- `google.sheet`: The name of the sheet to use as import source.

### `sheets_queries`

Fetch queries from a Google spreadsheet. The first column is the query type,
and the second column is the query term. The plugin looks up the
`sheets_query` query type to determine the sheet in which to look.

- `google.spreadsheet_id`: The ID of the spreadsheet to fetch from.
