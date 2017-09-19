import {curry, flow, trimCharsEnd} from "lodash/fp";
import cheerio from "cheerio";
import {URL} from "url";
import {maybeDate} from "./utils";

export const parseSearches = curry((searchUrl, body) => {
  const $ = cheerio.load(body);

  return $("div.srg > div.g")
    .toArray()
    .map(el => {
      const title = $("h3 > a", el).text();
      const href = $("h3 > a", el).attr("href");
      const actionItems = $("div.s ol > li", el).toArray();
      const cached = $("a", actionItems[0]).attr("href");
      const similar = `${searchUrl}${$("a", actionItems[1]).attr("href")}`;
      const date = flow([trimCharsEnd(" - "), maybeDate])(
        $("div.s span.st > span.f", el).text()
      );
      const description = $("div.s span.st", el).text();

      return {title, href, cached, similar, description, date};
    });
});

export const parseImages = html => {
  const $ = cheerio.load(html);
  return $("#rg a.rg_l")
    .parents()
    .toArray()
    .map(el => {
      const path = $("a.rg_l", el).attr("href");
      const u = new URL(`https://google.com${path}`);
      return {
        href: u.searchParams.get("imgurl"),
        imgHref: u.searchParams.get("imgrefurl"),
      };
    });
};

export const parseReverseImages = html => {
  const $ = cheerio.load(html);
  // const topstuff = $('#topstuff');
  const results = $("#search div.srg div.g")
    .toArray()
    .map(el => {
      const title = $("h3 > a", el).text();
      const href = $("h3 > a", el).attr("href");

      return {title, href};
    });
  return results;
};

export default {
  parseSearches,
  parseImages,
  parseReverseImages,
};
