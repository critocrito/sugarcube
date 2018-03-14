import {flow, map, merge, omit} from "lodash/fp";
import {parse} from "date-fns";

export const pageEntity = flow([
  merge({_sc_id_fields: ["id"]}),
  omit(["feed"]),
]);

export const userEntity = pageEntity;

export const feedEntity = map(m => {
  const created = parse(m.created_time);
  const updated = parse(m.updated_time);
  const media = [{type: "url", term: m.permalink_url}];
  if (m.link) media.push({type: "url", term: m.link});
  if (m.picture) media.push({type: "image", term: m.picture});
  if (m.type === "video" && m.source)
    media.push({type: "video", term: m.source});

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
