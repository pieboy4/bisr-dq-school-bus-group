-- BISR DQ School Bus Group V1.2 upgrade
-- Marks official/public-holiday closures so the app can show the holiday name prominently at the top.

update public.school_closures
set category = 'public-holiday'
where label in ('Saudi National Day','Saudi Foundation Day','Eid al-Fitr','Eid al-Adha');
