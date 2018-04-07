import {flowP, tapP} from "dashp";
import pify from "pify";
import request from "request";
import cheerio from "cheerio";

const uri = "https://check.torproject.org/";

const plugin = (envelope, {log}) =>
  flowP(
    [
      pify(request.get),
      tapP(({body}) => {
        const $ = cheerio.load(body);
        log.info($("title").text());
      }),
      () => envelope,
    ],
    uri,
  );

plugin.desc = "Check if HTTP is happening over the TOR network.";

export default plugin;
