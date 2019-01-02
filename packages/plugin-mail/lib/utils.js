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

export const encryptFile = (to, stream) =>
  // eslint-disable-next-line promise/avoid-new
  new Promise((resolve, reject) =>
    gpg.encryptStream(stream, [`-r ${to}`, "--armor"], (e, encrypted) => {
      if (e) reject(e);
      if (encrypted) resolve(encrypted.toString());
      reject();
    }),
  );

export const mail = async (
  transporter,
  from,
  to,
  message,
  subject,
  toEncrypt,
) => {
  const text = toEncrypt ? await encrypt(to, message) : message;
  return transporter.sendMail({from, subject, to, text});
};
