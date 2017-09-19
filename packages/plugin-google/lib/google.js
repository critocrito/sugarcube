import {curry, merge} from 'lodash/fp';

import {search, images, reverseImagesFromFile} from './browser';
import {parseSearches, parseImages, parseReverseImages} from './parsers';

const searchUrl = 'https://google.com/search';
const imagesUrl = 'https://images.google.com';

export const googleSearch = curry((headless, term) =>
  search(searchUrl, headless, term).then(parseSearches(searchUrl)));

export const imageSearch = curry((scrollCount, headless, term) =>
  images(searchUrl, scrollCount, headless, term).then(parseImages));

export const reverseImageSearchFromFile = curry((headless, term) =>
  reverseImagesFromFile(imagesUrl, headless, term).then(parseReverseImages));

export const entity = curry((source, unit) =>
  // TODO: Replace with mergeWith to merge arrays properly.
  merge(unit, {
    _lf_source: source,
    _lf_id_fields: ['href'],
    _lf_content_fields: ['title'],
    _lf_links: [{type: 'url', term: unit.href}],
    _lf_relations: [{type: 'url', term: unit.href}],
    _lf_downloads: [{type: 'url', term: unit.href}],
  }));

export const searchEntity = curry((term, unit) =>
  merge(unit, {
    _lf_pubdates: {source: unit.date},
    _lf_queries: [{type: 'google_search', term}],
    _lf_content_fields: ['title', 'description'],
  }));

export const imagesEntity = curry((term, unit) =>
  merge(unit, {
    _lf_content_fields: [unit.imgHref],
    _lf_queries: [{type: 'google_images', term}],
    _lf_links: [{type: 'url', term: unit.href}, {type: 'url', term: unit.imgHref}],
    _lf_relations: [{type: 'url', term: unit.href}, {type: 'url', term: unit.imgHref}],
    _lf_downloads: [{type: 'image', term: unit.href}, {type: 'url', term: unit.imgHref}],
    _lf_media: [{type: 'image', term: unit.href}],
  }));

export default {
  googleSearch,
  imageSearch,
  reverseImageSearchFromFile,

  entity,
  searchEntity,
  imagesEntity,
};
