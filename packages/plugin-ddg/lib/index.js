var _ = require('lodash'),
    pify = require("pify"),
    cheerio = require('cheerio'),
    envelope = require('@sugarcube/core').envelope,
    getAsync = pify(require('request').get),
    url = require('url');

var sharedFields = ['href', 'type', 'content', 'title', 'order' ];

var duckClean = function(dirtyContent) {
  /* because contains a lot of spaces and \n\n */
  return dirtyContent.replace(/\ \ \.*/g, '').replace(/\n/g, '');
};

var goGoDuck = function(searchQuery) {

  var uri = 'https://duckduckgo.com/html/?q=' + encodeURIComponent(searchQuery);

  return getAsync(uri)
    .then( function(response) {
      if (response.statusCode !== 200) {
        throw new Error("DuckDuckGo return " + response.statusCode);
      }
      var parsed_links = [];
      var ddgEntry = cheerio.load(response.body)('div .links_main');

      _.each(ddgEntry, function(div, i) {
        var completeSection = cheerio.load(div).html();
        var entryDesc = cheerio.load(div)('.result__snippet').text();
        var entryTitle = cheerio.load(div)('.result__title').text();
        var href = url.parse(cheerio.load(div)('.result__a').attr('href'), true);

        parsed_links.push({
          // html_section: completeSection,
          query: searchQuery,
          order: i + 1,
          href: href.query.uddg,
          query_url: uri,
          content: duckClean(entryDesc),
          title: duckClean(entryTitle)
        });
      });
      /* Remind, in this way I'm losing the association between source
       * of results and the actual responses.  */
      return parsed_links;
    });
  // TODO manage network error
};

var mightyDucky = function(val, {log}) {
  var ddgTerms = envelope.queriesByType('ddg_search', val);

  return Promise.map(ddgTerms, goGoDuck)
                .then ( function(results) {
                  return _.reduce(results, function(flattened, other) {
                    return flattened.concat(other);
                  }, []);
                })
                .tap( function(aggregated) {
                  log.debug("Fetched " + _.size(aggregated) + " results for " +
                            _.size(ddgTerms) + " search terms.");
                })
                .tap( function(aggregated)  {
                  _.each(aggregated, function(lo)  {
                    var finalized = _.pick(lo, sharedFields);
                    finalized._sc_source = 'ddg_search';
                    finalized._sc_id_fields = ['href'];
                    finalized._sc_content_fields = ['content'];
                    finalized._sc_title = 'title';
                    finalized._sc_content = 'content';
                    finalized._sc_links = [{
                      'href': lo.href,
                      'type': 'url'
                    }, {
                      'href': lo.query_url,
                      'meta': {"q": lo.query },
                      'method': 'GET',
                      'type': 'self'
                    }];
                    finalized._sc_relations = [{type: 'url', term: lo.href}];

                    val.data.push(finalized);
                  });
                })
  /* .tap( function(aggregated)  {
   *     // TODO move mail in a library
   *    mail.appendMailInfo(val, {
   *        'source': 'DuckDuckGo',
   *        'info': [ 'From', _.size(ddgTerms),
   *                  'terms, retrieved', _.size(aggregated),
   *                  'results' ]
   *    });
   * })*/
                .return(val);
};

mightyDucky.desc = 'Fetch search results from DuckDuckGo.';

module.exports = {
  plugins: {
    ddg_search: mightyDucky,
  },
};
