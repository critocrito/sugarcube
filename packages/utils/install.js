const fs = require("fs");
const URL = require("url");
const {promisify} = require("util");
const crypto = require("crypto");
const https = require("https");
const ProgressBar = require("progress");

const accessP = promisify(fs.access);
const unlinkP = promisify(fs.unlink);

const tikaVersion = "1.23";
const tikaUrl = `https://archive.apache.org/dist/tika/tika-app-${tikaVersion}.jar`;
const sha512 =
  "b31b10cb3cd2b5e15a0798f2119f4ae5435e9e4af82619cf1a64121415035bc73a51923a8144c9f5245492a093a9630f18eeee4483d896672a9dfab80b203981";

const logPolitely = toBeLogged => {
  const logLevel = process.env.npm_config_loglevel;
  const logLevelDisplay = ["silent", "error", "warn"].indexOf(logLevel) > -1;

  if (!logLevelDisplay)
    // eslint-disable-next-line no-console
    console.log(toBeLogged);
};

if (process.env.SUGARCUBE_SKIP_APACHE_TIKA_DOWNLOAD) {
  logPolitely(
    'Skipping Apache Tika download. "SUGARCUBE_SKIP_APACHE_TIKA_DOWNLOAD" environment variable was found.',
  );
  process.exit(0);
}
if (
  process.env.NPM_CONFIG_SUGARCUBE_SKIP_APACHE_TIKA_DOWNLOAD ||
  process.env.npm_config_sugarcube_skip_apache_tika_download
) {
  logPolitely(
    'Skipping Apache Tika download. "SUGARCUBE_SKIP_APACHE_TIKA_DOWNLOAD" was set in npm config.',
  );
  process.exit(0);
}
if (
  process.env.NPM_PACKAGE_CONFIG_SUGARCUBE_SKIP_APACHE_TIKA_DOWNLOAD ||
  process.env.npm_package_config_sugarcube_skip_apache_tika_download
) {
  logPolitely(
    'Skipping Apache Tika download. "SUGARCUBE_SKIP_APACHE_TIKA_DOWNLOAD" was set in project config.',
  );
  process.exit(0);
}

const existsP = async location => {
  try {
    await accessP(location);
  } catch (e) {
    // telegram uses filenames that throw a ENAMETOOLONG.
    if (e.code === "ENOENT" || e.code === "ENAMETOOLONG") return false;
    throw e;
  }
  return true;
};

const cleanUp = async location => {
  try {
    await accessP(location);
    await unlinkP(location);
    // eslint-disable-next-line no-empty
  } catch (e) {}
};

const httpRequest = (url, response) => {
  const options = URL.parse(url);
  options.method = "GET";

  const requestCallback = res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location)
      httpRequest(res.headers.location, response);
    else response(res);
  };

  const request = https.request(options, requestCallback);
  request.end();
  return request;
};

const download = async (from, to, progress) => {
  let downloadedBytes = 0;
  let totalBytes = 0;

  return new Promise((resolve, reject) => {
    const request = httpRequest(from, response => {
      if (response.statusCode !== 200) {
        const error = new Error(
          `Download failed: server returned code ${response.statusCode}. URL: ${from}`,
        );
        // consume response data to free up memory
        response.resume();
        reject(error);
        return;
      }

      const file = fs.createWriteStream(to);

      file.on("finish", resolve);
      file.on("error", reject);

      response.pipe(file);

      totalBytes = parseInt(response.headers["content-length"], 10);

      response.on("data", chunk => {
        downloadedBytes += chunk.length;
        progress(downloadedBytes, totalBytes);
      });
    });

    request.on("error", error => reject(error));
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

const toMegabytes = bytes => {
  const mb = bytes / 1024 / 1024;
  return `${Math.round(mb * 10) / 10} Mb`;
};

(async () => {
  const target = "./tika-app.jar";

  if (await existsP(target)) {
    const downloadHash = await hashFile(target);

    // If the hash checks out, do nothing.
    if (downloadHash === sha512) {
      logPolitely("Apache Tika already downloaded.");
      return;
    }

    // We found an existing download, but the hash doesn't verify. We clean it
    // up and re-download it.
    logPolitely("Cleaning up stale artifact and re-downloading Apache Tika.");
    await cleanUp(target);
  }

  let progressBar = null;
  let lastDownloadedBytes = 0;
  const onProgress = (downloadedBytes, totalBytes) => {
    if (!progressBar) {
      progressBar = new ProgressBar(
        `Downloading Apache Tika ${tikaVersion} - ${toMegabytes(
          totalBytes,
        )} [:bar] :percent :etas `,
        {
          complete: "=",
          incomplete: " ",
          width: 20,
          total: totalBytes,
        },
      );
    }
    const delta = downloadedBytes - lastDownloadedBytes;
    lastDownloadedBytes = downloadedBytes;
    progressBar.tick(delta);
  };

  logPolitely(`Downloading Apache Tika ${tikaVersion} from ${tikaUrl}.`);

  await download(tikaUrl, target, onProgress);
  const downloadHash = await hashFile(target);
  if (downloadHash !== sha512) {
    throw new Error(
      `File integrity didn't match. Expected sha512 ${sha512}, got ${downloadHash}`,
    );
  }
  logPolitely("Apache Tika download integrity verified.");
})();
