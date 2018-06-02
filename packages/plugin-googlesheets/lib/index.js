import {
  flow,
  intersection,
  pick,
  forEach,
  merge,
  keys,
  values,
} from "lodash/fp";

import exportPlugin from "./plugins/export";
import importPlugin from "./plugins/import";
import queriesPlugin from "./plugins/queries";
import appendPlugin from "./plugins/append";
import movePlugin from "./plugins/move";

import SheetsDo from "./sheets";
import {
  unitsToRows,
  rowsToUnits,
  rowsToQueries,
  concatEnvelopeAndRows,
} from "./utils";

const plugins = {
  sheets_export: exportPlugin,
  sheets_import: importPlugin,
  sheets_queries: queriesPlugin,
  sheets_append: appendPlugin,
  sheets_move: movePlugin,
};

const authPlugins = flow([
  keys,
  intersection([
    "sheets_export",
    "sheets_import",
    "sheets_queries",
    "sheets_append",
    "sheets_move",
  ]),
  ps => pick(ps, plugins),
  values,
])(plugins);

const sheetPlugins = flow([
  keys,
  intersection([
    "sheets_export",
    "sheets_import",
    "sheets_queries",
    "sheets_append",
    "sheets_move",
  ]),
  ps => pick(ps, plugins),
  values,
])(plugins);

const fieldPlugins = flow([
  keys,
  intersection([
    "sheets_export",
    "sheets_import",
    "sheets_append",
    "sheets_move",
  ]),
  ps => pick(ps, plugins),
  values,
])(plugins);

const selectionPlugins = flow([
  keys,
  intersection(["sheets_export", "sheets_append", "sheets_move"]),
  ps => pick(ps, plugins),
  values,
])(plugins);

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "google.client_id": {
        type: "string",
        desc: "Google OAuth client ID.",
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
    p.argv,
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
    p.argv,
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
    p.argv,
  );
}, fieldPlugins);

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "google.selection_list": {
        type: "array",
        desc: "Validate a field as one of a list, e.g. fieldname:opt1,opt2,op3",
        default: [],
      },
    },
    p.argv,
  );
}, selectionPlugins);

export {
  plugins,
  SheetsDo,
  unitsToRows,
  rowsToUnits,
  rowsToQueries,
  concatEnvelopeAndRows,
};
export default {
  plugins,
  SheetsDo,
  unitsToRows,
  rowsToUnits,
  rowsToQueries,
  concatEnvelopeAndRows,
};
