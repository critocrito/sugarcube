import {flow, map, merge, omit} from "lodash/fp";
import {URL} from "url";
import {basename} from "path";
import {parse} from "date-fns";

const fileName = source => {
  const url = new URL(source);
  return basename(url.pathname);
};

const termify = term => {
  switch (term) {
    // The cdn of fb includes changing timestamps as a query parameter. This
    // includes scontent.XX.fbcdn.
    case /(video|content).*fbcdn\.(com|net)/.test(term) ? term : null:
      return {term: fileName(term), href: term};
    default:
      return {term};
  }
};

export const pageEntity = flow([
  merge({_sc_id_fields: ["id"]}),
  omit(["feed"]),
]);

export const userEntity = pageEntity;

export const feedEntity = map(m => {
  const created = parse(m.created_time);
  const updated = parse(m.updated_time);
  const media = [{type: "url", term: m.permalink_url}];
  if (m.link) media.push(Object.assign({type: "url"}, termify(m.link)));
  if (m.picture) media.push(Object.assign({type: "image"}, termify(m.picture)));
  if (m.type === "video" && m.source) {
    media.push(
      Object.assign(
        {
          type: "video",
        },
        termify(m.source),
      ),
    );
  }

  return flow([
    merge({
      _sc_pubdates: {source: created},
      created_at: created,
      updated_at: updated,
      _sc_id_fields: ["id"],
      _sc_content_fields: ["description", "message"],
      _sc_media: media,
    }),
    omit(["created_time", "updated_time"]),
  ])(m);
});

export default {pageEntity, userEntity, feedEntity};
