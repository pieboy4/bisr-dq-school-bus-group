# BISR DQ school calendar used by V1.1

Source used for the automatic closed-day rules:

- **British International School Riyadh (BISR) Diplomatic Quarter – Academic School Calendar 2026–2027**
- Calendar marked **Updated: April 2026**
- Source PDF: https://theinternationalschools.com/saudi-arabia/wp-content/uploads/sites/21/2026/05/british-international-school-riyadh-BISR-diplomatic-quarter-academic-calendar-2026-2027-TISG-saudi-arabia.pdf

## Published dates built into the app

- First day of school: 26-Aug-2026
- Saudi National Day: 23-Sep-2026
- Half Term: 25-Oct-2026 to 29-Oct-2026 inclusive
- Winter Break: 13-Dec-2026 to 31-Dec-2026 inclusive
- Saudi Foundation Day: 22-Feb-2027
- Eid al-Fitr: 07-Mar-2027 to 11-Mar-2027 inclusive
- Spring Break: 28-Mar-2027 to 08-Apr-2027 inclusive
- Eid al-Adha: 16-May-2027 to 20-May-2027 inclusive
- Summer Break begins: 04-Jul-2027
- Published pupil days: 180

Friday and Saturday are treated as weekends by the app.

## Maintenance

The live app reads school-year and closure data from the Supabase tables `school_years` and `school_closures`. This means the owner can amend a holiday in Supabase without changing or redeploying the app. Eid dates should be checked if BISR publishes a revised calendar.
