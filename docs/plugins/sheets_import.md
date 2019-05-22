---
path: "/plugins/sheets_import"
title: "sheets_import plugin"
author: "niko <niko@niko.io>"
version: "0.24.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-googlesheets#readme"
tags: ["sugarcube","sugarcube plugin","sugarcube-plugin","google sheets"]
---

### Installation
    npm install --save @sugarcube/plugin-googlesheets

### Authentication

This plugin uses the Google API Oauth. In order to use this plugin you need
the following:

-   A [Google account](https://gmail.com).
-   A spreadsheet ID. Logged in as your user, create a new spreadsheet, and copy
    the spreadsheet ID from the URL.
-   A client ID, a client secret and a token.

    -   Go to the [Developers Console](https://console.developers.google.com) and
        login with your account.
    -   Create a new project.
    -   Enable the Google Sheets API.
    -   Under the "Credentials" page (click on the left bar):

        -   Configure the OAuth consent screen and use "other" as the application
            type.
        -   Create new credentials and select `OAuth client ID`, this will generate
            a client ID and the client secret.

![Google Developer Console](developer-console.jpg?raw=true "Google Developer Console")

Your current config looks like this:

    {
      "google": {
        "client_id": "<CLIENT ID>",
        "client_secret": "<CLIENT SECRET>",
        "spreadsheet_id": "<SPREADSHEET ID>"
      }
    }

When running the first time it will ask you to visit an URL to authorize your
Google account. On success you will receive an OAuth token, which you have to
paste in your terminal.

The retrieved credentials are stored using the cache facility of SugarCube. In
case of the CLI interface the tokens are stored in `.sugarcube_cache.json`.


### Usage
Import data from a Google Spreadsheet.

-   `google.client_id`: The identifier for this client.
-   `google.client_secret`: A secret that is used by this client.
-   `google.spreadsheet_id`: The ID of the spreadsheet to import from.
-   `google.sheet`: The name of the sheet to use as import source. Defaults to
    _Sheet1_.
-   `google.sheet_fields`: Specify the field names, which should be imported from
    the spreadsheet. Defaults to all fields.
-   `google.id_fields`: Specify a list of field names that are used to calculate
    the `_sc_id_hash`. The `_sc_id_fields` field is populated with those fields.

The `sheets_import` plugin can take optional queries of type
`sheets_condition` which specifies which rows to import based on a field
match. The format of the query term is `<field>:<value>`. Currently only exact
matches are supported. When specified, only rows matching the field will be
imported from the sheets.

```sh
sugarcube -Q sheets_condition:aa:23 -Q sheets_condition:bb:42 -p sheets_import
```
