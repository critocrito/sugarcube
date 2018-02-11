import {curry, merge} from "lodash/fp";

import {search, images, reverseImagesFromFile} from "./browser";
import {parseSearches, parseImages, parseReverseImages} from "./parsers";

const searchUrl = "https://google.com/search";
const imagesUrl = "https://images.google.com";

export const googleSearch = curry((headless, term) =>
  search(searchUrl, headless, term).then(parseSearches(searchUrl))
);

export const imageSearch = curry((scrollCount, headless, term) =>
  images(searchUrl, scrollCount, headless, term).then(parseImages)
);

export const reverseImageSearchFromFile = curry((headless, term) =>
  reverseImagesFromFile(imagesUrl, headless, term).then(parseReverseImages)
);

export const entity = curry((source, unit) =>
  // TODO: Replace with mergeWith to merge arrays properly.
  merge(unit, {
    _sc_source: source,
    _sc_id_fields: ["href"],
    _sc_content_fields: ["title"],
    _sc_relations: [{type: "url", term: unit.href}],
    _sc_media: [{type: "url", term: unit.href}],
  })
);

export const searchEntity = curry((term, unit) =>
  merge(unit, {
    _sc_pubdates: {source: unit.date},
    _sc_queries: [{type: "google_search", term}],
    _sc_content_fields: ["title", "description"],
  })
);

export const imagesEntity = curry((term, unit) =>
  merge(unit, {
    _sc_content_fields: [unit.imgHref],
    _sc_queries: [{type: "google_images", term}],
    _sc_relations: [
      {type: "url", term: unit.href},
      {type: "url", term: unit.imgHref},
    ],
    _sc_media: [
      {type: "image", term: unit.href},
      {type: "url", term: unit.imgHref},
    ],
  })
);

export default {
  googleSearch,
  imageSearch,
  reverseImageSearchFromFile,

  entity,
  searchEntity,
  imagesEntity,
};
