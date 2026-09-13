# BISR DQ School Bus Group V1.3 — Step-by-step live setup

## What V1.3 fixes

1. **Morning pickup time**
   - Sunday: 06:35
   - Monday: 06:35
   - Tuesday: 06:35
   - Wednesday: 06:35
   - Thursday: 07:25
   - Afternoon remains 14:10.

2. **Shared voting instead of Demo Mode**
   - Demo Mode stores data only on the phone/browser that made the change.
   - Live Mode uses Supabase, so every parent using the GitHub Pages link sees the same children and votes.

3. **Logos**
   - The exact BISR logo supplied by the group and the supplied Azure logo are now embedded inside the page itself.
   - This removes the broken-image problem even if GitHub folder uploads are mishandled.

4. **Header wording**
   - `DIPLOMATIC QUARTER` is replaced with `La Palma II Parents Group`.

5. **Navigation**
   - Swiping left/right changes **week**.
   - The seven dates in the current week remain tappable.
   - Parent view: 28 days back and 7 days ahead only.

6. **Database retention**
   - Supabase keeps historic `bus_votes` rows indefinitely unless you deliberately delete them.
   - The app only downloads/displays the rolling 4-week-back/1-week-ahead window.

---

# PART A — Replace your current GitHub files with V1.3

If you already have the GitHub repository, use this section. If you have not created it yet, jump to Part D after setting up Supabase.

1. Download and unzip `BISR_DQ_School_Bus_Group_V1_3.zip`.
2. Open your GitHub repository: `bisr-dq-school-bus-group`.
3. Replace the old app files with the V1.3 files. The important files are:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `config.js`
   - `manifest.webmanifest`
   - `sw.js`
   - `.nojekyll`
   - `assets/` folder
4. Keep `supabase.sql` locally until Part B; it does not need to be executed by GitHub.
5. Commit the changes, for example: `BISR Bus V1.3`.

Do not test shared voting yet if `config.js` still contains blank Supabase values; the page will correctly say **Demo mode - local device only** until Part C is completed.

---

# PART B — Create the shared Supabase database

If you already created the Supabase database using V1.1/V1.2 `supabase.sql`, you do not need to recreate it. Go to Part C.

For a fresh setup:

1. Go to Supabase and sign in.
2. Select **New project**.
3. Project name: `bisr-dq-school-bus-group`.
4. Create a strong database password and keep it somewhere safe.
5. Choose a suitable region and create the project.
6. Wait until the project reports that it is ready.
7. In Supabase, open **SQL Editor**.
8. Select **New query**.
9. On your computer, open the supplied `supabase.sql`.
10. Copy the entire contents.
11. Paste it into the Supabase SQL Editor.
12. Press **Run**.
13. Confirm there are no SQL errors.

The script creates:
- `children`
- `bus_votes`
- `school_years`
- `school_closures`
- voting/add/remove database functions
- Row Level Security policies
- Realtime publication entries
- the five initial children
- the published BISR closure calendar

### Verify the children
Open **Table Editor > children** and confirm:
- Villa 49 — Maria Alejandra
- Villa 49 — Nicolas Cortes
- Villa 75 — Enie Rüscher
- Villa 94 — Poppy Yap
- Villa 97 — Amelia Hannesdottir

### Verify historical storage
Open **Table Editor > bus_votes**. This table has no automatic 28-day deletion rule. Votes remain in the database even after those dates disappear from the parents' 4-week viewing window.

---

# PART C — Turn off Demo Mode and connect the shared database

The screenshot showing **Demo mode - local device only** means the website is not yet connected to Supabase.

1. In Supabase, open your project's **Connect** dialog (or **Settings > API Keys**).
2. Copy the **Project URL**. It will look similar to:
   `https://abcdefghijk.supabase.co`
3. Copy the **Publishable key** beginning with something similar to:
   `sb_publishable_...`
4. Do **not** use a secret key or `service_role` key in this app.
5. Open `config.js` in your GitHub repository.
6. Replace:

```javascript
SUPABASE_URL: '',
SUPABASE_PUBLISHABLE_KEY: '',
```

with your own values, for example:

```javascript
SUPABASE_URL: 'https://abcdefghijk.supabase.co',
SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_XXXXXXXXXXXXXXXX',
```

