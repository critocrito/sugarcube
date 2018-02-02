import {curry, merge, get} from "lodash/fp";
import {flowP, tapP, collectP} from "dashp";
import pify from "pify";
import fs from "fs";
import {join} from "path";
import {usingBrowser, usingHeadlessBrowser, browse} from "scraptor";
import {envelope as env} from "@sugarcube/core";
import {mkdirP, sha256sum, md5sum} from "@sugarcube/plugin-fs";

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
    ])
  );
});

const plugin = (envelope, {cfg, log}) => {
  const dataDir = get("http.data_dir", cfg);
  const headless = get("http.headless", cfg);

  return flowP(
    [
      mkdirP,
      () =>
        env.fmapDataAsync(
          unit =>
            collectP(media => {
              if (media.type !== "url") return media;
              const {type, term} = media;
              const idHash = media._sc_id_hash;
              const dir = join(dataDir, unit._sc_id_hash, "screenshot");
              const location = join(dir, `${idHash}.jpeg`);

              return flowP(
                [
                  () =>
                    accessAsync(location)
                      .then(() =>
                        log.info(`Screenshot ${term} exists at ${location}`)
                      )
                      .catch(e => {
                        if (e.code === "ENOENT") {
                          return flowP(
                            [
                              () => mkdirP(dir),
                              () => screenshotUrl(headless, term, location),
                              tapP(() =>
                                log.info(
                                  `Screenshot of ${term} stored in ${location}.`
                                )
                              ),
                            ],
                            null
                          );
                        }
                        throw e;
                      }),
                  () => Promise.all([md5sum(location), sha256sum(location)]),
                  tapP(([md5, sha256]) =>
                    unit._sc_downloads.push({
                      dir,
                      md5,
                      sha256,
                      type,
                      term,
                    })
                  ),
                  () => media,
                ],
                null
              );
            }, unit._sc_media).then(ms => merge(unit, {_sc_media: ms})),
          envelope
        ),
    ],
    dataDir
  );
};

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
