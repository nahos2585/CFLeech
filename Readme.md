# Cloudflare Worker Download Proxy

A lightweight personal download proxy built on **Cloudflare Workers**.

This project allows you to download files through Cloudflare by providing a direct file URL. The Worker acts as a streaming proxy:

```
User
 |
 |
Cloudflare Worker
 |
 |
Original File Server
```

The file is **not stored** on Cloudflare. The Worker fetches the file from the source URL and streams it directly to the user.

## Features

- Cloudflare Worker based (serverless)
- Streaming download proxy
- Simple web interface
- Password protected access
- Secure session authentication
- Session expiration (24 hours)
- Copy proxy download link button
- No password stored inside JavaScript source code
- Uses Cloudflare Worker Secrets for sensitive values

---

# How it works

When you open the Worker URL:

```
https://your-worker-name.workers.dev
```

you will first see a login page.

After entering the correct password:

1. Worker validates the password stored in Cloudflare Secrets.
2. A signed session token is created.
3. The session is stored in a secure HTTP-only cookie.
4. User can access the download page.

When a download URL is submitted:

Example:

```
https://example.com/file.iso
```

The Worker fetches the file:

```
Worker ---> example.com/file.iso
```

and streams the response back:

```
example.com
        |
        |
Cloudflare Worker
        |
        |
       User
```

---

# Deployment

## 1. Create a Cloudflare Worker

1. Login to Cloudflare Dashboard:

https://dash.cloudflare.com

2. Go to:

```
Workers & Pages
```

3. Click:

```
Create Application
```

4. Select:

```
Create Worker
```

5. Give your Worker a name.

Example:

```
download-proxy
```

6. Click:

```
Deploy
```

---

# 2. Add Worker Code

Open your Worker:

```
Workers & Pages
        |
        |
Your Worker
        |
        |
Edit Code
```

Replace the default code with the provided JavaScript source.

Click:

```
Save and Deploy
```

---

# 3. Configure Secrets

The Worker requires two secrets:

## APP_PASSWORD

This is the login password.

Example:

```
MySecurePassword2026
```

## SESSION_SECRET

This is used to cryptographically sign user sessions.

Generate a random long string.

Example:

```
6f4c0c3f1dcbbe9f8f5b6e0a4a9d7b1e0d5f2a3c8e7b9a1f
```

---

# Add Secrets using Cloudflare Dashboard

Go to:

```
Workers & Pages
        |
        |
Select your Worker
        |
        |
Settings
        |
        |
Variables
```

Click:

```
Add variable
```

Choose:

```
Type: Secret
```

---

Create the first secret:

Name:

```
APP_PASSWORD
```

Value:

```
Your login password
```

Example:

```
MySecurePassword2026
```

Save.

---

Create the second secret:

Name:

```
SESSION_SECRET
```

Value:

```
A long random secret string
```

Example:

```
6f4c0c3f1dcbbe9f8f5b6e0a4a9d7b1e0d5f2a3c8e7b9a1f
```

Save.

---

# Important

Do NOT put these values directly inside the JavaScript code.

Bad:

```javascript
const password = "MyPassword123";
```

Good:

```javascript
env.APP_PASSWORD
```

Secrets are stored securely by Cloudflare and injected into the Worker runtime.

---

# Usage

Open:

```
https://your-worker-name.workers.dev
```

Login using your configured password.

Paste a download URL:

Example:

```
https://example.com/linux.iso
```

Click:

```
Download
```

or:

```
Copy Link
```

The generated link can be used with download managers.

---

# Security Notes

This project is designed for personal/private usage.

Recommended:

- Keep the Worker URL private
- Use a strong APP_PASSWORD
- Use a long random SESSION_SECRET
- Do not share the Worker endpoint publicly

---

# Limitations

Cloudflare Workers are not designed as unlimited download servers.

Possible limitations:

- Very large files may hit Cloudflare limits
- Some websites may block automated requests
- Some URLs require authentication cookies
- Some anti-bot protected sites may not work

This project is intended for personal file streaming through Cloudflare Worker.

---

# License

Free to use and modify.
