import {get, getOr} from "lodash/fp";
import {flowP, tapP, caughtP} from "dashp";
import dot from "dot";
import {formatDistance} from "date-fns";
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
  const project = getOr("unknown-project", "project", cfg);
  const marker = get("marker", cfg);
  const noEncrypt = get("mail.no-encrypt", cfg);
  const sender = get("mail.from", cfg);
  const isDebug = get("mail.debug", cfg);
  const recipients = env.queriesByType(querySource, envelope);

  // report stats.
  const report = stats.get("pipeline");

  // FIXME: Until the pipeline can calculate it's own total.
  const total = (report.total || []).reduce((memo, t) => memo + t, 0);
  const created = (report.created || []).reduce((memo, c) => memo + c, 0);

  // We skip the report if no observatons were collected.
  if (total === 0 || created === 0) {
    log.warn("Skipping the report since we have no observations to report.");
    return envelope;
  }

  // Stats for each plugin.
  const plugins = Object.keys(report.plugins || {})
    .filter(key => !/^(tap|mail|workflow)/.test(key))
    .map(key => {
      const stat = report.plugins[key];
      const start = stat.start[0];
      const end = (stat.duration || []).reduce((memo, d) => memo + d, start);
      return Object.assign({}, stat, {
        name: key,
        total: (stat.total || []).reduce((memo, t) => memo + t, 0),
        duration: formatDistance(new Date(start), new Date(end)),
      });
    })
    .sort((a, b) => {
      if (a.order > b.order) return 1;
      if (a.order < b.order) return -1;
      return 0;
    });

  // Create the actual email.
  const subject = `[${project}]: Report for ${report.name} (${marker}).`;
  const body = dots.pipeline_stats(
    Object.assign({}, {recipients, report, total, created, plugins}),
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
            if (isDebug)
              log.info(
                ["Emailing the following:", "", info.message.toString()].join(
                  "\n",
                ),
              );
            log.info(`Accepted mail for: ${info.accepted.join(", ")}`);
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
