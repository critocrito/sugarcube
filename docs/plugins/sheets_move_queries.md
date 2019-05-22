---
path: "/plugins/sheets_move_queries"
title: "sheets_move_queries plugin"
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
Move queries in the pipeline from one sheet to another. The plugin will look up queries defined through the `sheets_queries` query type, and move the queries to a spreadsheet defined with `google.to_spreadsheet_id` and `google.to_sheet`.

By specifying `google.copy_from_spreadsheet` and `google.copy_from_sheet` the new sheet will be copied from a template if it doesn't yet exist. Both of those options have to be provided if a new sheet should be create from a template.

-   `google.client_id`: The identifier for this client.
-   `google.client_secret`: A secret that is used by this client.
-   `google.spreadsheet_id`: The ID of the spreadsheet to move from.
-   `google.to_spreadsheet_id`: The ID of the spreadsheet to move to.
-   `google.to_sheet`: The name of the sheet to move to. Defaults to the run marker of the current pipeline run.
-   `google.copy_from_spreadsheet`: Specify the spreadsheet ID to copy the template from. Requires `google.copy_from_sheet` as well.
-   `google.copy_from_sheet`: Specify a sheet name to copy the template from. Requires `google.copy_from_spreadsheet` as well.
-   `google.skip_empty` Use this option to only move data if any exists in the source.
-   `google.selection_list`: Enable a drop down selection list for a field. It validates that input can only be one of the specified options. The selection list is specified using the following format: `<field-name>:opt1,opt2,opt3`. This will validate the input of `<field-name>` to be one of `opt1`, `opt2` or `opt3`. This option is an array and can be specified multiple times.
-   `google.query_default_type`: Specify a default query type if none is provided. The plugin looks up query types in a column named `type`. If this column is missing, or the cell is empty, us the value of this option instead.
-   `google.query_fields`: The `sheets_query` plugin will always look for columns named `type` and `term`. Using this option, additional fields can be added into the query extraction. This is useful to enhance queries with additional meta data. The fields `type` and `term` are always included, so there is no need to specify them separately.
-   `google.query_types_to_move`: Specify the types of queries to move from one sheet to another. This is useful if one sheet contains queries of multiple types, but an individual pipeline only operates on a sub set of those queries. Specify multiple query types by separating them with a comma.

```sh
sugarcube -p sheets_queries,youtube_channel,sheets_move_queries \
          -Q sheets_queries:HistoricScrapes \
          --google.to_sheet DailyScrapes \
          --google.query_default_type youtube_channel \
          --google.query_types_to_move youtube_channel,youtube_video
```
