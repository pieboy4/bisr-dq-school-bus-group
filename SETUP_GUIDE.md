# BISR DQ School Bus Group V1.2 - Complete setup guide

## What has changed in V1.2
V1.2 keeps the agreed mobile layout and adds the BISR DQ school calendar. The app now:

- defaults to the current **Riyadh** date;
- swipes left/right **one day at a time**;
- permits viewing **28 days back and 7 days ahead**;
- automatically greys **Friday and Saturday**;
- automatically greys published **BISR DQ school holidays**;
- shows the closure reason, e.g. `Weekend`, `Half Term`, or `Saudi National Day`;
- disables YES/NO voting on a closed day;
- keeps closed dates visible so the calendar still moves day by day;
- stores calendar dates in Supabase, so the owner can amend a holiday without rebuilding GitHub files.

The current five children remain sorted numerically by Villa: **49, 49, 75, 94, 97**. Any child added later is automatically inserted into Villa-number order.

---

# 1. Download and test the app first

1. Unzip `BISR_DQ_School_Bus_Group_V1_1.zip`.
2. Open the extracted folder.
3. Double-click `index.html`.
4. It opens in **Demo Mode**. Demo votes are stored only in that browser.
5. Check the current day, swipe left/right, and navigate to a Friday or Saturday.
6. Friday/Saturday should be grey and the poll should say **No school bus service - Weekend**.
7. Test `Add new child`; enter a child in Villa 62. The order should become `49, 49, 62, 75, 94, 97`.
8. Remove the test child.

---

# 2. Create the Supabase project

1. Go to **supabase.com** and sign in.
2. Select **New project**.
3. Project name: `bisr-dq-school-bus-group`.
4. Create and retain a strong database password.
5. Select a region reasonably close to Saudi Arabia.
6. Wait for the project to finish provisioning.

### Fresh installation
1. Open **SQL Editor** in Supabase.
2. Select **New query**.
3. Open the supplied `supabase.sql` file on your computer.
4. Copy the entire file into the SQL editor.
5. Press **Run**.

This creates:
- `children`
- `bus_votes`
- `school_years`
- `school_closures`
- the safe voting/add/remove database functions
- Row Level Security read rules
- Realtime subscriptions
- the five initial children
- BISR DQ 2026-27 school-year and holiday dates

### If you already installed the earlier V1 database
Do **not** start again. Run `supabase_calendar_upgrade.sql` instead. This only adds the new school-calendar tables/data.

---

# 3. Verify the BISR calendar in Supabase

Open **Table Editor**.

In `school_years`, check:
- 2026-2027 — 26-Aug-2026 to 03-Jul-2027

In `school_closures`, check:
- 23-Sep-2026 — Saudi National Day
- 25-Oct-2026 to 29-Oct-2026 — Half Term
- 13-Dec-2026 to 31-Dec-2026 — Winter Break
- 22-Feb-2027 — Saudi Foundation Day
- 07-Mar-2027 to 11-Mar-2027 — Eid al-Fitr
- 28-Mar-2027 to 08-Apr-2027 — Spring Break
- 16-May-2027 to 20-May-2027 — Eid al-Adha
- 04-Jul-2027 — Summer Break begins

Friday and Saturday are calculated automatically by the app and are not stored as hundreds of database rows.

If BISR later changes a holiday date, edit the corresponding row in `school_closures`. Parent phones receive the change through Supabase Realtime; GitHub does not need to be rebuilt.

---

# 4. Connect the app to Supabase

1. In Supabase open **Connect** (or Project Settings/API if shown in your interface).
2. Copy the **Project URL**.
3. Copy the **Publishable key**. Do not use a service-role or secret key in the app.
4. Open `config.js` in Notepad.
5. Change:

```js
SUPABASE_URL: '',
SUPABASE_PUBLISHABLE_KEY: '',
DEMO_MODE: true,
```

to:

```js
SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
SUPABASE_PUBLISHABLE_KEY: 'YOUR_PUBLISHABLE_KEY',
DEMO_MODE: false,
```

6. Save `config.js`.

---

# 5. Create the GitHub repository

1. Sign in to GitHub.
2. Select **New repository**.
3. Repository name: `bisr-dq-school-bus-group`.
4. Create the repository.
5. Choose **Add file > Upload files**.
6. Upload the contents of this folder, preserving the `assets` directory:

