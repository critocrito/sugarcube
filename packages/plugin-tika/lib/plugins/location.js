import {merge, get} from "lodash/fp";
import {flowP, foldP, tapP} from "dashp";
import {envelope as env} from "@sugarcube/core";

import {safeExtract} from "../utils";

const querySource = "tika_location_field";

const plugin = (envelope, {log}) => {
  const fields = env.queriesByType(querySource, envelope);

  return env.fmapDataAsync(
    (unit) =>
      foldP(
        (memo, field) => {
          const value = get(field, unit);
          if (!value) {
            log.debug(`There is no value for ${field} on the unit.`);
            return memo;
          }
          return flowP(
            [
              tapP((url) => log.debug(`Parse ${field}: ${url}.`)),
              safeExtract,
              ([text, meta]) =>
                merge(memo, {
                  [`${field}_text`]: text,
                  [`${field}_meta`]: meta,
                }),
            ],
            value,
          );
        },
        unit,
        fields,
      ),
    envelope,
  );
};

plugin.desc = "Extract the data and meta data from a given location.";

export default plugin;
