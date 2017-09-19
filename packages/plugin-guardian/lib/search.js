import {flow, map, merge, concat, property, size} from 'lodash/fp';
import Promise from 'bluebird';
import request from 'request';
import moment from 'moment';
import {envelope as env, plugin as p, utils} from '@sugarcube/core';

import {assertKey} from './utils';

Promise.promisifyAll(request);

const {reduceP} = utils.combinators;

const content = (envelope, {log, cfg}) => {
  const {key} = cfg.guardian;

  return reduceP((memo, term) => {
    const opts = {
      uri: 'https://content.guardianapis.com/search',
      qs: {'api-key': key, q: term},
      json: true,
    };

    return request
      .getAsync(opts)
      .then(flow([
        property('body.response.results'),
        rs => {
          log.info(`Fetched ${size(rs)} pieces of content for ${term}.`);
          return rs;
        },
        concat(memo),
        map(r => {
          const unit = {
            _lf_source: 'guardian_content',
            _lf_id_fields: ['id'],
            _lf_content_fields: ['webTitle', 'webUrl'],
            _lf_pubdates: {source: moment.utc(r.webPublicationDate).toDate()},
            _lf_links: [
              {type: 'url', href: r.webUrl},
              {type: 'self', href: r.apiUrl},
            ],
            _lf_relations: [
              {type: 'url', term: r.webUrl},
              {type: 'url', term: r.apiUrl},
            ],
            _lf_downloads: [
              {type: 'url', term: r.webUrl},
              {type: 'json', term: r.apiUrl},
            ],
          };
          return merge(r, unit);
        }),
      ]));
  }, [], env.queriesByType('guardian_search', envelope))
    .then(data => env.concatData(data, envelope));
};

const plugin = p.liftManyA2([assertKey, content]);

plugin.description = 'Search for content of The Guardian.';

export default plugin;
