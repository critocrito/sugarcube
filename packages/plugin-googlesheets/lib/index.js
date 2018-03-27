import {flow, intersection, pick, forEach, merge, keys} from "lodash/fp";

import exportPlugin from "./plugins/export";
import importPlugin from "./plugins/import";
import queriesPlugin from "./plugins/queries";

const plugins = {
  sheets_export: exportPlugin,
  sheets_import: importPlugin,
  sheets_queries: queriesPlugin,
};

const authPlugins = flow([
  keys,
  intersection(["sheets_export", "sheets_import", "sheets_queries"]),
  pick(plugins),
])(plugins);

const sheetPlugins = flow([
  keys,
  intersection(["sheets_export", "sheets_import", "sheets_queries"]),
  pick(plugins),
])(plugins);

const fieldPlugins = flow([
  keys,
  intersection(["sheets_export", "sheets_import"]),
  pick(plugins),
])(plugins);

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "google.refresh_token": {
        type: "string",
        desc: "Google OAuth refresh token.",
      },
      "google.client_id": {
        type: "string",
        desc: "google OAuth client ID.",
      },
      "google.client_secret": {
        type: "string",
        desc: "Google OAuth client secret.",
      },
      "google.spreadsheet_id": {
        type: "string",
        desc: "Google spreadsheet ID to use.",
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
        type: "string",
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
        type: "array",
        desc: "Fields of SugarCube units to export and import.",
      },
    },
    p.argv
  );
}, fieldPlugins);

export {plugins};
export default {plugins};
