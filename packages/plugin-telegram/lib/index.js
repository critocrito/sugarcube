import {forEach, values, merge} from "lodash/fp";

import sendMessagePlugin from "./send-message";

const plugins = {
  telegram_send_message: sendMessagePlugin,
};

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "telegram.bot_key": {
        type: "string",
        desc: "An API key for your bot authentication.",
      },
    },
    p.argv
  );
}, values(plugins));

export {plugins};
export default {plugins};
