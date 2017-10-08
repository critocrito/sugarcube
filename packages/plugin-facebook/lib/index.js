import {flow, forEach, values, pick, merge} from "lodash/fp";
import apiPages from "./plugins/api-pages";
import apiUsers from "./plugins/api-users";

const plugins = {
  facebook_api_pages: apiPages,
  facebook_api_users: apiUsers,
};

const apiPlugins = ["facebook_api_pages", "facebook_api_users"];

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
