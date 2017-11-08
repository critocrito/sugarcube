import {property, merge} from "lodash/fp";
import {flowP} from "dashp";
import {envelope as env} from "@sugarcube/core";

import {safeExtract} from "../utils";

const parseLinks = envelope =>
  env.fmapDataLinksAsync(
    unit =>
      flowP(
        [
          property("term"),
          safeExtract,
          ([text, meta]) => merge(unit, {text, meta}),
        ],
        unit
      ),
    envelope
  );

const plugin = parseLinks;

plugin.desc = "Extract the data and meta data from _sc_links.";

export default plugin;
