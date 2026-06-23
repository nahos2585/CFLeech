# Cloudflare Worker Download Proxy

A lightweight personal download proxy running on **Cloudflare Workers**.

This project allows you to paste a download URL into a web interface.
The Cloudflare Worker fetches the remote file and streams it directly
back to the user without storing the file.

The Worker works as a simple reverse proxy for downloading files.

## Features

-   Web-based login page
-   Password protection using Cloudflare Secrets
-   Secure session authentication using HMAC-SHA256 signed cookies
-   24-hour session expiration
-   Download URL input form
-   Copy Proxy URL button
-   Streaming download (no file storage)
-   Runs completely on Cloudflare Workers

## How It Works

Flow:

    User
     |
     |  Enter download URL
     |
    Cloudflare Worker
     |
     |  Fetch remote file
     |
    Remote Server

The Worker does not save files. It only streams the response.

------------------------------------------------------------------------

# Deployment

## Requirements

-   Cloudflare account
-   Wrangler CLI installed

Install Wrangler:

``` bash
npm install -g wrangler
```

Login:

``` bash
wrangler login
```

------------------------------------------------------------------------

# Configure Secrets

This project requires two Cloudflare secrets.

## 1. Application Password

This is the password used to access the web interface.

Create it:

``` bash
wrangler secret put APP_PASSWORD
```

Example value:

    MyStrongPassword123!

------------------------------------------------------------------------

## 2. Session Secret

This secret is used to cryptographically sign authentication sessions.

Create it:

``` bash
wrangler secret put SESSION_SECRET
```

Use a long random value.

Example:

    6f4c0c3f1dcbbe9f8f5b6e0a4a9d7b1e0d5f2a3c8e7b9a1f

Never share this value.

------------------------------------------------------------------------

# Deploy

Deploy the Worker:

``` bash
wrangler deploy
```

After deployment Cloudflare provides a Worker URL:

Example:

    https://your-worker-name.workers.dev

Open this URL in your browser.

------------------------------------------------------------------------

# Usage

1.  Open the Worker URL.
2.  Enter the configured password.
3.  Paste the download URL.
4.  Click Download.

The Worker will fetch the file and stream it to your browser/download
manager.

------------------------------------------------------------------------

# Security Notes

-   The password is NOT stored inside the JavaScript source code.
-   Authentication uses signed session cookies.
-   Cookies use:
    -   HttpOnly
    -   Secure
    -   SameSite=Strict

Session lifetime:

    24 hours

After expiration, login is required again.

------------------------------------------------------------------------

# Limitations

This project is designed for personal usage.

Cloudflare Workers are not intended to be used as a public unlimited
download service.

Possible limitations:

-   Large file transfers may be affected by Cloudflare limits.
-   Some websites may block automated requests.
-   Websites requiring cookies, authentication, or anti-bot checks may
    not work.

------------------------------------------------------------------------

# Files

Main Worker file:

    cloudflare-worker-download-proxy.js

------------------------------------------------------------------------

# License

Use and modify freely for personal projects.
