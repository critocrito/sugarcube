import {merge} from "lodash/fp";

export const pageEntity = page =>
  merge(page, {
    _sc_id_fields: ["id"],
  });

export const userEntity = pageEntity;

export const feedEntity = feed =>
  feed.map(m => {
    const media = [{type: "url", term: m.permalink_url}];
    if (m.link) media.push({type: "url", term: m.link});
    if (m.picture) media.push({type: "image", term: m.picture});
    if (m.type === "video" && m.source)
      media.push({type: "video", term: m.source});

    return merge(m, {
      _sc_id_fields: ["id"],
      _sc_content_fields: ["description", "message"],
      _sc_media: media,
    });
  });

export default {pageEntity, userEntity, feedEntity};
