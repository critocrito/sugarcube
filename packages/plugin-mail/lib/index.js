import {merge, values, forEach} from "lodash/fp";
import mailDiffStats from "./plugins/diff-stats";

export const plugins = {
  mail_diff_stats: mailDiffStats,
};

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "mail.debug": {
        type: "boolean",
        default: false,
        desc: "Only print emails to the screen, don't actually send them.",
      },
      "mail.from": {
        type: "string",
        nargs: 1,
      },
      "mail.smtp_user": {
        type: "string",
        nargs: 1,
      },
      "mail.smtp_password": {
        type: "string",
        nargs: 1,
      },
      "mail.smtp_host": {
        type: "string",
        nargs: 1,
      },
      "mail.smtp_port": {
        type: "number",
        nargs: 1,
      },
    },
    p.argv,
  );
}, values(plugins));

export default {plugins};
