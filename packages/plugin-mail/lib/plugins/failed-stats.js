import {get, getOr} from "lodash/fp";
import {flowP, tapP, caughtP} from "dashp";
import dot from "dot";
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
  const failures = Array.isArray(stats.get("failed"))
    ? stats.get("failed")
    : [];

  if (failures.length === 0) {
    log.info("No failures to report. Skipping mailing.");
    return envelope;
  }

  const project = getOr("unknown-project", "project", cfg);
  const marker = get("marker", cfg);
  const noEncrypt = get("mail.no-encrypt", cfg);
  const sender = get("mail.from", cfg);
  const isDebug = get("mail.debug", cfg);
  const recipients = env.queriesByType(querySource, envelope);
  const subject = `[${project}]: Failed queries for ${marker}.`;
  const body = dots.failed_stats(Object.assign({}, {recipients, failures}));
  const transporter = createTransporter(cfg.mail);

  log.info(`Mailing ${failures.length} failures.`);

  if (isDebug) log.info(["Email text:", "", body].join("\n"));

  await Promise.all(
    recipients.map(recipient => {
      log.info(`Mailing diff stats to ${recipient}.`);

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
