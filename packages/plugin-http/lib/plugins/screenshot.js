import {curry, merge, get} from "lodash/fp";
import {flowP, tapP, collectP} from "dashp";
import pify from "pify";
import fs from "fs";
import {join} from "path";
import {usingBrowser, usingHeadlessBrowser, browse} from "scraptor";
import {envelope as env, plugin as p} from "@sugarcube/core";
import {mkdirP, sha256sum, md5sum} from "@sugarcube/plugin-fs";

import {assertDir} from "../utils";

const accessAsync = pify(fs.access);

const screenshotUrl = curry((headless, url, path) => {
  const browser = headless ? usingHeadlessBrowser : usingBrowser;
  return browser(
    flowP([
      browse(url),
      page =>
        page
          .screenshot({
            path,
            quality: 100,
            fullPage: true,
          })
          .then(() => page),
    ]),
  );
});

const screenshot = (envelope, {cfg, log}) => {
  const dataDir = get("http.data_dir", cfg);
  const headless = get("http.headless", cfg);

  return env.fmapDataAsync(
    unit =>
      collectP(media => {
        if (media.type !== "url") return media;
        const {type, term, href} = media;
        const source = href || term;
        const idHash = media._sc_id_hash;
        const dir = join(dataDir, unit._sc_id_hash, "screenshot");
        const location = join(dir, `${idHash}.jpeg`);

        return flowP(
          [
            () =>
              accessAsync(location)
                .then(() =>
                  log.info(`Screenshot ${source} exists at ${location}`),
                )
                .catch(e => {
                  if (e.code === "ENOENT") {
                    return flowP(
                      [
                        () => mkdirP(dir),
                        () => screenshotUrl(headless, source, location),
                        tapP(() =>
                          log.info(
                            `Screenshot of ${source} stored in ${location}.`,
                          ),
                        ),
                      ],
                      null,
                    );
                  }
                  throw e;
                }),
            () => Promise.all([md5sum(location), sha256sum(location)]),
            tapP(([md5, sha256]) =>
              unit._sc_downloads.push(
                Object.assign(
                  {},
                  {
                    dir,
                    md5,
                    sha256,
                    type,
                    term,
                  },
                  href ? {href} : {},
                ),
              ),
            ),
            () => media,
          ],
          null,
        );
      }, unit._sc_media).then(ms => merge(unit, {_sc_media: ms})),
    envelope,
  );
};

const plugin = p.liftManyA2([assertDir, screenshot]);

plugin.desc = "Make screenshots of websites.";

plugin.argv = {
  "http.headless": {
    type: "boolean",
    nargs: 1,
    desc: "Run the screenshot as a headless browser.",
    default: true,
  },
};

export default plugin;
