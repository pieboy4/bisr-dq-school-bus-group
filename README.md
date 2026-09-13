# BISR DQ School Bus Group V1.2

Mobile-first shared school-bus poll for the BISR Diplomatic Quarter parent group.

## Stack
- **GitHub Pages** - app hosting
- **Supabase Postgres** - shared child list, votes and BISR calendar
- **Supabase Realtime** - live updates between parents
- **PWA** - Add to Home Screen on iPhone/Android

## Main behaviour
- Current Riyadh date by default
- Swipe left/right **one day at a time**
- 4 weeks history / 1 week ahead
- Morning 07:25 / Afternoon 14:10
- YES green / NO red
- Automatic numeric Villa sorting
- Add/remove child controls
- Historical votes retained
- **Friday and Saturday are greyed out and voting is disabled**
- **Published BISR DQ 2026-27 holidays are greyed out and voting is disabled**
- Closed dates remain viewable so parents can swipe through the calendar normally

See `SETUP_GUIDE.md` for installation. See `CALENDAR_SOURCE.md` for the school-calendar dates used.

## Security model
V1.2 remains deliberately link-based with no parent login. Anyone who can access the public app can read the displayed data and use the permitted Supabase functions. Keep the app link within the parent group. For stronger protection, the next version should use invite-only authentication.


## V1.2 public-holiday banner
When the selected date is a public holiday on which BISR DQ is closed, a prominent banner appears at the top of the app showing the holiday name (for example, **Saudi National Day**) and **No school • No bus service**. Weekends remain greyed out without a public-holiday banner.

If upgrading an existing V1.1 Supabase database, run `supabase_public_holiday_upgrade.sql` once in the Supabase SQL Editor.
