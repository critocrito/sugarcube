import {
  curry,
  flow,
  forEach,
  nth,
  get,
  merge,
  compact,
  chunk,
  size,
  replace,
  split,
} from "lodash/fp";
import {flowP, collectP2, flatmapP2, tapP, retryP} from "dashp";
import {envelope as env} from "@sugarcube/core";
import request from "request-promise";
import {URL} from "url";
import cheerio from "cheerio";
import moment from "moment";

const forEachObj = forEach.convert({cap: false});

const url = "http://searchwww.sec.gov/EDGARFSClient/jsp/EDGAR_MainAccess.jsp";

const querySource = "sec_search";

const search = curry((numResults, count, term) =>
  collectP2(
    i => {
      const params = {
        sort: "Date",
        formType: "FormSD",
        isAdv: "true",
        stemming: "true",
        startDoc: i === 0 ? 0 : i * numResults + 1,
        numResults,
      };

      const requestUrl = new URL(url);

      forEachObj((v, k) => requestUrl.searchParams.append(k, v), params);
      requestUrl.searchParams.append("search_text", term.replace(" ", "+"));

      return request(requestUrl.toString());
    },
    [...Array(Math.ceil(count / numResults)).keys()]
  )
);

const scrape = html => {
  const $ = cheerio.load(html);
  const results = $("#ifrm2 table:nth-child(2) tr:not(:first-child)").toArray();

  return collectP2(async ([first, second]) => {
    const dateFiled = moment
      .utc($("td:first-child i", first).text(), "DD/MM/YYYY")
      .toDate();
    const filing = $("td:nth-child(2) a", first).attr("href");
    const [filingLink, name] = flow([
      compact,
      nth(1),
      replace(/["']/g, ""),
      split(","),
    ])(filing.match(/opennew\((.*)\);$/i));
    // const [filingLink, name] = compact(filing.match(/opennew\((.*)\);$/i))
    //   [1].replace(/["']/g, "")
    //   .split(",");
    const cik = $("#cikSearch", second).text();
    const sic = $("#sicSearch", second).text();
    const media = [{type: "url", term: filingLink}];
    const $filing = cheerio.load(await retryP(request(filingLink)));

    return {
      date_filed: dateFiled,
      name,
      filing_link: filingLink,
      filing: $filing("body").text(),
      cik,
      sic: !sic || sic === "0000" ? null : sic,
      _sc_id_fields: ["cik"],
      _sc_relations: media,
      _sc_media: media,
    };
  }, chunk(4, results));
};

const plugin = (envelope, {log, cfg}) => {
  const pageCount = 100;
  const total = get("sec.results", cfg);
  const queries = env.queriesByType(querySource, envelope);

  const doSearch = term => {
    log.info(`Searching the SEC for '${term}'`);
    return flowP(
      [
        flowP([search(pageCount, total), flatmapP2(scrape)]),
        tapP(rs => log.info(`Fetched ${size(rs)} results.`)),
        collectP2(unit =>
          merge(unit, {_sc_queries: [{type: "sec_search", term}]})
        ),
      ],
      term
    );
  };

  return flatmapP2(q => retryP(doSearch(q)), queries).then(rs =>
    env.concatData(rs, envelope)
  );
};

plugin.desc = "Search the SEC for EDGAR filings.";

plugin.argv = {
  "sec.results": {
    nargs: 1,
    desc: "The number of results to fetch.",
    default: 500,
  },
};

export default plugin;
