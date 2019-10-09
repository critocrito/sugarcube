import {URL} from "url";
import {utils} from "@sugarcube/core";

const {assertCfg} = utils.assertions;

export const assertCredentials = assertCfg(["youtube.api_key"]);

export const parseYoutubeVideo = query => {
  if (query.startsWith("http")) {
    const u = new URL(query);
    // Accept youtube urls in the form of https://youtu.be and https://www.youtube.com
    return u.hostname.startsWith("youtu.be")
      ? u.pathname.split("/").filter(segment => segment.length > 0)[0]
      : u.searchParams.get("v");
  }
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
  if (/youtube\.com/.test(u.hostname) && u.searchParams.get("v") != null)
    return true;
  if (
    /youtu\.be/.test(u.hostname) &&
    u.pathname.split("/").filter(x => x !== "").length === 1
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
