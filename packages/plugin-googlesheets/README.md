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
- A client ID, a client secret, a project ID and a token.

  - Go to the [Developers Console](https://console.developers.google.com) and
    login with your account.
  - Create a new project. Note the project ID mentioned
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
    "project_id": "<PROJECT ID>",
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
    "project_id": "<PROJECT ID>",
    "spreadsheet_id": "<SPREADSHEET ID>",
    "token": "<TOKEN>"
  }
}
```

## Plugins

**Configuration Options**:

- `google.client_id`
- `google.client_secret`
- `google.project_id`
- `google.token`

### `google_export`

Export data to a Google spreadsheet.

- `google.spreadsheet_id`: The ID of the spreadsheet to export to.
- `google.sheet_fields`: A list of field names, which get exported to the
  spreadsheet.

### `google_import`

Import data from a Google Spreadsheet.

- `google.spreadsheet_id`: The ID of the spreadsheet to import from.
- `google.sheet`: The name of the sheet to use as import source.
