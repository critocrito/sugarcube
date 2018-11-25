import {get, getOr} from "lodash/fp";
import {flowP, tapP, caughtP} from "dashp";
import dot from "dot";
import distanceInWords from "date-fns/distance_in_words";
import format from "date-fns/format";
import {envelope as env, plugin as p} from "@sugarcube/core";

import {createTransporter, mail} from "../utils";
import {assertFrom} from "../assertions";

dot.log = false;

const dots = dot.process({
  path: `${__dirname}/../../views`,
  templateSettings: {strip: false},
});

const querySource = "mail_recipient";

const mailFailedStats = async (envelope, {cfg, log, stats}) => {
  const report = stats.get("pipeline");
  const project = getOr("unknown-project", "project", cfg);
  const marker = get("marker", cfg);
  const noEncrypt = get("mail.no-encrypt", cfg);
  const sender = get("mail.from", cfg);
  const isDebug = get("mail.debug", cfg);
  const recipients = env.queriesByType(querySource, envelope);
  const subject = `[${project}]: Report for ${report.name} (${marker}).`;
  const plugins = Object.keys(report.plugins || {})
    .filter(key => !/^(tap|mail)/.test(key))
    .map(key => {
      const stat = report.plugins[key];
      return Object.assign({}, stat, {
        name: key,
        start: format(new Date(stat.start)),
        end: format(new Date(stat.end)),
        duration: distanceInWords(new Date(stat.start), new Date(stat.end)),
      });
    })
    .sort((a, b) => {
      if (a.order > b.order) return 1;
      if (a.order < b.order) return -1;
      return 0;
    });
  const body = dots.pipeline_stats(
    Object.assign({}, {recipients, report, plugins}),
  );
  const transporter = createTransporter(cfg.mail);

  log.info(`Mailing the report for ${report.name} (${marker}).`);

  if (isDebug) log.info(["Email text:", "", body].join("\n"));

  await Promise.all(
    recipients.map(recipient => {
      log.info(`Mailing pipeline stats to ${recipient}.`);

      return flowP(
        [
          to => mail(transporter, sender, to, body, subject, !noEncrypt),
          tapP(info => {
            if (isDebug) {
              log.info(
                ["Emailing the following:", "", info.message.toString()].join(
                  "\n",
                ),
              );
            } else {
              log.info(`Accepted mail for: ${info.accepted.join(", ")}`);
            }
          }),
          caughtP(e => {
            log.warn(`Failed to send to ${recipient}.`);
            log.warn(e);
          }),
        ],
        recipient,
      );
    }),
  );
  return envelope;
};

const plugin = p.liftManyA2([assertFrom, mailFailedStats]);

plugin.desc = "Mail failed stats to one or more recipient.";

plugin.argv = {};

export default plugin;
