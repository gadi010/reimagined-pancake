
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";
const GITHUB_EMAILS_URL = "https://api.github.com/user/emails";

export const getResponse = async (code) => {
    
  if (!code) throw new Error("Missing code");

  const tokenResp = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: { "Accept": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI,
    }),
  });

  const tokenJson = await tokenResp.json();
  if (tokenJson.error) throw new Error(tokenJson.error_description || tokenJson.error);

  const accessToken = tokenJson.access_token;
  if (!accessToken) throw new Error("No access token returned");

  const userResp = await fetch(GITHUB_USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "your-app-name" },
  });
  const githubUser = await userResp.json();

  let email = githubUser.email;
  if (!email) {
    const emailsResp = await fetch(GITHUB_EMAILS_URL, {
      headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "your-app-name" },
    });
    const emails = await emailsResp.json();
    const primary = Array.isArray(emails) && emails.find(e => e.primary && e.verified) || emails[0];
    email = primary?.email;
  }

  if (!email) throw new Error("Email not available");

  return {
    email: email,
    name: githubUser.login,
    avatar: githubUser.avatar_url,
  };
};
