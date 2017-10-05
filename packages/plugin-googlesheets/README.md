# SugarCube Plugin Google Sheets

A plugin to handle operations based around adding or updating unit data in google sheets

Includes two plugins:
`sheets_import`, `sheets_export`

## Authenticating

here i will write the authentication procedure, getting a google client, and generating the token

## Configuration values

an example config:

```
"google": {

		// authentication values:
    "token": "token",
    "client_id": "clientid",
    "project_id": "projectid",
    "client_secret": "clientsectet",

		// always needed:
    "spreadsheet_id": "spreadsheetid",

	// export:
		// a new sheet is created in the above spreadsheet
		// name is the run marker

		// which sheet id to copy formatting and data validation from
		"copy_formatting_from": "2365788284",

	// import:

		// which sheet to import from in the spreadsheet
		"sheet": "Sheetname"

		// which fields to export and import?
		// lf_id_hash is always added to export
    "sheet_fields": [
			"dem.reference_code",
			"dem.relevant",
			"dem.verified",
			"dem.weapons_used.0",
			"dem.weapons_used.1"
			]
  },
```
