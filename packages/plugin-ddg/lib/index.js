var _ = require("lodash"),
  pify = require("pify"),
  cheerio = require("cheerio"),
  dashp = require("dashp"),
  envelope = require("@sugarcube/core").envelope,
  // getAsync = pify(require("request").get),
  request = require("request"),
  url = require("url");

var customRequest = request.defaults({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0",
  },
});
var getAsync = pify(customRequest);
var tapP = dashp.tap;
var collectP = dashp.collect;
var flowP = dashp.flow;
var delayP = dashp.delay;

var sharedFields = ["href", "description", "title"];

var duckClean = function(dirtyContent) {
  /* because contains a lot of spaces and \n\n */
  return dirtyContent.replace(/\ \ \.*/g, "").replace(/\n/g, "");
};

let retryCount = 0;

var goGoDuck = function(searchQuery) {
  var uri = "https://duckduckgo.com/html/?q=" + encodeURIComponent(searchQuery);

  return getAsync(uri).then(function(response) {
    if (response.statusCode === 403) {
      if (retryCount < 5) {
        retryCount += 1;
        const delayM = Math.floor(Math.random() * 10) + 5 * retryCount;
        console.warn(
          `Retrying (#${retryCount}) request with ${delayM} minutes timeout.`,
        );
        return flowP([delayP(delayM * 60 * 1000), goGoDuck], searchQuery);
      }
      console.warn(`Exceeded maximum retries of ${retryCount}.`);
    }

    if (response.statusCode !== 200) {
      throw new Error("DuckDuckGo return " + response.statusCode);
    }

    var parsed_links = [];
    var ddgEntry = cheerio.load(response.body)("div .links_main");

    _.each(ddgEntry, function(div, i) {
      var completeSection = cheerio.load(div).html();
      var entryDesc = cheerio.load(div)(".result__snippet").text();
      var entryTitle = cheerio.load(div)(".result__title").text();
      var href = cheerio.load(div)(".result__a").attr("href");

      parsed_links.push({
        href: href,
        description: duckClean(entryDesc),
        title: duckClean(entryTitle),
        search_category: [searchQuery],
      });
    });
    /* Remind, in this way I'm losing the association between source
     * of results and the actual responses.  */
    return parsed_links;
  });
  // TODO manage network error
};

var mightyDucky = function(val, {log}) {
  var ddgTerms = envelope.queriesByType("ddg_search", val);

  return flowP(
    [
      collectP(goGoDuck),
      function(results) {
        return _.reduce(
          results,
          function(flattened, other) {
            return flattened.concat(other);
          },
          [],
        );
      },
      tapP(function(aggregated) {
        log.debug(
          "Fetched " +
            _.size(aggregated) +
            " results for " +
            _.size(ddgTerms) +
            " search terms.",
        );
        _.each(aggregated, function(lo) {
          var finalized = _.pick(lo, sharedFields);
          finalized._sc_source = "ddg_search";
          finalized._sc_id_fields = ["href"];
          finalized._sc_content_fields = ["description"];
          (finalized._sc_media = [{term: lo.href, type: "url"}]),
            (finalized._sc_relations = [{type: "url", term: lo.href}]);

          val.data.push(finalized);
        });
      }),
      function() {
        return val;
      },
    ],
    ddgTerms,
  );
};

mightyDucky.desc = "Fetch search results from DuckDuckGo.";

module.exports = {
  plugins: {
    ddg_search: mightyDucky,
  },
};
