import {flow, forEach, values, pick, merge} from "lodash/fp";
import apiPages from "./plugins/api-pages";
import apiUsers from "./plugins/api-users";
import apiFeed from "./plugins/api-feed";

const plugins = {
  facebook_api_page: apiPages,
  facebook_api_user: apiUsers,
  facebook_api_feed: apiFeed,
};

const apiPlugins = [
  "facebook_api_page",
  "facebook_api_user",
  "facebook_api_feed",
];

// eslint-disable-next-line lodash-fp/no-unused-result
flow([
  values,
  pick(apiPlugins),
  forEach(p => {
    // eslint-disable-next-line no-param-reassign
    p.argv = merge(
      {
        "facebook.app_id": {
          type: "string",
          nargs: 1,
          desc: "The Facebook AppID.",
        },
        "facebook.app_secret": {
          type: "string",
          nargs: 1,
          desc: "The Facebook app secret.",
        },
      },
      p.argv
    );
  }),
])(plugins);

export {plugins};
export default {plugins};
