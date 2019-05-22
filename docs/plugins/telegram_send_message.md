---
path: "/plugins/telegram_send_message"
title: "telegram_send_message plugin"
author: "Christo <christo@cryptodrunks.net>"
version: "0.24.0"
bugs: "https://github.com/critocrito/sugarcube/issues"
license: "GPL-3.0"
homepage: "https://github.com/critocrito/sugarcube/tree/master/packages/plugin-telegram#readme"
tags: ["sugarcube","sugarcube plugin","sugarcube-plugin","data","transformation","telegram"]
---

### Installation
    npm install --save @sugarcube/plugin-telegram

I had to do the following steps to make this work:

1.  Send a message to @BotFather: /newbot
    This asks you for a name and a username for your bot. You get back a bot token.
2.  Run `curl -v https://api.telegram.org/bot<your bot key>/getUpdates` and
    look for the channel ID of this bot.

Edit your config file and add:

    {
      "telegram": {
        "bot_key": "<your bot key>",
        "channel_id": "<your channel id"
      }
    }


### Usage
Sends the content of `_sc_content_fields` of every unit to the Telegram chat.

**Configuration:**

-   `telegram.bot_key`
-   `telegram.channel_id`
