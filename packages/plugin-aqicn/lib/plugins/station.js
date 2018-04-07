import {size} from "lodash/fp";
import {mapP, collectP} from "dashp";
import {envelope as e} from "@sugarcube/core";

import {station} from "../aqicn";

const querySource = "aqicn_station";

const plugin = (envelope, {log}) => {
  const queries = e.queriesByType(querySource, envelope);

  log.debug(`Found ${size(queries)} queries.`);

  return collectP(station, queries).then(
    mapP(rs => e.concatData(rs, envelope)),
  );
};

plugin.desc = "Query the air pollution of a aqicn station.";

plugin.argv = {};

export default plugin;
