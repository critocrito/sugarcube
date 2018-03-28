import {isEmpty} from "lodash/fp";
import readline from "readline";
import {OAuth2Client} from "google-auth-library";

const authClient = (client, secret) =>
  new OAuth2Client(client, secret, "urn:ietf:wg:oauth:2.0:oob");

const requestToken = oauth2Client => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const question = `Authorize this app by visiting this url:
${authUrl}
and paste the OAuth token here: `;

  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.on("error", reject);
    rl.question(question, token => {
      rl.close();
      resolve(token);
    });
  });
};

const authenticate = async (client, secret, tokens) => {
  const auth = authClient(client, secret);

  if (!isEmpty(tokens)) {
    auth.credentials = tokens;
    return auth;
  }

  const refreshToken = await requestToken(auth);
  const response = await auth.getToken(refreshToken);
  auth.credentials = response.tokens;
  return auth;
};

export default authenticate;
