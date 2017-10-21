import {get, size} from "lodash/fp";
import {flowP, collectP, flatmapP, tapP} from "combinators-p";
import {envelope as e} from "@sugarcube/core";
import withSession from "../sheets";

const querySource = "sheets_query";

const plugin = (envelope, {log, cfg}) => {
  const client = get("google.client_id", cfg);
  const secret = get("google.client_secret", cfg);
  const project = get("google.project_id", cfg);
  const token = get("google.token", cfg);
  const id = get("google.spreadsheet_id", cfg);
  const queries = e.queriesByType(querySource, envelope);

  log.info(`Fetching ${size(queries)} sheet${size(queries) > 1 ? "s" : ""}`);

  const querySheet = query =>
    withSession(
      async ({getValues}) => {
        const {values} = await getValues(id, query);
        log.info(`Fetched ${size(values)} queries from ${id}/${query}`);
        return values;
      },
      {client, secret, project, token}
    );

  return flowP(
    [
      flatmapP(querySheet),
      collectP(([type, term]) => ({type, term})),
      tapP(rs =>
        log.info(`Fetched ${size(rs)} quer${size(rs) > 1 ? "ies" : "y"}.`)
      ),
      rs => e.concatQueries(rs, envelope),
    ],
    queries
  );
};

plugin.desc = "Fetch queries from a Google Sheet.";

plugin.argv = {};

export default plugin;
