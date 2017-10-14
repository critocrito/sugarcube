import {forEach, merge, values} from "lodash/fp";
import {plugin} from "@sugarcube/core";

import exportPlugin from "./export";
import importPlugin from "./import";
import {assertCredentials, assertSpreadsheet} from "./assertions";

const plugins = {
  sheets_export: plugin.liftManyA2([
    assertCredentials,
    assertSpreadsheet,
    exportPlugin,
  ]),
  sheets_import: plugin.liftManyA2([
    assertCredentials,
    assertSpreadsheet,
    importPlugin,
  ]),
};

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "google.token": {
        type: "text",
        desc: "Google oauth token",
      },
      "google.client_id": {
        type: "text",
        desc: "google Oauth client id",
      },
      "google.project_id": {
        type: "text",
        desc: "Google Oauth project id",
      },
      "google.client_secret": {
        type: "text",
        desc: "Google Oauth client secret",
      },
      "google.spreadsheet_id": {
        type: "text",
        desc: "Google Spreadsheet ID to use",
      },
      "google.sheet_fields": {
        type: "text",
        desc: "Fields of sugarcube units to export and import",
      },
    },
    p.argv
  );
}, values(plugins));

export {plugins};
export default {plugins};
