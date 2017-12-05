import {curry, trimCharsEnd} from "lodash/fp";
import Nightmare from "nightmare";
import moment from "moment";
import {URL} from "url";
import querystring from "querystring";

require("nightmare-upload")(Nightmare);

export const urlify = curry((params, url) => {
  const u = new URL(trimCharsEnd("/", url));
  u.search = querystring.stringify(params);
  return u.toString();
});

export const promisify = curry((f, p) => Promise.resolve(p).then(f));

export const browse = curry((show, url) => {
  const nightmare = Nightmare({show});
  return nightmare.goto(url);
});

export const html = n => n.end().evaluate(() => document.body.innerHTML); // eslint-disable-line no-undef

export const htmlP = promisify(html);

export const maybeDate = string => {
  let date;
  if (!string) return date;
  try {
    // See:
    // - https://en.wikipedia.org/wiki/Date_format_by_country
    // - https://en.wikipedia.org/wiki/Date_and_time_representation_by_country
    switch (string) {
      // little-endian, German format
      case string.indexOf(".") > -1 ? string : null: {
        date = moment.utc(string, "DD.MM.YYYY").toDate();
        break;
      }
      // little-endian, gregorian/julian
      case string.indexOf("-") === 2 ? string : null: {
        date = moment.utc(string, "DD-MM-YYYY").toDate();
        break;
      }
      // middle-endian, US format
      case string.indexOf(",") > -1 ? string : null: {
        date = moment.utc(string, "MMM DD, YYYY").toDate();
        break;
      }
      // big-endian, ISO8601 format
      case string.indexOf("-") === 4 ? string : null: {
        date = moment.utc(string).toDate();
        break;
      }
      default:
        break;
    }
  } catch (e) {
    // do nothing is there is an error.
  }
  return date;
};

export default {
  urlify,
  browse,
  html,
  htmlP,
  maybeDate,
};
