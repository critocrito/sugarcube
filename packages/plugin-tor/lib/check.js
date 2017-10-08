import Promise from "bluebird";
import request from "request";
import cheerio from "cheerio";

Promise.promisifyAll(request);
const uri = "https://check.torproject.org/";

const plugin = (envelope, {log}) =>
  request
    .getAsync(uri)
    .tap(({body}) => {
      const $ = cheerio.load(body);
      log.info($("title").text());
    })
    .return(envelope);

plugin.desc = "Check if HTTP is happening over the TOR network.";

export default plugin;
