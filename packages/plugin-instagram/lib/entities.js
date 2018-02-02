import {curry, map, merge, flatten, get, getOr} from "lodash/fp";

const TAG = /(?:#)([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)/g;
const MENTION = /(?:@)([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)/g;

const tags = str => str.match(TAG) || [];
const mentions = str => str.match(MENTION) || [];

export const postEntity = curry((username, post) => {
  const entity = {
    postId: get("id", post),
    postCode: get("code", post),
    postUrl: get("link", post),
    userId: get("user.id", post),
    userFullName: get("user.full_name", post),
    userProfilePicture: get("user.profile_picture", post),
    userName: get("user.username", post),
    imageUrl: get("images.standard_resolution.url", post),
    caption: get("caption.text", post),
    createdAt: get("caption.created_time", post),
    likesCount: get("likes.count", post),
    commentsCount: get("comments.count", post),
    location: get("location.name", post),
    hashtags: tags(getOr("", "caption.text", post)),
    mentions: mentions(getOr("", "caption.text", post)),
    _sc_id_fields: ["postId"],
    _sc_content_fields: ["imageUrl", "caption"],
    _sc_query: username,
  };
  const lfLinks = [
    {type: "url", term: entity.postUrl},
    {type: "image", term: entity.imageUrl},
    {type: "image", term: entity.userProfilePicture},
  ];
  const lfHashtags = map(term => ({type: "hashtag", term}), entity.hashtags);
  const lfMentions = map(term => ({type: "mention", term}), entity.mentions);
  const lfRelations = flatten([lfHashtags, lfMentions, lfLinks]);

  return merge(entity, {
    _sc_links: lfLinks,
    _sc_media: lfLinks,
    _sc_relations: lfRelations,
  });
});

export default {postEntity};
