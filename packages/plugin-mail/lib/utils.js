import {flowP} from "dashp";
import nodemailer from "nodemailer";
import gpg from "gpg";

export const createTransporter = cfg =>
  cfg.debug
    ? nodemailer.createTransport({
        streamTransport: true,
        newline: "unix",
        buffer: true,
      })
    : nodemailer.createTransport({
        host: cfg.smtp_host,
        port: cfg.smtp_port,
        auth: {
          user: cfg.smtp_user,
          pass: cfg.smtp_password,
        },
      });

export const encrypt = (to, text) =>
  // eslint-disable-next-line promise/avoid-new
  new Promise((resolve, reject) =>
    gpg.encrypt(text, [`-r ${to}`, "--armor"], (e, encrypted) => {
      if (e) reject(e);
      if (encrypted) resolve(encrypted.toString());
      reject();
    }),
  );

export const mail = (transporter, from, to, message, subject, toEncrypt) =>
  flowP(
    [
      () => (toEncrypt ? encrypt(to, message) : message),
      text => transporter.sendMail({from, subject, to, text}),
    ],
    null,
  );
