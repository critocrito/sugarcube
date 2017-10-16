import {property, merge, get} from "lodash/fp";
import {flowP} from "combinators-p";
import {envelope as env} from "@sugarcube/core";

import {safeExtract} from "../utils";

const parseLocation = (envelope, {cfg}) => {
  const location = get("tika.location_field", cfg);
  return env.fmapDataAsync(
    unit =>
      flowP(
        [
          property(location),
          safeExtract,
          ([text, meta]) => merge(unit, {text, meta}),
        ],
        unit
      ),
    envelope
  );
};

const plugin = parseLocation;

plugin.desc = "Extract the data and meta data from a given location.";

plugin.argv = {
  "tika.location_field": {
    type: "string",
    nargs: 1,
    default: "location",
    desc: "Specify the field name that points to the location.",
  },
};

export default plugin;
