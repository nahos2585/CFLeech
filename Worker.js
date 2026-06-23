export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Logout
    if (url.pathname === "/logout") {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
          "Set-Cookie":
            "session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
        }
      });
    }

    // Login
    if (request.method === "POST" && url.pathname === "/login") {
      const form = await request.formData();
      const password = String(form.get("password") || "");

      if (password === String(env.APP_PASSWORD || "")) {
        const sessionToken = await createSessionToken(env);

        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
            "Set-Cookie":
              `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
          }
        });
      }

      return html(loginPage("Invalid password"));
    }

    // Check Session
    const sessionCookie = getCookie(
      request.headers.get("Cookie"),
      "session"
    );

    const authenticated =
      await verifySessionToken(sessionCookie, env);

    if (!authenticated) {
      return html(loginPage(""));
    }

    // Main Page
    const target = url.searchParams.get("url");

    if (!target) {
      return html(mainPage());
    }

    // Proxy Download
    try {
      const upstream = await fetch(target, {
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const headers = new Headers(upstream.headers);

      return new Response(upstream.body, {
        status: upstream.status,
        headers
      });

    } catch (err) {
      return new Response(
        `Download failed: ${err.message}`,
        {
          status: 500
        }
      );
    }
  }
};

function html(content) {
  return new Response(content, {
    headers: {
      "Content-Type": "text/html; charset=UTF-8"
    }
  });
}

function getCookie(cookieHeader, cookieName) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [name, ...value] = cookie.trim().split("=");

    if (name === cookieName) {
      return value.join("=");
    }
  }

  return null;
}

async function createSessionToken(env) {
  const expires =
    Math.floor(Date.now() / 1000) + 86400;

  const payload = `auth:${expires}`;

  const signature =
    await signPayload(payload, env.SESSION_SECRET);

  return `${btoa(payload)}.${signature}`;
}

async function verifySessionToken(token, env) {
  try {
    if (!token) {
      return false;
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
      return false;
    }

    const payload = atob(parts[0]);
    const signature = parts[1];

    const expected =
      await signPayload(payload, env.SESSION_SECRET);

    if (signature !== expected) {
      return false;
    }

    const payloadParts = payload.split(":");

    if (payloadParts.length !== 2) {
      return false;
    }

    const expires =
      parseInt(payloadParts[1], 10);

    return (
      Math.floor(Date.now() / 1000) < expires
    );

  } catch (e) {
    return false;
  }
}

async function signPayload(data, secret) {
  const encoder = new TextEncoder();

  const cryptoKey =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256"
      },
      false,
      ["sign"]
    );

  const signature =
    await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      encoder.encode(data)
    );

  const bytes =
    new Uint8Array(signature);

  let binary = "";

  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }

  return btoa(binary);
}

function loginPage(errorMessage) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Login</title>

<style>
body {
  font-family: Arial;
  max-width: 500px;
  margin: 100px auto;
}

input {
  width: 100%;
  padding: 10px;
}

button {
  padding: 10px 20px;
  margin-top: 10px;
}

.error {
  color: red;
}
</style>

</head>

<body>

<h2>Login</h2>

<div class="error">
${errorMessage}
</div>

<form method="POST" action="/login">

<input
  type="password"
  name="password"
  placeholder="Password"
  required
>

<br>

<button type="submit">
Login
</button>

</form>

</body>
</html>
`;
}

function mainPage() {
  return `
<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8">
<title>Cloudflare Download Proxy</title>

<style>
body {
  font-family: Arial;
  max-width: 900px;
  margin: 50px auto;
}

input {
  width: 100%;
  padding: 10px;
}

button {
  padding: 10px 20px;
  margin-top: 10px;
  margin-right: 10px;
}
</style>

</head>

<body>

<h2>Cloudflare Download Proxy</h2>

<form method="GET">

<input
  id="urlInput"
  type="url"
  name="url"
  placeholder="https://example.com/file.iso"
  required
>

<br>

<button type="submit">
Download
</button>

<button
  type="button"
  onclick="copyLink()"
>
Copy Link
</button>

<button
  type="button"
  onclick="window.location='/logout'"
>
Logout
</button>

</form>

<script>

function copyLink() {

  const url =
    document.getElementById(
      'urlInput'
    ).value;

  if (!url) {
    alert('Enter URL first');
    return;
  }

  const proxyUrl =
    window.location.origin +
    '/?url=' +
    encodeURIComponent(url);

  navigator.clipboard.writeText(
    proxyUrl
  );

  alert('Proxy URL copied');
}

</script>

</body>
</html>
`;
}