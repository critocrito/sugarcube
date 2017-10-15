import fs from "fs";
import Promise from "bluebird";

import googleAuth from "google-auth-library";

const GoogleAuth = googleAuth;

// TODO: refactor this file ince an authentication workflow is decided on.
// should it stop the runner if authentication isnt finished?

const client = (clientId, clientSecret, projectId) => ({
  installed: {
    client_id: clientId,
    client_secret: clientSecret,
    project_id: projectId,
    redirect_uris: ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"],
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://accounts.google.com/o/oauth2/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  },
});

Promise.promisifyAll(fs);

const requestToken = oauth2Client => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  console.log("Authorize this app by visiting this url: ", authUrl);
  return authUrl;
};

const checkIfFile = file =>
  new Promise((resolve, reject) =>
    fs
      .statAsync(file)
      .then(stats => {
        resolve(stats.isFile());
        return "";
      })
      .catch(err => {
        if (err.code === "ENOENT") {
          resolve(false);
        } else {
          reject(err);
        }
      })
  );

const authenticate = (clientId, clientSecret, projectId, token) => {
  const c = client(clientId, clientSecret, projectId);
  const auth = new GoogleAuth();
  const oauth2Client = new auth.OAuth2(
    c.installed.client_id,
    c.installed.client_secret,
    c.installed.redirect_uris[0]
  );

  return checkIfFile("google-sheets-token.json").then(exists => {
    if (exists) {
      return fs.readFileAsync("google-sheets-token.json").then(f => {
        oauth2Client.credentials = JSON.parse(f);
        return oauth2Client;
      });
    }

    if (token) {
      return new Promise((resolve, reject) => {
        oauth2Client.getToken(token, (err, t) => {
          if (err) {
            requestToken(oauth2Client);
            reject(err);
          } else {
            resolve(
              fs
                .writeFileAsync(
                  "google-sheets-token.json",
                  JSON.stringify(token)
                )
                .then(() => {
                  oauth2Client.credentials = t;
                  return oauth2Client;
                })
            );
          }
        });
      });
    }

    requestToken(oauth2Client);
    throw new Error();
  });
};

export default authenticate;
