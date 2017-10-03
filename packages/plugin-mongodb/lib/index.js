import {forEach, merge, values} from "lodash/fp";

import db from "./db";
// FIXME: I disabled the specific store plugins. The semantic has to be better
//        figured out.
// import existsPlugin from './plugins/exists';
// import storeDataPlugin from './plugins/store-data';
// import storeRelationsPlugin from './plugins/store-relations';
// import storeRevisionsPlugin from './plugins/store-revisions';
import storePlugin from "./plugins/store";
import fetchUnitsPlugin from "./plugins/fetch-units";
import fetchRelationsPlugin from "./plugins/fetch-relations";
import fetchRevisionsPlugin from "./plugins/fetch-revisions";
import queryUnitsPlugin from "./plugins/query-units";
import complementPlugin from "./plugins/complement";
import complementLeftPlugin from "./plugins/complement-left";

const plugins = {
  // mongodb_exists: existsPlugin,
  // mongodb_store_data: storeDataPlugin,
  // mongodb_store_relations: storeRelationsPlugin,
  // mongodb_store_revisions: storeRevisionsPlugin,
  mongodb_store: storePlugin,
  mongodb_fetch_units: fetchUnitsPlugin,
  mongodb_fetch_relations: fetchRelationsPlugin,
  mongodb_fetch_revisions: fetchRevisionsPlugin,
  mongodb_query_units: queryUnitsPlugin,
  mongodb_complement: complementPlugin,
  mongodb_supplement: complementLeftPlugin,
};

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "mongodb.uri": {
        type: "string",
        nargs: 1,
        desc: "The MongoDB connection string",
        default: "mongodb://localhost/sugarcube",
      },
    },
    p.argv
  );
}, values(plugins));

export {plugins, db};
export default {plugins, db};
