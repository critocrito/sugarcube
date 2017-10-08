import {utils} from "@sugarcube/core";

const {assertCfg} = utils.assertions;

export const assertBotKey = assertCfg(["telegram.bot_key"]);
export const assertChatId = assertCfg(["telegram.chat_id"]);

export default {
  assertBotKey,
  assertChatId,
};
