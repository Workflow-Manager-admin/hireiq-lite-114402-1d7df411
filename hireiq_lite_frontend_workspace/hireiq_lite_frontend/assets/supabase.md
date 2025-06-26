# Supabase Configuration Review: HireIQ Lite

## 1. Environment Variables Used

- `SUPABASE_URL`: https://rquvaaymanduddbwktxk.supabase.co
- `SUPABASE_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdXZhYXltYW5kdWRkYndrdHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MTkwOTcsImV4cCI6MjA2NjM5NTA5N30.iT_cuWebAjeMangmiYSbyutvYab4TlEBZU19QZhR0ss
- `SUPABASE_DB_URL`: postgresql://postgres:Kavia%4012345@db.rquvaaymanduddbwktxk.supabase.co:5432/postgres

## 2. Where Environment Variables Are Used

- Frontend `src/supabaseClient.js`:
  - Uses `process.env.REACT_APP_SUPABASE_URL` and `process.env.REACT_APP_SUPABASE_KEY`.
  - If env variables are _not_ defined, fallback values are hardcoded and match the above official project values.

## 3. Service Setup & Integration

- The React app integrates directly with Supabase using the `@supabase/supabase-js` npm package (`package.json` dependency confirmed).
- All user authentication (sign up, login, logout) and CRUD operations (users, jobs, applications) are implemented via direct REST RPC/API to Supabase.
- There is no separate backend proxy—the frontend directly connects to Supabase.

## 4. Summary of Key Settings

- **Supabase Auth**: Used for user authentication (sign up/sign in/out, session management).
- **Tables Accessed**: 
  - `users` (profile, role assignment)
  - `jobs` (CRUD by recruiters)
  - `applications` (CRUD by candidates)
- **Row-level Security**: _Not auditable from codebase; should be verified in Supabase dashboard for proper RLS/auth rules._
- **Direct Integration**: All data and auth logic handled by frontend using the credentials provided.

## 5. Anything Needing Attention

- **Environment Variable Security**: The Supabase service role API key is included as a fallback in the code. In production, _always_ populate `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY` using environment variables. Do NOT check service role/jwt keys into public repos.
- **RLS (Row Level Security)**: Ensure proper RLS is configured in Supabase dashboard for all tables (`users`, `jobs`, `applications`) especially since the key in use is the anon/public key by default.
- **Credentials Exposure**: As per current code (`src/supabaseClient.js`), fallback credentials are visible to all users. This is safe for anon keys, but not if service role keys are accidentally exposed.
- **Backend Usage**: The backend in this workspace does not mediate between frontend and Supabase for this app.

## 6. Integration Status

- Supabase integration is complete and functional.
- Auth and CRUD depend exclusively on Supabase’s security model.
- If moving to production, audit RLS and rotate keys if needed.

---

**In summary:**\
The HireIQ Lite frontend is configured to connect to Supabase using public env variables for both the REST API and authentication. No backend proxy is in use; all logic is implemented on the frontend with direct supabase-js library usage.

**If you need stricter security or wish to hide API keys, consider enabling backend proxy or SSR.**

## Action Items (if needed)
- [ ] Populate `.env` with `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY` in deployment pipeline, not in repo.
- [ ] Periodically audit Supabase RLS and API key exposure.

