import puppeteer from "puppeteer-extra";
import {TimeoutError} from "puppeteer/lib/api";
import pluginStealth from "puppeteer-extra-plugin-stealth";

puppeteer.use(pluginStealth());

export default async () => {
  const instance = await puppeteer.launch({
    args: ["--no-sandbox", "--disabled-setuid-sandbox"],
  });

  const dispose = () => instance.close();

  const browse = async f => {
    const page = await instance.newPage();
    await page.setViewport({width: 1024, height: 768});

    const goto = async url => {
      try {
        try {
          // Not all websites will work with networkidle0. Try again with
          // networkidle2 in case the URL times out. Otherwise give up.
          await page.goto(url, {waitUntil: "networkidle0"});
        } catch (ee) {
          if (ee instanceof TimeoutError) {
            await page.goto(url, {waitUntil: "networkidle2"});
          } else {
            await page.close();
            throw ee;
          }
        }
      } catch (e) {
        await page.close();
        throw e;
      }
    };

    await f({goto, page});

    await page.close();
  };

  return {dispose, browse};
};
