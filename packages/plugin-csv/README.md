# `@sugarcube/plugin-csv`

Convert sugarcube data from and to CSV.

## Installation

```
npm install --save @sugarcube/plugin-csv
```

## Usage

### `csv_export` plugin

Export sugarcube data in CSV format to a file.

**Configuration**:

- `csv.delimiter` (defaults to `,`)

  Specify the CSV delimiter.

- `csv.filename` (defaults to `out.csv`). Specify the target file.

```
$(npm bin)/sugarcube -c config.json -p google_search,csv_export --csv.filename data.csv
```

### `csv_import` plugin

Import a CSV file, and turn it into sugarcube data.

**Configuration**:

Uses `glob_pattern` as query type.

- `csv.delimiter` (defaults to `,`)

  Specify the CSV delimiter.

- `csv.id_fields` (required). Specify one or several field names (separated by
  a comma), that are used to determine the identity of a record


```
$(npm bin)/sugarcube -Q glob_pattern:data/**/*.csv -p csv_import,tap_printf --csv.id_fields firstName,lastName
```
