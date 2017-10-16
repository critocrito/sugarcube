import {flow, intersection, pick, forEach, merge, keys} from "lodash/fp";
import {plugin} from "@sugarcube/core";

import exportPlugin from "./plugins/export";
import importPlugin from "./plugins/import";
import queriesPlugin from "./plugins/queries";
import {assertCredentials, assertSpreadsheet, assertSheet} from "./assertions";

const plugins = {
  sheets_export: plugin.liftManyA2([
    assertCredentials,
    assertSpreadsheet,
    exportPlugin,
  ]),
  sheets_import: plugin.liftManyA2([
    assertCredentials,
    assertSpreadsheet,
    assertSheet,
    importPlugin,
  ]),
  sheets_queries: plugin.liftManyA2([
    assertCredentials,
    assertSpreadsheet,
    queriesPlugin,
  ]),
};

const authPlugins = flow([
  keys,
  intersection(["sheets_export", "sheets_import", "sheets_queries"]),
  pick(plugins),
])(plugins);

const sheetPlugins = flow([
  keys,
  intersection(["sheets_queries"]),
  pick(plugins),
])(plugins);

const fieldPlugins = flow([
  keys,
  intersection(["sheets_export"]),
  pick(plugins),
])(plugins);

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "google.token": {
        type: "text",
        desc: "Google oauth token.",
      },
      "google.client_id": {
        type: "text",
        desc: "google Oauth client id.",
      },
      "google.project_id": {
        type: "text",
        desc: "Google Oauth project id.",
      },
      "google.client_secret": {
        type: "text",
        desc: "Google Oauth client secret.",
      },
      "google.spreadsheet_id": {
        type: "text",
        desc: "Google Spreadsheet ID to use.",
      },
    },
    p.argv
  );
}, authPlugins);

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "google.sheet": {
        type: "text",
        desc: "The name of the sheet to use.",
      },
    },
    p.argv
  );
}, sheetPlugins);

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "google.sheet_fields": {
        type: "text",
        desc: "Fields of SugarCube units to export and import.",
      },
    },
    p.argv
  );
}, fieldPlugins);

export {plugins};
export default {plugins};
