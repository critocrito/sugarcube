---
path: "/plugins/sheets_move"
title: "sheets_move plugin"
author: "niko <niko@niko.io>"
version: "0.25.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-googlesheets#readme"
tags: ["google sheets","sugarcube","sugarcube plugin","sugarcube-plugin"]
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

Move data from one spreadsheet to another. If a sheet doesn't exist yet, a new
one will be created. Before any values are exported a backup of the target
sheet is created with the name of `<sheet-name>-bkp`. If the export succeeds,
the backup sheet is deleted.

By specifying `google.copy_from_spreadsheet` and `google.copy_from_sheet` the
new sheet will be copied from a template. Both of those options have to be
provided if a new sheet should be create from a template.

-   `google.client_id`: The identifier for this client.
-   `google.client_secret`: A secret that is used by this client.
-   `google.spreadsheet_id`: The ID of the spreadsheet to move from.
-   `google.sheet`: The name of the sheet to move from. Defaults to the run
    marker of the current pipeline run.
-   `google.to_spreadsheet_id`: The ID of the spreadsheet to move to.
-   `google.to_sheet`: The name of the sheet to move to. Defaults to the run
    marker of the current pipeline run.
-   `google.copy_from_spreadsheet`: Specify the spreadsheet ID to copy the
    template from. Requires `google.copy_from_sheet` as well.
-   `google.copy_from_sheet`: Specify a sheet name to copy the template
    from. Requires `google.copy_from_spreadsheet` as well.
-   `google.skip_empty` Use this option to only move data if any exists in the
    source.
-   `google.selection_list`: Enable a drop down selection list for a field. It
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
