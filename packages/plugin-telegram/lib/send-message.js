/* eslint camelcase: off */
import {reduce, size} from "lodash/fp";
import Promise from "bluebird";
import Telegraf from "telegraf";
import {plugin as p} from "@sugarcube/core";

import {assertBotKey, assertChatId} from "./utils";

const sendMessage = (envelope, {log, cfg}) => {
  const botKey = cfg.telegram.bot_key;
  const chatId = cfg.telegram.chat_id;

  const app = new Telegraf(botKey);

  log.info(`Sending ${size(envelope.data)} messages to ${chatId} on Telegram.`);

  return Promise.each(envelope.data, d => {
    const {_sc_source, _sc_content_fields} = d;
    const msg = reduce(
      (memo, s) => `${memo} ${d[s]}`,
      `${_sc_source}:`,
      _sc_content_fields
    );

    log.debug(`Sending: ${msg}`);

    return app.telegram.sendMessage(chatId, msg);
  }).return(envelope);
};

const plugin = p.liftManyA2([assertBotKey, assertChatId, sendMessage]);

plugin.description = "Send data units to a Telegram chat.";
plugin.argv = {
  "telegram.chat_id": {
    type: "string",
    desc: "The ID of the chat to send messages to.",
  },
};

export default plugin;