7. Leave:

```javascript
DEMO_MODE: false,
```

8. Commit the edited `config.js`.

The publishable key is designed for browser/mobile client code. Database access is controlled by Supabase permissions and Row Level Security. Never put a secret/service-role key in GitHub or in browser code.

---

# PART D — Publish through GitHub Pages

For a new repository:

1. Sign in to GitHub.
2. Select **New repository**.
3. Name it `bisr-dq-school-bus-group`.
4. Create the repository.
5. Select **Add file > Upload files**.
6. Upload the contents of the V1.3 folder, preserving the folder structure.
7. Commit the upload.
8. Open **Settings** in the repository.
9. Select **Pages**.
10. Under **Build and deployment**, choose **Deploy from a branch**.
11. Branch: `main`.
12. Folder: `/ (root)`.
13. Save.
14. Wait for GitHub Pages to publish the site.
15. GitHub will provide a URL similar to:
    `https://YOUR-USERNAME.github.io/bisr-dq-school-bus-group/`

For an existing repository, replace the old V1.2 files with V1.3, commit them, and GitHub Pages will redeploy automatically.

---

# PART E — Clear the old V1.2 screen if your phone still shows it

V1.3 uses a new service-worker cache name, so it should update automatically. If an iPhone still shows the previous version:

1. Open the GitHub Pages link directly in **Safari** rather than from the Home Screen icon.
2. Reload the page.
3. Close Safari and reopen the link once.
4. If necessary, remove the old Home Screen icon and add it again after the new page is visible.

You should see:
- `La Palma II Parents Group` at the top;
- both BISR and Azure logos;
- `Swipe weeks • 4 weeks back • 1 week ahead`;
- Sunday–Wednesday morning time `06:35`;
- Thursday morning time `07:25`.

---

# PART F — Test Live Mode before sending it to parents

Use two different phones, or one phone and one computer.

1. Open the same GitHub Pages URL on both devices.
2. Confirm the bottom status says **Live • all changes saved** rather than Demo Mode.
3. On device A, select Maria > Morning > YES.
4. Device B should receive the shared update through Supabase Realtime.
5. On device B, change Maria > Morning > NO.
6. Confirm device A updates.
7. Add a temporary child, for example `Test Child`, Villa `62`.
8. Confirm the child appears on both devices and is automatically placed between Villa 49 and Villa 75.
9. Remove the test child.
10. Check Friday and Saturday remain greyed out and cannot be voted on.
11. Check a school/public-holiday date; the poll should be disabled and the closure name shown.

If votes save but do not appear automatically on the other phone, confirm `bus_votes` and `children` are in Supabase's `supabase_realtime` publication. The supplied `supabase.sql` attempts to enable this automatically.

---

# PART G — How the week navigation now works

- The app defaults to today's Riyadh date.
- Tap a day tile to move to a specific day within the visible week.
- Swipe **left** to move to the next week.
- Swipe **right** to move to the previous week.
- The left/right arrow buttons also move one week.
- The app never shows parents more than 28 days before today or 7 days after today.
- The database is not trimmed to that range; old dates remain stored.

---

# PART H — Give the app to everyone

Once the two-device test works:

1. Copy the GitHub Pages URL.
2. Send it only in the private parent WhatsApp group.
3. Pin the message.
4. Parents do not need GitHub or Supabase accounts.
5. Each parent opens the same link and votes against their child's row.

### iPhone
1. Open the URL in Safari.
2. Tap **Share**.
3. Select **Add to Home Screen**.
4. Name it `BISR Bus`.
5. Tap **Add**.

### Android
1. Open the URL in Chrome.
2. Open the browser menu.
3. Choose **Install app** or **Add to Home screen**.

---

# Normal daily operation

- Sunday–Wednesday morning pickup: **06:35**.
- Thursday morning pickup: **07:25**.
- Afternoon pickup: **14:10**.
- YES turns green.
- NO turns red.
- Blank means not answered.
- Friday, Saturday, BISR closures and public holidays are disabled.
- New children automatically sort by Villa number.
- All shared votes are written to Supabase.
- Parent viewing is limited to four weeks back and one week ahead, but the underlying records remain stored.
