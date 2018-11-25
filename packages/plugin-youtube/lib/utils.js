import {URL} from "url";
import {utils} from "@sugarcube/core";

const {assertCfg} = utils.assertions;

export const assertCredentials = assertCfg(["youtube.api_key"]);

export const parseVideoQuery = query => {
  if (query.startsWith("http")) {
    const u = new URL(query);
    // Accept youtube urls in the form of https://youtu.be and https://www.youtube.com
    return u.hostname.startsWith("youtu.be")
      ? u.pathname.split("/").filter(segment => segment.length > 0)[0]
      : u.searchParams.get("v");
  }
  return query;
};

export const parseChannelQuery = query => {
  if (query.startsWith("http")) {
    const u = new URL(query);
    return u.pathname
      .replace(/^\//, "")
      .replace(/\/$/, "")
      .split("/")[1];
  }
  return query;
};

export default {assertCredentials};
