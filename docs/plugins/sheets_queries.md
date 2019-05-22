---
path: "/plugins/sheets_queries"
title: "sheets_queries plugin"
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
Fetch queries from a Google spreadsheet. The first column is the query type,
and the second column is the query term. The plugin looks up the
`sheets_query` query type to determine the sheet in which to look.

-   `google.client_id`: The identifier for this client.
-   `google.client_secret`: A secret that is used by this client.
-   `google.spreadsheet_id`: The ID of the spreadsheet to fetch from.
-   `google.query_default_type`: Specify a default query type if none is provided. The plugin looks up query types in a column named `type`. If this column is missing, or the cell is empty, us the value of this option instead.
-   `google.query_fields`: The `sheets_query` plugin will always look for columns named `type` and `term`. Using this option, additional fields can be added into the query extraction. This is useful to enhance queries with additional meta data. The fields `type` and `term` are always queried, so there is no need to specify them separately.
