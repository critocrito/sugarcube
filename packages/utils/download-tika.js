const fs = require("fs");
const crypto = require("crypto");
const fetch = require("node-fetch");

const tikaUrl = "https://www-eu.apache.org/dist/tika/tika-app-1.22.jar";
const sha512 =
  "64975d79211bc5c37f866abb2f4077687eff55b761567f7ad0b36a221a2ae3457b748fac9b288a31a641f37dfc8679260413f972b5b60cf6deb6721329cad001";

const download = async (from, to) => {
  const resp = await fetch(from);
  const dest = fs.createWriteStream(to);
  resp.body.pipe(dest);
  return new Promise((resolve, reject) => {
    dest.on("end", () => resolve());
    dest.on("error", e => reject(e));
  });
};

const hashFile = target => {
  const fd = fs.createReadStream(target);
  const hash = crypto.createHash("sha512");
  hash.setEncoding("hex");

  return new Promise((resolve, reject) => {
    fd.on("end", () => {
      hash.end();
      resolve(hash.read());
    });
    fd.on("error", reject);

    fd.pipe(hash);
  });
};

(async () => {
  const target = "./tika-app.jar";
  // eslint-disable-next-line no-console
  console.warn("Downloading Apache Tika 1.22.");
  await download(tikaUrl, target);
  const downloadHash = await hashFile(target);
  if (downloadHash !== sha512) {
    throw new Error(
      `File integrity didn't verify. Expected sha512 ${sha512}, got ${downloadHash}`,
    );
  }
})();
