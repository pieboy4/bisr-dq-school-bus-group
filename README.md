# BISR DQ School Bus Group V1.3

Mobile-first shared school bus poll for the La Palma II Parents Group.

## V1.3 corrections
- Header subtitle changed to **La Palma II Parents Group**.
- Correct supplied **BISR** and **Azure** logos are embedded directly into `index.html`, so the header no longer depends on separate logo files loading correctly.
- Morning pickup time is automatic:
  - Sunday–Wednesday: **06:35**
  - Thursday: **07:25**
- Afternoon pickup remains **14:10**.
- Swipe left/right now moves **one week**, not one day.
- Dates within the visible week remain individually tappable.
- Parent view remains limited to **4 weeks back / 1 week ahead**.
- Supabase keeps the bus-vote rows indefinitely; the 4-week/1-week rule is only a viewing window.
- Friday, Saturday and BISR closure dates remain greyed and non-votable.
- Public holidays continue to show the public-holiday name prominently.

## Shared data
For all parents to see the same votes, the app must be connected to Supabase. If `SUPABASE_URL` or `SUPABASE_PUBLISHABLE_KEY` is blank, the app intentionally falls back to **Demo Mode – local device only**.

See `SETUP_GUIDE.md` for the complete deployment steps.
