import {URL} from "url";
import {utils} from "@sugarcube/core";

const {assertCfg} = utils.assertions;

export const assertCredentials = assertCfg(["youtube.api_key"]);

export const parseYoutubeVideo = query => {
  // e.g. o0tjic523cg
  if (!query.startsWith("http")) return query;

  const u = new URL(query);

  // e.g. http://youtu.be/o0tjic523cg
  if (u.hostname.startsWith("youtu.be"))
    return u.pathname.split("/").filter(segment => segment.length > 0)[0];

  // e.g. https://www.youtube.com/watch?v=tcCBtSjKEzI
  if (u.searchParams.has("v")) return u.searchParams.get("v");

  // e.g. https://www.youtube.com/embed/iq_XLq5ONtE?version
  if (u.pathname.startsWith("/embed"))
    return u.pathname.split("/").filter(x => x !== "")[1];

  return query;
};

export const parseYoutubeChannel = query => {
  if (query.startsWith("http")) {
    const u = new URL(query);
    return u.pathname
      .replace(/^\//, "")
      .replace(/\/$/, "")
      .split("/")[1];
  }
  return query;
};

export const isYoutubeVideo = url => {
  const u = new URL(url);
  // e.g. https://www.youtube.com/watch?v=tcCBtSjKEzI
  if (/youtube\.com/.test(u.hostname) && u.searchParams.get("v") != null)
    return true;
  // e.g. http://youtu.be/o0tjic523cg
  if (
    /youtu\.be/.test(u.hostname) &&
    u.pathname.split("/").filter(x => x !== "").length === 1
  )
    return true;
  // e.g. https://www.youtube.com/embed/iq_XLq5ONtE?version
  if (
    /youtube\.com/.test(u.hostname) &&
    u.pathname.split("/").filter(x => x !== "").length === 2 &&
    u.pathname.split("/").filter(x => x !== "")[0] === "embed"
  )
    return true;
  return false;
};

export const isYoutubeChannel = url => {
  const u = new URL(url);
  if (/youtube\.com/.test(u.hostname) && /channel/.test(u.pathname))
    return true;
  return false;
};

export const normalizeYoutubeVideoUrl = url => {
  const videoId = parseYoutubeVideo(url);
  return `https://www.youtube.com/watch?v=${videoId}`;
};

export const normalizeYoutubeChannelUrl = url => {
  const channelId = parseYoutubeChannel(url);
  return `https://www.youtube.com/channel/${channelId}`;
};

export default {assertCredentials};