```text
assets/
  app-icon.svg
  azure-logo.svg
  bisr-logo.png
.nojekyll
app.js
config.js
index.html
manifest.webmanifest
styles.css
supabase.sql
supabase_calendar_upgrade.sql
sw.js
README.md
SETUP_GUIDE.md
CALENDAR_SOURCE.md
```

7. Commit the files to `main`.

A public repository is the simplest way to use GitHub Pages. The Supabase publishable key is intentionally a browser key and is visible in the site source; database protection must come from Supabase permissions/RLS, not from hiding that key.

---

# 6. Turn on GitHub Pages

1. Open the repository **Settings**.
2. Select **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Branch: `main`.
5. Folder: `/ (root)`.
6. Save.
7. Wait for GitHub to publish the site.
8. GitHub will display a URL similar to:

`https://YOUR-USERNAME.github.io/bisr-dq-school-bus-group/`

Open this link on your phone.

---

# 7. Test the live shared version before giving it to parents

Use two phones or a phone plus a computer.

1. Open the GitHub Pages URL on both devices.
2. On device 1 choose Poppy > Morning > YES.
3. Confirm device 2 updates.
4. On device 2 change Poppy to NO.
5. Confirm device 1 updates.
6. Swipe to **Friday**. Confirm:
   - the Friday date is grey;
   - the poll screen is grey;
   - `No school bus service - Weekend` is shown;
   - YES/NO cannot be selected.
7. Swipe to Saturday and repeat.
8. If a BISR holiday falls inside the available 4-week/1-week window, open it and verify its holiday label.
9. Add a temporary child in Villa 62 and confirm automatic sorting.
10. Remove the test child.

---

# 8. Give the app to the parent group

Post one permanent message in WhatsApp and pin it:

**BISR DQ SCHOOL BUS GROUP**

Please use the shared bus app to confirm morning and afternoon transport.

- Green YES = travelling
- Red NO = not travelling
- Unselected = not yet answered
- Swipe left/right to change day
- Friday, Saturday and BISR school holidays are automatically disabled

`PASTE YOUR GITHUB PAGES LINK HERE`

Parents do not need GitHub or Supabase accounts. They only need the link.

---

# 9. Add it to each parent's phone like an app

## iPhone
1. Open the GitHub Pages link in **Safari**.
2. Tap **Share**.
3. Tap **Add to Home Screen**.
4. Name it `BISR Bus`.
5. Tap **Add**.

## Android
1. Open the link in **Chrome**.
2. Open the browser menu.
3. Choose **Install app** or **Add to Home screen**.

The icon then opens the PWA in a standalone mobile view.

---

# 10. Normal parent use

1. Open `BISR Bus`.
2. Today's Riyadh date opens automatically.
3. Select YES or NO for Morning.
4. Select YES or NO for Afternoon.
5. Swipe left/right to move exactly one day.
6. Parents can enter a future day up to seven days ahead.
7. Historical dates remain visible for 28 days.
8. Friday/Saturday and school holidays can be viewed but not voted on.
9. Use **Add new child** when someone joins; the app automatically places them in Villa order.
10. Use **Remove child** when someone leaves; previous dated records remain intact.

---

# 11. Maintaining the school calendar

The owner should check BISR's calendar when a revised academic calendar is published, particularly Eid dates. To change a closure:

1. Open Supabase.
2. Open **Table Editor > school_closures**.
3. Edit the start/end date or label.
4. Save.

The app will pick up the change. No GitHub code edit is required.

For a new academic year:
1. Add the new academic-year row to `school_years`.
2. Add the published holiday ranges to `school_closures`.
3. Leave old years in place so historical days continue to display correctly.

---

# Privacy / security note

This version deliberately follows the agreed model: **anyone who has access to the app can vote and add/remove children**. There is no parent login. Because the app contains children's names and Villa numbers, keep the URL inside the private parent group. If you later want stronger control, the appropriate V2 change is invite-only Supabase authentication with an approved parent email list.


## V1.2: public holiday name at the top
On Saudi National Day, Saudi Foundation Day, Eid al-Fitr and Eid al-Adha closure dates, the selected-day screen now shows a prominent **PUBLIC HOLIDAY** banner at the top with the holiday name and **No school • No bus service**.

### If you already installed V1.1
1. Upload the V1.2 web files to GitHub, replacing the old files.
2. In Supabase, open **SQL Editor**.
3. Open `supabase_public_holiday_upgrade.sql` from this package and paste it into a new query.
4. Click **Run** once.
5. Reload the GitHub Pages app on your phone.

For a completely new installation, `supabase.sql` already contains the correct public-holiday categories, so no upgrade script is needed.
