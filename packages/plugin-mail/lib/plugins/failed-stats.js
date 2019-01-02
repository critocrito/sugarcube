import {get, getOr} from "lodash/fp";
import fs from "fs";
import path from "path";
import dot from "dot";
import {envelope as env, plugin as p} from "@sugarcube/core";

import {createTransporter, encrypt, encryptFile} from "../utils";
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
  const name = get("name", stats.get("pipeline"));
  const marker = get("marker", cfg);
  const noEncrypt = get("mail.no-encrypt", cfg);
  const from = get("mail.from", cfg);
  const isDebug = get("mail.debug", cfg);
  const recipients = env.queriesByType(querySource, envelope);
  const subject = `[${project}]: Failed queries for ${name} (${marker}).`;
  const body = dots.failed_stats(Object.assign({}, {recipients, failures}));
  const transporter = createTransporter(cfg.mail);

  log.info(`Mailing ${failures.length} failures.`);

  const mailReport = async to => {
    let text;
    let content;
    let attachments = [];
    let info;
    let statsFile;

    log.info(`Mailing failed stats to ${to}.`);

    try {
      text = !noEncrypt ? await encrypt(to, body) : body;
    } catch (e) {
      log.error(`Failed to encrypt message to ${to}.`);
      log.error(e);
      return;
    }

    try {
      statsFile = fs.createReadStream(stats.get("failed_stats_csv"));
    } catch (e) {} // eslint-disable-line no-empty

    if (statsFile != null) {
      try {
        content = !noEncrypt ? await encryptFile(to, statsFile) : statsFile;
      } catch (e) {
        log.error(`Failed to encrypt attachment to ${to}.`);
        log.error(e);
        return;
      }
      const filename = path.basename(
        `${stats.get("failed_stats_csv")}${!noEncrypt ? ".gpg" : ""}`,
      );
      attachments = [{filename, content}];
    }

    try {
      info = await transporter.sendMail({
        from,
        subject,
        to,
        text,
        attachments,
      });
      if (isDebug)
        log.info(
          ["Emailing the following:", "", info.message.toString()].join("\n"),
        );
      log.info(`Accepted mail for: ${info.accepted.join(", ")}`);
    } catch (e) {
      log.warn(`Failed to send to ${to}.`);
      log.warn(e);
    }
  };

  await Promise.all(recipients.map(mailReport));

  return envelope;
};

const plugin = p.liftManyA2([assertFrom, mailFailedStats]);

plugin.desc = "Mail failed stats to one or more recipient.";

plugin.argv = {};

export default plugin;
