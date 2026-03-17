# Troubleshooting

## "Can't reach database server" and Auth / AdapterError / Configuration

If you see:

- **Prisma:** `Can't reach database server at db.xxxxx.supabase.co`
- **Auth:** `AdapterError` and redirect to `/api/auth/error?error=Configuration`

these all come from **one cause**: the app cannot reach your Postgres database. Auth (NextAuth) uses the Prisma adapter, so every sign-in or callback runs `prisma.account.findUnique()` (and similar). When the DB is unreachable, Prisma fails → the adapter throws → NextAuth redirects to the error page.

### What to do

1. **Use Supabase's connection pooler** (recommended for Next.js):
   - In [Supabase](https://supabase.com/dashboard): your project → **Project Settings** → **Database**.
   - Copy the **Connection string** that uses the **Transaction pooler** (port **6543**), not the direct connection (port 5432 / host `db.xxx.supabase.co`).
   - Set that as `DATABASE_URL` in `.env.local`.

2. **If the project was paused and restored:**  
   Re-copy the connection string and database password from the same Database settings page; they can change after restore.

3. **Restart the dev server** after changing `.env.local`.

4. **Optional:** If you get SSL certificate errors in development, you can set `DATABASE_SSL_ACCEPT_INSECURE="true"` in `.env.local` (see `.env.example`).

Once the app can reach the database, Prisma and Auth errors from this cause should stop.

---

## How to see Supabase logs

If the Supabase dashboard shows request counts (e.g. "Database requests", "Auth requests") but your app still reports "Can't reach database server", you need the **actual logs** to see connection attempts, errors, and which host/port was used.

### Where to open logs

1. In the [Supabase dashboard](https://supabase.com/dashboard), open your project (e.g. **autoPort**).
2. In the **left sidebar**, open **Logs** (or **Reports** → **Logs**, depending on the layout).
3. Choose **Postgres Logs** (or **Database** → **Logs**).

Direct URL pattern:  
`https://supabase.com/dashboard/project/<your-project-ref>/logs/postgres-logs`

### What you’ll see

- **Postgres Logs**: connection attempts, disconnects, and Postgres errors. Look at `event_message` and any parsed metadata (e.g. `connection_from`, `user_name`, errors).
- **Logs Explorer** (if available): you can filter by time range and search for terms like `connection`, `timeout`, or your app’s IP.

### Why dashboard “requests” can show up even when the app fails

- **Database requests** in the overview count traffic that reaches Supabase (e.g. via the pooler or other clients). If your app uses the **direct** URL (`db.xxx.supabase.co:5432`) and that path is failing (e.g. connection limit or timeout), other requests (pooler, dashboard, other apps) can still succeed and show up as “7 Database requests”.
- **Auth requests** there are for **Supabase Auth** (Supabase’s built-in auth). Your app uses **NextAuth** with Prisma and Postgres only, so those 7 Auth requests are not from NextAuth; they’re from Supabase’s own Auth product.

So: use **Postgres Logs** to see whether your app’s connection attempts reach the database, and whether they fail with timeouts, connection refused, or auth errors. That will tell you if the problem is the direct URL, credentials, or something else.

### "Connection received" but nothing after it

If you only see **"connection received"** (with `user_name: null`, `backend_type: "not initialized"`) and no later "connection authorized" or "FATAL" line, the TCP connection reaches Postgres but is dropped or times out **before** the auth step. Common causes:

1. **SSL handshake failing** – The Node `pg` driver may close the connection during TLS (e.g. certificate verification), so Postgres never logs auth. **Try:** set `DATABASE_SSL_ACCEPT_INSECURE="true"` in `.env.local` for local dev and restart the app.
2. **Client timeout** – The app may give up waiting during SSL or auth; Prisma then reports "Can't reach database server." Using the **pooler** URL (port 6543) often avoids this; the app also uses a longer connection timeout in development.
3. **Use the pooler** – Prefer the **Transaction pooler** connection string (port 6543) from Project Settings → Database; it often works better with serverless/Next.js than the direct `db.xxx.supabase.co:5432` URL.
