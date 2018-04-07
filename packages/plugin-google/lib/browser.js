import {curry, flow} from "lodash/fp";
import Nightmare from "nightmare";

import {urlify} from "./utils";

require("nightmare-upload")(Nightmare);
require("babel-polyfill");

const browse = curry((show, url) => {
  const nightmare = Nightmare({show});
  return nightmare.goto(url);
});

const html = n => n.end().evaluate(() => document.body.innerHTML); // eslint-disable-line no-undef

const scrolledHtml = curry((scrollCount, nightmare) => {
  // eslint-disable-next-line no-undef
  const scrollHeight = () => document.body.scrollHeight;

  // eslint-disable-next-line func-names
  const run = Promise.coroutine(function*() {
    for (let i = 0; i < scrollCount; i += 1) {
      const height = yield nightmare.evaluate(scrollHeight);
      yield nightmare.scrollTo(height, 0).wait(1000);
    }
    // TODO: Not sure why I have to call `html` here, the only way I found.
    return html(nightmare);
  });

  return run();
});

export const search = curry((url, headless, term) =>
  flow([
    browse(headless),
    n =>
      n
        .type("#lst-ib", term)
        .click("input[name='btnK']")
        .wait("div.srg"),
    html,
  ])(url),
);

export const images = curry((url, scrollCount, headless, term) =>
  flow([
    urlify({tbm: "isch", q: term}),
    browse(headless),
    scrolledHtml(scrollCount),
  ])(url),
);

export const reverseImagesFromFile = curry((url, headless, path) =>
  flow([
    browse(headless),
    n =>
      n
        .click("a.gsst_a")
        .wait("#qbf a")
        .click("#qbf a")
        .wait("#qbfile")
        .upload("#qbfile", path)
        .wait(5000), // TODO: Maybe there is a better wait condition.
    html,
  ])(url),
);

export default {search, images, reverseImagesFromFile};
