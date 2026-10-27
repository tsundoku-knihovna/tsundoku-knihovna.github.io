const SUPABASE_URL = 'https://ukwoxnidopkcpcimhcrc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AimfClf0MBCRxMpgUeJD8w_RCiLqG1v';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const $app = document.getElementById('app');
const $sheet = document.getElementById('sheet-root');

const S = {
  session: null, profile: null, books: [], friendships: [], profilesById: {},
  view: 'library', filter: 'all', query: '', wishQuery: '',
  friend: null, friendBooks: [], friendTab: 'library', authMode: 'login',
};

const ic = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const I = {
  books: ic('<path d="M5 4h4v16H5z"/><path d="M9 4h4v16H9z"/><path d="M5 8h4M9 16h4"/><path d="m13 7 4-1 3 13-4 1z"/>'),
  heart: ic('<path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6a5 5 0 1 1 7.5 6.6"/>'),
  scan: ic('<path d="M4 7V6a2 2 0 0 1 2-2h2M4 17v1a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v1M16 20h2a2 2 0 0 0 2-2v-1M7 12h10"/>'),
  users: ic('<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.1a4 4 0 0 1 0 7.8M21 21v-2a4 4 0 0 0-3-3.9"/>'),
  camera: ic('<path d="M5 7h1a2 2 0 0 0 2-2 1 1 0 0 1 1-1h6a1 1 0 0 1 1 1 2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2"/><circle cx="12" cy="13" r="3"/>'),
  barcode: ic('<path d="M4 7V6a2 2 0 0 1 2-2h2M4 17v1a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v1M16 20h2a2 2 0 0 0 2-2v-1M5 11h1v2H5zM10 11v2M14 11h1v2h-1zM19 11v2"/>'),
  search: ic('<circle cx="10" cy="10" r="7"/><path d="m21 21-6-6"/>'),
  edit: ic('<path d="M4 20h4L18.5 9.5a2.8 2.8 0 0 0-4-4L4 16v4"/><path d="m13.5 6.5 4 4"/>'),
  x: ic('<path d="M18 6 6 18M6 6l12 12"/>'),
  ext: ic('<path d="M12 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6M11 13l9-9M15 4h5v5"/>'),
  share: ic('<circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="m8.7 10.7 6.6-3.4M8.7 13.3l6.6 3.4"/>'),
  logout: ic('<path d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2"/><path d="M9 12h12l-3-3M18 15l3-3"/>'),
  left: ic('<path d="m15 6-6 6 6 6"/>'),
  user: ic('<circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>'),
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initials = (n) => (n || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const starsTxt = (r) => (r ? '★'.repeat(r) + '☆'.repeat(5 - r) : '');
const COVER_COLORS = ['#2F4A3A', '#8C3B2E', '#C9A24A', '#5C6B73', '#A6705A', '#3E5C76', '#6B5B4B'];
const coverColor = (t) => COVER_COLORS[[...(t || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % COVER_COLORS.length];
const STATUS = { unread: 'Nepřečteno', reading: 'Čtu', read: 'Přečteno' };
const safeUrl = (u) => (/^https:\/\//.test(u || '') ? u : '');

function coverHtml(b) {
  const url = safeUrl(b.cover_url);
  if (url) return `<div class="cover has-img"><img src="${esc(url)}" alt="" loading="lazy" onerror="this.parentNode.classList.remove('has-img');this.parentNode.style.background='${coverColor(b.title)}';this.replaceWith(document.createTextNode(${esc(JSON.stringify(b.title || ''))}))"></div>`;
  return `<div class="cover" style="background:${coverColor(b.title)}">${esc(b.title)}</div>`;
}

function dbkUrl(b) {
  if (/^https:\/\/(www\.)?databazeknih\.cz\//.test(b.dbk_url || '')) return b.dbk_url;
  return 'https://www.databazeknih.cz/search?q=' + encodeURIComponent([b.title, b.author].filter(Boolean).join(' '));
}
function goodreadsUrl(b) {
  const q = b.isbn || [b.title, b.author].filter(Boolean).join(' ');
  return 'https://www.goodreads.com/search?q=' + encodeURIComponent(q);
}

let toastT;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- Data ---------- */
async function loadProfile() {
  const { data } = await sb.from('profiles').select('*').eq('id', S.session.user.id).maybeSingle();
  S.profile = data;
}
async function loadBooks() {
  const { data, error } = await sb.from('books').select('*').eq('owner_id', S.session.user.id).order('created_at', { ascending: false });
  if (!error) S.books = data;
}
async function loadFriends() {
  const { data } = await sb.from('friendships').select('*');
  S.friendships = data || [];
  const ids = [...new Set(S.friendships.flatMap((f) => [f.requester_id, f.addressee_id]))];
  if (ids.length) {
    const { data: ps } = await sb.from('profiles').select('id,username,display_name').in('id', ids);
    (ps || []).forEach((p) => (S.profilesById[p.id] = p));
  }
}
const me = () => S.session.user.id;
const otherId = (f) => (f.requester_id === me() ? f.addressee_id : f.requester_id);
const acceptedFriends = () => S.friendships.filter((f) => f.status === 'accepted').map((f) => S.profilesById[otherId(f)]).filter(Boolean);
const incoming = () => S.friendships.filter((f) => f.status === 'pending' && f.addressee_id === me());

/* ---------- Book lookup ---------- */
const olCover = (isbn) => (isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false` : null);

// Thorough search: AI + web search on the server (Czech catalogues, databazeknih.cz…). Returns { results } or { error }.
async function deepSearch(params) {
  const { data, error } = await sb.functions.invoke('search-books', { body: params });
  if (error) {
    let code = '';
    try { code = (await error.context.json()).error; } catch (e) {}
    return { error: code || 'failed', results: [] };
  }
  return { results: (data.results || []).map((r) => ({ ...r, cover_url: olCover(r.isbn), ai: true })) };
}
function deepErrorText(code) {
  if (code === 'limit') return 'Dnešní limit důkladného hledání je vyčerpaný. Zkus to zítra, nebo knihu zadej ručně.';
  if (code === 'no_key') return 'Důkladné hledání zatím není zapnuté.';
  return 'Důkladné hledání se nepovedlo. Zkus to znovu, nebo knihu zadej ručně.';
}

/* ---------- Enrichment: year, ISBN, publisher, plot, cover ---------- */
const imgExists = (url) => new Promise((res) => {
  if (!url) return res(false);
  const i = new Image(); const t = setTimeout(() => res(false), 8000);
  i.onload = () => { clearTimeout(t); res(i.naturalWidth > 10); }; i.onerror = () => { clearTimeout(t); res(false); }; i.src = url;
});
async function findCover(isbn, title, author) {
  if (isbn) { const u = olCover(isbn); if (await imgExists(u)) return u; }
  try {
    const hits = await searchBooks([title, author].filter(Boolean).join(' '));
    const nt = normT(title);
    const m = hits.find((h) => h.cover_url && (isbn ? h.isbn === isbn : normT(h.title).startsWith(nt.slice(0, 10))));
    if (m && await imgExists(m.cover_url)) return m.cover_url;
  } catch (e) {}
  return null;
}
// Fills only what is missing; never overwrites what the user typed. Returns 'ok' or an error code.
async function enrichBook(b) {
  const { data, error } = await sb.functions.invoke('enrich-book', { body: { title: b.title, author: b.author, isbn: b.isbn, year: b.year } });
  let code = null;
  if (error) { try { code = (await error.context.json()).error; } catch (e) {} code = code || 'failed'; }
  const r = data || {};
  const up = { enriched_at: new Date().toISOString() };
  if (!error) {
    if (r.author && (!b.author || (r.author.length > b.author.length && normT(r.author).includes(normT(b.author))))) up.author = r.author;
    if (!b.year && r.year) up.year = r.year;
    if (!b.isbn && r.isbn) up.isbn = r.isbn;
    if (!b.publisher && r.publisher) up.publisher = r.publisher;
    if (!b.original_title && r.original_title && normT(r.original_title) !== normT(b.title)) up.original_title = r.original_title;
    if (!b.description && r.description) up.description = r.description;
    if (!b.dbk_url && r.dbk_url) up.dbk_url = r.dbk_url;
  }
  if (!safeUrl(b.cover_url)) { const c = await findCover(up.isbn || b.isbn, b.title, up.author || b.author); if (c) up.cover_url = c; }
  if (code === 'limit' || code === 'no_key') return code;
  const { error: e2 } = await sb.from('books').update(up).eq('id', b.id);
  if (!e2) Object.assign(b, up);
  return error ? code : 'ok';
}
const enrichState = { ids: new Set(), total: 0, done: 0 };
function enrichBanner() {
  let el = document.getElementById('enrich-bar');
  if (!enrichState.ids.size) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('div'); el.id = 'enrich-bar'; document.body.appendChild(el); }
  el.innerHTML = `<div class="spin"></div>Dohledávám děj a údaje… ${enrichState.done}/${enrichState.total}`;
}
// Runs in the background (3 at a time) so the user can keep working.
async function enrichMany(books) {
  const todo = books.filter((b) => b && !enrichState.ids.has(b.id));
  if (!todo.length) return;
  todo.forEach((b) => enrichState.ids.add(b.id));
  enrichState.total += todo.length; enrichBanner();
  let stop = null;
  const queue = [...todo];
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (queue.length && !stop) {
      const b = queue.shift();
      const r = await enrichBook(b);
      if (r === 'limit' || r === 'no_key') stop = r;
      enrichState.ids.delete(b.id); enrichState.done++; enrichBanner();
    }
  }));
  queue.forEach((b) => enrichState.ids.delete(b.id));
  if (!enrichState.ids.size) { enrichState.total = 0; enrichState.done = 0; enrichBanner(); }
  if (stop) toast(deepErrorText(stop));
  else if (!enrichState.ids.size) toast('Děj a údaje jsou doplněné');
  await loadBooks();
  if (!$sheet.innerHTML) render();
}

async function lookupIsbnCatalogs(isbn) {
  try {
    const r = await fetch('https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn);
    if (r.ok) { const v = (await r.json()).items?.[0]?.volumeInfo; if (v) return fromGoogle(v, isbn); }
  } catch (e) {}
  try {
    const r = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    const v = (await r.json())['ISBN:' + isbn];
    if (v) return {
      title: v.title, author: v.authors?.map((a) => a.name).join(', ') || null, isbn,
      year: parseInt(v.publish_date?.match(/\d{4}/)?.[0]) || null,
      cover_url: v.cover?.medium || v.cover?.large || olCover(isbn),
    };
  } catch (e) {}
  return null;
}
async function lookupIsbn(isbn, onDeep) {
  isbn = isbn.replace(/[^0-9Xx]/g, '');
  const hit = await lookupIsbnCatalogs(isbn);
  if (hit) return hit;
  onDeep && onDeep();
  const d = await deepSearch({ isbn });
  const exact = d.results.find((r) => r.isbn === isbn) || d.results[0];
  return exact ? { ...exact, isbn } : null;
}
function fromGoogle(v, isbn) {
  const ids = v.industryIdentifiers || [];
  const i13 = ids.find((x) => x.type === 'ISBN_13')?.identifier || ids.find((x) => x.type === 'ISBN_10')?.identifier;
  let cover = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || null;
  if (cover) cover = cover.replace('http://', 'https://').replace('&edge=curl', '');
  const is = isbn || i13 || null;
  if (!cover && is) cover = olCover(is);
  return { title: v.title + (v.subtitle ? ': ' + v.subtitle : ''), author: v.authors?.join(', ') || null, isbn: is, year: parseInt(v.publishedDate) || null, cover_url: cover };
}
async function searchGoogle(q) {
  const r = await fetch('https://www.googleapis.com/books/v1/volumes?maxResults=10&q=' + encodeURIComponent(q));
  if (!r.ok) return [];
  return ((await r.json()).items || []).map((it) => fromGoogle(it.volumeInfo));
}
async function searchOpenLibrary(q) {
  const r = await fetch('https://openlibrary.org/search.json?limit=10&fields=title,author_name,isbn,cover_i,first_publish_year&q=' + encodeURIComponent(q));
  if (!r.ok) return [];
  return ((await r.json()).docs || []).map((d) => {
    const isbn = (d.isbn || []).find((x) => x.length === 13) || d.isbn?.[0] || null;
    return {
      title: d.title, author: d.author_name?.join(', ') || null, isbn, year: d.first_publish_year || null,
      cover_url: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : olCover(isbn),
    };
  });
}
const normT = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
// Fast free search across catalogues (Google Books + Open Library), merged and de-duplicated.
async function searchBooks(q) {
  const [g, o] = await Promise.allSettled([searchGoogle(q), searchOpenLibrary(q)]);
  const all = [...(g.value || []), ...(o.value || [])];
  const seen = new Set();
  return all.filter((b) => {
    if (!b.title) return false;
    const k = b.isbn || normT(b.title) + '|' + normT(b.author);
    if (seen.has(k)) return false; seen.add(k); return true;
  }).slice(0, 12);
}

/* ---------- Auth ---------- */
function renderAuth(msg = '') {
  const signup = S.authMode === 'signup';
  $app.innerHTML = `<div class="auth">
    <h1>Tsundoku</h1>
    <p class="sub">Tvoje domácí knihovna, hodnocení a wishlist. Sdílej je s přáteli.</p>
    <form id="authf" class="card" novalidate>
      <label class="f" for="em">E-mail</label>
      <input class="inp" id="em" type="email" autocomplete="email" placeholder="jmeno@email.cz" required>
      <label class="f" for="pw">Heslo</label>
      <input class="inp" id="pw" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="${signup ? 'Aspoň 8 znaků' : ''}" required>
      <div class="err" id="aerr">${esc(msg)}</div>
      <button class="btn primary" type="submit">${signup ? 'Vytvořit účet' : 'Přihlásit se'}</button>
    </form>
    <p class="hint" style="text-align:center;margin-top:16px">${signup ? 'Už máš účet?' : 'Ještě nemáš účet?'}
      <button class="link" id="sw">${signup ? 'Přihlas se' : 'Zaregistruj se'}</button></p>
  </div>`;
  document.getElementById('sw').onclick = () => { S.authMode = signup ? 'login' : 'signup'; renderAuth(); };
  document.getElementById('authf').onsubmit = async (e) => {
    e.preventDefault();
    const em = document.getElementById('em').value.trim();
    const pw = document.getElementById('pw').value;
    const err = document.getElementById('aerr');
    if (!/^\S+@\S+\.\S+$/.test(em)) return (err.textContent = 'Zadej platný e-mail.');
    if (pw.length < (signup ? 8 : 1)) return (err.textContent = signup ? 'Heslo musí mít aspoň 8 znaků.' : 'Zadej heslo.');
    const btn = e.target.querySelector('button[type=submit]'); btn.disabled = true;
    if (signup) {
      const { data, error } = await sb.auth.signUp({ email: em, password: pw, options: { emailRedirectTo: location.origin + location.pathname } });
      btn.disabled = false;
      if (error) return (err.textContent = authErr(error));
      if (!data.session) { S.authMode = 'login'; renderAuth(); document.getElementById('aerr').style.color = 'var(--green)'; document.getElementById('aerr').textContent = 'Hotovo. Potvrď registraci odkazem v e-mailu a pak se přihlas.'; }
    } else {
      const { error } = await sb.auth.signInWithPassword({ email: em, password: pw });
      btn.disabled = false;
      if (error) err.textContent = authErr(error);
    }
  };
}
function authErr(e) {
  const m = (e.message || '').toLowerCase();
  if (m.includes('invalid login')) return 'Špatný e-mail nebo heslo.';
  if (m.includes('not confirmed')) return 'Nejdřív potvrď registraci odkazem v e-mailu.';
  if (m.includes('already registered')) return 'Tenhle e-mail už má účet. Přihlas se.';
  if (m.includes('rate limit')) return 'Moc pokusů za sebou. Zkus to za chvíli.';
  return 'Něco se pokazilo. Zkus to znovu.';
}

function renderProfileSetup() {
  $app.innerHTML = `<div class="auth">
    <h1>Vítej!</h1>
    <p class="sub">Ještě jméno, pod kterým tě najdou přátelé.</p>
    <form id="pf" class="card" novalidate>
      <label class="f" for="dn">Tvoje jméno</label>
      <input class="inp" id="dn" placeholder="Bára Nováková" maxlength="60">
      <label class="f" for="un">Uživatelské jméno</label>
      <input class="inp" id="un" placeholder="bara.cte" maxlength="24" autocapitalize="none">
      <p class="hint">3–24 znaků: malá písmena bez diakritiky, čísla, tečka nebo podtržítko.</p>
      <div class="err" id="perr"></div>
      <button class="btn primary" type="submit">Pokračovat</button>
    </form></div>`;
  document.getElementById('pf').onsubmit = async (e) => {
    e.preventDefault();
    const dn = document.getElementById('dn').value.trim();
    const un = document.getElementById('un').value.trim().toLowerCase();
    const err = document.getElementById('perr');
    if (!dn) return (err.textContent = 'Zadej jméno.');
    if (!/^[a-z0-9_.]{3,24}$/.test(un)) return (err.textContent = 'Uživatelské jméno nesplňuje pravidla výše.');
    const { error } = await sb.from('profiles').insert({ id: me(), username: un, display_name: dn });
    if (error) return (err.textContent = error.code === '23505' ? 'Tohle jméno už někdo má. Zkus jiné.' : 'Nepodařilo se uložit. Zkus to znovu.');
    await boot();
  };
}

/* ---------- Shell ---------- */
function nav() {
  const n = incoming().length;
  const b = (v, icon, label) => `<button class="${S.view === v ? 'on' : ''}" data-v="${v}">${icon}${label}${v === 'friends' && n ? `<span class="badge">${n}</span>` : ''}</button>`;
  return `<nav class="nav"><div class="nav-in">${b('library', I.books, 'Knihovna')}${b('wishlist', I.heart, 'Wishlist')}${b('add', I.scan, 'Přidat')}${b('friends', I.users, 'Přátelé')}</div></nav>`;
}
function render() {
  stopScanner();
  let body = '';
  if (S.view === 'library') body = viewLibrary();
  else if (S.view === 'wishlist') body = viewWishlist();
  else if (S.view === 'add') body = viewAdd();
  else if (S.view === 'friends') body = S.friend ? viewFriend() : viewFriends();
  $app.innerHTML = `<div class="wrap">${body}</div>${nav()}`;
  $app.querySelectorAll('.nav button').forEach((b) => (b.onclick = () => { S.view = b.dataset.v; S.friend = null; render(); window.scrollTo(0, 0); }));
  bindView();
}

function bookGrid(list, own = true) {
  return `<div class="grid">${list.map((b) => `<button class="book" data-id="${b.id}" data-own="${own ? 1 : 0}">
    ${coverHtml(b)}<div class="t">${esc(b.title)}</div><div class="a">${esc(b.author || '')}</div>
    ${b.rating ? `<div class="stars">${starsTxt(b.rating)}</div>` : ''}</button>`).join('')}</div>`;
}
const matchQ = (b, q) => !q || (b.title + ' ' + (b.author || '')).toLowerCase().includes(q.toLowerCase());

function viewLibrary() {
  const lib = S.books.filter((b) => b.list === 'library');
  const year = new Date().getFullYear();
  const readYear = lib.filter((b) => b.status === 'read' && new Date(b.updated_at).getFullYear() === year).length;
  const list = lib.filter((b) => (S.filter === 'all' || b.status === S.filter) && matchQ(b, S.query));
  const chip = (k, l) => `<button class="chip ${S.filter === k ? 'on' : ''}" data-f="${k}">${l}</button>`;
  return `<div class="top"><div><h1>Tsundoku</h1><p class="sub">${lib.length} ${plural(lib.length, 'kniha', 'knihy', 'knih')} · ${readYear} přečteno letos</p></div>
    <button class="icon-btn" id="me" aria-label="Můj účet">${I.user}</button></div>
    ${missingBanner()}
    ${lib.length ? `<input class="search" id="q" type="search" placeholder="Hledat v knihovně" value="${esc(S.query)}">
    <div class="chips">${chip('all', 'Vše')}${chip('reading', 'Čtu')}${chip('read', 'Přečteno')}${chip('unread', 'Nepřečteno')}</div>
    ${list.length ? bookGrid(list) : `<div class="empty">Nic tu neodpovídá hledání.</div>`}`
    : `<div class="empty"><h3>Začni plnit knihovnu</h3><p>Naskenuj čárový kód na zadní straně knihy nebo vyfoť obálku.</p><br><button class="btn primary" data-go="add">${I.scan}Přidat první knihu</button></div>`}`;
}
function missingBanner() {
  const miss = S.books.filter((b) => !b.enriched_at && !enrichState.ids.has(b.id));
  if (!miss.length || enrichState.ids.size) return '';
  const kc = Math.max(1, Math.round(miss.length * 0.5));
  return `<div class="card banner"><div class="grow"><b>U ${miss.length} ${plural(miss.length, 'knihy', 'knih', 'knih')} chybí děj a údaje</b>
    <span>Rok, nakladatel, obálka a o čem kniha je. Asi ${kc} Kč celkem.</span></div><button class="mini primary" id="enr-all">Doplnit</button></div>`;
}
function viewWishlist() {
  const w = S.books.filter((b) => b.list === 'wishlist' && matchQ(b, S.wishQuery));
  const all = S.books.filter((b) => b.list === 'wishlist').length;
  return `<div class="top"><div><h1>Wishlist</h1><p class="sub">Knihy, které chceš. Přátelé je uvidí, až budou vybírat dárek.</p></div></div>
    ${all ? `<input class="search" id="wq" type="search" placeholder="Hledat ve wishlistu" value="${esc(S.wishQuery)}">${bookGrid(w)}`
    : `<div class="empty"><h3>Zatím nic nechceš?</h3><p>Při přidávání knihy zvol „Wishlist“ místo „Knihovna“.</p><br><button class="btn primary" data-go="add" data-list="wishlist">${I.heart}Přidat do wishlistu</button></div>`}`;
}
function viewAdd() {
  return `<div class="top"><div><h1>Přidat knihu</h1><p class="sub">Údaje a obálku doplníme automaticky.</p></div></div>
  <div class="add-opts">
    <button class="add-opt" id="o-shelf"><div class="ic">${I.books}</div><div><b>Vyfotit celou poličku</b><span>Víc knih najednou podle hřbetů. Seznam pak zkontroluješ.</span></div></button>
    <button class="add-opt" id="o-scan"><div class="ic">${I.barcode}</div><div><b>Naskenovat čárový kód</b><span>Kód ISBN na zadní straně. Nejrychlejší.</span></div></button>
    <button class="add-opt" id="o-photo"><div class="ic">${I.camera}</div><div><b>Vyfotit obálku</b><span>Pro knihy bez kódu. Pozná ji AI.</span></div></button>
    <button class="add-opt" id="o-search"><div class="ic">${I.search}</div><div><b>Najít podle názvu</b><span>Nebo zadat úplně ručně.</span></div></button>
  </div>
  <input type="file" id="photo-in" accept="image/*" capture="environment" hidden>
  <input type="file" id="shelf-in" accept="image/*" hidden>
  <p class="hint" style="margin-top:16px">Tip pro poličku: foť zepředu, rovně a při dobrém světle, nejvýš jednu nebo dvě police najednou, aby byly hřbety čitelné.</p>`;
}
function viewFriends() {
  const inc = incoming();
  const out = S.friendships.filter((f) => f.status === 'pending' && f.requester_id === me());
  const fr = acceptedFriends();
  const row = (p, right) => `<div class="li"><div class="av">${esc(initials(p.display_name))}</div><div class="grow"><b>${esc(p.display_name)}</b><span>@${esc(p.username)}</span></div>${right}</div>`;
  return `<div class="top"><div><h1>Přátelé</h1><p class="sub">Tvoje jméno: <b>@${esc(S.profile.username)}</b></p></div></div>
    <button class="btn wine" id="invite">${I.share}Pozvat kamarádku</button>
    <form id="addf" style="margin-top:14px" novalidate><label class="f" for="fu">Přidat podle uživatelského jména</label>
      <div class="row"><input class="inp" id="fu" placeholder="jana.knihomolka" autocapitalize="none"><button class="mini primary" type="submit" style="padding:10px 14px">Přidat</button></div>
      <div class="err" id="ferr"></div></form>
    ${inc.length ? `<h2>Žádosti o přátelství</h2><div class="list">${inc.map((f) => { const p = S.profilesById[f.requester_id]; return p ? row(p, `<button class="mini primary" data-acc="${f.id}">Přijmout</button><button class="mini" data-del="${f.id}" aria-label="Odmítnout">${'Ne'}</button>`) : ''; }).join('')}</div>` : ''}
    <h2>Moji přátelé</h2>
    ${fr.length ? `<div class="list">${fr.map((p) => `<button class="li" style="width:100%;text-align:left" data-friend="${p.id}"><div class="av">${esc(initials(p.display_name))}</div><div class="grow"><b>${esc(p.display_name)}</b><span>Zobrazit knihovnu a wishlist</span></div>${I.left.replace('<svg', '<svg style="width:18px;transform:rotate(180deg)"')}</button>`).join('')}</div>`
    : `<p class="sub">Zatím tu nikdo není. Pošli kamarádce pozvánku, nebo ji přidej podle jména.</p>`}
    ${out.length ? `<h2>Čeká na potvrzení</h2><div class="list">${out.map((f) => { const p = S.profilesById[f.addressee_id]; return p ? row(p, `<button class="mini" data-del="${f.id}">Zrušit</button>`) : ''; }).join('')}</div>` : ''}`;
}
function viewFriend() {
  const p = S.friend;
  const list = S.friendBooks.filter((b) => b.list === S.friendTab);
  const chip = (k, l) => `<button class="chip ${S.friendTab === k ? 'on' : ''}" data-ft="${k}">${l}</button>`;
  return `<button class="back" id="back">${I.left}Přátelé</button>
    <div class="top"><div><h1>${esc(p.display_name)}</h1><p class="sub">@${esc(p.username)} · ${S.friendBooks.filter((b) => b.list === 'library').length} knih</p></div><div class="av">${esc(initials(p.display_name))}</div></div>
    <div class="chips">${chip('library', 'Knihovna')}${chip('wishlist', 'Wishlist')}</div>
    ${list.length ? bookGrid(list, false) : `<div class="empty">${S.friendTab === 'wishlist' ? 'Wishlist je zatím prázdný.' : 'Knihovna je zatím prázdná.'}</div>`}`;
}
const plural = (n, a, b, c) => (n === 1 ? a : n >= 2 && n <= 4 ? b : c);

function bindView() {
  $app.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => { S.view = b.dataset.go; S.defaultList = b.dataset.list || 'library'; render(); }));
  $app.querySelectorAll('.book').forEach((b) => (b.onclick = () => openBook(b.dataset.id, b.dataset.own === '1')));
  $app.querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => { S.filter = b.dataset.f; render(); }));
  $app.querySelectorAll('[data-ft]').forEach((b) => (b.onclick = () => { S.friendTab = b.dataset.ft; render(); }));
  const q = document.getElementById('q');
  if (q) q.oninput = () => { S.query = q.value; const pos = q.selectionStart; render(); const n = document.getElementById('q'); n.focus(); n.setSelectionRange(pos, pos); };
  const wq = document.getElementById('wq');
  if (wq) wq.oninput = () => { S.wishQuery = wq.value; const pos = wq.selectionStart; render(); const n = document.getElementById('wq'); n.focus(); n.setSelectionRange(pos, pos); };
  const meBtn = document.getElementById('me'); if (meBtn) meBtn.onclick = openAccount;
  const ea = document.getElementById('enr-all'); if (ea) ea.onclick = () => { enrichMany(S.books.filter((b) => !b.enriched_at)); render(); };
  const back = document.getElementById('back'); if (back) back.onclick = () => { S.friend = null; render(); };

  if (S.view === 'add') {
    document.getElementById('o-scan').onclick = openScanner;
    document.getElementById('o-search').onclick = () => openSearch();
    const pin = document.getElementById('photo-in');
    document.getElementById('o-photo').onclick = () => pin.click();
    pin.onchange = () => { if (pin.files[0]) recognizePhoto(pin.files[0]); pin.value = ''; };
    const sin = document.getElementById('shelf-in');
    document.getElementById('o-shelf').onclick = () => sin.click();
    sin.onchange = () => { if (sin.files[0]) recognizeShelf(sin.files[0]); sin.value = ''; };
  }
  if (S.view === 'friends' && !S.friend) {
    document.getElementById('invite').onclick = invite;
    document.getElementById('addf').onsubmit = (e) => { e.preventDefault(); addFriend(document.getElementById('fu').value); };
    $app.querySelectorAll('[data-acc]').forEach((b) => (b.onclick = async () => {
      const { error } = await sb.from('friendships').update({ status: 'accepted' }).eq('id', b.dataset.acc);
      if (error) return toast('Nepodařilo se přijmout.');
      await loadFriends(); toast('Jste přátelé'); render();
    }));
    $app.querySelectorAll('[data-del]').forEach((b) => (b.onclick = async () => {
      await sb.from('friendships').delete().eq('id', b.dataset.del); await loadFriends(); render();
    }));
    $app.querySelectorAll('[data-friend]').forEach((b) => (b.onclick = () => openFriend(b.dataset.friend)));
  }
}

/* ---------- Friends ---------- */
async function addFriend(username) {
  const err = document.getElementById('ferr');
  const un = username.trim().replace(/^@/, '').toLowerCase();
  if (!un) { if (err) err.textContent = 'Zadej uživatelské jméno.'; return; }
  if (un === S.profile.username) { if (err) err.textContent = 'To jsi ty.'; return; }
  const { data: p } = await sb.from('profiles').select('id,username,display_name').eq('username', un).maybeSingle();
  if (!p) { if (err) err.textContent = 'Takové jméno jsme nenašli.'; else toast('Uživatel @' + un + ' neexistuje.'); return; }
  S.profilesById[p.id] = p;
  const existing = S.friendships.find((f) => otherId(f) === p.id);
  if (existing) {
    if (existing.status === 'pending' && existing.addressee_id === me()) {
      await sb.from('friendships').update({ status: 'accepted' }).eq('id', existing.id);
      await loadFriends(); toast('Jste přátelé'); return render();
    }
    toast(existing.status === 'accepted' ? 'Už jste přátelé.' : 'Žádost už čeká na potvrzení.'); return;
  }
  const { error } = await sb.from('friendships').insert({ addressee_id: p.id });
  if (error) return toast('Nepodařilo se odeslat žádost.');
  await loadFriends(); toast('Žádost odeslána'); render();
}
async function invite() {
  const url = location.origin + location.pathname + '?pritel=' + encodeURIComponent(S.profile.username);
  const text = `Přidej se ke mně na Tsundoku, ukážeme si knihovny a wishlisty. Moje jméno: @${S.profile.username}`;
  if (navigator.share) { try { await navigator.share({ title: 'Tsundoku', text, url }); } catch (e) {} }
  else { try { await navigator.clipboard.writeText(text + '\n' + url); toast('Odkaz zkopírován'); } catch (e) { toast(url); } }
}
async function openFriend(id) {
  const { data } = await sb.from('books').select('*').eq('owner_id', id).order('created_at', { ascending: false });
  S.friend = S.profilesById[id]; S.friendBooks = data || []; S.friendTab = 'library'; render(); window.scrollTo(0, 0);
}

/* ---------- Sheets ---------- */
function sheet(html, onClose) {
  $sheet.innerHTML = `<div class="sheet-bg"><div class="sheet" role="dialog" aria-modal="true">${html}</div></div>`;
  const bg = $sheet.querySelector('.sheet-bg');
  const close = () => { $sheet.innerHTML = ''; document.body.style.overflow = ''; onClose && onClose(); };
  bg.onclick = (e) => { if (e.target === bg) close(); };
  $sheet.querySelectorAll('[data-close]').forEach((b) => (b.onclick = close));
  document.body.style.overflow = 'hidden';
  return { el: $sheet.querySelector('.sheet'), close };
}
const head = (t) => `<div class="sheet-head"><h2>${esc(t)}</h2><button class="icon-btn" data-close aria-label="Zavřít">${I.x}</button></div>`;

async function openBook(id, own) {
  const b = (own ? S.books : S.friendBooks).find((x) => x.id === id);
  if (!b) return;
  let friendsHave = [];
  if (own && acceptedFriends().length) {
    let q = sb.from('books').select('owner_id').neq('owner_id', me()).eq('list', 'library');
    q = b.isbn ? q.eq('isbn', b.isbn) : q.ilike('title', b.title);
    const { data } = await q; friendsHave = [...new Set((data || []).map((x) => x.owner_id))].map((i) => S.profilesById[i]).filter(Boolean);
  }
  const iHave = !own && S.books.some((x) => (b.isbn && x.isbn === b.isbn) || x.title.toLowerCase() === b.title.toLowerCase());
  const pending = own && enrichState.ids.has(b.id);
  const meta = [b.publisher, b.original_title && `orig. ${b.original_title}`].filter(Boolean).join(' · ');
  const { el, close } = sheet(`${head('')}
    <div class="detail"><div id="dcv">${coverHtml(b)}</div><div><h2>${esc(b.title)}</h2><p class="sub">${esc([b.author, b.year].filter(Boolean).join(' · '))}</p>
      ${meta ? `<p class="sub" style="font-size:12px">${esc(meta)}</p>` : ''}
      ${b.rating ? `<div class="stars" style="font-size:18px">${starsTxt(b.rating)}</div>` : ''}
      <span class="pill ${b.list === 'wishlist' ? 'wine' : ''}">${b.list === 'wishlist' ? 'Wishlist' : STATUS[b.status]}</span></div></div>
    ${b.description ? `<label class="f">O čem to je</label><p class="desc">${esc(b.description)}</p>`
      : own ? `<div class="card" style="padding:10px 12px;margin-top:10px"><p class="sub" style="margin-bottom:8px">${pending ? 'Děj a údaje se právě dohledávají…' : 'Děj ani podrobnosti zatím nemáme.'}</p>
        ${pending ? '' : `<button class="mini primary" id="enr">Dohledat děj a údaje</button>`}</div>` : ''}
    ${b.note ? `<label class="f">${own ? 'Moje poznámka' : 'Poznámka'}</label><div class="card" style="padding:10px 12px;font-size:14px;white-space:pre-wrap">${esc(b.note)}</div>` : ''}
    <div class="stack" style="margin-top:16px">
      <div class="row"><a class="btn" href="${esc(goodreadsUrl(b))}" target="_blank" rel="noopener">${I.ext}Goodreads</a>
        <a class="btn" href="${esc(dbkUrl(b))}" target="_blank" rel="noopener">${I.ext}Databáze knih</a></div>
      ${own ? `<button class="btn primary" id="ed">${I.edit}Upravit, hodnotit</button>
        <button class="btn" id="cph">${I.camera}${safeUrl(b.cover_url) ? 'Vyměnit obálku za vlastní fotku' : 'Vyfotit obálku'}</button>
        <input type="file" id="cph-in" accept="image/*" capture="environment" hidden>
        ${b.list === 'wishlist' ? `<button class="btn" id="mv">${I.books}Mám ji, přesunout do knihovny</button>` : ''}`
      : (iHave ? `<p class="hint" style="text-align:center">Tuhle knihu už máš.</p>` : `<button class="btn wine" id="want">${I.heart}Chci ji taky (do wishlistu)</button>`)}
    </div>
    ${friendsHave.length ? `<label class="f" style="margin-top:16px">Mají ji i přátelé</label><div class="friends-have">${friendsHave.map((p) => `<span class="av sm" title="${esc(p.display_name)}">${esc(initials(p.display_name))}</span>`).join('')}</div>` : ''}`);
  if (own) {
    el.querySelector('#ed').onclick = () => { close(); openEditor(b); };
    const enr = el.querySelector('#enr');
    if (enr) enr.onclick = async () => {
      enr.disabled = true; enr.textContent = 'Hledám… (asi 10 s)';
      const r = await enrichBook(b);
      close();
      if (r === 'limit' || r === 'no_key') toast(deepErrorText(r));
      else if (r !== 'ok') toast('Podrobnosti se nepodařilo najít. Můžeš je doplnit ručně.');
      render(); openBook(b.id, true);
    };
    const cph = el.querySelector('#cph'), cin = el.querySelector('#cph-in');
    cph.onclick = () => cin.click();
    cin.onchange = async () => {
      const f = cin.files[0]; if (!f) return;
      cph.disabled = true; cph.textContent = 'Nahrávám fotku…';
      let url = null;
      try { url = await uploadCover(await resizeImage(f, 900)); } catch (e) {}
      if (!url) { cph.disabled = false; return toast('Fotku se nepodařilo nahrát.'); }
      await sb.from('books').update({ cover_url: url }).eq('id', b.id);
      b.cover_url = url; close(); render(); openBook(b.id, true); toast('Obálka uložena');
    };
    const mv = el.querySelector('#mv');
    if (mv) mv.onclick = async () => { await sb.from('books').update({ list: 'library' }).eq('id', b.id); await loadBooks(); close(); toast('Přesunuto do knihovny'); render(); };
  } else {
    const w = el.querySelector('#want');
    if (w) w.onclick = async () => {
      const { error } = await sb.from('books').insert({ list: 'wishlist', title: b.title, author: b.author, isbn: b.isbn, year: b.year, cover_url: b.cover_url,
        description: b.description, publisher: b.publisher, original_title: b.original_title, dbk_url: b.dbk_url, enriched_at: b.enriched_at });
      if (error) return toast('Nepodařilo se uložit.');
      await loadBooks(); close(); toast('Přidáno do tvého wishlistu');
    };
  }
}

function openEditor(data, isNew = false, photoFile = null) {
  const d = { list: S.defaultList || 'library', status: 'unread', rating: null, note: '', ...data };
  const { el, close } = sheet(`${head(isNew ? 'Nová kniha' : 'Upravit knihu')}
    <form id="bf" novalidate>
      <div class="detail"><div id="cv" style="width:80px;flex-shrink:0">${coverHtml(d)}</div>
        <div style="flex:1;min-width:0"><label class="f" style="margin-top:0" for="bt">Název</label><input class="inp" id="bt" value="${esc(d.title || '')}" maxlength="300">
        <label class="f" for="ba">Autor</label><input class="inp" id="ba" value="${esc(d.author || '')}" maxlength="300"></div></div>
      <div class="row"><div style="flex:1"><label class="f" for="bi">ISBN</label><input class="inp" id="bi" value="${esc(d.isbn || '')}" inputmode="numeric" maxlength="17"></div>
        <div style="width:100px"><label class="f" for="by">Rok</label><input class="inp" id="by" value="${esc(d.year || '')}" inputmode="numeric" maxlength="4"></div></div>
      <label class="f">Kam</label><div class="seg" id="sl">${['library', 'wishlist'].map((k) => `<button type="button" data-k="${k}" class="${d.list === k ? 'on' : ''}">${k === 'library' ? 'Knihovna' : 'Wishlist'}</button>`).join('')}</div>
      <div id="libonly" ${d.list === 'wishlist' ? 'hidden' : ''}>
        <label class="f">Stav</label><div class="seg" id="ss">${Object.entries(STATUS).map(([k, l]) => `<button type="button" data-k="${k}" class="${d.status === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <label class="f">Hodnocení</label><div class="rate" id="rt">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-n="${n}" class="${d.rating >= n ? 'on' : ''}" aria-label="${n} z 5">★</button>`).join('')}</div>
      </div>
      <label class="f" for="bn">Poznámka</label><textarea class="inp" id="bn" maxlength="2000" placeholder="Komu jsem ji půjčila, co se mi líbilo…">${esc(d.note || '')}</textarea>
      ${photoFile && !safeUrl(d.cover_url) ? `<p class="hint">Jako obálku použijeme tvoji fotku.</p>` : ''}
      <div class="err" id="berr"></div>
      <div class="stack" style="margin-top:8px"><button class="btn primary" type="submit">${isNew ? 'Uložit do knihovny' : 'Uložit změny'}</button>
      ${!isNew ? `<button type="button" class="btn danger" id="bd">Smazat knihu</button>` : ''}</div>
    </form>`);
  el.querySelectorAll('#sl button').forEach((b) => (b.onclick = () => { d.list = b.dataset.k; el.querySelectorAll('#sl button').forEach((x) => x.classList.toggle('on', x === b)); el.querySelector('#libonly').hidden = d.list === 'wishlist'; }));
  el.querySelectorAll('#ss button').forEach((b) => (b.onclick = () => { d.status = b.dataset.k; el.querySelectorAll('#ss button').forEach((x) => x.classList.toggle('on', x === b)); }));
  el.querySelectorAll('#rt button').forEach((b) => (b.onclick = () => { const n = +b.dataset.n; d.rating = d.rating === n ? null : n; el.querySelectorAll('#rt button').forEach((x) => x.classList.toggle('on', d.rating >= +x.dataset.n)); }));
  const del = el.querySelector('#bd');
  if (del) del.onclick = async () => {
    if (!confirm('Opravdu smazat „' + d.title + '“?')) return;
    await sb.from('books').delete().eq('id', d.id); await loadBooks(); close(); toast('Smazáno'); render();
  };
  el.querySelector('#bf').onsubmit = async (e) => {
    e.preventDefault();
    const err = el.querySelector('#berr');
    const title = el.querySelector('#bt').value.trim();
    const isbn = el.querySelector('#bi').value.replace(/[^0-9Xx]/g, '');
    const yearS = el.querySelector('#by').value.trim();
    if (!title) return (err.textContent = 'Kniha potřebuje název.');
    if (isbn && !/^[0-9Xx]{10,13}$/.test(isbn)) return (err.textContent = 'ISBN má mít 10 nebo 13 číslic.');
    if (yearS && !/^\d{3,4}$/.test(yearS)) return (err.textContent = 'Rok zadej jako číslo, třeba 1924.');
    const btn = e.target.querySelector('button[type=submit]'); btn.disabled = true;
    let cover_url = safeUrl(d.cover_url) || null;
    if (!cover_url && photoFile) cover_url = await uploadCover(photoFile);
    const row = {
      title, author: el.querySelector('#ba').value.trim() || null, isbn: isbn || null, year: yearS ? +yearS : null,
      list: d.list, status: d.list === 'wishlist' ? 'unread' : d.status, rating: d.list === 'wishlist' ? null : d.rating,
      note: el.querySelector('#bn').value.trim() || null, cover_url,
    };
    if (isNew && row.isbn && S.books.some((b) => b.isbn === row.isbn) && !confirm('Tuhle knihu už máš. Přidat ji znovu?')) { btn.disabled = false; return; }
    const { data: saved, error } = isNew ? await sb.from('books').insert(row).select() : await sb.from('books').update(row).eq('id', d.id).select();
    btn.disabled = false;
    if (error) return (err.textContent = 'Nepodařilo se uložit. Zkus to znovu.');
    await loadBooks(); close();
    toast(isNew ? (row.list === 'wishlist' ? 'Přidáno do wishlistu' : 'Kniha je v knihovně') : 'Uloženo');
    if (isNew) S.view = row.list === 'wishlist' ? 'wishlist' : 'library';
    render();
    if (isNew && saved?.[0] && !saved[0].description) enrichMany([saved[0]]);
  };
}

/* ---------- Adding: scanner ---------- */
let scanner = null;
function stopScanner() { if (scanner) { const s = scanner; scanner = null; s.stop().catch(() => {}).finally(() => { try { s.clear(); } catch (e) {} }); } }
function openScanner() {
  const { el, close } = sheet(`${head('Naskenuj kód')}<div id="reader"></div>
    <p class="hint">Namiř kameru na čárový kód s ISBN (začíná 978 nebo 979).</p>
    <form id="mf" style="margin-top:12px" novalidate><label class="f" for="mi">Nebo opiš ISBN ručně</label>
    <div class="row"><input class="inp" id="mi" inputmode="numeric" placeholder="9788025712345"><button class="mini primary" style="padding:10px 14px">Hledat</button></div><div class="err" id="serr"></div></form>`, stopScanner);
  let done = false;
  const found = async (code) => {
    if (done) return; done = true;
    stopScanner(); close(); await handleIsbn(code);
  };
  el.querySelector('#mf').onsubmit = (e) => {
    e.preventDefault();
    const v = el.querySelector('#mi').value.replace(/[^0-9Xx]/g, '');
    if (!/^[0-9Xx]{10,13}$/.test(v)) return (el.querySelector('#serr').textContent = 'ISBN má 10 nebo 13 číslic.');
    found(v);
  };
  try {
    scanner = new Html5Qrcode('reader', { formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8, Html5QrcodeSupportedFormats.UPC_A], verbose: false });
    scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 260, height: 120 } }, (txt) => {
      if (/^97[89]\d{10}$/.test(txt) || /^\d{10}$/.test(txt)) found(txt);
    }).catch(() => { el.querySelector('#reader').outerHTML = `<div class="card"><p class="sub">Kameru se nepodařilo spustit. Povol aplikaci přístup ke kameře, nebo opiš ISBN níže.</p></div>`; scanner = null; });
  } catch (e) { scanner = null; }
}
function loadingSheet(text) {
  const s = sheet(`<div class="empty"><div class="spin" style="margin:0 auto 12px;color:var(--green)"></div><span id="ld">${esc(text)}</span></div>`);
  s.set = (t) => { const n = s.el.querySelector('#ld'); if (n) n.textContent = t; };
  return s;
}
const DEEP_MSG = 'V katalozích nic. Hledám důkladně na internetu, i v českých databázích (asi 10 s)…';
const LANG = { cs: 'česky', en: 'anglicky', fr: 'francouzsky', de: 'německy', sk: 'slovensky' };
function resultRows(items) {
  return `<div class="list results">${items.map((b, i) => `<div class="li" data-i="${i}">${coverHtml(b)}<div class="grow"><b>${esc(b.title)}</b>
    <span>${esc([b.author, b.year, b.publisher, LANG[b.language]].filter(Boolean).join(' · '))}</span></div></div>`).join('')}</div>`;
}
async function handleIsbn(isbn) {
  const ld = loadingSheet('Hledám knihu…');
  const book = await lookupIsbn(isbn, () => ld.set(DEEP_MSG));
  ld.close();
  if (book) openEditor(book, true);
  else { toast('Knihu se nepodařilo najít. Doplň název a ulož.'); openEditor({ isbn: isbn.replace(/[^0-9Xx]/g, ''), title: '' }, true); }
}

/* ---------- Adding: photo + AI ---------- */
async function resizeImage(file, max = 1200) {
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
  const s = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(img.src);
  return await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.82));
}
const blobToB64 = (blob) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.readAsDataURL(blob); });

async function recognizePhoto(file) {
  const ld = loadingSheet('Čtu, co je na fotce…');
  let blob;
  try { blob = await resizeImage(file); } catch (e) { ld.close(); return toast('Fotku se nepodařilo načíst.'); }
  const image = await blobToB64(blob);
  const { data, error } = await sb.functions.invoke('recognize-cover', { body: { image, mediaType: 'image/jpeg' } });
  if (error) {
    ld.close();
    let code = '';
    try { code = (await error.context.json()).error; } catch (e) {}
    if (code === 'no_key') toast('Poznávání fotek zatím není zapnuté. Doplň knihu ručně.');
    else if (code === 'not_recognized') toast('Na fotce se nepodařilo přečíst název. Zkus ostřejší fotku, nebo knihu doplň ručně.');
    else if (code === 'limit') toast(deepErrorText('limit'));
    else toast('Rozpoznání selhalo. Doplň knihu ručně.');
    return openEditor({ title: '' }, true, blob);
  }
  // What is printed on the cover is the truth for this edition; catalogues only add details.
  const fromPhoto = { title: data.title, author: data.author, isbn: data.isbn, year: data.year };
  let found = [];
  if (data.isbn) {
    ld.set('Hledám knihu podle ISBN…');
    const b = await lookupIsbn(data.isbn, () => ld.set(DEEP_MSG));
    if (b) { ld.close(); return openEditor({ ...b, title: data.title || b.title, author: data.author || b.author }, true, blob); }
  }
  const q = [data.title, data.author].filter(Boolean).join(' ');
  ld.set(`Na fotce je „${data.title}“. Hledám vydání…`);
  try { found = await searchBooks(q); } catch (e) {}
  const nt = normT(data.title);
  found = found.filter((b) => normT(b.title).includes(nt.slice(0, 12)) || nt.includes(normT(b.title).slice(0, 12)));
  if (!found.length) { ld.set(DEEP_MSG); found = (await deepSearch({ q })).results; }
  ld.close();
  if (!found.length) return openEditor(fromPhoto, true, blob);
  pickEdition(found, fromPhoto, blob);
}
// After a photo: let the user choose which edition they have, or keep just what was read from the photo.
function pickEdition(items, fromPhoto, blob) {
  const { el, close } = sheet(`${head('Které vydání máš?')}
    <p class="sub" style="margin-bottom:12px">Na fotce: <b>${esc(fromPhoto.title)}</b>${fromPhoto.author ? ' · ' + esc(fromPhoto.author) : ''}</p>
    ${resultRows(items)}
    <button class="btn" id="justphoto" style="margin-top:12px">Žádné z nich, jen podle fotky</button>`);
  el.querySelectorAll('[data-i]').forEach((r) => (r.onclick = () => { close(); openEditor({ ...items[+r.dataset.i] }, true, blob); }));
  el.querySelector('#justphoto').onclick = () => { close(); openEditor(fromPhoto, true, blob); };
}
/* ---------- Adding: whole shelf ---------- */
async function recognizeShelf(file) {
  const ld = loadingSheet('Čtu hřbety knih na fotce… (může to trvat až půl minuty)');
  let blob;
  try { blob = await resizeImage(file, 2000); } catch (e) { ld.close(); return toast('Fotku se nepodařilo načíst.'); }
  const image = await blobToB64(blob);
  const { data, error } = await sb.functions.invoke('recognize-shelf', { body: { image, mediaType: 'image/jpeg' } });
  ld.close();
  if (error) {
    let code = '';
    try { code = (await error.context.json()).error; } catch (e) {}
    if (code === 'not_recognized') return toast('Na fotce se nepodařilo přečíst žádný hřbet. Zkus to blíž a při lepším světle.');
    if (code === 'limit' || code === 'no_key') return toast(deepErrorText(code));
    return toast('Rozpoznání poličky selhalo. Zkus to znovu.');
  }
  openShelfReview(data.books || [], data.unreadable || 0);
}

function openShelfReview(found, unreadable) {
  const owned = new Set(S.books.filter((b) => b.list === 'library').map((b) => normT(b.title)));
  const rows = found.map((b) => ({ title: b.title, author: b.author || '', low: b.confidence === 'low', dup: owned.has(normT(b.title)) }));
  rows.forEach((r) => (r.on = !r.dup));
  let status = 'unread';
  const { el, close } = sheet(`${head('Knihy z poličky')}
    <p class="sub" id="sh-sum"></p>
    ${unreadable ? `<p class="hint">Dalších ${unreadable} ${plural(unreadable, 'hřbet', 'hřbety', 'hřbetů')} se přečíst nepodařilo. Přidej je pak ručně, nebo je vyfoť zblízka.</p>` : ''}
    <p class="hint">Zkontroluj názvy, oprav, co nesedí, a odškrtni, co přidat nechceš.</p>
    <div class="list" id="sh-list" style="margin-top:12px"></div>
    <button class="btn ghost" id="sh-add" style="margin-top:8px">+ Přidat knihu ručně</button>
    <label class="f">Stav pro všechny</label><div class="seg" id="sh-st">${Object.entries(STATUS).map(([k, l]) => `<button type="button" data-k="${k}" class="${k === status ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div class="err" id="sh-err"></div>
    <button class="btn primary" id="sh-save" style="margin-top:8px"></button>`);
  const list = el.querySelector('#sh-list');
  const sync = () => {
    const n = rows.filter((r) => r.on && r.title.trim()).length;
    el.querySelector('#sh-save').textContent = n ? `Přidat do knihovny (${n})` : 'Vyber aspoň jednu knihu';
    el.querySelector('#sh-sum').textContent = `Našli jsme ${rows.length} ${plural(rows.length, 'knihu', 'knihy', 'knih')}.`;
  };
  const draw = () => {
    list.innerHTML = rows.map((r, i) => `<div class="li shelf-row ${r.on ? '' : 'off'}" data-r="${i}">
      <input type="checkbox" ${r.on ? 'checked' : ''} aria-label="Přidat">
      <div class="grow"><input class="inp sm" data-f="title" value="${esc(r.title)}" placeholder="Název" maxlength="300">
        <input class="inp sm" data-f="author" value="${esc(r.author)}" placeholder="Autor" maxlength="300">
        ${r.low ? '<span class="pill wine">Nejisté, zkontroluj</span> ' : ''}${r.dup ? '<span class="pill">Už ji máš</span>' : ''}</div></div>`).join('')
      || '<p class="sub" style="padding:12px 14px">Žádné knihy. Přidej je ručně.</p>';
    list.querySelectorAll('.shelf-row').forEach((row) => {
      const r = rows[+row.dataset.r];
      row.querySelector('input[type=checkbox]').onchange = (e) => { r.on = e.target.checked; row.classList.toggle('off', !r.on); sync(); };
      row.querySelectorAll('input[data-f]').forEach((inp) => (inp.oninput = () => { r[inp.dataset.f] = inp.value; sync(); }));
    });
    sync();
  };
  draw();
  el.querySelector('#sh-add').onclick = () => { rows.push({ title: '', author: '', on: true }); draw(); const ins = list.querySelectorAll('input[data-f=title]'); ins[ins.length - 1].focus(); };
  el.querySelectorAll('#sh-st button').forEach((b) => (b.onclick = () => { status = b.dataset.k; el.querySelectorAll('#sh-st button').forEach((x) => x.classList.toggle('on', x === b)); }));
  el.querySelector('#sh-save').onclick = async () => {
    const pick = rows.filter((r) => r.on && r.title.trim());
    const err = el.querySelector('#sh-err');
    if (!pick.length) return (err.textContent = 'Vyber aspoň jednu knihu.');
    err.textContent = '';
    const btn = el.querySelector('#sh-save'); btn.disabled = true;
    // Fill in ISBN, year and cover from free catalogues; keep title/author as printed on the spine.
    let done = 0;
    const out = new Array(pick.length);
    const work = pick.map((r, i) => async () => {
      const title = r.title.trim(), author = r.author.trim() || null;
      let m = null;
      try {
        const res = await searchBooks([title, author].filter(Boolean).join(' '));
        const nt = normT(title), na = normT(author || '');
        m = res.find((b) => (normT(b.title).startsWith(nt.slice(0, 10)) || nt.startsWith(normT(b.title).slice(0, 10))) && (!na || normT(b.author).includes(na.slice(-6))));
      } catch (e) {}
      const fullAuthor = m?.author && author && m.author.length > author.length && normT(m.author).includes(normT(author)) ? m.author : author;
      out[i] = { list: 'library', status, title, author: fullAuthor || m?.author || null, isbn: m?.isbn || null, year: m?.year || null, cover_url: safeUrl(m?.cover_url) || null };
      btn.textContent = `Doplňuji údaje… ${++done}/${pick.length}`;
    });
    const queue = [...work];
    await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await queue.shift()(); }));
    btn.textContent = 'Ukládám…';
    const { data: saved, error } = await sb.from('books').insert(out).select();
    if (error) { btn.disabled = false; sync(); return (err.textContent = 'Nepodařilo se uložit. Zkus to znovu.'); }
    await loadBooks(); close();
    toast(`Přidáno ${pick.length} ${plural(pick.length, 'kniha', 'knihy', 'knih')}`);
    S.view = 'library'; render();
    if (saved?.length) enrichMany(saved);
  };
}

async function uploadCover(blob) {
  const path = `${me()}/${crypto.randomUUID()}.jpg`;
  const { error } = await sb.storage.from('covers').upload(path, blob, { contentType: 'image/jpeg' });
  if (error) return null;
  return sb.storage.from('covers').getPublicUrl(path).data.publicUrl;
}

/* ---------- Adding: search ---------- */
function openSearch() {
  const { el, close } = sheet(`${head('Najít knihu')}
    <form id="sf" novalidate><div class="row"><input class="inp" id="sq" placeholder="Název nebo autor" autofocus><button class="mini primary" style="padding:10px 14px">Hledat</button></div><div class="err" id="sferr"></div></form>
    <p class="hint">Funguje česky, anglicky i francouzsky. Nevadí překlep ani neúplný název.</p>
    <div id="res" style="margin-top:12px"></div>
    <div class="stack" style="margin-top:12px"><button class="btn" id="deep" hidden>${I.search}Není tam? Hledat důkladně na internetu</button>
    <button class="btn ghost" id="manual">Zadat ručně</button></div>`);
  const $q = el.querySelector('#sq'), res = el.querySelector('#res'), deepBtn = el.querySelector('#deep'), manual = el.querySelector('#manual');
  let lastQ = '';
  const spin = (t) => (res.innerHTML = `<div class="empty" style="padding:20px"><div class="spin" style="margin:0 auto 10px;color:var(--green)"></div>${esc(t || '')}</div>`);
  const show = (items, note = '') => {
    res.innerHTML = (note ? `<p class="hint" style="margin:0 0 8px">${esc(note)}</p>` : '') + resultRows(items);
    res.querySelectorAll('[data-i]').forEach((r) => (r.onclick = () => { close(); openEditor(items[+r.dataset.i], true); }));
  };
  const setManual = (q) => (manual.textContent = q ? `Přidat ručně: „${q.length > 40 ? q.slice(0, 40) + '…' : q}“` : 'Zadat ručně');
  manual.onclick = () => { close(); openEditor({ title: lastQ }, true); };
  const runDeep = async () => {
    deepBtn.hidden = true; spin(DEEP_MSG);
    const d = await deepSearch({ q: lastQ });
    if (d.error) { res.innerHTML = `<p class="sub">${esc(deepErrorText(d.error))}</p>`; return; }
    if (!d.results.length) { res.innerHTML = `<p class="sub">Ani na internetu jsme ji nenašli. Přidej ji ručně, údaje stačí opsat z knihy.</p>`; return; }
    show(d.results, 'Nalezeno na internetu. Zkontroluj, že sedí vydání.');
  };
  deepBtn.onclick = runDeep;
  el.querySelector('#sf').onsubmit = async (e) => {
    e.preventDefault();
    const q = $q.value.trim();
    if (!q) return (el.querySelector('#sferr').textContent = 'Napiš název nebo autora.');
    el.querySelector('#sferr').textContent = '';
    lastQ = q; setManual(q); deepBtn.hidden = true; spin('Hledám v katalozích…');
    let items = [];
    try { items = await searchBooks(q); } catch (e) {}
    if (!items.length) return runDeep();
    show(items); deepBtn.hidden = false;
  };
}

/* ---------- Account ---------- */
function openAccount() {
  const { el, close } = sheet(`${head('Můj účet')}
    <div class="li" style="padding:0 0 16px"><div class="av">${esc(initials(S.profile.display_name))}</div><div class="grow"><b>${esc(S.profile.display_name)}</b><span>@${esc(S.profile.username)} · ${esc(S.session.user.email)}</span></div></div>
    <div class="stack"><button class="btn" id="exp">Stáhnout knihovnu jako CSV</button><button class="btn danger" id="lo">${I.logout}Odhlásit se</button></div>`);
  el.querySelector('#lo').onclick = async () => { close(); await sb.auth.signOut(); };
  el.querySelector('#exp').onclick = () => {
    const cols = ['title', 'author', 'isbn', 'year', 'list', 'status', 'rating', 'note'];
    const csv = [cols.join(';'), ...S.books.map((b) => cols.map((c) => `"${String(b[c] ?? '').replace(/"/g, '""')}"`).join(';'))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = 'tsundoku.csv'; a.click();
  };
}

/* ---------- Boot ---------- */
async function boot() {
  if (!S.session) return renderAuth();
  await loadProfile();
  if (!S.profile) return renderProfileSetup();
  await Promise.all([loadBooks(), loadFriends()]);
  let pritel = null;
  try { pritel = localStorage.getItem('tsundoku_pritel'); localStorage.removeItem('tsundoku_pritel'); } catch (e) {}
  if (pritel) {
    S.view = 'friends'; render();
    if (pritel !== S.profile.username) await addFriend(pritel);
    return;
  }
  render();
}
{
  const p = new URLSearchParams(location.search).get('pritel');
  if (p) { try { localStorage.setItem('tsundoku_pritel', p); } catch (e) {} history.replaceState(null, '', location.pathname); }
}
let booted = false;
sb.auth.onAuthStateChange((ev, session) => {
  const changedUser = (S.session?.user?.id || null) !== (session?.user?.id || null);
  S.session = session;
  if (!booted || changedUser) {
    booted = true;
    if (!session) { S.profile = null; S.books = []; S.friendships = []; S.friend = null; S.view = 'library'; }
    setTimeout(boot, 0);
  }
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
