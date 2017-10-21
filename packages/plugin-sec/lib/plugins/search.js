import {
  flow,
  forEach,
  nth,
  compact,
  chunk,
  size,
  replace,
  split,
} from "lodash/fp";
import {flowP, collectP4, flatmapP, tapP} from "combinators-p";
import {envelope as env} from "@sugarcube/core";
import request from "request-promise";
import {URL} from "url";
import cheerio from "cheerio";
import moment from "moment";

const forEachObj = forEach.convert({cap: false});

const url = "https://searchwww.sec.gov/EDGARFSClient/jsp/EDGAR_MainAccess.jsp";

const querySource = "sec_search";

const search = term => {
  const params = {
    sort: "Date",
    formType: "FormSD",
    isAdv: "true",
    stemming: "true",
    numResults: "100",
  };
  const requestUrl = new URL(url);

  forEachObj((v, k) => requestUrl.searchParams.append(k, v), params);
  requestUrl.searchParams.append("search_text", term.replace(" ", "+"));
  return request(requestUrl.toString());
};

const scrape = html => {
  const $ = cheerio.load(html);
  const results = $("#ifrm2 table:nth-child(2) tr:not(:first-child)").toArray();

  return collectP4(async ([first, second]) => {
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

    const $filing = cheerio.load(await request(filingLink));

    return {
      date_filed: dateFiled,
      name,
      filing_link: filingLink,
      filing: $filing("body").text(),
      cik,
      sic: !sic || sic === "0000" ? null : sic,
      _sc_id_fields: ["cik"],
      _sc_relations: [{type: "url", term: filingLink}],
      _sc_downloads: [{type: "url", term: filingLink}],
      _sc_links: [{type: "url", term: filingLink}],
    };
  }, chunk(4, results));
};

const plugin = (envelope, {log}) => {
  const queries = env.queriesByType(querySource, envelope);

  const doSearch = flowP([
    tapP(term => log.info(`Searching the SEC for '${term}'`)),
    flowP([search, scrape]),
    tapP(r => log.info(`Fetched ${size(r)} results.`)),
  ]);

  return flatmapP(doSearch, queries).then(rs => env.concatData(rs, envelope));
};

plugin.desc = "Search the SEC for EDGAR filings.";

plugin.argv = {
  "sec.results": {
    nargs: 1,
    desc: "The number of results to fetch.",
    default: 100,
  },
};

export default plugin;
