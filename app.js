(() => {
  const CONFIG = window.BUS_APP_CONFIG || {};
  const DEMO_KEY = 'bisr_dq_bus_group_v1_4_demo';
  const DEFAULT_CHILDREN = [
    { id: '11111111-1111-4111-8111-111111111111', name: 'Maria Alejandra', villa_number: 49, active_from: '2026-01-01', active_until: null },
    { id: '22222222-2222-4222-8222-222222222222', name: 'Nicolas Cortes', villa_number: 49, active_from: '2026-01-01', active_until: null },
    { id: '33333333-3333-4333-8333-333333333333', name: 'Enie Rüscher', villa_number: 75, active_from: '2026-01-01', active_until: null },
    { id: '44444444-4444-4444-8444-444444444444', name: 'Poppy Yap', villa_number: 94, active_from: '2026-01-01', active_until: null },
    { id: '55555555-5555-4555-8555-555555555555', name: 'Amelia Hannesdottir', villa_number: 97, active_from: '2026-01-01', active_until: null }
  ];

  // Published BISR DQ 2026-27 calendar fallback. Live deployments load the same data from Supabase.
  const DEFAULT_SCHOOL_YEARS = [
    { label:'2026-2027', start_date:'2026-08-26', end_date:'2027-07-03' }
  ];
  const DEFAULT_CLOSURES = [
    { start_date:'2026-09-23', end_date:'2026-09-23', label:'Saudi National Day', category:'public-holiday' },
    { start_date:'2026-10-25', end_date:'2026-10-29', label:'Half Term', category:'holiday' },
    { start_date:'2026-12-13', end_date:'2026-12-31', label:'Winter Break', category:'holiday' },
    { start_date:'2027-02-22', end_date:'2027-02-22', label:'Saudi Foundation Day', category:'public-holiday' },
    { start_date:'2027-03-07', end_date:'2027-03-11', label:'Eid al-Fitr', category:'public-holiday' },
    { start_date:'2027-03-28', end_date:'2027-04-08', label:'Spring Break', category:'holiday' },
    { start_date:'2027-05-16', end_date:'2027-05-20', label:'Eid al-Adha', category:'public-holiday' },
    { start_date:'2027-07-04', end_date:'2027-07-04', label:'Summer Break begins', category:'holiday' }
  ];

  const configured = Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_PUBLISHABLE_KEY && window.supabase);
  const demoMode = CONFIG.DEMO_MODE !== false || !configured;
  const sb = !demoMode ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_PUBLISHABLE_KEY) : null;

  const $ = id => document.getElementById(id);
  const addDays = (isoDate, n) => {
    const [y,m,d] = isoDate.split('-').map(Number);
    const x = new Date(Date.UTC(y,m-1,d+n));
    return x.toISOString().slice(0,10);
  };
  const compareDate = (a,b) => a < b ? -1 : a > b ? 1 : 0;
  const riyadhToday = () => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: CONFIG.TIME_ZONE || 'Asia/Riyadh', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date());
    const o = Object.fromEntries(parts.map(p => [p.type,p.value]));
    return `${o.year}-${o.month}-${o.day}`;
  };
  const toDate = s => { const [y,m,d] = s.split('-').map(Number); return new Date(Date.UTC(y,m-1,d)); };
  const formatLong = s => new Intl.DateTimeFormat('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }).format(toDate(s));
  const formatDOW = s => new Intl.DateTimeFormat('en-GB', { weekday:'short', timeZone:'UTC' }).format(toDate(s)).toUpperCase();
  const formatMon = s => new Intl.DateTimeFormat('en-GB', { month:'short', timeZone:'UTC' }).format(toDate(s)).toUpperCase();
  const dayNumber = s => Number(s.slice(8,10));
  const startSunday = s => addDays(s, -toDate(s).getUTCDay());
  const morningPickupTime = s => {
    const dow = toDate(s).getUTCDay();
    if (dow >= 0 && dow <= 3) return CONFIG.MORNING_TIME_SUN_WED || '06:35';
    if (dow === 4) return CONFIG.MORNING_TIME_THURSDAY || '07:25';
    return CONFIG.MORNING_TIME_SUN_WED || '06:35';
  };
  const safe = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const viewWindowFor = baseToday => {
    // Week-based navigation: four complete prior weeks + current week + one complete next week.
    const currentWeekStart = startSunday(baseToday);
    return {
      minDate: addDays(currentWeekStart, -(CONFIG.PAST_DAYS ?? 28)),
      maxDate: addDays(currentWeekStart, 6 + (CONFIG.FUTURE_DAYS ?? 7))
    };
  };

  let today = riyadhToday();
  let { minDate, maxDate } = viewWindowFor(today);
  let selectedDate = today;
  let children = [];
  let votes = new Map();
  let closures = structuredClone(DEFAULT_CLOSURES);
  let schoolYears = structuredClone(DEFAULT_SCHOOL_YEARS);
  let realtimeChannel = null;
  let saving = false;
  let refreshInFlight = false;
  let lastForegroundRefresh = 0;

  function refreshDateWindow() {
    const latestToday = riyadhToday();
    if (latestToday === today) return false;

    const previousToday = today;
    const wasShowingToday = selectedDate === previousToday;
    today = latestToday;
    ({ minDate, maxDate } = viewWindowFor(today));

    // If the app was left open overnight on yesterday's 'today', move naturally to the new current day.
    if (wasShowingToday) selectedDate = today;
    if (compareDate(selectedDate, minDate) < 0) selectedDate = minDate;
    if (compareDate(selectedDate, maxDate) > 0) selectedDate = maxDate;
    return true;
  }

  function demoState() {
    try {
      const saved = JSON.parse(localStorage.getItem(DEMO_KEY));
      if (saved && Array.isArray(saved.children) && saved.votes) return saved;
    } catch (_) {}
    const state = { children: structuredClone(DEFAULT_CHILDREN), votes: {} };
    localStorage.setItem(DEMO_KEY, JSON.stringify(state));
    return state;
  }

  function activeForDate(c, date) {
    return compareDate(c.active_from || '1900-01-01', date) <= 0 && (!c.active_until || compareDate(c.active_until, date) >= 0);
  }

  function sortChildren(list) {
    return [...list].sort((a,b) => Number(a.villa_number)-Number(b.villa_number) || a.name.localeCompare(b.name, 'en', { sensitivity:'base' }));
  }

  function schoolDayInfo(date) {
    const closure = closures.find(c => compareDate(c.start_date,date) <= 0 && compareDate(c.end_date,date) >= 0);
    if (closure) return { closed:true, type:closure.category || 'holiday', label:closure.label || 'School Holiday' };

    const activeYear = schoolYears.find(y => compareDate(y.start_date,date) <= 0 && compareDate(y.end_date,date) >= 0);
    if (!activeYear) {
      const earliest = [...schoolYears].sort((a,b)=>a.start_date.localeCompare(b.start_date))[0];
      const latest = [...schoolYears].sort((a,b)=>b.end_date.localeCompare(a.end_date))[0];
      if (earliest && compareDate(date, earliest.start_date) < 0) return { closed:true, type:'out-of-term', label:'Before the BISR school term' };
      if (latest && compareDate(date, latest.end_date) > 0) return { closed:true, type:'out-of-term', label:'Summer Break / outside published school term' };
      return { closed:true, type:'out-of-term', label:'Outside published BISR school term' };
    }

    const dow = toDate(date).getUTCDay();
    if (dow === 5 || dow === 6) return { closed:true, type:'weekend', label:'Weekend' };
    return { closed:false, type:'school-day', label:'School day' };
  }

  function status(text, type='live') {
    const bar = $('saveBar');
    bar.classList.remove('live','error','saving');
    bar.classList.add(type);
    $('saveText').textContent = text;
  }

  function toast(text) {
    const t = $('toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  async function loadData() {
    status(demoMode ? 'Demo mode - changes stored on this device' : 'Loading shared bus board…', 'saving');
    if (demoMode) {
      const state = demoState();
      children = state.children;
      loadDemoVotes(state);
      render();
      status('Demo mode - local device only', 'live');
      return;
    }

    const [childRes, voteRes, closureRes, yearRes] = await Promise.all([
      sb.from('children').select('*').order('villa_number', { ascending:true }).order('name', { ascending:true }),
      sb.from('bus_votes').select('*').gte('service_date', minDate).lte('service_date', maxDate),
      sb.from('school_closures').select('*').order('start_date', { ascending:true }),
      sb.from('school_years').select('*').order('start_date', { ascending:true })
    ]);

    if (childRes.error || voteRes.error) {
      console.error(childRes.error || voteRes.error);
      status('Could not load shared data', 'error');
      return;
    }
    if (closureRes.error) console.warn('Using built-in school closures:', closureRes.error);
    if (yearRes.error) console.warn('Using built-in school year dates:', yearRes.error);

    children = childRes.data || [];
    votes = new Map();
    (voteRes.data || []).forEach(v => votes.set(`${v.service_date}|${v.child_id}`, v));
    if (!closureRes.error && closureRes.data?.length) closures = closureRes.data;
    if (!yearRes.error && yearRes.data?.length) schoolYears = yearRes.data;

    render();
    status('Live • all changes saved', 'live');
    subscribeRealtime();
  }

  async function refreshSharedData({ silent = true, includeCalendar = false } = {}) {
    const dateRolled = refreshDateWindow();

    if (demoMode) {
      if (dateRolled) render();
      return;
    }
    if (!sb || refreshInFlight || saving) return;

    refreshInFlight = true;
    if (!silent) status('Refreshing shared bus board…', 'saving');

    try {
      const queries = [
        sb.from('children').select('*').order('villa_number', { ascending:true }).order('name', { ascending:true }),
        sb.from('bus_votes').select('*').gte('service_date', minDate).lte('service_date', maxDate)
      ];
      if (includeCalendar) {
        queries.push(
          sb.from('school_closures').select('*').order('start_date', { ascending:true }),
          sb.from('school_years').select('*').order('start_date', { ascending:true })
        );
      }

      const results = await Promise.all(queries);
      const childRes = results[0];
      const voteRes = results[1];

      if (childRes.error || voteRes.error) throw childRes.error || voteRes.error;

      children = childRes.data || [];
      const latestVotes = new Map();
      (voteRes.data || []).forEach(v => latestVotes.set(`${v.service_date}|${v.child_id}`, v));
      votes = latestVotes;

      if (includeCalendar) {
        const closureRes = results[2];
        const yearRes = results[3];
        if (!closureRes.error && closureRes.data?.length) closures = closureRes.data;
        if (!yearRes.error && yearRes.data?.length) schoolYears = yearRes.data;
      }

      render();
      status('Live • all changes saved', 'live');
      subscribeRealtime();
    } catch (error) {
      console.warn('Automatic refresh failed; retaining last known shared data.', error);
      status('Sync delayed • retrying automatically', 'error');
    } finally {
      refreshInFlight = false;
    }
  }

  function loadDemoVotes(state) {
    votes = new Map();
    Object.entries(state.votes || {}).forEach(([key,v]) => votes.set(key,v));
  }

  function persistDemo() {
    const obj = {};
    votes.forEach((v,k) => { obj[k] = v; });
    localStorage.setItem(DEMO_KEY, JSON.stringify({ children, votes: obj }));
  }

  function voteRow(childId) { return votes.get(`${selectedDate}|${childId}`) || { service_date:selectedDate, child_id:childId, morning:null, afternoon:null }; }

  function render() {
    renderDate();
    renderChildren();
    renderRemoveOptions();
  }

  function renderDate() {
    const info = schoolDayInfo(selectedDate);
    $('fullDate').textContent = formatLong(selectedDate);
    $('morningTime').textContent = morningPickupTime(selectedDate);
    $('afternoonTime').textContent = CONFIG.AFTERNOON_TIME || '14:10';
    $('dateStatus').textContent = info.closed
      ? (info.type === 'weekend' ? 'WEEKEND' : info.type === 'out-of-term' ? 'NO SCHOOL' : info.type === 'public-holiday' ? 'PUBLIC HOLIDAY' : 'SCHOOL HOLIDAY')
      : selectedDate === today ? 'TODAY' : selectedDate === addDays(today,1) ? 'TOMORROW' : 'BUS DAY';

    const holidayBanner = $('topHolidayBanner');
    const isPublicHoliday = info.closed && info.type === 'public-holiday';
    holidayBanner.hidden = !isPublicHoliday;
    if (isPublicHoliday) $('topHolidayName').textContent = info.label;

    const sunday = startSunday(selectedDate);
    const strip = $('weekStrip');
    strip.innerHTML = '';
    for (let i=0; i<7; i++) {
      const d = addDays(sunday, i);
      const allowed = compareDate(d,minDate) >= 0 && compareDate(d,maxDate) <= 0;
      const dayInfo = schoolDayInfo(d);
      const b = document.createElement('button');
      b.className = 'day-button' + (d === selectedDate ? ' selected' : '') + (d === today ? ' today' : '') + (dayInfo.closed ? ' closed-day' : '');
      b.disabled = !allowed;
      b.title = dayInfo.closed ? dayInfo.label : 'School bus day';
      b.setAttribute('aria-label', `${formatLong(d)}${dayInfo.closed ? `, ${dayInfo.label}, no bus service` : ''}`);
      b.innerHTML = `<span class="dow">${formatDOW(d)}</span><span class="dom">${dayNumber(d)}</span><span class="mon">${formatMon(d)}</span>`;
      if (allowed) b.onclick = () => { selectedDate = d; render(); };
      strip.appendChild(b);
    }
    $('prevWeek').disabled = !canShiftWeek(-1);
    $('nextWeek').disabled = !canShiftWeek(1);
  }

  function renderChildren() {
    const dayInfo = schoolDayInfo(selectedDate);
    const panel = $('pollPanel');
    const banner = $('closedDayBanner');
    panel.classList.toggle('closed-poll', dayInfo.closed);
    banner.hidden = !dayInfo.closed;
    if (dayInfo.closed) {
      $('closedDayTitle').textContent = 'No school bus service';
      $('closedDayReason').textContent = dayInfo.label;
    }

    const list = sortChildren(children.filter(c => activeForDate(c, selectedDate)));
    const root = $('childrenList');
    root.innerHTML = '';
    let complete = 0;
    list.forEach(c => {
      const v = voteRow(c.id);
      if (v.morning !== null && v.afternoon !== null) complete++;
      const row = document.createElement('div');
      row.className = 'child-row' + (dayInfo.closed ? ' closed-row' : '');
      row.innerHTML = `
        <div class="child-info">
          <div class="villa-badge"><small>Villa</small><strong>${Number(c.villa_number)}</strong></div>
          <div class="child-name">${safe(c.name)}</div>
        </div>
        ${voteButtons(c.id, 'morning', v.morning, dayInfo.closed)}
        ${voteButtons(c.id, 'afternoon', v.afternoon, dayInfo.closed)}
      `;
      if (!dayInfo.closed) row.querySelectorAll('[data-vote]').forEach(btn => btn.addEventListener('click', () => changeVote(btn.dataset.child, btn.dataset.journey, btn.dataset.vote)));
      root.appendChild(row);
    });
    $('answeredPill').textContent = dayInfo.closed ? 'No service' : `${complete}/${list.length} complete`;
  }

  function voteButtons(childId, journey, value, disabled=false) {
    return `<div class="vote-pair">
      <button class="vote yes ${value === true ? 'active' : ''}" data-vote="yes" data-child="${childId}" data-journey="${journey}" aria-pressed="${value === true}" ${disabled ? 'disabled aria-disabled="true"' : ''}>YES</button>
      <button class="vote no ${value === false ? 'active' : ''}" data-vote="no" data-child="${childId}" data-journey="${journey}" aria-pressed="${value === false}" ${disabled ? 'disabled aria-disabled="true"' : ''}>NO</button>
    </div>`;
  }

  async function changeVote(childId, journey, option) {
    const dayInfo = schoolDayInfo(selectedDate);
    if (dayInfo.closed) { toast(`No bus service: ${dayInfo.label}`); return; }
    if (saving) return;
    const current = voteRow(childId);
    const clicked = option === 'yes';
    const next = current[journey] === clicked ? null : clicked;
    saving = true;
    status('Saving…', 'saving');
    if (demoMode) {
      const updated = { ...current, [journey]: next, updated_at: new Date().toISOString() };
      votes.set(`${selectedDate}|${childId}`, updated);
      persistDemo();
      saving = false;
      renderChildren();
      status('Demo mode - local device only', 'live');
      return;
    }
    const { error } = await sb.rpc('set_bus_vote', { p_date:selectedDate, p_child_id:childId, p_journey:journey, p_value:next });
    saving = false;
    if (error) { console.error(error); status('Save failed - tap again', 'error'); toast('Vote was not saved'); return; }
    const updated = { ...current, [journey]:next, updated_at:new Date().toISOString() };
    votes.set(`${selectedDate}|${childId}`, updated);
    renderChildren();
    status('Live • all changes saved', 'live');
  }

  function effectiveDate() { return compareDate(selectedDate, today) < 0 ? today : selectedDate; }

  async function addChild() {
    const name = $('childName').value.trim();
    const villa = Number($('villaNumber').value);
    if (!name || !Number.isInteger(villa) || villa < 1 || villa > 9999) { toast('Enter a child name and valid Villa number'); return; }
    const activeFrom = effectiveDate();
    status('Adding child…', 'saving');
    if (demoMode) {
      children.push({ id: crypto.randomUUID(), name, villa_number:villa, active_from:activeFrom, active_until:null });
      persistDemo();
      $('addDialog').close();
      render();
      status('Demo mode - local device only', 'live');
      toast(`${name} added in Villa order`);
      return;
    }
    const { data, error } = await sb.rpc('add_bus_child', { p_name:name, p_villa_number:villa, p_active_from:activeFrom });
    if (error) { console.error(error); status('Could not add child', 'error'); toast(error.message || 'Could not add child'); return; }
    if (data) children.push(Array.isArray(data) ? data[0] : data);
    $('addDialog').close();
    render();
    status('Live • all changes saved', 'live');
    toast(`${name} added in Villa order`);
  }

  async function removeChild() {
    const id = $('removeSelect').value;
    const child = children.find(c => c.id === id);
    if (!child) return;
    const start = effectiveDate();
    const until = addDays(start,-1);
    if (!confirm(`Remove ${child.name} from ${formatLong(start)} onward? Previous records will stay in history.`)) return;
    status('Removing child…', 'saving');
    if (demoMode) {
      child.active_until = until;
      persistDemo();
      $('removeDialog').close();
      render();
      status('Demo mode - local device only', 'live');
      toast(`${child.name} removed from the active list`);
      return;
    }
    const { error } = await sb.rpc('remove_bus_child', { p_child_id:id, p_active_until:until });
    if (error) { console.error(error); status('Could not remove child', 'error'); toast('Remove failed'); return; }
    child.active_until = until;
    $('removeDialog').close();
    render();
    status('Live • all changes saved', 'live');
    toast(`${child.name} removed from the active list`);
  }

  function renderRemoveOptions() {
    const select = $('removeSelect');
    if (!select) return;
    const list = sortChildren(children.filter(c => activeForDate(c, effectiveDate())));
    select.innerHTML = list.map(c => `<option value="${c.id}">Villa ${Number(c.villa_number)} - ${safe(c.name)}</option>`).join('');
  }

  async function refreshCalendarData() {
    if (!sb) return;
    const [closureRes, yearRes] = await Promise.all([
      sb.from('school_closures').select('*').order('start_date', { ascending:true }),
      sb.from('school_years').select('*').order('start_date', { ascending:true })
    ]);
    if (!closureRes.error && closureRes.data?.length) closures = closureRes.data;
    if (!yearRes.error && yearRes.data?.length) schoolYears = yearRes.data;
    render();
  }

  function subscribeRealtime() {
    if (!sb || realtimeChannel) return;
    realtimeChannel = sb.channel('bus-board-live')
      .on('postgres_changes', { event:'*', schema:'public', table:'bus_votes' }, payload => {
        const r = payload.new || payload.old;
        if (!r || compareDate(r.service_date,minDate)<0 || compareDate(r.service_date,maxDate)>0) return;
        if (payload.eventType === 'DELETE') votes.delete(`${r.service_date}|${r.child_id}`);
        else votes.set(`${r.service_date}|${r.child_id}`, r);
        if (r.service_date === selectedDate) renderChildren();
      })
      .on('postgres_changes', { event:'*', schema:'public', table:'children' }, async () => {
        const { data } = await sb.from('children').select('*').order('villa_number').order('name');
        if (data) { children = data; render(); }
      })
      .on('postgres_changes', { event:'*', schema:'public', table:'school_closures' }, refreshCalendarData)
      .on('postgres_changes', { event:'*', schema:'public', table:'school_years' }, refreshCalendarData)
      .subscribe();
  }

  function canShiftWeek(n) {
    const targetStart = addDays(startSunday(selectedDate), n * 7);
    const targetEnd = addDays(targetStart, 6);
    return compareDate(targetEnd, minDate) >= 0 && compareDate(targetStart, maxDate) <= 0;
  }

  function shiftWeek(n) {
    if (!canShiftWeek(n)) return;
    const currentDow = toDate(selectedDate).getUTCDay();
    const targetStart = addDays(startSunday(selectedDate), n * 7);
    let candidate = addDays(targetStart, currentDow);
    if (compareDate(candidate, minDate) < 0) candidate = minDate;
    if (compareDate(candidate, maxDate) > 0) candidate = maxDate;
    selectedDate = candidate;
    render();
  }

  $('prevWeek').onclick = () => shiftWeek(-1);
  $('nextWeek').onclick = () => shiftWeek(1);
  $('addChildBtn').onclick = () => { $('childName').value=''; $('villaNumber').value=''; $('addDialog').showModal(); setTimeout(()=>$('childName').focus(),100); };
  $('removeChildBtn').onclick = () => { renderRemoveOptions(); $('removeDialog').showModal(); };
  $('confirmAdd').onclick = addChild;
  $('confirmRemove').onclick = removeChild;

  let touchStartX = null;
  $('datePanel').addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive:true });
  $('datePanel').addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) > 55) shiftWeek(dx < 0 ? 1 : -1);
  }, { passive:true });

  function foregroundRefresh() {
    if (document.visibilityState !== 'visible') return;
    const now = Date.now();
    // visibilitychange and focus can fire together; one refresh is enough.
    if (now - lastForegroundRefresh < 1500) return;
    lastForegroundRefresh = now;
    refreshSharedData({ silent:true, includeCalendar:true });
  }

  // Reconcile with Supabase every 30 seconds while the app is actually visible.
  // Realtime remains active; this periodic pull is a safety net for suspended/mobile browser sessions.
  setInterval(() => {
    if (document.visibilityState === 'visible') refreshSharedData({ silent:true });
  }, 30000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') foregroundRefresh();
  });
  window.addEventListener('focus', foregroundRefresh);
  window.addEventListener('online', foregroundRefresh);

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  loadData();
})();
