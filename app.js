const SUPABASE_URL = 'https://ukwoxnidopkcpcimhcrc.supabase.co';
// Google Books key: free (1000 requests/day), restricted to the app's web address and Books API only.
const GBOOKS_KEY = 'AIzaSyBMw_pc99KNGulZW7m3Yg-LLSSWTeMd5yE';
const SUPABASE_KEY = 'sb_publishable_AimfClf0MBCRxMpgUeJD8w_RCiLqG1v';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const $app = document.getElementById('app');
const $sheet = document.getElementById('sheet-root');

const S = {
  session: null, profile: null, books: [], friendships: [], profilesById: {},
  view: 'library',
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
  tablet: ic('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6M9 11h6M9 15h3"/>'),
  headphones: ic('<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="5" height="7" rx="2"/><rect x="16" y="14" width="5" height="7" rx="2"/>'),
  image: ic('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/>'),
  grid: ic('<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>'),
  list: ic('<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>'),
  sliders: ic('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
  chart: ic('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  dice: ic('<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/>'),
  plus: ic('<path d="M12 5v14M5 12h14"/>'),
  user: ic('<circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>'),
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initials = (n) => (n || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const avHtml = (p, cls = '') => (p && /^https:\/\//.test(p.avatar_url || '') ? `<div class="av img ${cls}"><img src="${esc(p.avatar_url)}" alt=""></div>` : `<div class="av ${cls}">${esc(initials(p?.display_name))}</div>`);
const starsTxt = (r) => (r ? '★'.repeat(r) + '☆'.repeat(5 - r) : '');
const COVER_COLORS = ['#2F4A3A', '#8C3B2E', '#C9A24A', '#5C6B73', '#A6705A', '#3E5C76', '#6B5B4B'];
const coverColor = (t) => COVER_COLORS[[...(t || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % COVER_COLORS.length];
const STATUS = { unread: 'Nepřečteno', reading: 'Čtu', read: 'Přečteno', paused: 'Odloženo' };
// Book language (of the edition she owns).
const LANGS = [['cs', 'Česky'], ['en', 'Anglicky'], ['fr', 'Francouzsky'], ['de', 'Německy'], ['sk', 'Slovensky'], ['es', 'Španělsky'], ['it', 'Italsky']];
const LANG_NAME = Object.fromEntries(LANGS.map(([k, l]) => [k, l.toLowerCase()]));
// Rough guess from the title when no catalogue tells us (Czech diacritics, French / English small words).
function guessLang(title) {
  const t = ` ${(title || '').toLowerCase()} `;
  if (/[ěščřžůťďňĚŠČŘŽŮ]/.test(t)) return 'cs';
  if (/[àâçèêëîïôœùûÿ]/.test(t) || /\s(le|la|les|des|du|une|et|pour|dans|sur|je|que|vous|nous|avec|mon|ma)\s/.test(t) || /\s(l|d|t|qu|j|n|c)'/.test(t)) return 'fr';
  if (/\s(the|and|of|to|in|with|for|is|you|my|your|a)\s/.test(t) || /'s\s/.test(t)) return 'en';
  return 'cs';
}
const TSUNDOKU_DEF = 'Japonské slovo pro knihy, které si pořídíš a pak je necháš ležet na hromádce nepřečtené. Vzniklo spojením „tsunde oku“ (nechat ležet na hromádce) a „doku“ (číst).';
function openAbout() {
  sheet(`${head('')}<div class="about"><div class="about-jp">積ん読</div><h2>Tsundoku</h2><p class="sub">[cundoku] · japonsky</p>
    <p class="desc" style="margin-top:12px">${TSUNDOKU_DEF}</p>
    <p class="hint" style="margin-top:14px">Tahle aplikace je pro všechny tvoje hromádky. Ty přečtené, rozečtené i ty, co na tebe teprve čekají.</p></div>`);
}
const STATUS_AUDIO = { unread: 'Neposlechnuto', reading: 'Poslouchám', read: 'Poslechnuto', paused: 'Odloženo' };
const isAudio = (b) => b.format === 'audio';
const isEbook = (b) => b.format === 'ebook';
// [key, plural label, singular label, short label]
const FORMATS = [['book', 'Knihy', 'Kniha', 'Knihy'], ['ebook', 'E-knihy', 'E-kniha', 'E-knihy'], ['audio', 'Audioknihy', 'Audiokniha', 'Audio']];
const fmtIcon = (k) => (k === 'audio' ? I.headphones : k === 'ebook' ? I.tablet : I.books);
const fmtOne = (k) => (FORMATS.find((f) => f[0] === k) || FORMATS[0])[2];
const SOURCES = { audio: ['Audiolibrix', 'Storytel', 'Audible', 'Spotify', 'Palmknihy', 'Kanopy', 'CD', 'Knihovna'], ebook: ['Kindle', 'Palmknihy', 'Kosmas', 'Google Play Knihy', 'Apple Books', 'Kobo', 'PocketBook', 'eReading', 'PDF', 'Knihovna'] };
const statusMap = (audio) => (audio ? STATUS_AUDIO : STATUS);
const statusLabel = (b) => statusMap(isAudio(b))[b.status];
const safeUrl = (u) => (/^https:\/\//.test(u || '') ? u : '');

function coverHtml(b) {
  const url = safeUrl(b.cover_url);
  const fmt = isAudio(b) || isEbook(b) ? `<span class="fmt" title="${fmtOne(b.format)}">${fmtIcon(b.format)}</span>` : '';
  if (url) return `<div class="cover has-img"><img src="${esc(url)}" alt="" loading="lazy" onerror="this.parentNode.classList.remove('has-img');this.parentNode.style.background='${coverColor(b.title)}';this.replaceWith(document.createTextNode(${esc(JSON.stringify(b.title || ''))}))">${fmt}</div>`;
  return `<div class="cover" style="background:${coverColor(b.title)}">${esc(b.title)}${fmt}</div>`;
}

function dbkUrl(b) {
  if (/^https:\/\/(www\.)?databazeknih\.cz\//.test(b.dbk_url || '')) return b.dbk_url;
  return 'https://www.databazeknih.cz/search?q=' + encodeURIComponent([b.title, b.author].filter(Boolean).join(' '));
}
// Goodreads. Best: a direct book page (gr_url, found via Open Library's Goodreads IDs). Fallback: a search
// for the ORIGINAL title + author (Czech ISBNs and titles are mostly unknown to Goodreads).
// Surname for catalogue searches; Czech feminine endings dropped (Flynnová → Flynn).
const grSurname = (a) => surnameOf(a).replace(/ov[áa]$/i, '');
const isCzIsbn = (i) => /^(97[89])?80/.test(i || '');
function goodreadsUrl(b) {
  if (/^https:\/\/www\.goodreads\.com\/book\/show\/\d/.test(b.gr_url || '')) return b.gr_url;
  const orig = b.original_title && normT(b.original_title) !== normT(b.title) ? b.original_title : null;
  if (!orig && b.isbn && !isCzIsbn(b.isbn)) return 'https://www.goodreads.com/book/isbn/' + b.isbn;
  const q = orig ? [orig, grSurname(b.author)] : [b.title, grSurname(b.author)];
  return 'https://www.goodreads.com/search?search_type=books&q=' + encodeURIComponent(q.filter(Boolean).join(' '));
}
async function resolveGoodreads(b) {
  const tries = [];
  const orig = b.original_title && normT(b.original_title) !== normT(b.title) ? b.original_title : null;
  if (b.isbn) tries.push({ url: `https://openlibrary.org/search.json?isbn=${b.isbn}&fields=title,author_name,id_goodreads&limit=3`, title: null });
  if (orig) tries.push({ url: `https://openlibrary.org/search.json?fields=title,author_name,id_goodreads&limit=8&title=${encodeURIComponent(orig)}&author=${encodeURIComponent(grSurname(b.author))}`, title: orig });
  tries.push({ url: `https://openlibrary.org/search.json?fields=title,author_name,id_goodreads&limit=8&title=${encodeURIComponent(b.title)}&author=${encodeURIComponent(grSurname(b.author))}`, title: b.title });
  const sn = normT(grSurname(b.author)).slice(0, 5);
  for (const t of tries) {
    try {
      const r = await fetch(t.url); if (!r.ok) continue;
      const docs = (await r.json()).docs || [];
      const nt = t.title ? normT(t.title) : null;
      const d = docs.find((d) => d.id_goodreads?.length
        && (!nt || normT(d.title).startsWith(nt.slice(0, 12)) || nt.startsWith(normT(d.title).slice(0, 12)))
        && (!sn || (d.author_name || []).some((a) => normT(a).includes(sn))));
      if (d) return 'https://www.goodreads.com/book/show/' + d.id_goodreads[0];
    } catch (e) {}
  }
  return null;
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
async function loadFavs() {
  const { data } = await sb.from('profile_favs').select('favs').eq('user_id', S.session.user.id).maybeSingle();
  S.favs = data?.favs || {};
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
    const { data: ps } = await sb.from('profiles').select('id,username,display_name,avatar_url').in('id', ids);
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
// Remember answers for the session, so enrichment does not ask the same catalogue twice.
// Empty answers are not kept (they may be a network hiccup).
function remember(fn, keep = (v) => v && (!Array.isArray(v) || v.length)) {
  const m = new Map();
  return (k) => {
    if (m.has(k)) return m.get(k);
    const p = fn(k).then((v) => { if (!keep(v)) m.delete(k); return v; }, (e) => { m.delete(k); throw e; });
    m.set(k, p); if (m.size > 300) m.delete(m.keys().next().value);
    return p;
  };
}
const imgExists = remember((url) => new Promise((res) => {
  if (!url) return res(false);
  const i = new Image(); const t = setTimeout(() => res(false), 8000);
  i.onload = () => { clearTimeout(t); res(i.naturalWidth > 10); }; i.onerror = () => { clearTimeout(t); res(false); }; i.src = url;
}), () => true);
async function findCover(isbn, title, author) {
  if (isbn) {
    const hit = await lookupIsbnCatalogs(isbn);
    if (hit?.cover_url && await imgExists(hit.cover_url)) return hit.cover_url;
    const u = olCover(isbn); if (u !== hit?.cover_url && await imgExists(u)) return u;
  }
  try {
    const hits = await searchBooks([title, author].filter(Boolean).join(' '));
    const nt = normT(title);
    const m = hits.find((h) => h.cover_url && (isbn ? h.isbn === isbn : normT(h.title).startsWith(nt.slice(0, 10))));
    if (m && await imgExists(m.cover_url)) return m.cover_url;
  } catch (e) {}
  return null;
}
// Fallback for translations: the cover of the original (usually English) edition.
async function findOriginalCover(originalTitle, author) {
  if (!originalTitle) return null;
  const last = grSurname(author);
  const surname = normT(last).slice(0, 5);
  try {
    const hits = await searchBooks([originalTitle, last].filter(Boolean).join(' '));
    const nt = normT(originalTitle);
    for (const h of hits) {
      if (!h.cover_url) continue;
      const ht = normT(h.title);
      if (!(ht.startsWith(nt.slice(0, 12)) || nt.startsWith(ht.slice(0, 12)))) continue;
      if (surname && !normT(h.author).includes(surname)) continue;
      if (await imgExists(h.cover_url)) return h.cover_url;
    }
  } catch (e) {}
  return null;
}
// Fills only what is missing; never overwrites what the user typed. Returns 'ok' or an error code.
// Catalogues often list translators/narrators as extra authors and AI may add notes in brackets.
// Take only the first clean name, and only use it to complete a missing or shortened name (Flynn → Gillian Flynn).
function cleanAuthor(a) {
  if (!a) return null;
  const first = a.replace(/\([^)]*\)?/g, ' ').split(/\s*[,;/]\s*/)[0].replace(/\s+/g, ' ').trim();
  return first || null;
}
function betterAuthor(current, candidate) {
  const c = cleanAuthor(candidate);
  if (!c) return null;
  if (!current) return c;
  if (c.length > current.length && normT(c).includes(normT(current)) && !/[(;]/.test(current)) return c;
  return null;
}
// Free step: Google Books / Open Library fill year, ISBN, publisher and cover without any AI cost.
async function catalogMatch(b) {
  if (b.isbn) return lookupIsbnCatalogs(b.isbn);
  const hits = await searchBooks([b.title, b.author].filter(Boolean).join(' '));
  const nt = normT(b.title), na = normT((b.author || '').split(/[ ,]+/).pop());
  return hits.find((h) => (normT(h.title).startsWith(nt.slice(0, 12)) || nt.startsWith(normT(h.title).slice(0, 12))) && (!na || normT(h.author).includes(na))) || null;
}
async function enrichBook(b) {
  try {
    const m = await catalogMatch(b);
    if (m) {
      const up0 = {};
      if (!b.isbn && m.isbn) up0.isbn = m.isbn;
      if (!b.year && m.year) up0.year = m.year;
      if (!b.publisher && m.publisher) up0.publisher = m.publisher;
      { const na = betterAuthor(b.author, m.author); if (na) up0.author = na; }
      if (!safeUrl(b.cover_url) && m.cover_url && await imgExists(m.cover_url)) up0.cover_url = m.cover_url;
      if (Object.keys(up0).length) { const { error } = await sb.from('books').update(up0).eq('id', b.id); if (!error) Object.assign(b, up0); }
    }
  } catch (e) {}
  const { data, error } = await sb.functions.invoke('enrich-book', { body: { title: b.title, author: b.author, isbn: b.isbn, year: b.year } });
  let code = null;
  if (error) { try { code = (await error.context.json()).error; } catch (e) {} code = code || 'failed'; }
  const r = data || {};
  const up = { enriched_at: new Date().toISOString() };
  if (!error) {
    { const na = betterAuthor(up.author || b.author, r.author); if (na) up.author = na; }
    if (!b.year && r.year) up.year = r.year;
    if (!b.isbn && r.isbn) up.isbn = r.isbn;
    if (!b.publisher && r.publisher) up.publisher = r.publisher;
    if (!b.original_title && r.original_title && normT(r.original_title) !== normT(b.title)) up.original_title = r.original_title;
    if (!b.description && r.description) up.description = r.description;
    if (!b.dbk_url && r.dbk_url) up.dbk_url = r.dbk_url;
    if (!b.gr_url && r.goodreads_url) up.gr_url = r.goodreads_url;
  }
  if (!safeUrl(b.cover_url)) {
    const c = await findCover(up.isbn || b.isbn, b.title, up.author || b.author);
    if (c) { up.cover_url = c; up.cover_is_original = false; }
    else {
      const o = await findOriginalCover(up.original_title || b.original_title, up.author || b.author);
      if (o) { up.cover_url = o; up.cover_is_original = true; }
    }
  }
  if (!b.gr_url && !up.gr_url && !b.gr_checked_at) { try { const g = await resolveGoodreads({ ...b, ...up }); if (g) up.gr_url = g; up.gr_checked_at = new Date().toISOString(); } catch (e) {} }
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
  const ids = new Set(todo.map((b) => b.id));
  await tagMany(S.books.filter((b) => ids.has(b.id) && !b.tagged_at));
  findSeries(S.books.filter((b) => ids.has(b.id) && !b.series_checked_at && !b.series_name));
}

/* ---------- Genres (tags) ---------- */
const GENRES = ['Román', 'Detektivka', 'Thriller', 'Krimi', 'Fantasy', 'Sci-fi', 'Dystopie', 'Horor', 'Romantika', 'Historický', 'Válečný', 'Dobrodružný', 'Psychologický', 'Společenský', 'Humor', 'Magický realismus', 'Klasika', 'Povídky', 'Poezie', 'Drama', 'Young adult', 'Pro děti', 'Komiks', 'Literatura faktu', 'Životopis', 'Paměti', 'Filozofie', 'Cestopis', 'Kuchařka', 'Seberozvoj', 'Odborná', 'Česká literatura', 'LGBT+'];
const tagState = { running: false };
// AI assigns genres in batches of 25 (no web search, so it costs almost nothing).
async function tagMany(books) {
  const todo = books.filter((b) => b && !b.tagged_at);
  if (!todo.length || tagState.running) return;
  tagState.running = true; render();
  let bar = document.getElementById('enrich-bar');
  if (!bar) { bar = document.createElement('div'); bar.id = 'enrich-bar'; document.body.appendChild(bar); }
  let done = 0, stop = null;
  for (let i = 0; i < todo.length && !stop; i += 25) {
    const batch = todo.slice(i, i + 25);
    bar.innerHTML = `<div class="spin"></div>Přiřazuji žánry… ${done}/${todo.length}`;
    const { data, error } = await sb.functions.invoke('tag-books', { body: { books: batch.map((b) => ({ id: b.id, title: b.title, author: b.author, original_title: b.original_title, description: b.description })) } });
    if (error) { let c = ''; try { c = (await error.context.json()).error; } catch (e) {} stop = c || 'failed'; break; }
    const now = new Date().toISOString();
    await Promise.all(batch.map(async (b) => {
      const ai = data.tags?.[b.id] || [];
      const tags = [...new Set([...(b.tags || []), ...ai])].slice(0, 12);
      const { error: e2 } = await sb.from('books').update({ tags, tagged_at: now }).eq('id', b.id);
      if (!e2) { b.tags = tags; b.tagged_at = now; }
    }));
    done += batch.length;
  }
  bar.remove(); tagState.running = false;
  toast(stop ? (stop === 'limit' || stop === 'no_key' ? deepErrorText(stop) : 'Přiřazení žánrů se nepovedlo. Zkus to znovu.') : 'Žánry jsou přiřazené');
  if (!$sheet.innerHTML) render();
}

const lookupIsbnCatalogs = remember(async (isbn) => {
  try {
    const r = await fetch(`https://www.googleapis.com/books/v1/volumes?key=${GBOOKS_KEY}&q=isbn:` + isbn);
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
});
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
  return { title: v.title + (v.subtitle ? ': ' + v.subtitle : ''), author: v.authors?.join(', ') || null, isbn: is, year: parseInt(v.publishedDate) || null, cover_url: cover, publisher: v.publisher || null, language: /^[a-z]{2}$/.test(v.language || '') ? v.language : null };
}
async function searchGoogle(q) {
  const r = await fetch(`https://www.googleapis.com/books/v1/volumes?key=${GBOOKS_KEY}&maxResults=10&q=` + encodeURIComponent(q));
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
const searchBooks = remember(async (q) => {
  const [g, o] = await Promise.allSettled([searchGoogle(q), searchOpenLibrary(q)]);
  const all = [...(g.value || []), ...(o.value || [])];
  const seen = new Set();
  return all.filter((b) => {
    if (!b.title) return false;
    const k = b.isbn || normT(b.title) + '|' + normT(b.author);
    if (seen.has(k)) return false; seen.add(k); return true;
  }).slice(0, 12);
});

/* ---------- Auth ---------- */
function renderForgot(msg = '', ok = false) {
  $app.innerHTML = `<div class="auth">
    <h1>Tsundoku</h1>
    <p class="sub">Zapomenuté heslo? Pošleme ti e-mailem odkaz, přes který si nastavíš nové.</p>
    <form id="fgf" class="card" novalidate>
      <label class="f" for="fem">E-mail, se kterým se přihlašuješ</label>
      <input class="inp" id="fem" type="email" autocomplete="email" placeholder="jmeno@email.cz" value="${esc(S.authEmail || '')}" required>
      <div class="err" id="ferr2" ${ok ? 'style="color:var(--green)"' : ''}>${esc(msg)}</div>
      <button class="btn primary" type="submit">Poslat odkaz</button>
    </form>
    <p class="hint" style="text-align:center;margin-top:16px"><button class="link" id="fback">Zpět na přihlášení</button></p>
  </div>`;
  document.getElementById('fback').onclick = () => { S.authMode = 'login'; renderAuth(); };
  document.getElementById('fgf').onsubmit = async (e) => {
    e.preventDefault();
    const em = document.getElementById('fem').value.trim(), err = document.getElementById('ferr2');
    if (!/^\S+@\S+\.\S+$/.test(em)) return (err.textContent = 'Zadej platný e-mail.');
    S.authEmail = em;
    const btn = e.target.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Posílám…';
    const { error } = await sb.auth.resetPasswordForEmail(em, { redirectTo: location.origin + location.pathname });
    btn.disabled = false; btn.textContent = 'Poslat odkaz';
    if (error) { err.style.color = ''; return (err.textContent = (error.status === 429 || /rate limit|security purposes/i.test(error.message || '')) ? 'Odkaz už odešel před chvílí. Počkej pár minut a zkus to znovu (koukni i do spamu).' : 'Odkaz se nepodařilo poslat. Zkus to znovu.'); }
    renderForgot('Hotovo. Jestli k tomuhle e-mailu existuje účet, přišel ti odkaz (koukni i do spamu). Otevři ho a nastav si nové heslo.', true);
  };
}
function renderAuth(msg = '') {
  if (S.authMode === 'forgot') return renderForgot(msg);
  const signup = S.authMode === 'signup';
  $app.innerHTML = `<div class="auth">
    <h1>Tsundoku</h1>
    <p class="about-line">積ん読 · kupovat knihy a nechat je ležet na hromádce nepřečtené</p>
    <p class="sub">Tvoje domácí knihovna, hodnocení a wishlist. Sdílej je s přáteli.</p>
    <form id="authf" class="card" novalidate>
      <label class="f" for="em">E-mail</label>
      <input class="inp" id="em" type="email" autocomplete="email" placeholder="jmeno@email.cz" required>
      <label class="f" for="pw">Heslo</label>
      <input class="inp" id="pw" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="${signup ? 'Aspoň 8 znaků' : ''}" required>
      <div class="err" id="aerr">${esc(msg)}</div>
      <button class="btn primary" type="submit">${signup ? 'Vytvořit účet' : 'Přihlásit se'}</button>
      ${signup ? '' : '<p style="text-align:center;margin-top:12px"><button type="button" class="link" id="forgot">Zapomněla jsi heslo?</button></p>'}
    </form>
    <p class="hint" style="text-align:center;margin-top:16px">${signup ? 'Už máš účet?' : 'Ještě nemáš účet?'}
      <button class="link" id="sw">${signup ? 'Přihlas se' : 'Zaregistruj se'}</button></p>
  </div>`;
  document.getElementById('sw').onclick = () => { S.authMode = signup ? 'login' : 'signup'; renderAuth(); };
  const fg = document.getElementById('forgot'); if (fg) fg.onclick = () => { S.authEmail = document.getElementById('em').value.trim(); S.authMode = 'forgot'; renderAuth(); };
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
      if (error) err.innerHTML = esc(authErr(error)) + (/invalid login/i.test(error.message || '') ? ' <button type="button" class="link" id="forgot2">Nepamatuješ si ho?</button>' : '');
      const f2 = document.getElementById('forgot2'); if (f2) f2.onclick = () => { S.authEmail = em; S.authMode = 'forgot'; renderAuth(); };
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
  const n = incoming().length + incomingLoans().length;
  const b = (v, icon, label) => `<button class="${S.view === v || (v === 'library' && ['year', 'profile'].includes(S.view)) ? 'on' : ''}" data-v="${v}">${icon}${label}${v === 'friends' && n ? `<span class="badge">${n}</span>` : ''}</button>`;
  return `<nav class="nav"><div class="nav-in">${b('library', I.books, 'Knihovna')}${b('wishlist', I.heart, 'Wishlist')}${b('add', I.scan, 'Přidat')}${b('friends', I.users, 'Přátelé')}</div></nav>`;
}
function render() {
  stopScanner();
  let body = '';
  if (S.view === 'library') body = viewLibrary();
  else if (S.view === 'year') body = viewYear();
  else if (S.view === 'wishlist') body = viewWishlist();
  else if (S.view === 'add') body = viewAdd();
  else if (S.view === 'friends') body = S.friend ? viewFriend() : viewFriends();
  else if (S.view === 'profile') body = viewProfile();
  if (S.sel && S.sel.key !== S.view) S.sel = null;
  $app.innerHTML = `<div class="wrap${S.sel ? ' selecting' : ''}">${body}</div>${S.sel ? selBarHtml() : ''}${nav()}`;
  $app.querySelectorAll('.nav button').forEach((b) => (b.onclick = () => {
    const v = b.dataset.v;
    // Knihovna (and Wishlist) always go "home": no search, no filters.
    if (v === 'library') UI.library = { q: '', filter: 'all', genres: [], gAll: false, format: 'all', lang: '' };
    if (v === 'wishlist') UI.wishlist = { q: '', filter: 'all', genres: [], gAll: false, format: 'all', lang: '' };
    S.view = v; S.friend = null; if (v === 'add') S.defaultList = 'library';
    render(); window.scrollTo(0, 0);
  }));
  bindView();
  if (S.sel) bindSelBar();
  syncHistory();
}

/* ---------- Back button: every screen and sheet is a step in the browser history ---------- */
const navState = () => ({ v: S.view, f: S.view === 'friends' ? S.friend?.id || null : null, t: S.friendTab || 'library', y: S.statYear || null });
const sameNav = (a, b) => !!a && !!b && a.v === b.v && (a.f || null) === (b.f || null) && (!a.f || a.t === b.t) && (a.v !== 'year' || a.y === b.y);
let ignorePop = 0, backTimer = null, sheetCur = null, sheetStack = [], pendingClose = null;
function syncHistory() {
  const st = navState(), h = history.state;
  if (h && h.d != null && h.sheet) {
    // The screen changed from inside a sheet (e.g. tapping a genre): reuse the sheet's history entry.
    if (!sameNav(h, st)) {
      history.replaceState({ ...st, d: h.d, sheet: sheetCur ? 1 : 0 }, '');
      if (!sheetCur) { clearTimeout(backTimer); sheetStack = []; pendingClose = null; }
    }
    return;
  }
  if (!h || h.d == null) return history.replaceState({ ...st, d: 0 }, '');
  if (!sameNav(h, st)) history.pushState({ ...st, d: h.d + 1 }, '');
}
// In-app "‹" buttons behave like the phone's back button when there is somewhere to go back to.
const goBack = (fallback) => ((history.state?.d || 0) > 0 ? history.back() : fallback());
async function restoreNav(st) {
  st = st || { v: 'library' };
  S.view = st.v || 'library';
  if (st.y) S.statYear = st.y;
  if (S.view === 'friends' && st.f && S.profilesById[st.f]) {
    if (S.friend?.id !== st.f) return openFriend(st.f, st.t);
    S.friendTab = st.t || 'library';
  } else S.friend = null;
  render(); window.scrollTo(0, 0);
}
window.addEventListener('popstate', (e) => {
  if (ignorePop > 0) { ignorePop--; return; }
  if (sheetCur) {
    const prev = sheetStack.pop();
    sheetCur.finish();
    if (prev) return prev();
    if (!sameNav(e.state, navState())) restoreNav(e.state);
    return;
  }
  if (e.state?.sheet) history.replaceState({ ...e.state, sheet: 0 }, '');
  restoreNav(e.state);
});

/* ---------- Select several books and change them at once ---------- */
// Exactly the books the list shows right now (search, filters).
const shownBooks = (key) => { const u = UI[key]; return applyUI(listSource(key).filter((b) => u.q || !u.format || u.format === 'all' || (b.format || 'book') === u.format), key); };
function selBarHtml() {
  const n = S.sel.ids.size, shown = shownBooks(S.sel.key), all = shown.length && shown.every((b) => S.sel.ids.has(b.id));
  return `<div class="selbar"><div class="selbar-in"><b>${n ? `Vybráno ${n}` : 'Klepni na knihy'}</b>
    <button class="mini" id="sel-all">${all ? 'Nic' : `Vše (${shown.length})`}</button><button class="mini" id="sel-x">Zrušit</button>
    <button class="mini primary" id="sel-go" ${n ? '' : 'disabled'}>Upravit</button></div></div>`;
}
function bindSelBar() {
  document.getElementById('sel-x').onclick = () => { S.sel = null; render(); };
  document.getElementById('sel-all').onclick = () => {
    const shown = shownBooks(S.sel.key), all = shown.every((b) => S.sel.ids.has(b.id));
    shown.forEach((b) => (all ? S.sel.ids.delete(b.id) : S.sel.ids.add(b.id)));
    render();
  };
  document.getElementById('sel-go').onclick = openBulk;
}
function toggleSel(id, key) {
  S.sel.ids.has(id) ? S.sel.ids.delete(id) : S.sel.ids.add(id);
  const y = window.scrollY; render(); window.scrollTo(0, y);
}
function openBulk() {
  const ids = [...S.sel.ids], key = S.sel.key;
  const books = S.books.filter((b) => S.sel.ids.has(b.id));
  if (!books.length) return toast('Nejdřív vyber knihy.');
  const n = books.length, word = plural(n, 'knihu', 'knihy', 'knih');
  const opt = (v, l) => `<option value="${esc(v)}">${esc(l)}</option>`;
  const allTags = [...new Set([...GENRES, ...S.books.flatMap((b) => b.tags || [])])].sort(cmpCs);
  const haveTags = [...new Set(books.flatMap((b) => b.tags || []))].sort(cmpCs);
  const { el, close } = sheet(`${head(`Upravit ${n} ${word}`)}
    <p class="sub">Změní se jen to, co nastavíš. „Neměnit“ nechá u každé knihy, co má.</p>
    <label class="f" for="bk-lang">Jazyk</label><select class="sel inp" id="bk-lang">${opt('', 'Neměnit')}${LANGS.map(([k, l]) => opt(k, l)).join('')}</select>
    <label class="f" for="bk-fmt">Formát</label><select class="sel inp" id="bk-fmt">${opt('', 'Neměnit')}${FORMATS.map(([k, , l]) => opt(k, l)).join('')}</select>
    ${key === 'library' ? `<label class="f" for="bk-st">Stav</label><select class="sel inp" id="bk-st">${opt('', 'Neměnit')}${Object.entries(STATUS).map(([k, l]) => opt(k, l)).join('')}</select>` : ''}
    <label class="f" for="bk-mv">Přesunout</label><select class="sel inp" id="bk-mv">${opt('', 'Neměnit')}${key === 'library' ? opt('wishlist', 'Do wishlistu') : opt('library', 'Mám je, do knihovny')}</select>
    <label class="f" for="bk-ta">Přidat žánr</label><input class="inp" id="bk-ta" list="bk-tl" maxlength="40" placeholder="Např. Fantasy"><datalist id="bk-tl">${allTags.map((t) => `<option value="${esc(t)}">`).join('')}</datalist>
    ${haveTags.length ? `<label class="f" for="bk-tr">Odebrat žánr</label><select class="sel inp" id="bk-tr">${opt('', 'Neodebírat')}${haveTags.map((t) => opt(t, t)).join('')}</select>` : ''}
    <div class="err" id="bk-err"></div>
    <div class="stack" style="margin-top:14px"><button class="btn primary" id="bk-go">Uložit u ${n} ${word}</button>
      <button class="btn danger" id="bk-del">Smazat vybrané (${n})</button></div>`);
  const val = (id) => (el.querySelector(id)?.value || '').trim();
  el.querySelector('#bk-go').onclick = async () => {
    const lang = val('#bk-lang'), fmt = val('#bk-fmt'), st = val('#bk-st'), mv = val('#bk-mv');
    let add = val('#bk-ta').replace(/\s+/g, ' '); const rem = val('#bk-tr');
    if (add) add = allTags.find((t) => normT(t) === normT(add)) || add.charAt(0).toUpperCase() + add.slice(1);
    const up = {};
    if (lang) up.language = lang;
    if (fmt) { up.format = fmt; if (fmt !== 'audio') up.narrator = null; if (fmt === 'book') up.audio_source = null; }
    if (st) up.status = st;
    if (mv === 'wishlist') Object.assign(up, { list: 'wishlist', status: 'unread', rating: null, loan_type: null, loan_person: null });
    if (mv === 'library') Object.assign(up, { list: 'library', wish_top: false });
    if (!Object.keys(up).length && !add && !rem) return (el.querySelector('#bk-err').textContent = 'Nic jsi nezměnila.');
    const btn = el.querySelector('#bk-go'); btn.disabled = true; btn.textContent = 'Ukládám…';
    let failed = false;
    if (Object.keys(up).length) { const { error } = await sb.from('books').update(up).in('id', ids); if (error) failed = true; }
    if (!failed && (add || rem)) {
      const now = new Date().toISOString();
      const todo = books.map((b) => {
        let t = (b.tags || []).filter((x) => x !== rem);
        if (add && !t.some((x) => normT(x) === normT(add))) t = [...t, add].slice(0, 12);
        return t.join('|') === (b.tags || []).join('|') ? null : { id: b.id, tags: t };
      }).filter(Boolean);
      for (let i = 0; i < todo.length && !failed; i += 10) {
        const res = await Promise.all(todo.slice(i, i + 10).map((x) => sb.from('books').update({ tags: x.tags, tagged_at: now }).eq('id', x.id)));
        if (res.some((r) => r.error)) failed = true;
      }
    }
    await loadBooks();
    close();
    if (failed) { btn.disabled = false; return toast('Některé změny se nepodařilo uložit. Zkus to znovu.'); }
    S.sel = null; render(); toast(`Upraveno: ${n} ${plural(n, 'kniha', 'knihy', 'knih')}`);
  };
  el.querySelector('#bk-del').onclick = async () => {
    if (!confirm(`Opravdu smazat ${n} ${word}? Nejde to vrátit.`)) return;
    const { error } = await sb.from('books').delete().in('id', ids);
    if (error) return toast('Nepodařilo se smazat.');
    books.forEach((b) => removeOwnCover(b.cover_url));
    await loadBooks(); close(); S.sel = null; render(); toast(`Smazáno: ${n} ${plural(n, 'kniha', 'knihy', 'knih')}`);
  };
}

/* ---------- Book lists: search, filters, sorting, grid/list ---------- */
const PREFS_KEY = 'tsundoku_prefs';
const prefs = (() => { try { return { layout: 'grid', sort: 'added', ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }; } catch (e) { return { layout: 'grid', sort: 'added' }; } })();
const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) {} };
// Per-screen state: search text, status filter, genre.
const UI = { library: { q: '', filter: 'all', genres: [], gAll: false, format: 'all', lang: '' }, wishlist: { q: '', filter: 'all', genres: [], gAll: false, format: 'all', lang: '' }, friend: { q: '', filter: 'all', genres: [], gAll: false, format: 'all', lang: '' } };
const filtersFor = (audio) => [['all', 'Vše'], ['read', audio ? 'Poslechnuto' : 'Přečteno'], ['reading', audio ? 'Poslouchám' : 'Čtu'], ['unread', audio ? 'Neposlechnuto' : 'Nepřečteno'], ['paused', 'Odloženo'], ['loaned', 'Půjčené'], ['notowned', 'Nemám doma']];
const SORTS = [['added', 'Nejnovější'], ['title', 'Název A–Z'], ['author', 'Autor A–Z']];
// Surname of the FIRST author, ignoring notes in brackets, co-authors, translators and "& kol.".
function surnameOf(a) {
  let first = (a || '').replace(/\([^)]*\)?/g, ' ').split(/\s*(?:[,;/&]|\s(?:and|a|und|et)\s)\s*/i)[0] || '';
  const words = first.replace(/[.\s]+$/, '').trim().split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w) && !/^(kol|ed|editor)\.?$/i.test(w));
  return (words.pop() || '').replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, '');
}
const cmpCs = (a, b) => (a || '').localeCompare(b || '', 'cs', { sensitivity: 'base' });
function sortBooks(list, sort) {
  const l = [...list];
  if (sort === 'title') l.sort((a, b) => cmpCs(a.title, b.title));
  else if (sort === 'author') l.sort((a, b) => cmpCs(surnameOf(a.author), surnameOf(b.author)) || cmpCs(a.author, b.author) || cmpCs(a.title, b.title));
  else l.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  return l;
}
const matchQ = (b, q) => {
  if (!q) return true;
  const hay = normT([b.title, b.author, b.original_title, b.isbn, b.loan_person, b.narrator, b.audio_source, LANG_NAME[b.language], ...(b.tags || [])].join(' '));
  return q.split(/\s+/).filter(Boolean).every((w) => hay.includes(normT(w)));
};
function applyUI(books, key) {
  const u = UI[key];
  const res = sortBooks(books.filter((b) => {
    if (!u.q && u.format && u.format !== 'all' && (b.format || 'book') !== u.format) return false;
    if (u.filter === 'loaned') { if (!b.loan_type || b.loan_type === 'returned') return false; }
    else if (u.filter === 'notowned') { if (b.loan_type !== 'returned') return false; }
    else {
      if (u.filter !== 'all' && b.status !== u.filter) return false;
      // Books she only borrowed and gave back are not on her shelf: shown only when searching or with "Nemám doma".
      if (!u.q && b.loan_type === 'returned') return false;
    }
    if (u.genres.length) {
      const t = b.tags || [];
      if (!(u.gAll ? u.genres.every((g) => t.includes(g)) : u.genres.some((g) => t.includes(g)))) return false;
    }
    if (u.lang && (b.language || 'cs') !== u.lang) return false;
    return matchQ(b, u.q);
  }), prefs.sort);
  // Wishlist: "Nejvíc chci" first (sort is stable, so the chosen order stays within both groups).
  if (key === 'wishlist' || (key === 'friend' && S.friendTab === 'wishlist')) res.sort((a, b) => (b.wish_top ? 1 : 0) - (a.wish_top ? 1 : 0));
  return res;
}
const loanText = (b) => (b.loan_type === 'lent' ? `Půjčeno${b.loan_person ? ': ' + b.loan_person : ''}` : b.loan_type === 'borrowed' ? `Vypůjčeno${b.loan_person ? ' od: ' + b.loan_person : ''}` : b.loan_type === 'returned' ? `Nemám doma${b.loan_person ? ' · půjčila ' + b.loan_person : ''}` : '');
function booksHtml(list, own = true) {
  const sel = own && S.sel;
  const selCls = (b) => (sel ? ` selectable${S.sel.ids.has(b.id) ? ' picked' : ''}` : '');
  const tick = sel ? '<span class="selbox" aria-hidden="true">✓</span>' : '';
  if (prefs.layout === 'list') {
    const swipeable = (b) => own && !sel && b.list === 'library';
    // Always offer just "reading" and "read"; the current one is ticked ("read" again lets her change the rating).
    const acts = (b) => ['reading', 'read'].map((k) => `<button type="button" class="sw-btn st-${k}${b.status === k ? ' cur' : ''}" data-setst="${k}" data-bid="${b.id}">${b.status === k ? '✓ ' : ''}${statusMap(isAudio(b))[k]}</button>`).join('');
    return `<div class="list blist">${list.map((b) => `${swipeable(b) ? `<div class="swipe" data-sid="${b.id}"><div class="sw-actions">${acts(b)}</div>` : ''}<button class="book brow${selCls(b)}" data-id="${b.id}" data-own="${own ? 1 : 0}">
      ${tick}<div class="thumb">${coverHtml(b)}</div>
      <div class="grow"><b>${esc(b.title)}</b><span>${esc([b.author, b.year].filter(Boolean).join(' · '))}</span>
        <div class="meta">${b.rating ? `<span class="stars">${starsTxt(b.rating)}</span>` : ''}${b.language && b.language !== 'cs' ? `<span class="lang">${b.language.toUpperCase()}</span>` : ''}
          ${b.list === 'library' ? `<span class="pill sm st-${b.status}">${statusLabel(b)}</span>` : ''}
          ${b.list === 'wishlist' && b.wish_top ? '<span class="pill sm gold">★ Nejvíc chci</span>' : ''}${b.loan_type ? `<span class="pill sm wine">${esc(loanText(b))}</span>` : ''}${b._res ? `<span class="pill sm wine">${b._res === 'me' ? 'Zamluvila jsi' : 'Zamluveno'}</span>` : ''}
          ${(b.tags || []).slice(0, 1).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div></div></button>${swipeable(b) ? '</div>' : ''}`).join('')}</div>
      ${list.some(swipeable) && !hintSeen() ? '<p class="hint" style="text-align:center">Tip: posuň knihu prstem doleva a rychle ji označíš jako Čtu nebo Přečteno.</p>' : ''}`;
  }
  return `<div class="grid">${list.map((b) => `<button class="book${selCls(b)}" data-id="${b.id}" data-own="${own ? 1 : 0}">
    ${tick}${coverHtml(b)}<div class="t">${b.language && b.language !== 'cs' ? `<span class="lang">${b.language.toUpperCase()}</span> ` : ''}${esc(b.title)}</div><div class="a">${esc(b.author || '')}</div>
    ${b.rating ? `<div class="stars">${starsTxt(b.rating)}</div>` : ''}
    ${b.list === 'wishlist' && b.wish_top ? '<div class="wtop">★ Nejvíc chci</div>' : ''}${b.loan_type ? `<div class="loan">${esc(loanText(b))}</div>` : ''}${b._res ? `<div class="loan">${b._res === 'me' ? 'Zamluvila jsi' : 'Zamluveno'}</div>` : ''}</button>`).join('')}</div>`;
}
// Search box with clear button + status chips + sort / genre / layout toolbar.
// Compact controls: search + "Filtry" button; only ACTIVE filters are shown as removable chips.
function activeChips(key) {
  const u = UI[key], out = [];
  if (u.format && u.format !== 'all') out.push(['format', fmtOne(u.format) === 'Kniha' ? 'Knihy' : FORMATS.find((f) => f[0] === u.format)[1]]);
  if (u.filter && u.filter !== 'all') out.push(['filter', (filtersFor(u.format === 'audio').find(([k]) => k === u.filter) || [, u.filter])[1]]);
  if (u.lang) out.push(['lang', LANGS.find(([k]) => k === u.lang)?.[1] || u.lang]);
  u.genres.forEach((g) => out.push(['genre:' + g, g]));
  return out;
}
function controlsHtml(key, booksAll, { placeholder = 'Hledat' } = {}) {
  const u = UI[key];
  const act = activeChips(key);
  return `<div class="searchrow"><div class="searchbox"><span class="sico">${I.search}</span>
      <input class="search" data-q="${key}" type="text" inputmode="search" enterkeyhint="search" placeholder="${esc(placeholder)}" value="${esc(u.q)}" autocomplete="off">
      <button class="sclear" data-clear="${key}" aria-label="Smazat hledání" ${u.q ? '' : 'hidden'}>${I.x}</button></div>
      <button class="filter-btn ${act.length ? 'on' : ''}" data-filters="${key}" aria-label="Filtry a řazení">${I.sliders}${act.length ? `<span class="badge-n">${act.length}</span>` : ''}</button></div>
    ${act.length ? `<div class="chips act">${act.map(([k, l]) => `<button class="chip sm on" data-unset="${k}" data-uk="${key}">${esc(l)} <span aria-hidden="true">×</span></button>`).join('')}</div>` : ''}
    <div id="results-${key}"></div>`;
}
function openFilters(key) {
  const u = UI[key];
  const booksAll = listSource(key);
  const { el, close } = sheet(`${head('Filtry a řazení')}<div id="flt"></div>
    <button class="btn primary" id="fdone" style="margin-top:16px">Hotovo</button>`, null, () => openFilters(key));
  const box = el.querySelector('#flt');
  let gOpen = false; // genres stay folded until tapped
  const draw = () => {
    const nF = { book: 0, ebook: 0, audio: 0 };
    booksAll.forEach((b) => (nF[b.format || 'book'] = (nF[b.format || 'book'] || 0) + 1));
    const inFmt = u.format === 'all' ? booksAll : booksAll.filter((b) => (b.format || 'book') === u.format);
    const counts = {}; inFmt.forEach((b) => (b.tags || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
    const genres = Object.keys(counts).sort(cmpCs);
    u.genres = u.genres.filter((g) => counts[g]);
    const lc = {}; inFmt.forEach((b) => { const l = b.language || 'cs'; lc[l] = (lc[l] || 0) + 1; });
    const langs = LANGS.filter(([k]) => lc[k]);
    const showFmt = key === 'library' || nF.audio || nF.ebook;
    const chip = (attr, val, label, on, n) => `<button class="chip ${on ? 'on' : ''}" ${attr}="${val}">${label}${n != null ? ` <span class="n">${n}</span>` : ''}</button>`;
    box.innerHTML = `
      ${showFmt ? `<label class="f">Formát</label><div class="chips">${chip('data-xf', 'all', 'Vše', u.format === 'all', booksAll.length)}${FORMATS.map(([k, pl]) => chip('data-xf', k, pl, u.format === k, nF[k])).join('')}</div>` : ''}
      ${key === 'library' ? `<label class="f">Stav</label><div class="chips">${filtersFor(u.format === 'audio').map(([k, l]) => chip('data-xs', k, l, u.filter === k)).join('')}</div>` : ''}
      ${langs.length > 1 ? `<label class="f">Jazyk</label><div class="chips">${chip('data-xl', '', 'Všechny', !u.lang)}${langs.map(([k, l]) => chip('data-xl', k, l, u.lang === k, lc[k])).join('')}</div>` : ''}
      ${genres.length ? `<button type="button" class="fold ${gOpen ? 'open' : ''}" id="xgt"><span>Žánry</span><span class="fold-v">${u.genres.length ? esc(u.genres.join(', ')) : 'všechny'}</span></button>
        ${gOpen ? `<p class="hint" style="margin:6px 0 8px">Můžeš vybrat víc žánrů.</p><div class="chips">${chip('data-xg', '', 'Všechny', !u.genres.length)}${genres.map((g) => chip('data-xg', esc(g), esc(g), u.genres.includes(g), counts[g])).join('')}</div>
        ${u.genres.length > 1 ? `<div class="seg" style="margin-top:2px">${[[false, 'Aspoň jeden z nich'], [true, 'Všechny najednou']].map(([v, l]) => `<button type="button" data-xga="${v ? 1 : 0}" class="${!!u.gAll === v ? 'on' : ''}">${l}</button>`).join('')}</div>` : ''}` : ''}` : ''}
      <label class="f">Řazení</label><div class="chips">${SORTS.map(([k, l]) => chip('data-xo', k, l, prefs.sort === k)).join('')}</div>
      <label class="f">Zobrazení</label><div class="seg">${[['grid', 'Obálky', I.grid], ['list', 'Seznam', I.list]].map(([k, l, i]) => `<button type="button" data-xv="${k}" class="${prefs.layout === k ? 'on' : ''}">${i} ${l}</button>`).join('')}</div>
      ${key !== 'friend' ? `<button class="btn" id="xsel" style="margin-top:16px">${I.list}Vybrat víc knih a upravit je najednou</button>` : ''}
      ${key === 'library' && S.books.some((b) => b.series_name) ? `<button class="btn" id="xser" style="margin-top:16px">${I.books}Série</button>` : ''}
      ${activeChips(key).length ? `<button class="btn ghost" id="xreset" style="margin-top:10px">Zrušit všechny filtry</button>` : ''}`;
    const apply = () => { render(); draw(); };
    box.querySelectorAll('[data-xf]').forEach((b) => (b.onclick = () => { u.format = b.dataset.xf; u.filter = 'all'; apply(); }));
    box.querySelectorAll('[data-xs]').forEach((b) => (b.onclick = () => { u.filter = b.dataset.xs; apply(); }));
    box.querySelectorAll('[data-xl]').forEach((b) => (b.onclick = () => { u.lang = b.dataset.xl; apply(); }));
    box.querySelectorAll('[data-xg]').forEach((b) => (b.onclick = () => {
      const g = b.dataset.xg;
      u.genres = !g ? [] : u.genres.includes(g) ? u.genres.filter((x) => x !== g) : [...u.genres, g];
      apply();
    }));
    const xgt = box.querySelector('#xgt'); if (xgt) xgt.onclick = () => { gOpen = !gOpen; draw(); };
    box.querySelectorAll('[data-xga]').forEach((b) => (b.onclick = () => { u.gAll = b.dataset.xga === '1'; apply(); }));
    box.querySelectorAll('[data-xo]').forEach((b) => (b.onclick = () => { prefs.sort = b.dataset.xo; savePrefs(); apply(); }));
    box.querySelectorAll('[data-xv]').forEach((b) => (b.onclick = () => { prefs.layout = b.dataset.xv; savePrefs(); apply(); }));
    const xs = box.querySelector('#xser'); if (xs) xs.onclick = () => { close(); openSeriesList(); };
    const xsel = box.querySelector('#xsel'); if (xsel) xsel.onclick = () => { close(); S.sel = { key, ids: new Set() }; render(); };
    const xr = box.querySelector('#xreset'); if (xr) xr.onclick = () => { Object.assign(u, { filter: 'all', genres: [], gAll: false, lang: '', format: 'all' }); apply(); };
  };
  el.querySelector('#fdone').onclick = close;
  draw();
}
const listSource = (key) => key === 'library' ? S.books.filter((b) => b.list === 'library')
  : key === 'wishlist' ? S.books.filter((b) => b.list === 'wishlist')
  : S.friendBooks.filter((b) => b.list === S.friendTab);
function updateResults(key) {
  const box = document.getElementById('results-' + key);
  if (!box) return;
  const u = UI[key];
  const all = listSource(key).filter((b) => u.q || !u.format || u.format === 'all' || (b.format || 'book') === u.format)
    .filter((b) => u.q || u.filter === 'notowned' || b.loan_type !== 'returned');
  const list = applyUI(all, key);
  const filtered = list.length !== all.length;
  const across = u.q && u.format !== 'all' && listSource(key).some((b) => (b.format || 'book') !== u.format);
  box.innerHTML = (across ? `<p class="count">Hledám ve všem: v knihách, e-knihách i audioknihách</p>` : '')
    + (filtered && !across ? `<p class="count">${list.length} z ${all.length}</p>` : '')
    + (list.length ? booksHtml(list, key !== 'friend')
      : key === 'library' && (u.format === 'audio' || u.format === 'ebook') && !u.q && !listSource(key).some((b) => b.format === u.format)
        ? (u.format === 'audio'
          ? `<div class="empty"><h3>Zatím žádné audioknihy</h3><p>Přidej první. Stačí název, nebo screenshot z aplikace, kde posloucháš. Ze screenshotu jich přidáš i víc najednou.</p><br><button class="btn primary" data-addfmt2="audio">${I.headphones}Přidat audioknihy</button></div>`
          : `<div class="empty"><h3>Zatím žádné e-knihy</h3><p>Přidej první. Stačí název, nebo screenshot knihovny z Kindlu či jiné čtečky. Ze screenshotu jich přidáš i víc najednou.</p><br><button class="btn primary" data-addfmt2="ebook">${I.tablet}Přidat e-knihy</button></div>`)
        : `<div class="empty">Nic tu neodpovídá hledání ani filtru.</div>`);
  const aa = box.querySelector('[data-addfmt2]'); if (aa) aa.onclick = () => { S.defaultFormat = aa.dataset.addfmt2; S.defaultList = 'library'; S.view = 'add'; render(); window.scrollTo(0, 0); };
  box.querySelectorAll('.book').forEach((b) => (b.onclick = () => {
    if (S.sel && b.dataset.own === '1') return toggleSel(b.dataset.id, key);
    if (b.dataset.swiped) { delete b.dataset.swiped; return; }
    if (closeSwipes(box)) return;
    openBook(b.dataset.id, b.dataset.own === '1');
  }));
  bindSwipes(box, key);
  const off = box.querySelector('[data-genre-off]'); if (off) off.onclick = () => { u.genres = []; render(); };
}
function bindControls() {
  $app.querySelectorAll('[data-q]').forEach((inp) => {
    const key = inp.dataset.q, clr = $app.querySelector(`[data-clear="${key}"]`);
    inp.oninput = () => { UI[key].q = inp.value; clr.hidden = !inp.value; updateResults(key); };
    inp.onkeydown = (e) => { if (e.key === 'Enter') inp.blur(); };
    clr.onclick = () => { inp.value = ''; UI[key].q = ''; clr.hidden = true; updateResults(key); inp.focus(); };
  });
  $app.querySelectorAll('[data-filters]').forEach((b) => (b.onclick = () => openFilters(b.dataset.filters)));
  $app.querySelectorAll('[data-unset]').forEach((b) => (b.onclick = () => {
    const u = UI[b.dataset.uk], k = b.dataset.unset;
    if (k === 'format') u.format = 'all'; else if (k === 'filter') u.filter = 'all';
    else if (k.startsWith('genre:')) u.genres = u.genres.filter((g) => g !== k.slice(6));
    else u[k] = '';
    render();
  }));
  $app.querySelectorAll('[id^="results-"]').forEach((r) => updateResults(r.id.slice(8)));
}

/* ---------- Swipe in list view: quick status change, rating after "read" ---------- */
const hintSeen = () => { try { return localStorage.getItem('tsundoku_swipe_hint') === '1'; } catch (e) { return true; } };
function closeSwipes(root) {
  let any = false;
  root.querySelectorAll('.swipe.open').forEach((w) => { w.classList.remove('open'); w.querySelector('.brow').style.transform = ''; any = true; });
  return any;
}
function bindSwipes(box, key) {
  box.querySelectorAll('.swipe').forEach((w) => {
    const row = w.querySelector('.brow'), acts = w.querySelector('.sw-actions');
    let x0 = 0, y0 = 0, axis = null, base = 0, cur = 0, id = null;
    const width = () => acts.offsetWidth;
    row.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      id = e.pointerId; x0 = e.clientX; y0 = e.clientY; axis = null;
      base = w.classList.contains('open') ? -width() : 0; cur = base;
    });
    row.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      if (!axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (axis === 'x') { box.querySelectorAll('.swipe.open').forEach((o) => { if (o !== w) { o.classList.remove('open'); o.querySelector('.brow').style.transform = ''; } }); try { row.setPointerCapture(id); } catch (er) {} row.classList.add('dragging'); }
      }
      if (axis !== 'x') return;
      cur = Math.max(-width() - 24, Math.min(0, base + dx));
      row.style.transform = `translateX(${cur}px)`;
    });
    const end = (e) => {
      if (e.pointerId !== id) return;
      id = null; row.classList.remove('dragging');
      if (axis !== 'x') return;
      row.dataset.swiped = '1'; setTimeout(() => delete row.dataset.swiped, 350);
      const open = cur < -width() / 2.5;
      w.classList.toggle('open', open);
      row.style.transform = open ? `translateX(${-width()}px)` : '';
      if (open) { try { localStorage.setItem('tsundoku_swipe_hint', '1'); } catch (er) {} }
    };
    row.addEventListener('pointerup', end); row.addEventListener('pointercancel', end);
  });
  box.querySelectorAll('[data-setst]').forEach((btn) => (btn.onclick = (e) => {
    e.stopPropagation();
    const b = S.books.find((x) => x.id === btn.dataset.bid);
    if (b) setStatusQuick(b, btn.dataset.setst, key);
  }));
}
async function setStatusQuick(b, status, key) {
  if (b.status === status) { closeSwipes(document); if (status === 'read') askRating(b, key); return; }
  const prev = b.status;
  const up = { status };
  if (status === 'read' && !b.finished_at && b.finished_precision !== 'unknown') { up.finished_at = todayISO(); up.finished_precision = 'day'; }
  const before = { finished_at: b.finished_at, finished_precision: b.finished_precision };
  Object.assign(b, up); b.updated_at = new Date().toISOString();
  updateResults(key);
  const { error } = await sb.from('books').update(up).eq('id', b.id);
  if (error) { b.status = prev; Object.assign(b, before); updateResults(key); return toast('Nepodařilo se uložit. Zkus to znovu.'); }
  if (status === 'read') askRating(b, key);
  else toast(`${b.title}: ${statusLabel(b)}`);
}
function askRating(b, key) {
  let r = b.rating || 0;
  const { el, close } = sheet(`${head(isAudio(b) ? 'Poslechnuto! Jak se ti líbila?' : 'Přečteno! Jak se ti líbila?')}
    <div class="detail" style="align-items:center"><div class="rcv">${coverHtml(b)}</div><div><b>${esc(b.title)}</b><p class="sub">${esc(b.author || '')}</p></div></div>
    <div class="rate big" id="qr">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-n="${n}" class="${r >= n ? 'on' : ''}" aria-label="${n} z 5">★</button>`).join('')}</div>
    <div class="row qdate"><label for="qd">${isAudio(b) ? 'Poslechnuto' : 'Dočteno'}</label><input class="inp" type="date" id="qd" max="${todayISO()}" value="${b.finished_precision === 'day' && b.finished_at ? b.finished_at : todayISO()}"></div>
    <div class="stack" style="margin-top:12px"><button class="btn primary" id="qrs">Uložit</button><button class="btn ghost" id="qrx">Teď ne</button></div>`);
  const draw = () => el.querySelectorAll('#qr button').forEach((x) => x.classList.toggle('on', r >= +x.dataset.n));
  el.querySelectorAll('#qr button').forEach((x) => (x.onclick = () => { r = +x.dataset.n; draw(); }));
  el.querySelector('#qrx').onclick = () => { close(); toast(`${b.title}: ${statusLabel(b)}`); };
  el.querySelector('#qrs').onclick = async () => {
    const qd = el.querySelector('#qd').value;
    const up = {};
    if (r) up.rating = r;
    if (/^\d{4}-\d{2}-\d{2}$/.test(qd) && (qd !== b.finished_at || b.finished_precision !== 'day')) { up.finished_at = qd; up.finished_precision = 'day'; }
    if (!Object.keys(up).length) return close();
    const { error } = await sb.from('books').update(up).eq('id', b.id);
    close();
    if (error) return toast('Nepodařilo se uložit.');
    Object.assign(b, up); if (key) updateResults(key); else render();
    toast(r ? `${b.title}: ${starsTxt(r)}` : 'Uloženo');
  };
}

function viewLibrary() {
  const lib = S.books.filter((b) => b.list === 'library');
  const home = lib.filter((b) => b.loan_type !== 'returned').length;
  const year = new Date().getFullYear();
  const readYear = readIn(year).length;
  const loaned = lib.filter((b) => b.loan_type).length;
  const nA = lib.filter(isAudio).length, nE = lib.filter(isEbook).length, nB = lib.length - nA - nE;
  const goal = S.goals?.[year];
  return `<div class="top"><div><button class="h1btn" id="about" aria-label="Co znamená tsundoku"><h1>Tsundoku</h1><span class="jp">積ん読</span></button>
      <p class="sub">${home} ${plural(home, 'kniha', 'knihy', 'knih')} · <button class="link-sub" id="yearcard">letos ${readYear}${goal ? ` z ${goal}` : ' dočteno'}</button></p></div>
    <div class="top-icons">${lib.length ? `<button class="icon-btn" id="pick" aria-label="Co číst dál?" title="Co číst dál?">${I.dice}</button><button class="icon-btn" id="yearbtn" aria-label="Čtenářský rok" title="Čtenářský rok">${I.chart}</button>` : ''}
      <button class="icon-btn me-btn" id="me" aria-label="Můj profil">${/^https:\/\//.test(S.profile.avatar_url || '') ? `<img src="${esc(S.profile.avatar_url)}" alt="">` : I.user}</button></div></div>
    ${loanBanner() || missingBanner() || tagBanner() || seriesBanner()}
    ${lib.length ? controlsHtml('library', lib, { placeholder: 'Hledat název, autora, žánr…' })
    : `<div class="empty"><h3>Začni plnit knihovnu</h3><p>Naskenuj čárový kód na zadní straně knihy nebo vyfoť obálku.</p><br><button class="btn primary" data-go="add">${I.scan}Přidat první knihu</button></div>`}`;
}
/* ---------- Loan reminders: a book away for 2+ months ---------- */
const LOAN_REMIND_DAYS = 60;
const daysSince = (iso) => Math.floor((Date.now() - new Date(iso + 'T00:00:00').getTime()) / 864e5);
function agoText(iso) {
  const d = daysSince(iso);
  if (d <= 0) return 'dnes';
  if (d === 1) return 'včera';
  if (d < 14) return `před ${d} dny`;
  if (d < 60) { const w = Math.round(d / 7); return w === 1 ? 'před týdnem' : `před ${w} týdny`; }
  const m = Math.round(d / 30.4); return m === 1 ? 'před měsícem' : `před ${m} měsíci`;
}
const addDays = (n) => { const t = new Date(); t.setDate(t.getDate() + n); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
const dueLoans = () => S.books.filter((b) => (b.loan_type === 'lent' || b.loan_type === 'borrowed') && b.loaned_at
  && daysSince(b.loaned_at) >= LOAN_REMIND_DAYS && (!b.loan_snooze_until || b.loan_snooze_until <= todayISO()));
function loanBanner() {
  const due = dueLoans();
  if (!due.length) return '';
  const b = due[0];
  const title = due.length === 1
    ? (b.loan_type === 'lent' ? `„${b.title}“ se ještě nevrátila` : `„${b.title}“ máš vypůjčenou už dlouho`)
    : `${due.length} ${plural(due.length, 'půjčená kniha', 'půjčené knihy', 'půjčených knih')} ${due.length < 5 ? 'čekají' : 'čeká'} na vrácení`;
  const sub = due.length === 1 ? `${loanText(b)} · ${agoText(b.loaned_at)}` : due.map((x) => `„${x.title}“`).slice(0, 3).join(', ') + (due.length > 3 ? ' a další' : '');
  return `<div class="card banner loanb"><div class="grow"><b>${esc(title)}</b><span>${esc(sub)}</span></div><button class="mini primary" id="loan-rem">Projít</button></div>`;
}
function openLoanReminders() {
  const { el, close } = sheet(`${head('Půjčené knihy')}<p class="sub" style="margin-bottom:10px">Tyhle knihy jsou pryč déle než 2 měsíce.</p><div class="list" id="lrl"></div>`);
  const draw = () => {
    const due = dueLoans();
    if (!due.length) { close(); render(); return toast('Hotovo, všechno projité'); }
    el.querySelector('#lrl').innerHTML = due.map((b) => `<div class="li lr"><div class="thumb" style="width:36px">${coverHtml(b)}</div><div class="grow"><b>${esc(b.title)}</b>
      <span>${esc(loanText(b))} · ${agoText(b.loaned_at)}</span>
      <div class="row" style="margin-top:6px;gap:6px"><button class="mini primary" data-back="${b.id}">${b.loan_type === 'lent' ? 'Vrátila mi ji' : 'Vrátila jsem ji'}</button>
      <button class="mini" data-snz="${b.id}">${b.loan_type === 'lent' ? 'Ještě ji má' : 'Ještě ji mám'}</button></div></div></div>`).join('');
    const act = async (id, up, msg) => {
      const b = S.books.find((x) => x.id === id);
      const { error } = await sb.from('books').update(up).eq('id', id);
      if (error) return toast('Nepodařilo se uložit.');
      Object.assign(b, up); toast(msg); draw();
    };
    el.querySelectorAll('[data-back]').forEach((x) => (x.onclick = () => {
      const b = S.books.find((y) => y.id === x.dataset.back);
      act(b.id, b.loan_type === 'lent' ? { loan_type: null, loan_person: null } : { loan_type: 'returned' }, b.loan_type === 'lent' ? 'Kniha je zase doma' : 'Zapsáno jako vrácená');
    }));
    el.querySelectorAll('[data-snz]').forEach((x) => (x.onclick = () => act(x.dataset.snz, { loan_snooze_until: addDays(30) }, 'Připomenu za měsíc')));
  };
  draw();
}
// Which books a banner is about: names for 1–2, otherwise a "Které?" link with the full list.
const WHICH = {};
function whichHtml(kind, books) {
  WHICH[kind] = books.map((b) => b.id);
  const q = (b) => `„${b.title}“`;
  if (books.length <= 2) return `<span class="which">${books.map((b) => `<button type="button" class="link-sub" data-wopen="${b.id}">${esc(q(b))}</button>`).join(', ')}</span>`;
  return `<span class="which">${esc(books.slice(0, 2).map(q).join(', '))} a další · <button type="button" class="link-sub" data-which="${kind}">Které?</button></span>`;
}
function openWhich(kind) {
  const titles = { enrich: 'Chybí děj a údaje', tags: 'Bez žánrů', series: 'Zatím bez hledání série', dates: 'Bez data dočtení', loans: 'Půjčené knihy' };
  const books = (WHICH[kind] || []).map((id) => S.books.find((b) => b.id === id)).filter(Boolean);
  const { el } = sheet(`${head(titles[kind] || 'Knihy')}<p class="sub" style="margin-bottom:10px">${books.length} ${plural(books.length, 'kniha', 'knihy', 'knih')}</p>
    <div class="list">${books.map((b) => `<button class="li book" data-wid="${b.id}" style="width:100%;text-align:left"><div class="thumb" style="width:36px">${coverHtml(b)}</div><div class="grow"><b>${esc(b.title)}</b><span>${esc(b.author || '')}</span></div></button>`).join('')}</div>`, null, () => openWhich(kind));
  el.querySelectorAll('[data-wid]').forEach((x) => (x.onclick = () => openBook(x.dataset.wid, true)));
}
function missingBanner() {
  const miss = S.books.filter((b) => !b.enriched_at && !enrichState.ids.has(b.id));
  if (!miss.length || enrichState.ids.size) return '';
  const kc = Math.max(1, Math.round(miss.length * 0.5));
  return `<div class="card banner"><div class="grow"><b>U ${miss.length} ${plural(miss.length, 'knihy', 'knih', 'knih')} chybí děj a údaje</b>
    ${whichHtml('enrich', miss)}<span>Rok, nakladatel, obálka a o čem kniha je. Asi ${kc} Kč celkem.</span></div><button class="mini primary" id="enr-all">Doplnit</button></div>`;
}
function tagBanner() {
  const miss = S.books.filter((b) => !b.tagged_at);
  if (!miss.length || tagState.running || enrichState.ids.size) return '';
  return `<div class="card banner"><div class="grow"><b>${miss.length} ${plural(miss.length, 'kniha nemá', 'knihy nemají', 'knih nemá')} žánry</b>
    ${whichHtml('tags', miss)}<span>Přiřadí je AI podle názvu, autora a děje. Za celou knihovnu méně než 1 Kč.</span></div><button class="mini primary" id="tag-all">Přiřadit</button></div>`;
}
function viewWishlist() {
  const w = S.books.filter((b) => b.list === 'wishlist');
  return `<div class="top"><div><h1>Wishlist</h1><p class="sub">Knihy, které chceš. Přátelé je uvidí, až budou vybírat dárek.</p></div>
    <button class="add-btn" data-go="add" data-list="wishlist" aria-label="Přidat do wishlistu">${I.plus}<span>Přidat</span></button></div>
    ${w.length ? controlsHtml('wishlist', w, { chips: false, placeholder: 'Hledat ve wishlistu' })
    : `<div class="empty"><h3>Zatím nic nechceš?</h3><p>Při přidávání knihy zvol „Wishlist“ místo „Knihovna“.</p><br><button class="btn primary" data-go="add" data-list="wishlist">${I.heart}Přidat do wishlistu</button></div>`}`;
}
function viewAdd() {
  const f = S.defaultFormat || 'book', audio = f === 'audio', ebook = f === 'ebook', digital = audio || ebook;
  const word = audio ? 'audioknih' : 'e-knih';
  return `<div class="top"><div><h1>${audio ? 'Přidat audioknihu' : ebook ? 'Přidat e-knihu' : 'Přidat knihu'}</h1><p class="sub">Údaje a obálku doplníme automaticky.</p></div></div>
  ${S.defaultList === 'wishlist' ? `<div class="card banner wl"><div class="grow"><b>${I.heart} Přidáváš do wishlistu</b><span>Všechno, co teď přidáš, se uloží do wishlistu.</span></div><button class="mini" id="to-lib">Do knihovny</button></div>` : ''}
  <div class="seg fmtseg" style="margin-bottom:14px">${FORMATS.map(([k, , one]) => `<button type="button" data-addfmt="${k}" class="${f === k ? 'on' : ''}">${fmtIcon(k)}${one}</button>`).join('')}</div>
  <div class="add-opts">
    ${digital ? `<button class="add-opt" id="o-list"><div class="ic">${fmtIcon(f)}</div><div><b>Víc ${word} ze screenshotu</b><span>${audio ? 'Screenshot knihovny z Audiolibrixu, Storytelu…' : 'Screenshot knihovny z Kindlu, Palmknih, Kosmasu…'} AI vypíše všechny, seznam pak zkontroluješ.</span></div></button>`
      : `<button class="add-opt" id="o-shelf"><div class="ic">${I.books}</div><div><b>Vyfotit celou poličku</b><span>Víc knih najednou podle hřbetů. Seznam pak zkontroluješ.</span></div></button>`}
    <button class="add-opt" id="o-search"><div class="ic">${I.search}</div><div><b>Najít podle názvu</b><span>Nebo zadat úplně ručně.</span></div></button>
    <button class="add-opt" id="o-photo"><div class="ic">${I.camera}</div><div><b>${digital ? 'Fotka nebo screenshot jedné obálky' : 'Vyfotit obálku'}</b><span>${digital ? 'Pozná ji AI.' : 'Pro knihy bez kódu. Pozná ji AI.'}</span></div></button>
    ${digital ? '' : `<button class="add-opt" id="o-scan"><div class="ic">${I.barcode}</div><div><b>Naskenovat čárový kód</b><span>Kód ISBN na zadní straně. Nejrychlejší.</span></div></button>`}
  </div>
  ${digital ? '' : `<button class="link-sub gal-link" id="o-gal">${I.image}Fotku obálky máš v galerii? Vyber ji odtud</button>`}
  <input type="file" id="photo-in" accept="image/*" ${digital ? '' : 'capture="environment"'} hidden>
  <input type="file" id="gal-in" accept="image/*" hidden>
  <input type="file" id="shelf-in" accept="image/*" hidden>
  ${digital ? '<p class="hint" style="margin-top:16px">Tip: na screenshotu ať jsou vidět názvy celé. Když je seznam dlouhý, udělej víc screenshotů a nahraj je postupně.</p>' : '<p class="hint" style="margin-top:16px">Tip pro poličku: foť zepředu, rovně a při dobrém světle, nejvýš jednu nebo dvě police najednou, aby byly hřbety čitelné.</p>'}`;
}
function viewFriends() {
  const inc = incoming();
  const out = S.friendships.filter((f) => f.status === 'pending' && f.requester_id === me());
  const fr = acceptedFriends();
  const row = (p, right) => `<div class="li">${avHtml(p)}<div class="grow"><b>${esc(p.display_name)}</b><span>@${esc(p.username)}</span></div>${right}</div>`;
  return `<div class="top"><div><h1>Přátelé</h1><p class="sub">Tvoje jméno: <b>@${esc(S.profile.username)}</b></p></div></div>
    <button class="btn wine" id="invite">${I.share}Pozvat kamarádku</button>
    <form id="addf" style="margin-top:14px" novalidate><label class="f" for="fu">Přidat podle uživatelského jména</label>
      <div class="row"><input class="inp" id="fu" placeholder="jana.knihomolka" autocapitalize="none"><button class="mini primary" type="submit" style="padding:10px 14px">Přidat</button></div>
      <div class="err" id="ferr"></div></form>
    ${inc.length ? `<h2>Žádosti o přátelství</h2><div class="list">${inc.map((f) => { const p = S.profilesById[f.requester_id]; return p ? row(p, `<button class="mini primary" data-acc="${f.id}">Přijmout</button><button class="mini" data-del="${f.id}" aria-label="Odmítnout">${'Ne'}</button>`) : ''; }).join('')}</div>` : ''}
    ${friendsExtraHtml()}
    <h2>Moji přátelé</h2>
    ${fr.length ? `<div class="list">${fr.map((p) => `<button class="li" style="width:100%;text-align:left" data-friend="${p.id}">${avHtml(p)}<div class="grow"><b>${esc(p.display_name)}</b><span>Zobrazit knihovnu a wishlist</span></div>${I.left.replace('<svg', '<svg style="width:18px;transform:rotate(180deg)"')}</button>`).join('')}</div>`
    : `<p class="sub">Zatím tu nikdo není. Pošli kamarádce pozvánku, nebo ji přidej podle jména.</p>`}
    ${out.length ? `<h2>Čeká na potvrzení</h2><div class="list">${out.map((f) => { const p = S.profilesById[f.addressee_id]; return p ? row(p, `<button class="mini" data-del="${f.id}">Zrušit</button>`) : ''; }).join('')}</div>` : ''}`;
}
function viewFriend() {
  const p = S.friend;
  S.friendBooks.forEach((b) => (b._res = S.friendRes?.[b.id] || null));
  const all = S.friendBooks.filter((b) => b.list === S.friendTab);
  const chip = (k, l) => `<button class="chip ${S.friendTab === k ? 'on' : ''}" data-ft="${k}">${l}</button>`;
  const nHome = S.friendBooks.filter((b) => b.list === 'library' && b.loan_type !== 'returned').length;
  const prof = S.friendTab === 'profile';
  return `<button class="back" id="back">${I.left}Přátelé</button>
    ${prof ? `<div class="prof-head">${avHtml(p, 'xl')}<h1>${esc(p.display_name)}</h1><p class="sub">@${esc(p.username)}</p>${statsHtml(S.friendBooks)}</div>`
      : `<div class="top"><div><h1>${esc(p.display_name)}</h1><p class="sub">@${esc(p.username)} · ${nHome} ${plural(nHome, 'kniha', 'knihy', 'knih')}</p></div><button class="prof-open" id="fprof" aria-label="Profil">${avHtml(p, 'lg')}</button></div>`}
    <div class="chips">${chip('profile', 'Profil')}${chip('library', 'Knihovna')}${chip('wishlist', 'Wishlist')}</div>
    ${prof ? (favsHtml(S.friendFavs || {}, S.friendBooks, false) || `<p class="sub" style="text-align:center">Oblíbené knihy tu zatím nejsou.</p>`) : all.length ? controlsHtml('friend', all, { chips: false, placeholder: 'Hledat' }) : `<div class="empty">${S.friendTab === 'wishlist' ? 'Wishlist je zatím prázdný.' : 'Knihovna je zatím prázdná.'}</div>`}`;
}
const plural = (n, a, b, c) => (n === 1 ? a : n >= 2 && n <= 4 ? b : c);

function bindView() {
  $app.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => { S.view = b.dataset.go; S.defaultList = b.dataset.list || 'library'; render(); }));
  $app.querySelectorAll('[data-ft]').forEach((b) => (b.onclick = () => { S.friendTab = b.dataset.ft; UI.friend.genres = []; render(); }));
  bindControls();
  if (S.view === 'year') bindYear();
  const goYear = () => { S.view = 'year'; S.statYear = new Date().getFullYear(); render(); window.scrollTo(0, 0); };
  const yc = document.getElementById('yearcard'); if (yc) yc.onclick = goYear;
  const yb = document.getElementById('yearbtn'); if (yb) yb.onclick = goYear;
  const pk = document.getElementById('pick'); if (pk) pk.onclick = openPick;
  const lr = document.getElementById('loan-rem'); if (lr) lr.onclick = openLoanReminders;
  $app.querySelectorAll('[data-which]').forEach((x) => (x.onclick = () => openWhich(x.dataset.which)));
  $app.querySelectorAll('[data-wopen]').forEach((x) => (x.onclick = () => openBook(x.dataset.wopen, true)));
  const sa = document.getElementById('ser-all'); if (sa) sa.onclick = () => findSeries(S.books.filter((b) => !b.series_checked_at && !b.series_name));
  const sl = document.getElementById('series-btn'); if (sl) sl.onclick = openSeriesList;
  const ta = document.getElementById('tag-all'); if (ta) ta.onclick = () => tagMany(S.books.filter((b) => !b.tagged_at));
  const meBtn = document.getElementById('me'); if (meBtn) meBtn.onclick = () => { S.view = 'profile'; render(); window.scrollTo(0, 0); };
  const ab = document.getElementById('about'); if (ab) ab.onclick = openAbout;
  const ea = document.getElementById('enr-all'); if (ea) ea.onclick = () => { enrichMany(S.books.filter((b) => !b.enriched_at)); render(); };
  const back = document.getElementById('back'); if (back) back.onclick = () => goBack(() => { S.friend = null; if (S.view !== 'friends') S.view = 'library'; render(); window.scrollTo(0, 0); });
  const fp = document.getElementById('fprof'); if (fp) fp.onclick = () => { S.friendTab = 'profile'; render(); window.scrollTo(0, 0); };
  $app.querySelectorAll('[data-favbook]').forEach((x) => (x.onclick = () => openBook(x.dataset.favbook, x.dataset.own === '1')));
  if (S.view === 'profile') bindProfile();

  if (S.view === 'add') {
    const tl = document.getElementById('to-lib'); if (tl) tl.onclick = () => { S.defaultList = 'library'; render(); };
    $app.querySelectorAll('[data-addfmt]').forEach((b) => (b.onclick = () => { S.defaultFormat = b.dataset.addfmt; render(); }));
    const osc = document.getElementById('o-scan'); if (osc) osc.onclick = openScanner;
    document.getElementById('o-search').onclick = () => openSearch();
    const pin = document.getElementById('photo-in');
    document.getElementById('o-photo').onclick = () => pin.click();
    const gin = document.getElementById('gal-in'), og = document.getElementById('o-gal');
    if (og) og.onclick = () => gin.click();
    gin.onchange = () => { if (gin.files[0]) recognizePhoto(gin.files[0]); gin.value = ''; };
    pin.onchange = () => { if (pin.files[0]) recognizePhoto(pin.files[0]); pin.value = ''; };
    const sin = document.getElementById('shelf-in');
    const osh = document.getElementById('o-shelf') || document.getElementById('o-list'); if (osh) osh.onclick = () => sin.click();
    sin.onchange = () => { if (sin.files[0]) recognizeShelf(sin.files[0], S.defaultFormat === 'audio' || S.defaultFormat === 'ebook' ? S.defaultFormat : 'shelf'); sin.value = ''; };
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
    bindFriendsExtra();
  }
}

/* ---------- Friends ---------- */
async function addFriend(username) {
  const err = document.getElementById('ferr');
  const un = username.trim().replace(/^@/, '').toLowerCase();
  if (!un) { if (err) err.textContent = 'Zadej uživatelské jméno.'; return; }
  if (un === S.profile.username) { if (err) err.textContent = 'To jsi ty.'; return; }
  const { data: p } = await sb.from('profiles').select('id,username,display_name,avatar_url').eq('username', un).maybeSingle();
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
async function openFriend(id, tab) {
  const { data } = await sb.from('books').select('*').eq('owner_id', id).order('created_at', { ascending: false });
  const { data: fv } = await sb.from('profile_favs').select('favs').eq('user_id', id).maybeSingle();
  S.friendFavs = fv?.favs || {};
  S.view = 'friends'; S.friend = S.profilesById[id]; S.friendBooks = data || []; await loadFriendReservations(); S.friendTab = tab || 'library'; UI.friend = { q: '', filter: 'all', genres: [], gAll: false, format: 'all', lang: '' }; render(); window.scrollTo(0, 0);
}

/* ---------- Sheets ---------- */
// reopen: how to show this sheet again, so the next sheet opened from it gets a "‹" back to it.
function sheet(html, onClose, reopen) {
  if (pendingClose) { if (pendingClose.reopen) sheetStack.push(pendingClose.reopen); pendingClose = null; clearTimeout(backTimer); }
  else if (sheetCur && sheetCur.reopen) sheetStack.push(sheetCur.reopen);
  if (!history.state?.sheet) history.pushState({ ...navState(), d: (history.state?.d || 0) + 1, sheet: 1 }, '');
  $sheet.innerHTML = `<div class="sheet-bg"><div class="sheet" role="dialog" aria-modal="true">${html}</div></div>`;
  const bg = $sheet.querySelector('.sheet-bg');
  const self = { reopen };
  self.finish = () => { if (sheetCur !== self) return; sheetCur = null; $sheet.innerHTML = ''; document.body.style.overflow = ''; onClose && onClose(); };
  sheetCur = self;
  const close = () => {
    if (sheetCur !== self) return;
    self.finish();
    pendingClose = { reopen };
    clearTimeout(backTimer);
    // If no other sheet opens right away, drop the sheet's history entry.
    backTimer = setTimeout(() => {
      pendingClose = null;
      if (sheetCur) return;
      sheetStack = [];
      if (history.state?.sheet) { ignorePop++; history.back(); }
    }, 350);
  };
  bg.onclick = (e) => { if (e.target === bg) close(); };
  $sheet.querySelectorAll('[data-close]').forEach((b) => (b.onclick = close));
  const hd = $sheet.querySelector('.sheet-head');
  if (hd && sheetStack.length) {
    hd.insertAdjacentHTML('afterbegin', `<button class="icon-btn sback" aria-label="Zpět">${I.left}</button>`);
    hd.querySelector('.sback').onclick = () => { const prev = sheetStack.pop(); self.finish(); prev && prev(); };
  }
  document.body.style.overflow = 'hidden';
  return { el: $sheet.querySelector('.sheet'), close };
}
const head = (t) => `<div class="sheet-head"><h2>${esc(t)}</h2><button class="icon-btn" data-close aria-label="Zavřít">${I.x}</button></div>`;

async function openBook(id, own) {
  const b = (own ? S.books : S.friendBooks).find((x) => x.id === id);
  if (!b) return;
  let friendsHave = [];
  if (own && acceptedFriends().length) {
    let q = sb.from('books').select('owner_id').neq('owner_id', me()).eq('list', 'library').or('loan_type.is.null,loan_type.neq.returned');
    q = b.isbn ? q.eq('isbn', b.isbn) : q.ilike('title', b.title);
    const { data } = await q; friendsHave = [...new Set((data || []).map((x) => x.owner_id))].map((i) => S.profilesById[i]).filter(Boolean);
  }
  const iHave = !own && S.books.some((x) => (b.isbn && x.isbn === b.isbn) || x.title.toLowerCase() === b.title.toLowerCase());
  const pending = own && enrichState.ids.has(b.id);
  const meta = [LANG_NAME[b.language || 'cs'], isAudio(b) && b.narrator && `čte ${b.narrator}`, (isAudio(b) || isEbook(b)) && b.audio_source, b.publisher, b.original_title && `orig. ${b.original_title}`].filter(Boolean).join(' · ');
  const { el, close } = sheet(`${head('')}
    <div class="detail"><div id="dcv">${own ? `<button type="button" class="cover-btn" id="dcvb" aria-label="Změnit obálku">${coverHtml(b)}<span class="cam-badge">${I.camera}</span></button>` : coverHtml(b)}${b.cover_is_original && safeUrl(b.cover_url) ? '<p class="cover-note">Obálka originálu</p>' : ''}</div><div><h2>${esc(b.title)}</h2><p class="sub">${esc([b.author, b.year].filter(Boolean).join(' · '))}</p>
      ${meta ? `<p class="sub" style="font-size:12px">${esc(meta)}</p>` : ''}
      ${b.rating ? `<div class="stars" style="font-size:18px">${starsTxt(b.rating)}</div>` : ''}
      <span class="pill ${b.list === 'wishlist' ? 'wine' : 'st-' + b.status}">${b.list === 'wishlist' ? 'Wishlist' : statusLabel(b)}</span>${b.list === 'wishlist' && b.wish_top ? '<span class="pill gold">★ Nejvíc chci</span>' : ''}${isAudio(b) || isEbook(b) ? `<span class="pill">${fmtOne(b.format)}</span>` : ''}
      ${b.loan_type ? `<span class="pill wine">${esc(loanText(b))}${b.loaned_at && b.loan_type !== 'returned' ? ' · ' + agoText(b.loaned_at) : ''}</span>` : ''}
      ${finishedText(b) ? `<p class="sub" style="font-size:12px;margin-top:4px">${esc(finishedText(b))}</p>` : ''}</div></div>
    ${own ? coverPickHtml('dcp', safeUrl(b.cover_url) ? 'Vyměnit obálku za vlastní fotku:' : 'Přidat obálku:') : ''}
    ${b.series_name ? `<button class="ser-line" id="serl">${I.books}<span>${esc(b.series_name)}${b.series_index ? ` · ${String(b.series_index).replace('.0', '').replace('.', ',')}. díl` : ''}</span></button>` : ''}
    ${(b.tags || []).length ? `<div class="tags-row">${b.tags.map((t) => `<button class="tag big" data-tag="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : ''}
    ${b.description ? `<label class="f">O čem to je</label><p class="desc">${esc(b.description)}</p>`
      : own ? `<div class="card" style="padding:10px 12px;margin-top:10px"><p class="sub" style="margin-bottom:8px">${pending ? 'Děj a údaje se právě dohledávají…' : 'Děj ani podrobnosti zatím nemáme.'}</p>
        ${pending ? '' : `<button class="mini primary" id="enr">Dohledat děj a údaje</button>`}</div>` : ''}
    ${b.note ? `<label class="f">${own ? 'Moje poznámka' : 'Poznámka'}</label><div class="card" style="padding:10px 12px;font-size:14px;white-space:pre-wrap">${esc(b.note)}</div>` : ''}
    <div class="stack" style="margin-top:16px">
      <div class="row"><a class="btn" id="gr" href="${esc(goodreadsUrl(b))}" target="_blank" rel="noopener">${I.ext}Goodreads</a>
        <a class="btn" href="${esc(dbkUrl(b))}" target="_blank" rel="noopener">${I.ext}Databáze knih</a></div>
      ${own ? `<button class="btn primary" id="ed">${I.edit}Upravit, hodnotit</button>
        ${b.list === 'wishlist' ? `<button class="btn ${b.wish_top ? 'gold' : ''}" id="wtop">${b.wish_top ? '★ Nejvíc chci · zrušit' : '☆ Označit: tuhle chci nejvíc'}</button>
        <button class="btn" id="mv">${I.books}Mám ji, přesunout do knihovny</button>` : ''}
        ${b.loan_type === 'borrowed' ? `<button class="btn" id="ret">Vrátila jsem ji (nemám ji doma)</button>` : ''}`
      : `${b.loan_type === 'returned' ? '' : friendBookActions(b)}${iHave ? `<p class="hint" style="text-align:center">Tuhle knihu už máš.</p>` : `<button class="btn wine" id="want">${I.heart}Chci ji taky (do wishlistu)</button>`}`}
    </div>
    ${friendsHave.length ? `<label class="f" style="margin-top:16px">Mají ji i přátelé</label><div class="friends-have">${friendsHave.map((p) => avHtml(p, 'sm')).join('')}</div>` : ''}`, null, () => openBook(id, own));
  el.querySelectorAll('[data-tag]').forEach((t) => (t.onclick = () => {
    close();
    const key = own ? (b.list === 'wishlist' ? 'wishlist' : 'library') : 'friend';
    UI[key] = { q: '', filter: 'all', genres: [t.dataset.tag], gAll: false, format: key === 'wishlist' ? 'all' : (b.format || 'book'), lang: '' };
    if (own) S.view = key; else S.friendTab = b.list;
    render(); window.scrollTo(0, 0);
  }));
  // Look for the exact Goodreads page only once; if it is not found, the search link stays.
  if (!b.gr_url && !b.gr_checked_at) resolveGoodreads(b).then(async (u) => {
    const up = { gr_checked_at: new Date().toISOString(), ...(u ? { gr_url: u } : {}) };
    if (u) { const a = el.querySelector('#gr'); if (a) a.href = u; }
    Object.assign(b, up);
    if (own) await sb.from('books').update(up).eq('id', b.id);
  }).catch(() => {});
  const serl = el.querySelector('#serl'); if (serl) serl.onclick = () => { if (own) { close(); openSeries(b.series_name); } };
  if (!own) bindFriendBookActions(el, b, close);
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
    const dcp = el.querySelector('#dcp');
    el.querySelector('#dcvb').onclick = () => { dcp.hidden = !dcp.hidden; };
    bindCoverPick(dcp, async (f) => {
      dcp.querySelector('.hint').textContent = 'Nahrávám fotku…';
      let url = null;
      try { url = await uploadCover(await resizeImage(f, 900)); } catch (e) {}
      if (!url) return toast('Fotku se nepodařilo nahrát.');
      const { error } = await sb.from('books').update({ cover_url: url, cover_is_original: false }).eq('id', b.id);
      if (error) return toast('Obálku se nepodařilo uložit.');
      removeOwnCover(b.cover_url);
      b.cover_url = url; b.cover_is_original = false; close(); render(); openBook(b.id, true); toast('Obálka uložena');
    });
    const mv = el.querySelector('#mv');
    const wt = el.querySelector('#wtop');
    if (wt) wt.onclick = async () => {
      const v = !b.wish_top;
      const { error } = await sb.from('books').update({ wish_top: v }).eq('id', b.id);
      if (error) return toast('Nepodařilo se uložit.');
      b.wish_top = v; close(); render(); toast(v ? 'Označeno: nejvíc chci. Je teď nahoře.' : 'Zrušeno');
    };
    const rt = el.querySelector('#ret');
    if (rt) rt.onclick = async () => {
      const { error } = await sb.from('books').update({ loan_type: 'returned' }).eq('id', b.id);
      if (error) return toast('Nepodařilo se uložit.');
      b.loan_type = 'returned'; close(); render();
      toast('Hotovo. V knihovně ji najdeš přes filtr Nemám doma, do statistik se počítá.');
    };
    if (mv) mv.onclick = async () => { await sb.from('books').update({ list: 'library', wish_top: false }).eq('id', b.id); await loadBooks(); close(); toast('Přesunuto do knihovny'); render(); };
  } else {
    const w = el.querySelector('#want');
    if (w) w.onclick = async () => {
      const { error } = await sb.from('books').insert({ list: 'wishlist', title: b.title, author: b.author, isbn: b.isbn, year: b.year, cover_url: b.cover_url,
        description: b.description, publisher: b.publisher, cover_is_original: !!b.cover_is_original, format: b.format || 'book', narrator: b.narrator, language: b.language, original_title: b.original_title, dbk_url: b.dbk_url, gr_url: b.gr_url, enriched_at: b.enriched_at });
      if (error) return toast('Nepodařilo se uložit.');
      await loadBooks(); close(); toast('Přidáno do tvého wishlistu');
    };
  }
}

// One line saying what is filled in under "Další údaje".
function moreSummary(d) {
  return [d.format !== 'book' && fmtOne(d.format), d.year, d.language && d.language !== 'cs' && LANG_NAME[d.language],
    d.loan_type && loanText(d), (d.tags || []).length && `${d.tags.length} ${plural(d.tags.length, 'žánr', 'žánry', 'žánrů')}`,
    d.series_name && 'série', d.note && 'poznámka'].filter(Boolean).join(' · ');
}
// "Vyfotit / Z galerie" row, hidden until the cover is tapped.
const coverPickHtml = (id, label) => `<div class="cover-pick" id="${id}" hidden><span class="hint">${esc(label)}</span>
  <div class="row"><button type="button" class="mini" data-cam>${I.camera}Vyfotit</button><button type="button" class="mini" data-gal>${I.image}Z galerie</button></div>
  <input type="file" accept="image/*" capture="environment" data-cami hidden><input type="file" accept="image/*" data-gali hidden></div>`;
function bindCoverPick(box, onFile) {
  const cam = box.querySelector('[data-cami]'), gal = box.querySelector('[data-gali]');
  box.querySelector('[data-cam]').onclick = () => cam.click();
  box.querySelector('[data-gal]').onclick = () => gal.click();
  [cam, gal].forEach((inp) => (inp.onchange = () => { const f = inp.files[0]; inp.value = ''; if (f) onFile(f); }));
}
function openEditor(data, isNew = false, photoFile = null) {
  const d = { list: S.defaultList || 'library', format: S.defaultFormat || 'book', status: 'unread', rating: null, note: '', loan_type: null, loan_person: '', narrator: '', audio_source: '', ...data };
  if (!d.format) d.format = 'book';
  if (!d.language) d.language = guessLang(d.title);
  let fp = d.finished_precision || 'day';
  d.tags = [...(data.tags || [])];
  const allTags = [...new Set([...GENRES, ...S.books.flatMap((b) => b.tags || [])])].sort(cmpCs);
  const { el, close } = sheet(`${head(isNew ? ({ audio: 'Nová audiokniha', ebook: 'Nová e-kniha' }[d.format] || 'Nová kniha') : ({ audio: 'Upravit audioknihu', ebook: 'Upravit e-knihu' }[d.format] || 'Upravit knihu'))}
    <form id="bf" novalidate>
      <div class="detail"><div id="cv" style="width:80px;flex-shrink:0"><button type="button" class="cover-btn" id="cvb" aria-label="Změnit obálku">${coverHtml(d)}<span class="cam-badge">${I.camera}</span></button></div>
        <div style="flex:1;min-width:0"><label class="f" style="margin-top:0" for="bt">Název</label><input class="inp" id="bt" value="${esc(d.title || '')}" maxlength="300">
        <label class="f" for="ba">Autor</label><input class="inp" id="ba" value="${esc(d.author || '')}" maxlength="300"></div></div>
      ${coverPickHtml('ecp', 'Obálka z tvé fotky:')}
      <label class="f">Kam</label><div class="seg" id="sl">${['library', 'wishlist'].map((k) => `<button type="button" data-k="${k}" class="${d.list === k ? 'on' : ''}">${k === 'library' ? 'Knihovna' : 'Wishlist'}</button>`).join('')}</div>
      <div id="libonly" class="libonly" ${d.list === 'wishlist' ? 'hidden' : ''}>
        <label class="f">Stav</label><div class="seg seg4" id="ss">${Object.entries(statusMap(d.format === 'audio')).map(([k, l]) => `<button type="button" data-k="${k}" class="${d.status === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <label class="f">Hodnocení</label><div class="rate" id="rt">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-n="${n}" class="${d.rating >= n ? 'on' : ''}" aria-label="${n} z 5">★</button>`).join('')}</div>
        <div id="finw" ${d.status === 'read' ? '' : 'hidden'}>
          <label class="f">Dočteno</label><div class="seg" id="fpw">${[['day', 'Datum'], ['year', 'Jen rok'], ['unknown', 'Nevím / dávno']].map(([k, l]) => `<button type="button" data-k="${k}" class="${fp === k ? 'on' : ''}">${l}</button>`).join('')}</div>
          <input class="inp" type="date" id="fdate" style="margin-top:8px" max="${todayISO()}" value="${fp === 'day' && d.finished_at ? d.finished_at : todayISO()}" ${fp === 'day' ? '' : 'hidden'}>
          <select class="sel inp" id="fyear" style="margin-top:8px" ${fp === 'year' ? '' : 'hidden'}>${Array.from({ length: new Date().getFullYear() - 1949 }, (_, i) => new Date().getFullYear() - i).map((y) => `<option ${d.finished_at && +d.finished_at.slice(0, 4) === y ? 'selected' : ''}>${y}</option>`).join('')}</select>
        </div>
      </div>
      <details class="more" id="more">
        <summary><b>Další údaje</b><span>${esc(moreSummary(d) || 'formát, ISBN, rok, jazyk, půjčování, žánry, série, poznámka')}</span></summary>
      <label class="f">Formát</label><div class="seg" id="sf2">${FORMATS.map(([k, , l]) => `<button type="button" data-k="${k}" class="${d.format === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div id="audioonly" ${d.format === 'book' ? 'hidden' : ''}>
        <div class="row"><div style="flex:1" id="nrw" ${d.format === 'audio' ? '' : 'hidden'}><label class="f" for="bnr">Čte</label><input class="inp" id="bnr" maxlength="200" value="${esc(d.narrator || '')}" placeholder="Kdo audioknihu načetl"></div>
        <div style="flex:1"><label class="f" for="bas">Kde ji mám</label><input class="inp" id="bas" list="as-list" maxlength="60" value="${esc(d.audio_source || '')}" placeholder="${d.format === 'ebook' ? 'Kindle, Palmknihy…' : 'Audiolibrix, Storytel…'}"></div></div>
        <datalist id="as-list"></datalist>
      </div>
      <div class="row"><div style="flex:1"><label class="f" for="bi">ISBN</label><input class="inp" id="bi" value="${esc(d.isbn || '')}" inputmode="numeric" maxlength="17"></div>
        <div style="width:100px"><label class="f" for="by">Rok</label><input class="inp" id="by" value="${esc(d.year || '')}" inputmode="numeric" maxlength="4"></div></div>
      <label class="f" for="blg">Jazyk</label><select class="sel inp" id="blg">${LANGS.map(([k, l]) => `<option value="${k}" ${d.language === k ? 'selected' : ''}>${l}</option>`).join('')}${LANGS.some(([k]) => k === d.language) ? '' : `<option value="${esc(d.language)}" selected>${esc(d.language)}</option>`}</select>
      <div class="libonly" ${d.list === 'wishlist' ? 'hidden' : ''}>
        <label class="f">Půjčování</label><div class="seg seg4" id="ln">${[[null, 'Doma'], ['lent', 'Půjčila jsem'], ['borrowed', 'Vypůjčená'], ['returned', 'Vrátila jsem']].map(([k, l]) => `<button type="button" data-k="${k || ''}" class="${(d.loan_type || '') === (k || '') ? 'on' : ''}">${l}</button>`).join('')}</div>
        <div class="row" id="lpw" style="margin-top:8px" ${d.loan_type ? '' : 'hidden'}><input class="inp" id="lp" style="flex:1" maxlength="100" value="${esc(d.loan_person || '')}" placeholder="${d.loan_type === 'lent' ? 'Komu' : 'Od koho'}">
          <input class="inp" type="date" id="lda" style="width:auto" max="${todayISO()}" value="${d.loaned_at || todayISO()}" aria-label="Od kdy" ${d.loan_type === 'returned' ? 'hidden' : ''}></div>
        <p class="hint" id="lnh" ${d.loan_type === 'returned' ? '' : 'hidden'}>Četla jsi půjčenou a už ji nemáš. V knihovně ji najdeš přes hledání nebo filtr Nemám doma, do statistik se počítá.</p>
        <p class="hint" id="lnr" ${d.loan_type === 'lent' || d.loan_type === 'borrowed' ? '' : 'hidden'}>Když se kniha do 2 měsíců nevrátí, aplikace ti připomene.</p>
      </div>
      <label class="f">Žánry</label><div class="tags-edit" id="tg"></div>
      <div class="row" style="margin-top:6px"><input class="inp" id="tgi" list="tg-list" placeholder="Přidat žánr" maxlength="40"><button type="button" class="mini" id="tga" style="padding:10px 14px">Přidat</button></div>
      <div class="row"><div style="flex:1"><label class="f" for="bsr">Série</label><input class="inp" id="bsr" list="sr-list" maxlength="150" value="${esc(d.series_name || '')}" placeholder="Např. Harry Potter"></div>
        <div style="width:90px"><label class="f" for="bsi">Díl</label><input class="inp" id="bsi" inputmode="decimal" maxlength="5" value="${d.series_index ? String(d.series_index).replace('.0', '').replace('.', ',') : ''}"></div></div>
      <datalist id="sr-list">${[...new Set([...S.series.map((x) => x.name), ...S.books.map((b) => b.series_name).filter(Boolean)])].sort(cmpCs).map((x) => `<option value="${esc(x)}">`).join('')}</datalist>
      <datalist id="tg-list">${allTags.map((t) => `<option value="${esc(t)}">`).join('')}</datalist>
      <label class="f" for="bn">Poznámka</label><textarea class="inp" id="bn" maxlength="2000" placeholder="Komu jsem ji půjčila, co se mi líbilo…">${esc(d.note || '')}</textarea>
      ${isNew ? '' : `<label class="f">O čem to je</label>
      <div class="card desc-box" id="dsv">${d.description ? `<p class="desc">${esc(d.description)}</p>` : '<p class="sub">Zatím bez popisu.</p>'}
        <button type="button" class="mini" id="dse" style="margin-top:10px">${I.edit} ${d.description ? 'Upravit text' : 'Napsat popis'}</button></div>
      <div id="dsw" hidden><textarea class="inp" id="bds" maxlength="3000" rows="6" placeholder="O čem kniha je">${esc(d.description || '')}</textarea>
        <div class="row" style="margin-top:6px;justify-content:space-between"><span class="hint" style="margin:0">Uloží se tlačítkem Uložit změny.</span><button type="button" class="mini" id="dsx">Zrušit úpravu</button></div></div>`}
      </details>
      ${photoFile && !safeUrl(d.cover_url) ? `<p class="hint">Jako obálku použijeme tvoji fotku.</p>` : ''}
      <div class="err" id="berr"></div>
      <div class="stack" style="margin-top:8px"><button class="btn primary" type="submit" id="bsave">${isNew ? (d.list === 'wishlist' ? 'Uložit do wishlistu' : 'Uložit do knihovny') : 'Uložit změny'}</button>
      ${!isNew ? `<button type="button" class="btn danger" id="bd">Smazat knihu</button>` : ''}</div>
    </form>`);
  el.querySelectorAll('#sl button').forEach((b) => (b.onclick = () => { d.list = b.dataset.k; el.querySelectorAll('#sl button').forEach((x) => x.classList.toggle('on', x === b)); el.querySelectorAll('.libonly').forEach((x) => (x.hidden = d.list === 'wishlist')); if (isNew) el.querySelector('#bsave').textContent = d.list === 'wishlist' ? 'Uložit do wishlistu' : 'Uložit do knihovny'; }));
  el.querySelectorAll('#ss button').forEach((b) => (b.onclick = () => { d.status = b.dataset.k; el.querySelectorAll('#ss button').forEach((x) => x.classList.toggle('on', x === b)); el.querySelector('#finw').hidden = d.status !== 'read'; }));
  el.querySelectorAll('#fpw button').forEach((b) => (b.onclick = () => {
    fp = b.dataset.k; el.querySelectorAll('#fpw button').forEach((x) => x.classList.toggle('on', x === b));
    el.querySelector('#fdate').hidden = fp !== 'day'; el.querySelector('#fyear').hidden = fp !== 'year';
  }));
  el.querySelectorAll('#rt button').forEach((b) => (b.onclick = () => { const n = +b.dataset.n; d.rating = d.rating === n ? null : n; el.querySelectorAll('#rt button').forEach((x) => x.classList.toggle('on', d.rating >= +x.dataset.n)); }));
  const syncFmt = () => {
    el.querySelector('#audioonly').hidden = d.format === 'book';
    el.querySelector('#nrw').hidden = d.format !== 'audio';
    el.querySelector('#bas').placeholder = d.format === 'ebook' ? 'Kindle, Palmknihy…' : 'Audiolibrix, Storytel…';
    const own = S.books.filter((b) => b.format === d.format).map((b) => b.audio_source).filter(Boolean);
    el.querySelector('#as-list').innerHTML = [...new Set([...(SOURCES[d.format] || []), ...own])].map((x) => `<option value="${esc(x)}">`).join('');
  };
  syncFmt();
  el.querySelectorAll('#sf2 button').forEach((b) => (b.onclick = () => {
    d.format = b.dataset.k; el.querySelectorAll('#sf2 button').forEach((x) => x.classList.toggle('on', x === b));
    syncFmt();
    const m = statusMap(d.format === 'audio'); el.querySelectorAll('#ss button').forEach((x) => (x.textContent = m[x.dataset.k]));
  }));
  const dse = el.querySelector('#dse');
  if (dse) {
    const dsv = el.querySelector('#dsv'), dsw = el.querySelector('#dsw'), bds = el.querySelector('#bds');
    dse.onclick = () => { dsv.hidden = true; dsw.hidden = false; d.descEditing = true; bds.focus(); };
    el.querySelector('#dsx').onclick = () => { bds.value = d.description || ''; dsw.hidden = true; dsv.hidden = false; d.descEditing = false; };
  }
  let newCover = null;
  const ecp = el.querySelector('#ecp');
  el.querySelector('#cvb').onclick = () => { ecp.hidden = !ecp.hidden; };
  bindCoverPick(ecp, async (f) => {
    try { newCover = await resizeImage(f, 900); } catch (e) { return toast('Fotku se nepodařilo načíst.'); }
    const img = el.querySelector('#cvb .cover');
    img.className = 'cover has-img'; img.style.background = '';
    img.innerHTML = `<img src="${URL.createObjectURL(newCover)}" alt="">`;
    ecp.hidden = true; toast('Obálka se uloží s knihou');
  });
  const lp = el.querySelector('#lp');
  el.querySelectorAll('#ln button').forEach((b) => (b.onclick = () => {
    d.loan_type = b.dataset.k || null; el.querySelectorAll('#ln button').forEach((x) => x.classList.toggle('on', x === b));
    el.querySelector('#lpw').hidden = !d.loan_type; lp.placeholder = d.loan_type === 'lent' ? 'Komu' : 'Od koho';
    el.querySelector('#lda').hidden = d.loan_type === 'returned';
    el.querySelector('#lnh').hidden = d.loan_type !== 'returned';
    el.querySelector('#lnr').hidden = !(d.loan_type === 'lent' || d.loan_type === 'borrowed');
    if (d.loan_type) lp.focus();
  }));
  const tg = el.querySelector('#tg'), tgi = el.querySelector('#tgi');
  const drawTags = () => {
    tg.innerHTML = d.tags.length ? d.tags.map((t, i) => `<span class="tag big">${esc(t)}<button type="button" data-ti="${i}" aria-label="Odebrat ${esc(t)}">×</button></span>`).join('') : '<span class="sub" style="font-size:13px">Zatím žádné</span>';
    tg.querySelectorAll('[data-ti]').forEach((x) => (x.onclick = () => { d.tags.splice(+x.dataset.ti, 1); d.tagsEdited = true; drawTags(); }));
  };
  const addTag = () => {
    const v = tgi.value.trim().replace(/\s+/g, ' ');
    if (!v) return;
    const known = allTags.find((t) => normT(t) === normT(v));
    const t = known || v.charAt(0).toUpperCase() + v.slice(1);
    if (!d.tags.some((x) => normT(x) === normT(t)) && d.tags.length < 12) d.tags.push(t);
    tgi.value = ''; d.tagsEdited = true; drawTags();
  };
  el.querySelector('#tga').onclick = addTag;
  tgi.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } };
  tgi.onchange = () => { if (allTags.includes(tgi.value)) addTag(); };
  drawTags();
  const del = el.querySelector('#bd');
  if (del) del.onclick = async () => {
    if (!confirm('Opravdu smazat „' + d.title + '“?')) return;
    const { error } = await sb.from('books').delete().eq('id', d.id);
    if (error) return toast('Nepodařilo se smazat.');
    removeOwnCover(d.cover_url); await loadBooks(); close(); toast('Smazáno'); render();
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
    let cover_url = safeUrl(d.cover_url) || null, coverOwn = null;
    if (newCover) { const u = await uploadCover(newCover); if (u) { coverOwn = cover_url; cover_url = u; } else toast('Obálku se nepodařilo nahrát.'); }
    else if (!cover_url && photoFile) cover_url = await uploadCover(photoFile);
    const row = {
      title, author: el.querySelector('#ba').value.trim() || null, isbn: isbn || null, year: yearS ? +yearS : null,
      list: d.list, status: d.list === 'wishlist' ? 'unread' : d.status, rating: d.list === 'wishlist' ? null : d.rating,
      note: el.querySelector('#bn').value.trim() || null, cover_url,
      ...(d.descEditing ? { description: el.querySelector('#bds').value.trim() || null } : {}),
      loan_type: d.list === 'wishlist' ? null : d.loan_type, loan_person: d.list === 'wishlist' || !d.loan_type ? null : (lp.value.trim() || null),
      ...(d.list !== 'wishlist' && (d.loan_type === 'lent' || d.loan_type === 'borrowed') && /^\d{4}-\d{2}-\d{2}$/.test(el.querySelector('#lda').value) ? { loaned_at: el.querySelector('#lda').value } : {}),
      ...(newCover && cover_url !== safeUrl(d.cover_url) ? { cover_is_original: false } : {}),
      tags: d.tags, format: d.format, language: el.querySelector('#blg').value || null,
      narrator: d.format === 'audio' ? (el.querySelector('#bnr').value.trim() || null) : null,
      audio_source: d.format !== 'book' ? (el.querySelector('#bas').value.trim() || null) : null,
    };
    if (tgi.value.trim()) addTag(), (row.tags = d.tags);
    if (row.list === 'library' && row.status === 'read') {
      if (fp === 'day') { const v = el.querySelector('#fdate').value; row.finished_at = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : todayISO(); row.finished_precision = 'day'; }
      else if (fp === 'year') { row.finished_at = `${el.querySelector('#fyear').value}-01-01`; row.finished_precision = 'year'; }
      else { row.finished_at = null; row.finished_precision = 'unknown'; }
    } else { row.finished_at = null; row.finished_precision = null; }
    const srn = el.querySelector('#bsr').value.trim(), sri = parseFloat(el.querySelector('#bsi').value.replace(',', '.'));
    if (srn && (sri <= 0 || sri >= 1000)) return (err.textContent = 'Díl zadej jako číslo, třeba 3.'), (btn.disabled = false);
    if (srn !== (d.series_name || '') || (sri || null) !== (d.series_index ? +d.series_index : null)) {
      row.series_name = srn || null; row.series_index = srn && sri ? Math.round(sri * 10) / 10 : null; row.series_checked_at = new Date().toISOString();
    }
    if (d.tagsEdited || (isNew && d.tags.length)) row.tagged_at = new Date().toISOString();
    if (isNew && row.isbn && S.books.some((b) => b.isbn === row.isbn && (b.format || 'book') === row.format) && !confirm('Tuhle knihu už máš. Přidat ji znovu?')) { btn.disabled = false; return; }
    const { data: saved, error } = isNew ? await sb.from('books').insert(row).select() : await sb.from('books').update(row).eq('id', d.id).select();
    btn.disabled = false;
    if (error) return (err.textContent = 'Nepodařilo se uložit. Zkus to znovu.');
    if (coverOwn) removeOwnCover(coverOwn);
    await loadBooks(); close();
    toast(isNew ? (row.list === 'wishlist' ? 'Přidáno do wishlistu' : row.format === 'audio' ? 'Audiokniha je v knihovně' : row.format === 'ebook' ? 'E-kniha je v knihovně' : 'Kniha je v knihovně') : 'Uloženo');
    if (isNew) { S.view = row.list === 'wishlist' ? 'wishlist' : 'library'; if (row.list === 'library') UI.library.format = row.format; }
    render();
    if (isNew && saved?.[0] && !saved[0].description) enrichMany([saved[0]]);
    else if (isNew && saved?.[0] && !saved[0].tagged_at) tagMany([saved[0]]);
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
function resultRows(items) {
  return `<div class="list results">${items.map((b, i) => `<div class="li" data-i="${i}">${coverHtml(b)}<div class="grow"><b>${esc(b.title)}</b>
    <span>${esc([b.author, b.year, b.publisher, LANG_NAME[b.language]].filter(Boolean).join(' · '))}</span></div></div>`).join('')}</div>`;
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
  const fromPhoto = { title: data.title, author: data.author, isbn: data.isbn, year: data.year, language: /^[a-z]{2}$/.test(data.language || '') ? data.language : null };
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
async function recognizeShelf(file, mode = 'shelf') {
  const ld = loadingSheet(mode === 'shelf' ? 'Čtu hřbety knih na fotce… (může to trvat až půl minuty)' : `Čtu ${mode === 'audio' ? 'audioknihy' : 'e-knihy'} ze screenshotu… (může to trvat až půl minuty)`);
  let blob;
  try { blob = await resizeImage(file, 2000); } catch (e) { ld.close(); return toast('Fotku se nepodařilo načíst.'); }
  const image = await blobToB64(blob);
  const { data, error } = await sb.functions.invoke('recognize-shelf', { body: { image, mediaType: 'image/jpeg', mode } });
  ld.close();
  if (error) {
    let code = '';
    try { code = (await error.context.json()).error; } catch (e) {}
    if (code === 'not_recognized') return toast(mode === 'shelf' ? 'Na fotce se nepodařilo přečíst žádný hřbet. Zkus to blíž a při lepším světle.' : 'Na obrázku se nepodařilo přečíst žádný název. Zkus jiný screenshot.');
    if (code === 'limit' || code === 'no_key') return toast(deepErrorText(code));
    return toast('Rozpoznání poličky selhalo. Zkus to znovu.');
  }
  openShelfReview(data.books || [], data.unreadable || 0, mode, data.source);
}

function openShelfReview(found, unreadable, mode = 'shelf', source = null) {
  const format = mode === 'shelf' ? 'book' : mode, audio = format === 'audio';
  const target = S.defaultList === 'wishlist' ? 'wishlist' : 'library';
  const owned = new Set(S.books.filter((b) => b.list === 'library' && (b.format || 'book') === format).map((b) => normT(b.title)));
  const rows = found.map((b) => ({ title: b.title, author: b.author || '', narrator: b.narrator || '', low: b.confidence === 'low', dup: owned.has(normT(b.title)) }));
  const known = SOURCES[format] || [];
  const src0 = source ? (known.find((k) => normT(k) === normT(source) || normT(source).includes(normT(k))) || source) : '';
  rows.forEach((r) => (r.on = !r.dup));
  if (!rows.length) rows.push({ title: '', author: '', narrator: '', on: true });
  let status = 'unread';
  const { el, close } = sheet(`${head(mode === 'shelf' ? 'Knihy z poličky' : audio ? 'Audioknihy ze screenshotu' : 'E-knihy ze screenshotu')}
    <p class="sub" id="sh-sum"></p>
    ${unreadable ? `<p class="hint">${mode === 'shelf' ? `Dalších ${unreadable} ${plural(unreadable, 'hřbet', 'hřbety', 'hřbetů')} se přečíst nepodařilo. Přidej je pak ručně, nebo je vyfoť zblízka.` : `Ještě ${unreadable} ${plural(unreadable, 'položku', 'položky', 'položek')} se přečíst nepodařilo. Přidej je ručně, nebo nahraj ostřejší screenshot.`}</p>` : ''}
    ${mode !== 'shelf' ? `<label class="f" for="sh-src">Kde je máš (pro všechny)</label><input class="inp" id="sh-src" list="sh-src-l" maxlength="60" value="${esc(src0)}" placeholder="${audio ? 'Audiolibrix, Storytel…' : 'Kindle, Palmknihy…'}"><datalist id="sh-src-l">${known.map((x) => `<option value="${esc(x)}">`).join('')}</datalist>` : ''}
    <p class="hint">Zkontroluj názvy, oprav, co nesedí, a odškrtni, co přidat nechceš.</p>
    <div class="list" id="sh-list" style="margin-top:12px"></div>
    <button class="btn ghost" id="sh-add" style="margin-top:8px">${mode === 'shelf' ? '+ Přidat knihu ručně' : '+ Přidat další ručně'}</button>
    <label class="f">Stav pro všechny</label><div class="seg seg4" id="sh-st">${Object.entries(statusMap(audio)).map(([k, l]) => `<button type="button" data-k="${k}" class="${k === status ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div class="err" id="sh-err"></div>
    <button class="btn primary" id="sh-save" style="margin-top:8px"></button>`);
  const list = el.querySelector('#sh-list');
  const sync = () => {
    const n = rows.filter((r) => r.on && r.title.trim()).length;
    el.querySelector('#sh-save').textContent = n ? `${target === 'wishlist' ? 'Přidat do wishlistu' : 'Přidat do knihovny'} (${n})` : 'Vyber aspoň jednu';
    el.querySelector('#sh-sum').textContent = format === 'audio' ? `Našli jsme ${rows.length} ${plural(rows.length, 'audioknihu', 'audioknihy', 'audioknih')}.`
      : format === 'ebook' ? `Našli jsme ${rows.length} ${plural(rows.length, 'e-knihu', 'e-knihy', 'e-knih')}.` : `Našli jsme ${rows.length} ${plural(rows.length, 'knihu', 'knihy', 'knih')}.`;
  };
  const draw = () => {
    list.innerHTML = rows.map((r, i) => `<div class="li shelf-row ${r.on ? '' : 'off'}" data-r="${i}">
      <input type="checkbox" ${r.on ? 'checked' : ''} aria-label="Přidat">
      <div class="grow"><input class="inp sm" data-f="title" value="${esc(r.title)}" placeholder="Název" maxlength="300">
        <input class="inp sm" data-f="author" value="${esc(r.author)}" placeholder="Autor" maxlength="300">
        ${audio ? `<input class="inp sm" data-f="narrator" value="${esc(r.narrator)}" placeholder="Čte" maxlength="200">` : ''}
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
  el.querySelector('#sh-add').onclick = () => { rows.push({ title: '', author: '', narrator: '', on: true }); draw(); const ins = list.querySelectorAll('input[data-f=title]'); ins[ins.length - 1].focus(); };
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
      out[i] = { list: target, format, narrator: audio ? (r.narrator || '').trim() || null : null, audio_source: format !== 'book' ? (el.querySelector('#sh-src').value.trim() || null) : null, status, language: m?.language || guessLang(title), title, author: fullAuthor || m?.author || null, isbn: m?.isbn || null, year: m?.year || null, cover_url: safeUrl(m?.cover_url) || null };
      btn.textContent = `Doplňuji údaje… ${++done}/${pick.length}`;
    });
    const queue = [...work];
    await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await queue.shift()(); }));
    btn.textContent = 'Ukládám…';
    const { data: saved, error } = await sb.from('books').insert(out).select();
    if (error) { btn.disabled = false; sync(); return (err.textContent = 'Nepodařilo se uložit. Zkus to znovu.'); }
    await loadBooks(); close();
    toast(format === 'audio' ? `Přidáno ${pick.length} ${plural(pick.length, 'audiokniha', 'audioknihy', 'audioknih')}` : format === 'ebook' ? `Přidáno ${pick.length} ${plural(pick.length, 'e-kniha', 'e-knihy', 'e-knih')}` : `Přidáno ${pick.length} ${plural(pick.length, 'kniha', 'knihy', 'knih')}`);
    S.view = target; if (target === 'library') UI.library.format = format; render();
    if (saved?.length) enrichMany(saved);
  };
}

// Our own cover photos live in Storage; drop the file when it is replaced or the book is deleted.
const ownCoverPath = (url) => (url || '').split('/storage/v1/object/public/covers/')[1] || null;
function removeOwnCover(url) {
  const p = ownCoverPath(url);
  if (p && p.startsWith(me() + '/')) sb.storage.from('covers').remove([p]).catch(() => {});
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

/* ---------- Profile: photo, password, favourites ---------- */
// Everything is optional; only filled-in items are shown (and only to friends).
const FAV_DEFS = [
  ['book', 'Nejoblíbenější knihy', 'book', 3],
  ['series', 'Nejoblíbenější série', 'series'],
  ['author', 'Nejoblíbenější autor nebo autorka', 'author'],
  ['genre', 'Nejoblíbenější žánr', 'genre'],
  ['reread', 'Čtu pořád dokola', 'book'],
  ['recommend', 'Doporučuju všem', 'book'],
  ['audio', 'Nejoblíbenější audiokniha', 'audio'],
  ['narrator', 'Nejoblíbenější hlas audioknih', 'narrator'],
  ['quote', 'Oblíbený citát', 'quote'],
];
const favArr = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter((x) => x && x.title);
function favBookHtml(v, books, own) {
  const b = books.find((x) => x.id === v.id);
  const inner = `<div class="thumb">${coverHtml(b || v)}</div><div class="grow"><b>${esc(v.title)}</b><span>${esc(v.author || '')}</span></div>`;
  return b ? `<button class="fav-bk" data-favbook="${b.id}" data-own="${own ? 1 : 0}">${inner}</button>` : `<div class="fav-bk">${inner}</div>`;
}
function favsHtml(f, books, own) {
  const out = [];
  if (f.about) out.push(`<p class="about-me">${esc(f.about)}</p>`);
  const reading = f.show_reading ? books.filter((b) => b.list === 'library' && b.status === 'reading') : [];
  if (reading.length) out.push(`<div class="fav"><label>${reading.every(isAudio) ? 'Teď poslouchá' : own ? 'Teď čtu' : 'Teď čte'}</label>${reading.slice(0, 3).map((b) => favBookHtml(b, books, own)).join('')}</div>`);
  FAV_DEFS.forEach(([k, label, type]) => {
    const v = f[k];
    if (!v) return;
    if (type === 'book' || type === 'audio') {
      const arr = favArr(v);
      if (arr.length) out.push(`<div class="fav"><label>${arr.length === 1 ? label.replace('knihy', 'kniha') : label}</label>${arr.map((x) => favBookHtml(x, books, own)).join('')}</div>`);
    }
    else if (type === 'quote') out.push(`<div class="fav"><label>${label}</label><blockquote>„${esc(v)}“${f.quote_src ? `<cite>${esc(f.quote_src)}</cite>` : ''}</blockquote></div>`);
    else out.push(`<div class="fav"><label>${label}</label><b class="fav-txt">${esc(v)}</b></div>`);
  });
  if (!out.length) return own ? `<div class="card fav-empty"><b>Ukaž přátelům, co máš ráda</b><span>Nejoblíbenější kniha, série, autor, citát… Vyplníš jen to, co chceš.</span></div>` : '';
  return `<div class="favs">${out.join('')}</div>`;
}
/* ---------- Appearance: light / dark / follow the phone ---------- */
const THEME_KEY = 'tsundoku_theme';
const getTheme = () => { try { return localStorage.getItem(THEME_KEY) || 'auto'; } catch (e) { return 'auto'; } };
function applyTheme(t) {
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
  const dark = t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = dark ? '#1B1916' : '#2F4A3A';
}
function setTheme(t) { try { localStorage.setItem(THEME_KEY, t); } catch (e) {} applyTheme(t); }
applyTheme(getTheme());
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(getTheme())); } catch (e) {}
// Same numbers on my profile and on a friend's: books at home, read, read this year.
function statsHtml(books) {
  const lib = books.filter((b) => b.list === 'library');
  const home = lib.filter((b) => b.loan_type !== 'returned').length;
  const read = lib.filter((b) => b.status === 'read').length;
  const y = new Date().getFullYear(), year = lib.filter((b) => b.status === 'read' && finishedYear(b) === y).length;
  return `<div class="pstats"><div><b>${home}</b><span>${plural(home, 'kniha doma', 'knihy doma', 'knih doma')}</span></div><div><b>${read}</b><span>přečteno</span></div><div><b>${year}</b><span>letos</span></div></div>`;
}
function viewProfile() {
  const p = S.profile;
  return `<button class="back" id="back">${I.left}Knihovna</button>
    <div class="prof-head">
      <button class="prof-av" id="pav" aria-label="Změnit profilovou fotku">${avHtml(p, 'xl')}<span class="cam">${I.camera}</span></button>
      <input type="file" id="pav-in" accept="image/*" hidden>
      <h1>${esc(p.display_name)}</h1><p class="sub">@${esc(p.username)}</p>
      ${statsHtml(S.books)}
    </div>
    ${favsHtml(S.favs || {}, S.books, true)}
    <button class="btn primary" id="pedit" style="margin-top:14px">${I.edit}Upravit profil</button>
    <h2>Vzhled</h2>
    <div class="seg" id="theme">${[['auto', 'Podle telefonu'], ['light', 'Světlý'], ['dark', 'Tmavý']].map(([k, l]) => `<button type="button" data-th="${k}" class="${getTheme() === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    <h2>Účet</h2>
    <div class="list acts">
      <button class="li" id="ppw">Změnit heslo</button>
      <button class="li" id="pexp"><div class="grow"><b>Stáhnout knihovnu do Excelu</b><span>Tabulka .xlsx, otevřeš v Excelu, Numbers i Google Tabulkách</span></div></button>
      <button class="li" id="pabout">Co znamená tsundoku</button>
    </div>
    <p class="sub" style="font-size:12px;margin-top:8px">Přihlášená jako ${esc(S.session.user.email)}</p>
    <button class="btn danger" id="plo" style="margin-top:12px">${I.logout}Odhlásit se</button>`;
}
function bindProfile() {
  $app.querySelectorAll('[data-th]').forEach((b) => (b.onclick = () => { setTheme(b.dataset.th); $app.querySelectorAll('[data-th]').forEach((x) => x.classList.toggle('on', x === b)); }));
  const pin = document.getElementById('pav-in');
  document.getElementById('pav').onclick = () => pin.click();
  pin.onchange = async () => { const f = pin.files[0]; pin.value = ''; if (f) { await setAvatar(f); render(); } };
  document.getElementById('pedit').onclick = openProfileEdit;
  document.getElementById('ppw').onclick = openPassword;
  document.getElementById('pabout').onclick = openAbout;
  document.getElementById('plo').onclick = async () => { await sb.auth.signOut(); };
  document.getElementById('pexp').onclick = () => { try { exportXlsx(); } catch (e) { toast('Export se nepovedl.'); } };
}
/* ---------- Export: Excel table (.xlsx), opens in Excel, Numbers and Google Sheets ---------- */
const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (u8) => { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC_T[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
// Minimal ZIP writer (stored, no compression): enough for a small xlsx.
function zipFiles(files) {
  const enc = new TextEncoder(), parts = [], central = [];
  let offset = 0;
  for (const [name, text] of files) {
    const data = enc.encode(text), nm = enc.encode(name), crc = crc32(data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
    lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, nm.length, true);
    parts.push(lh.buffer, nm, data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true);
    ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true); ch.setUint16(28, nm.length, true); ch.setUint32(42, offset, true);
    central.push(ch.buffer, nm);
    offset += 30 + nm.length + data.length;
  }
  const cdSize = central.reduce((a, b) => a + b.byteLength, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
  return new Blob([...parts, ...central, end.buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
const xmlEsc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
function sheetXml(rows, widths) {
  const col = (i) => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
  const cell = (v, r, c, head) => {
    const ref = col(c) + (r + 1), st = head ? ' s="1"' : '';
    if (v === null || v === undefined || v === '') return head ? `<c r="${ref}"${st}/>` : '';
    if (typeof v === 'number') return `<c r="${ref}"${st}><v>${v}</v></c>`;
    return `<c r="${ref}"${st} t="inlineStr"><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`;
  };
  const last = col(rows[0].length - 1) + rows.length;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">`
    + `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
    + `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`
    + `<sheetData>${rows.map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => cell(v, ri, ci, ri === 0)).join('')}</row>`).join('')}</sheetData>`
    + `<autoFilter ref="A1:${last}"/></worksheet>`;
}
function exportXlsx() {
  const head = ['Seznam', 'Název', 'Autor', 'Formát', 'Stav', 'Hodnocení', 'Dočteno', 'Jazyk', 'Série', 'Díl', 'Žánry', 'Rok vydání', 'Nakladatel', 'ISBN', 'Originální název', 'Půjčování', 'Čte (audiokniha)', 'Poznámka', 'Přidáno'];
  const widths = [11, 34, 24, 11, 13, 10, 12, 10, 22, 6, 26, 10, 20, 15, 28, 24, 20, 40, 11];
  const fin = (b) => (b.status !== 'read' ? '' : b.finished_precision === 'unknown' ? 'dávno' : !b.finished_at ? '' : b.finished_precision === 'year' ? b.finished_at.slice(0, 4) : fmtDate(b.finished_at));
  const sorted = [...S.books].sort((a, b) => (a.list === b.list ? 0 : a.list === 'library' ? -1 : 1) || cmpCs(surnameOf(a.author), surnameOf(b.author)) || cmpCs(a.title, b.title));
  const rows = [head, ...sorted.map((b) => [
    b.list === 'wishlist' ? 'Wishlist' : 'Knihovna', b.title, b.author || '', fmtOne(b.format || 'book'),
    b.list === 'wishlist' ? (b.wish_top ? 'Nejvíc chci' : '') : statusLabel(b), b.rating || '', fin(b),
    LANG_NAME[b.language || 'cs'] || b.language || '', b.series_name || '', b.series_index ? +b.series_index : '', (b.tags || []).join(', '),
    b.year ? +b.year || b.year : '', b.publisher || '', b.isbn || '', b.original_title || '', loanText(b), b.narrator || '', b.note || '',
    b.created_at ? fmtDate(b.created_at.slice(0, 10)) : '']), ];
  const files = [
    ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
    ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ['xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Moje knihy" sheetId="1" r:id="rId1"/></sheets><definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">\'Moje knihy\'!$A$1:$' + 'S$' + rows.length + '</definedName></definedNames></workbook>'],
    ['xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
    ['xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2F4A3A"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'],
    ['xl/worksheets/sheet1.xml', sheetXml(rows, widths)],
  ];
  const a = document.createElement('a');
  a.href = URL.createObjectURL(zipFiles(files));
  a.download = `tsundoku-knihovna-${todayISO()}.xlsx`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const avatarPath = (url) => (url || '').split('/storage/v1/object/public/avatars/')[1] || null;
async function setAvatar(file) {
  toast('Nahrávám fotku…');
  let blob;
  try { blob = await resizeImage(file, 400); } catch (e) { return toast('Fotku se nepodařilo načíst.'); }
  const path = `${me()}/${crypto.randomUUID()}.jpg`;
  const { error } = await sb.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg' });
  if (error) return toast('Fotku se nepodařilo nahrát.');
  const url = sb.storage.from('avatars').getPublicUrl(path).data.publicUrl;
  const old = avatarPath(S.profile.avatar_url);
  const { error: e2 } = await sb.from('profiles').update({ avatar_url: url }).eq('id', me());
  if (e2) return toast('Fotku se nepodařilo uložit.');
  S.profile.avatar_url = url;
  if (old) sb.storage.from('avatars').remove([old]).catch(() => {});
  toast('Profilovka uložena');
}
async function removeAvatar() {
  const old = avatarPath(S.profile.avatar_url);
  const { error } = await sb.from('profiles').update({ avatar_url: null }).eq('id', me());
  if (error) return toast('Nepodařilo se uložit.');
  S.profile.avatar_url = null;
  if (old) sb.storage.from('avatars').remove([old]).catch(() => {});
}
function openProfileEdit() {
  const f = JSON.parse(JSON.stringify(S.favs || {}));
  const lib = S.books.filter((b) => b.list === 'library');
  const uniq = (a) => [...new Set(a.filter(Boolean).map((x) => x.trim()))].sort(cmpCs);
  const opts = (a) => a.map((x) => `<option value="${esc(x)}">`).join('');
  const field = ([k, label, type]) => {
    if (type === 'book' || type === 'audio') return `<label class="f">${label}</label><div class="fav-pick" data-fk="${k}"></div>`;
    if (type === 'genre') return `<label class="f" for="fv-${k}">${label}</label><select class="sel inp" id="fv-${k}"><option value="">Nevybráno</option>${uniq([...GENRES, ...S.books.flatMap((b) => b.tags || [])]).map((g) => `<option ${f[k] === g ? 'selected' : ''}>${esc(g)}</option>`).join('')}</select>`;
    if (type === 'quote') return `<label class="f" for="fv-${k}">${label}</label><textarea class="inp" id="fv-${k}" maxlength="400" rows="3" placeholder="Věta, která ti utkvěla">${esc(f[k] || '')}</textarea>
      <input class="inp" id="fv-quote_src" style="margin-top:6px" maxlength="120" placeholder="Odkud je (kniha, autor)" value="${esc(f.quote_src || '')}">`;
    const list = type === 'series' ? uniq([...S.series.map((x) => x.name), ...S.books.map((b) => b.series_name)])
      : type === 'author' ? uniq(lib.map((b) => cleanAuthor(b.author)))
      : uniq(S.books.map((b) => b.narrator));
    return `<label class="f" for="fv-${k}">${label}</label><input class="inp" id="fv-${k}" maxlength="120" list="dl-${k}" value="${esc(f[k] || '')}" placeholder="Napiš nebo vyber"><datalist id="dl-${k}">${opts(list)}</datalist>`;
  };
  const { el, close } = sheet(`${head('Upravit profil')}
    <label class="f" for="pdn">Jméno</label><input class="inp" id="pdn" maxlength="60" value="${esc(S.profile.display_name || '')}">
    <label class="f">Profilová fotka</label>
    <div class="row" style="align-items:center;gap:10px"><span id="pavw">${avHtml(S.profile)}</span><button type="button" class="mini" id="pph">Vybrat fotku</button><button type="button" class="mini" id="pphx" ${S.profile.avatar_url ? '' : 'hidden'}>Odebrat</button></div>
    <input type="file" id="pph-in" accept="image/*" hidden>
    <h2 style="margin-top:22px">Oblíbené</h2>
    <p class="hint" style="margin-top:-4px">Vyplň jen to, co chceš. Prázdné se na profilu neukáže. Vidí to jen tví přátelé.</p>
    <label class="check"><input type="checkbox" id="fv-show" ${f.show_reading ? 'checked' : ''}> Ukazovat, co právě čtu</label>
    <label class="f" for="fv-about">Pár slov o mně</label><textarea class="inp" id="fv-about" maxlength="400" rows="2" placeholder="Co ráda čteš, kde čteš nejradši…">${esc(f.about || '')}</textarea>
    ${FAV_DEFS.map(field).join('')}
    <div class="err" id="perr"></div>
    <button class="btn primary" id="psave" style="margin-top:16px">Uložit</button>`);
  // Book favourites: pick from your own library with a little inline search.
  el.querySelectorAll('.fav-pick').forEach((box) => {
    const def = FAV_DEFS.find((d) => d[0] === box.dataset.fk), k = def[0], audio = def[2] === 'audio', max = def[3] || 1;
    const pool = lib.filter((b) => (audio ? isAudio(b) : !isAudio(b)));
    let arr = favArr(f[k]);
    const store = () => { if (!arr.length) delete f[k]; else f[k] = max > 1 ? arr : arr[0]; };
    const draw = (open) => {
      const word = audio ? 'audioknihu' : 'knihu';
      const btnLabel = max === 1 ? (arr.length ? 'Změnit' : `Vybrat ${word}`) : arr.length ? `Přidat další (ještě ${max - arr.length})` : `Vybrat ${word}`;
      box.innerHTML = `${arr.map((v, i) => `<div class="fav-cur">${favBookHtml(v, [], true)}<button type="button" class="icon-btn sm" data-x="${i}" aria-label="Odebrat">${I.x}</button></div>`).join('')}
        ${max === 1 || arr.length < max ? `<button type="button" class="mini" data-ch>${btnLabel}</button>` : `<p class="hint" style="margin:0">Máš vybrané ${max}. Pro jinou nejdřív jednu odeber.</p>`}
        ${open ? `<div class="fav-search"><input class="inp" data-q placeholder="${pool.length ? 'Hledat ve své knihovně' : 'V knihovně zatím nic není'}"><div class="list fav-res"></div></div>` : ''}`;
      const ch = box.querySelector('[data-ch]'); if (ch) ch.onclick = () => draw(!open);
      box.querySelectorAll('[data-x]').forEach((x) => (x.onclick = () => { arr.splice(+x.dataset.x, 1); store(); draw(false); }));
      if (!open) return;
      const q = box.querySelector('[data-q]'), res = box.querySelector('.fav-res');
      const show = () => {
        const hits = pool.filter((b) => !arr.some((a) => a.id === b.id) && matchQ(b, q.value.trim())).slice(0, 6);
        res.innerHTML = hits.map((b) => `<button type="button" class="li" data-pid="${b.id}"><div class="grow"><b>${esc(b.title)}</b><span>${esc(b.author || '')}</span></div></button>`).join('') || '<p class="sub" style="padding:10px 12px">Nic takového v knihovně nemáš.</p>';
        res.querySelectorAll('[data-pid]').forEach((r) => (r.onclick = () => {
          const b = pool.find((x) => x.id === r.dataset.pid);
          const v = { id: b.id, title: b.title, author: b.author || '', cover_url: safeUrl(b.cover_url) || null };
          if (max === 1) arr = [v]; else arr.push(v);
          store(); draw(false);
        }));
      };
      q.oninput = show; show(); q.focus();
    };
    draw(false);
  });
  const pin = el.querySelector('#pph-in'), px = el.querySelector('#pphx');
  const drawAv = () => { el.querySelector('#pavw').innerHTML = avHtml(S.profile); px.hidden = !S.profile.avatar_url; };
  el.querySelector('#pph').onclick = () => pin.click();
  pin.onchange = async () => { const fl = pin.files[0]; pin.value = ''; if (fl) { await setAvatar(fl); drawAv(); render(); } };
  px.onclick = async () => { await removeAvatar(); drawAv(); render(); };
  el.querySelector('#psave').onclick = async () => {
    const err = el.querySelector('#perr');
    const name = el.querySelector('#pdn').value.trim();
    if (!name) return (err.textContent = 'Jméno nesmí být prázdné.');
    const out = {};
    FAV_DEFS.forEach(([k, , type]) => {
      if (type === 'book' || type === 'audio') { if (favArr(f[k]).length) out[k] = f[k]; return; }
      const v = el.querySelector('#fv-' + k).value.trim();
      if (v) out[k] = v;
    });
    const src = el.querySelector('#fv-quote_src').value.trim(); if (out.quote && src) out.quote_src = src;
    const about = el.querySelector('#fv-about').value.trim(); if (about) out.about = about;
    if (el.querySelector('#fv-show').checked) out.show_reading = true;
    const btn = el.querySelector('#psave'); btn.disabled = true;
    const { error } = await sb.from('profile_favs').upsert({ user_id: me(), favs: out, updated_at: new Date().toISOString() });
    let e2 = null;
    if (!error && name !== S.profile.display_name) ({ error: e2 } = await sb.from('profiles').update({ display_name: name }).eq('id', me()));
    btn.disabled = false;
    if (error || e2) return (err.textContent = 'Nepodařilo se uložit. Zkus to znovu.');
    S.favs = out; S.profile.display_name = name;
    close(); render(); toast('Profil uložen');
  };
}
function openPassword(recovery = false) {
  const { el, close } = sheet(`${head(recovery ? 'Nastav si nové heslo' : 'Změnit heslo')}
    ${recovery ? '<p class="sub" style="margin-bottom:6px">Přihlásila ses přes odkaz z e-mailu. Teď si zvol nové heslo.</p>' : ''}
    <form id="pwf" novalidate>
      <label class="f" for="pw1">Nové heslo</label><input class="inp" id="pw1" type="password" autocomplete="new-password" placeholder="Aspoň 8 znaků">
      <label class="f" for="pw2">Nové heslo ještě jednou</label><input class="inp" id="pw2" type="password" autocomplete="new-password">
      <div class="err" id="pwerr"></div>
      <button class="btn primary" style="margin-top:14px">Změnit heslo</button></form>`);
  el.querySelector('#pwf').onsubmit = async (e) => {
    e.preventDefault();
    const a = el.querySelector('#pw1').value, b = el.querySelector('#pw2').value, err = el.querySelector('#pwerr');
    if (a.length < 8) return (err.textContent = 'Heslo musí mít aspoň 8 znaků.');
    if (a !== b) return (err.textContent = 'Hesla se neshodují.');
    err.textContent = '';
    const btn = el.querySelector('button.primary'); btn.disabled = true; btn.textContent = 'Měním…';
    const { error } = await sb.auth.updateUser({ password: a });
    btn.disabled = false; btn.textContent = 'Změnit heslo';
    if (error) {
      const c = error.code || '';
      err.textContent = c === 'same_password' ? 'Tohle heslo už máš. Zvol jiné.'
        : c === 'weak_password' ? 'Heslo je moc slabé nebo uniklo z jiných webů. Zvol jiné.'
        : c === 'reauthentication_needed' ? 'Z bezpečnostních důvodů se odhlas, přihlas znovu a zkus to hned potom.'
        : 'Heslo se nepodařilo změnit. Zkus to znovu.';
      return;
    }
    close(); toast(recovery ? 'Nové heslo je nastavené' : 'Heslo změněno');
  };
}

/* ====================================================================
   Reading year: finished dates, yearly goal, statistics
   ==================================================================== */
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const finishedYear = (b) => (b.finished_at && b.finished_precision !== 'unknown' ? +b.finished_at.slice(0, 4) : null);
const MONTHS = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
const MONTHS_SHORT = ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'];
const fmtDate = (iso) => { const [y, m, d] = iso.split('-'); return `${+d}. ${+m}. ${y}`; };
function finishedText(b) {
  if (b.status !== 'read') return '';
  if (b.finished_precision === 'unknown') return 'Dočteno: dávno';
  if (!b.finished_at) return '';
  return b.finished_precision === 'year' ? `Dočteno v roce ${b.finished_at.slice(0, 4)}` : `Dočteno ${fmtDate(b.finished_at)}`;
}
async function loadGoals() {
  const { data } = await sb.from('reading_goals').select('*');
  S.goals = {}; (data || []).forEach((g) => (S.goals[g.year] = g.target));
}
const readIn = (y) => S.books.filter((b) => b.list === 'library' && b.status === 'read' && finishedYear(b) === y);
function paceText(n, goal, y) {
  const now = new Date();
  if (y !== now.getFullYear()) return n >= goal ? 'Cíl splněn' : `Chybělo ${goal - n}`;
  const start = new Date(y, 0, 1), end = new Date(y + 1, 0, 1);
  const expected = goal * ((now - start) / (end - start));
  const diff = Math.round(n - expected);
  if (n >= goal) return 'Cíl splněn!';
  if (diff > 0) return `Jsi napřed o ${diff} ${plural(diff, 'knihu', 'knihy', 'knih')}`;
  if (diff < 0) return `Pozadu o ${-diff} ${plural(-diff, 'knihu', 'knihy', 'knih')}`;
  return 'Přesně podle plánu';
}
function yearCard() {
  const y = new Date().getFullYear(), n = readIn(y).length, goal = S.goals?.[y];
  const pct = goal ? Math.min(100, Math.round((n / goal) * 100)) : 0;
  return `<button class="card yearcard" id="yearcard"><div class="grow">
      <b>${y}: ${n}${goal ? ` / ${goal}` : ''} ${goal ? '' : plural(n, 'kniha dočtená', 'knihy dočtené', 'knih dočtených')}</b>
      <span>${goal ? paceText(n, goal, y) : 'Čtenářský rok · nastav si cíl'}</span>
      ${goal ? `<div class="bar"><i style="width:${pct}%"></i></div>` : ''}</div>${I.left.replace('<svg', '<svg class="chev"')}</button>`;
}
function viewYear() {
  const y = S.statYear || new Date().getFullYear();
  const books = readIn(y);
  const goal = S.goals?.[y];
  const years = [...new Set([new Date().getFullYear(), ...S.books.map(finishedYear).filter(Boolean)])].sort((a, b) => b - a);
  const byMonth = Array.from({ length: 12 }, () => []);
  const yearOnly = [];
  books.forEach((b) => (b.finished_precision === 'year' ? yearOnly.push(b) : byMonth[+b.finished_at.slice(5, 7) - 1].push(b)));
  const max = Math.max(1, ...byMonth.map((m) => m.length));
  const rated = books.filter((b) => b.rating);
  const avg = rated.length ? (rated.reduce((a, b) => a + b.rating, 0) / rated.length).toFixed(1).replace('.', ',') : null;
  const best = [...rated].sort((a, b) => b.rating - a.rating || (b.finished_at || '').localeCompare(a.finished_at || ''))[0];
  const top = (arr) => Object.entries(arr.reduce((m, k) => ((m[k] = (m[k] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const genres = top(books.flatMap((b) => (b.tags || []).filter((t) => t !== 'Román')));
  const authors = top(books.map((b) => cleanAuthor(b.author)).filter(Boolean));
  const fmts = top(books.map((b) => fmtOne(b.format || 'book')));
  const langs = top(books.map((b) => LANG_NAME[b.language || 'cs'] || b.language));
  const missList = S.books.filter((b) => b.list === 'library' && b.status === 'read' && !b.finished_at && b.finished_precision !== 'unknown'), missing = missList.length;
  const pct = goal ? Math.min(100, Math.round((books.length / goal) * 100)) : 0;
  const statRow = (title, rows) => rows.length ? `<h3 class="st-h">${title}</h3><div class="st-list">${rows.map(([k, n]) => `<div><span>${esc(k)}</span><b>${n}</b></div>`).join('')}</div>` : '';
  const bookRow = (b) => `<button class="li book" data-id="${b.id}" data-own="1" style="width:100%;text-align:left"><div class="thumb" style="width:36px">${coverHtml(b)}</div><div class="grow"><b>${esc(b.title)}</b><span>${esc(b.author || '')}</span></div>${b.rating ? `<span class="stars">${starsTxt(b.rating)}</span>` : ''}</button>`;
  return `<button class="back" id="back-lib">${I.left}Knihovna</button>
    <div class="top"><div><h1>Čtenářský rok</h1><p class="sub">Knihy, e-knihy i audioknihy dohromady</p></div></div>
    <div class="chips">${years.map((yy) => `<button class="chip ${yy === y ? 'on' : ''}" data-year="${yy}">${yy}</button>`).join('')}</div>
    ${missing ? `<div class="card banner"><div class="grow"><b>${missing} ${plural(missing, 'přečtená kniha nemá', 'přečtené knihy nemají', 'přečtených knih nemá')} datum dočtení</b>${whichHtml('dates', missList)}<span>Vybereš jen rok, nebo „nevím“. Jde to rychle.</span></div><button class="mini primary" id="fill-dates">Doplnit</button></div>` : ''}
    <div class="card goal">
      <div class="goal-top"><div><div class="big">${books.length}${goal ? `<small> / ${goal}</small>` : ''}</div><div class="sub">${plural(books.length, 'kniha dočtená', 'knihy dočtené', 'knih dočtených')} v roce ${y}</div></div>
      <button class="mini" id="set-goal">${goal ? 'Změnit cíl' : 'Nastavit cíl'}</button></div>
      ${goal ? `<div class="bar big"><i style="width:${pct}%"></i></div><p class="sub" style="margin-top:6px">${pct} % · ${paceText(books.length, goal, y)}</p>` : ''}
    </div>
    <h3 class="st-h">Po měsících</h3>
    <div class="months">${byMonth.map((m, i) => `<button type="button" class="mcol" data-mi="${i}" ${m.length ? '' : 'disabled'} aria-label="${MONTHS[i]}"><div class="mbar"><i style="height:${Math.round((m.length / max) * 100)}%"></i></div><b>${m.length || ''}</b><span>${MONTHS_SHORT[i]}</span></button>`).join('')}</div>
    ${yearOnly.length ? `<p class="hint">+ ${yearOnly.length} ${plural(yearOnly.length, 'kniha', 'knihy', 'knih')} jen s rokem, bez měsíce.</p>` : ''}
    <div class="stats">
      <div><b>${books.length}</b><span>dočteno</span></div>
      <div><b>${avg || '–'}</b><span>průměrné hodnocení</span></div>
      <div><b>${new Set(books.map((b) => cleanAuthor(b.author))).size}</b><span>autorů</span></div>
    </div>
    ${best ? `<h3 class="st-h">Nejlepší kniha roku</h3><div class="list">${bookRow(best)}</div>` : ''}
    ${statRow('Nejčastější žánry', genres)}${statRow('Nejčastější autoři', authors)}${statRow('Formáty', fmts)}${statRow('Jazyky', langs)}
    ${books.length ? `<h3 class="st-h">Dočtené knihy</h3><p class="hint" style="margin:-4px 0 8px">Klepni na měsíc (nebo na sloupec v grafu).</p>
      ${byMonth.map((m, i) => (m.length ? `<details class="mdet" id="mdet-${i}"><summary><span>${MONTHS[i]}</span><span class="n">${m.length}</span></summary><div class="list">${m.map(bookRow).join('')}</div></details>` : '')).reverse().join('')}
      ${yearOnly.length ? `<details class="mdet"><summary><span>během roku</span><span class="n">${yearOnly.length}</span></summary><div class="list">${yearOnly.map(bookRow).join('')}</div></details>` : ''}`
    : `<div class="empty">V roce ${y} zatím nic dočteného. Až knihu označíš jako přečtenou, objeví se tady.</div>`}`;
}
function bindYear() {
  const bl = document.getElementById('back-lib'); if (bl) bl.onclick = () => goBack(() => { S.view = 'library'; render(); window.scrollTo(0, 0); });
  $app.querySelectorAll('[data-year]').forEach((b) => (b.onclick = () => { S.statYear = +b.dataset.year; render(); }));
  $app.querySelectorAll('[data-mi]').forEach((b) => (b.onclick = () => {
    const d = document.getElementById('mdet-' + b.dataset.mi); if (!d) return;
    d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  const sg = document.getElementById('set-goal'); if (sg) sg.onclick = openGoal;
  const fd = document.getElementById('fill-dates'); if (fd) fd.onclick = openFillDates;
  $app.querySelectorAll('.book').forEach((b) => (b.onclick = () => openBook(b.dataset.id, true)));
}
function openGoal() {
  const y = S.statYear || new Date().getFullYear();
  const { el, close } = sheet(`${head(`Cíl na rok ${y}`)}
    <p class="sub">Kolik knih chceš za rok dočíst? Počítají se knihy, e-knihy i audioknihy.</p>
    <div class="goal-pick"><button type="button" class="icon-btn" id="gm">−</button><input class="inp" id="gv" type="number" inputmode="numeric" min="1" max="1000" value="${S.goals?.[y] || 24}"><button type="button" class="icon-btn" id="gp">+</button></div>
    <div class="err" id="gerr"></div>
    <div class="stack"><button class="btn primary" id="gs">Uložit cíl</button>${S.goals?.[y] ? '<button class="btn danger" id="gd">Zrušit cíl</button>' : ''}</div>`);
  const v = el.querySelector('#gv');
  el.querySelector('#gm').onclick = () => (v.value = Math.max(1, (+v.value || 1) - 1));
  el.querySelector('#gp').onclick = () => (v.value = Math.min(1000, (+v.value || 0) + 1));
  el.querySelector('#gs').onclick = async () => {
    const t = Math.round(+v.value);
    if (!(t >= 1 && t <= 1000)) return (el.querySelector('#gerr').textContent = 'Zadej číslo od 1 do 1000.');
    const { error } = await sb.from('reading_goals').upsert({ user_id: me(), year: y, target: t });
    if (error) return (el.querySelector('#gerr').textContent = 'Nepodařilo se uložit. Zkus to znovu.');
    S.goals[y] = t; close(); render(); toast('Cíl uložen');
  };
  const gd = el.querySelector('#gd');
  if (gd) gd.onclick = async () => { await sb.from('reading_goals').delete().eq('year', y); delete S.goals[y]; close(); render(); };
}
// Quick bulk: give each read book without a date a year, or "don't know".
function openFillDates() {
  const list = S.books.filter((b) => b.list === 'library' && b.status === 'read' && !b.finished_at && b.finished_precision !== 'unknown')
    .sort((a, b) => cmpCs(a.title, b.title));
  const cy = new Date().getFullYear();
  const years = Array.from({ length: cy - 1979 }, (_, i) => cy - i);
  const choice = {};
  const { el, close } = sheet(`${head('Kdy jsi je dočetla?')}
    <p class="sub">U každé knihy vyber rok, nebo „nevím“. Které necháš na „—“, zůstanou bez data.</p>
    <div class="list" style="margin-top:12px">${list.map((b) => `<div class="li"><div class="grow"><b>${esc(b.title)}</b><span>${esc(b.author || '')}</span></div>
      <select class="sel yrsel" data-fid="${b.id}"><option value="">—</option><option value="unknown">nevím</option>${years.map((yy) => `<option value="${yy}">${yy}</option>`).join('')}</select></div>`).join('')}</div>
    <div class="err" id="fderr"></div>
    <button class="btn primary" id="fds" style="margin-top:12px">Uložit</button>`);
  el.querySelectorAll('[data-fid]').forEach((s) => (s.onchange = () => (choice[s.dataset.fid] = s.value)));
  el.querySelector('#fds').onclick = async () => {
    const ids = Object.keys(choice).filter((k) => choice[k]);
    if (!ids.length) return close();
    const btn = el.querySelector('#fds'); btn.disabled = true; btn.textContent = 'Ukládám…';
    const queue = [...ids];
    let fail = 0;
    await Promise.all(Array.from({ length: 5 }, async () => {
      while (queue.length) {
        const id = queue.shift(), v = choice[id];
        const up = v === 'unknown' ? { finished_at: null, finished_precision: 'unknown' } : { finished_at: `${v}-01-01`, finished_precision: 'year' };
        const { error } = await sb.from('books').update(up).eq('id', id);
        if (error) fail++; else Object.assign(S.books.find((b) => b.id === id), up);
      }
    }));
    close(); render();
    toast(fail ? `Uloženo, ${fail} se nepovedlo` : `Uloženo u ${ids.length} ${plural(ids.length, 'knihy', 'knih', 'knih')}`);
  };
}

/* ====================================================================
   "Co číst dál?" – random pick from the unread pile in the library
   ==================================================================== */
const PICK = { mode: 'random', format: 'all', lang: '', genre: '', paused: false, seen: new Set(), anchorId: null, simIdx: 0, ai: {} };
const onPile = (b) => b.list === 'library' && b.loan_type !== 'returned' && (b.status === 'unread' || (PICK.paused && b.status === 'paused'));
const pilePool = () => S.books.filter((b) => onPile(b)
  && (PICK.format === 'all' || (b.format || 'book') === PICK.format)
  && (!PICK.lang || (b.language || 'cs') === PICK.lang)
  && (!PICK.genre || (b.tags || []).includes(PICK.genre)));
const pileCount = () => S.books.filter((b) => b.list === 'library' && b.loan_type !== 'returned' && b.status === 'unread').length;
// Finished books, the most recent first (exact date first, then year-only, then the rest).
function recentReads() {
  const rank = (b) => (b.finished_at && b.finished_precision === 'day' ? b.finished_at : b.finished_at && b.finished_precision === 'year' ? b.finished_at.slice(0, 4) + '-00' : '0000') + (b.updated_at || b.created_at || '');
  return S.books.filter((b) => b.list === 'library' && b.status === 'read').sort((a, b) => rank(b).localeCompare(rank(a)));
}
const WIDE_GENRES = ['Román', 'Česká literatura'];
// Books on the pile most like the one just finished: next part of the series, same author, shared genres.
function similarOnPile(a) {
  const aTags = (a.tags || []).filter((t) => !WIDE_GENRES.includes(t));
  const aSur = normT(surnameOf(a.author)), aSer = normT(a.series_name);
  const sameSer = aSer ? S.books.filter((b) => onPile(b) && normT(b.series_name) === aSer) : [];
  const next = sameSer.filter((b) => +b.series_index > +(a.series_index || 0)).sort((x, y) => x.series_index - y.series_index)[0];
  return S.books.filter((b) => onPile(b) && b.id !== a.id).map((b) => {
    let score = 0; const why = [];
    if (next && b.id === next.id) { score += 100; why.push(`další díl série ${b.series_name}`); }
    else if (aSer && normT(b.series_name) === aSer) { score += 30; why.push(`ze stejné série`); }
    if (aSur && normT(surnameOf(b.author)) === aSur) { score += 40; why.push('od stejného autora'); }
    const shared = (b.tags || []).filter((t) => aTags.includes(t));
    if (shared.length) { score += 12 * shared.length; why.push('taky ' + shared.join(', ').toLowerCase()); }
    if ((b.language || 'cs') === (a.language || 'cs')) score += 2;
    if ((b.format || 'book') === (a.format || 'book')) score += 1;
    return { b, score, why };
  }).filter((x) => x.score >= 12).sort((x, y) => y.score - x.score || Math.random() - 0.5);
}
function openPick() {
  PICK.seen = new Set(); PICK.simIdx = 0;
  let current = null;
  const { el, close } = sheet(`${head('Co číst dál?')}<div id="pk"></div>`);
  const box = el.querySelector('#pk');
  const roll = () => {
    const pool = pilePool();
    let cand = pool.filter((b) => !PICK.seen.has(b.id));
    if (!cand.length && pool.length) { PICK.seen = new Set(current ? [current.id] : []); cand = pool.filter((b) => !PICK.seen.has(b.id)); if (!cand.length) cand = pool; }
    current = cand.length ? cand[Math.floor(Math.random() * cand.length)] : null;
    if (current) PICK.seen.add(current.id);
    draw();
  };
  const startReading = async (b) => {
    const { error } = await sb.from('books').update({ status: 'reading' }).eq('id', b.id);
    if (error) return toast('Nepodařilo se uložit.');
    b.status = 'reading'; close(); render(); toast(`${b.title}: ${statusLabel(b)}`);
  };
  const card = (b, reason) => `<div class="pick">
      <div class="pick-cover">${coverHtml(b)}</div>
      ${reason ? `<p class="pick-why">${esc(reason)}</p>` : ''}
      <h2>${esc(b.title)}</h2><p class="sub">${esc([b.author, b.year].filter(Boolean).join(' · '))}</p>
      ${(b.tags || []).length ? `<div class="tags-row" style="justify-content:center">${b.tags.slice(0, 4).map((t) => `<span class="tag big">${esc(t)}</span>`).join('')}</div>` : ''}
      ${b.description ? `<p class="desc" style="text-align:left;margin-top:10px">${esc(b.description)}</p>` : ''}
    </div>`;
  const draw = () => {
    const modeSeg = `<div class="seg" style="margin-bottom:12px">${[['random', 'Náhodně z hromádky'], ['similar', 'Podobné jako dočtená']].map(([k, l]) => `<button type="button" data-pm="${k}" class="${PICK.mode === k ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    if (PICK.mode === 'similar') return drawSimilar(modeSeg);
    const all = S.books.filter(onPile);
    const genres = [...new Set(all.flatMap((b) => b.tags || []))].sort(cmpCs);
    const langs = LANGS.filter(([k]) => all.some((b) => (b.language || 'cs') === k));
    const n = pilePool().length;
    const chip = (attr, val, label, on) => `<button class="chip sm ${on ? 'on' : ''}" ${attr}="${val}">${label}</button>`;
    box.innerHTML = `${modeSeg}
      <div class="chips">${[['all', 'Vše'], ...FORMATS.map(([k, , one]) => [k, one])].map(([k, l]) => chip('data-pf', k, l, PICK.format === k)).join('')}</div>
      ${langs.length > 1 ? `<div class="chips">${langs.map(([k, l]) => chip('data-pl', k, l, PICK.lang === k)).join('')}</div>` : ''}
      <div class="row" style="margin-bottom:10px">${genres.length ? `<select class="sel" id="pg" style="flex:1"><option value="">Žánr: jakýkoli</option>${genres.map((g) => `<option ${PICK.genre === g ? 'selected' : ''}>${esc(g)}</option>`).join('')}</select>` : ''}
        <label class="tog"><input type="checkbox" id="pp" ${PICK.paused ? 'checked' : ''}> i odložené</label></div>
      <p class="hint" style="margin:0 0 12px">Na hromádce: ${n} ${plural(n, 'kniha', 'knihy', 'knih')}</p>
      ${current ? `${card(current)}
        <div class="stack" style="margin-top:14px">
          <button class="btn primary" id="pstart">${isAudio(current) ? 'Začnu poslouchat' : 'Začnu číst'}</button>
          <div class="row"><button class="btn" id="pnext">Jinou</button><button class="btn" id="pdet">Detail</button></div>
        </div>`
      : `<div class="empty">${n ? '' : 'S tímhle výběrem na hromádce nic nečeká. Zkus jiný filtr.'}</div>`}`;
    bindMode();
    box.querySelectorAll('[data-pf]').forEach((b) => (b.onclick = () => { PICK.format = b.dataset.pf; roll(); }));
    box.querySelectorAll('[data-pl]').forEach((b) => (b.onclick = () => { PICK.lang = PICK.lang === b.dataset.pl ? '' : b.dataset.pl; roll(); }));
    const pg = box.querySelector('#pg'); if (pg) pg.onchange = () => { PICK.genre = pg.value; roll(); };
    box.querySelector('#pp').onchange = (e) => { PICK.paused = e.target.checked; roll(); };
    if (current) {
      box.querySelector('#pnext').onclick = roll;
      box.querySelector('#pdet').onclick = () => { const id = current.id; close(); openBook(id, true); };
      box.querySelector('#pstart').onclick = () => startReading(current);
    }
  };
  const bindMode = () => box.querySelectorAll('[data-pm]').forEach((b) => (b.onclick = () => { PICK.mode = b.dataset.pm; PICK.simIdx = 0; draw(); }));
  const drawSimilar = (modeSeg) => {
    const reads = recentReads().slice(0, 20);
    if (!reads.length) { box.innerHTML = `${modeSeg}<div class="empty">Zatím nemáš žádnou dočtenou knihu. Až nějakou označíš jako přečtenou, najdu ti podobné.</div>`; return bindMode(); }
    if (!reads.some((b) => b.id === PICK.anchorId)) PICK.anchorId = reads[0].id;
    const a = reads.find((b) => b.id === PICK.anchorId);
    const sim = similarOnPile(a);
    if (PICK.simIdx >= sim.length) PICK.simIdx = 0;
    const hit = sim[PICK.simIdx];
    const ai = PICK.ai[a.id];
    box.innerHTML = `${modeSeg}
      <label class="f" for="pa" style="margin-top:0">Podobné jako</label>
      <select class="sel inp" id="pa">${reads.map((b) => `<option value="${b.id}" ${b.id === a.id ? 'selected' : ''}>${esc(b.title)}${b.author ? ' · ' + esc(surnameOf(b.author)) : ''}</option>`).join('')}</select>
      <label class="tog" style="margin:8px 0 12px"><input type="checkbox" id="pp" ${PICK.paused ? 'checked' : ''}> i odložené</label>
      <p class="pick-sec">Z tvé hromádky</p>
      ${hit ? `${card(hit.b, hit.why.join(' · ').replace(/^./, (c) => c.toUpperCase()))}
        <div class="stack" style="margin-top:14px">
          <button class="btn primary" id="pstart">${isAudio(hit.b) ? 'Začnu poslouchat' : 'Začnu číst'}</button>
          <div class="row">${sim.length > 1 ? `<button class="btn" id="pnext">Další podobná (${PICK.simIdx + 1}/${sim.length})</button>` : ''}<button class="btn" id="pdet">Detail</button></div>
        </div>`
      : `<div class="card" style="padding:12px 14px"><p class="sub">Na hromádce nic podobného nemáš. Zkus to níž, mezi knihami, které ještě nemáš.</p></div>`}
      <p class="pick-sec" style="margin-top:22px">Knihy, které ještě nemáš</p>
      <div id="pai">${ai === 'loading' ? `<div class="empty" style="padding:16px"><div class="spin" style="margin:0 auto 10px;color:var(--green)"></div>Hledám podobné knihy… (asi 10 s)</div>`
        : Array.isArray(ai) ? (ai.length ? `<div class="list">${ai.map((r, i) => `<div class="li sim"><div class="grow"><b>${esc(r.title)}</b><span>${esc([r.author, r.year].filter(Boolean).join(' · '))}</span>
              ${r.why ? `<p class="sim-why">${esc(r.why)}</p>` : ''}
              <div class="row" style="gap:6px;margin-top:6px">${r.added ? '<span class="pill sm">Ve wishlistu ✓</span>' : `<button class="mini primary" data-wish="${i}">${I.heart}Do wishlistu</button>`}
              <a class="mini" href="${esc(goodreadsUrl(r))}" target="_blank" rel="noopener">Goodreads</a><a class="mini" href="${esc(dbkUrl(r))}" target="_blank" rel="noopener">Databáze knih</a></div></div></div>`).join('')}</div>
              <p class="hint">Doporučuje AI podle toho, co o knihách ví. Než si knihu koupíš, mrkni na odkaz.</p>` : '<p class="sub">Nic se nenašlo. Zkus jinou knihu.</p>')
        : `<button class="btn" id="pfind">${I.search}Najít podobné knihy</button>`}</div>`;
    bindMode();
    box.querySelector('#pa').onchange = (e) => { PICK.anchorId = e.target.value; PICK.simIdx = 0; draw(); };
    box.querySelector('#pp').onchange = (e) => { PICK.paused = e.target.checked; PICK.simIdx = 0; draw(); };
    if (hit) {
      const nx = box.querySelector('#pnext'); if (nx) nx.onclick = () => { PICK.simIdx++; draw(); };
      box.querySelector('#pdet').onclick = () => { close(); openBook(hit.b.id, true); };
      box.querySelector('#pstart').onclick = () => startReading(hit.b);
    }
    const pf = box.querySelector('#pfind');
    if (pf) pf.onclick = async () => {
      PICK.ai[a.id] = 'loading'; draw();
      const owned = [...new Set(S.books.flatMap((b) => [b.title, b.original_title]).filter(Boolean))];
      const { data, error } = await sb.functions.invoke('similar-books', { body: { anchor: { title: a.title, author: a.author, original_title: a.original_title, tags: a.tags, description: a.description }, owned, lang: a.language || 'cs' } });
      if (error) {
        let code = ''; try { code = (await error.context.json()).error; } catch (e) {}
        delete PICK.ai[a.id]; toast(code === 'limit' || code === 'no_key' ? deepErrorText(code) : 'Doporučení se nepovedlo. Zkus to znovu.');
      } else PICK.ai[a.id] = data.results || [];
      if (sheetCur) draw();
    };
    box.querySelectorAll('[data-wish]').forEach((x) => (x.onclick = async () => {
      const r = ai[+x.dataset.wish]; x.disabled = true;
      const { data: saved, error } = await sb.from('books').insert({ list: 'wishlist', title: r.title, author: r.author || null, original_title: r.original_title || null, year: r.year || null, format: 'book', language: guessLang(r.title) }).select();
      if (error) { x.disabled = false; return toast('Nepodařilo se uložit.'); }
      r.added = true; await loadBooks(); draw(); toast('Přidáno do wishlistu');
      if (saved?.[0]) enrichMany([S.books.find((b) => b.id === saved[0].id) || saved[0]]);
    }));
  };
  if (PICK.mode === 'similar') draw(); else roll();
}

/* ====================================================================
   Series
   ==================================================================== */
async function loadSeries() {
  const { data } = await sb.from('series').select('*').eq('owner_id', me());
  S.series = data || [];
}
const seriesState = { running: false };
function seriesBanner() {
  const miss = S.books.filter((b) => !b.series_checked_at && !b.series_name);
  if (!miss.length || seriesState.running || tagState.running || enrichState.ids.size || S.books.some((b) => !b.tagged_at)) return '';
  return `<div class="card banner"><div class="grow"><b>Najít série</b>${miss.length <= 2 ? whichHtml('series', miss) : ''}<span>AI pozná, které knihy patří do série a kolikátý jsou díl. U ${miss.length} ${plural(miss.length, 'knihy', 'knih', 'knih')} · méně než 1 Kč.</span></div><button class="mini primary" id="ser-all">Najít</button></div>`;
}
async function findSeries(books) {
  const todo = books.filter((b) => b && !b.series_checked_at && !b.series_name);
  if (!todo.length || seriesState.running) return;
  seriesState.running = true; if (!$sheet.innerHTML) render();
  let bar = document.getElementById('enrich-bar');
  if (!bar) { bar = document.createElement('div'); bar.id = 'enrich-bar'; document.body.appendChild(bar); }
  let done = 0, stop = null;
  const known = new Set(S.series.map((s) => s.name));
  for (let i = 0; i < todo.length && !stop; i += 25) {
    const batch = todo.slice(i, i + 25);
    bar.innerHTML = `<div class="spin"></div>Hledám série… ${done}/${todo.length}`;
    const { data, error } = await sb.functions.invoke('series-books', { body: { known: [...known], books: batch.map((b) => ({ id: b.id, title: b.title, author: b.author, original_title: b.original_title, language: b.language })) } });
    if (error) { let c = ''; try { c = (await error.context.json()).error; } catch (e) {} stop = c || 'failed'; break; }
    // merge series catalogue
    for (const [name, parts] of Object.entries(data.series || {})) {
      known.add(name);
      const ex = S.series.find((s) => s.name === name);
      const merged = [...(ex?.parts || [])];
      parts.forEach((p) => { if (!merged.some((m) => m.index === p.index)) merged.push(p); });
      merged.sort((a, b) => a.index - b.index);
      const { error: e1 } = await sb.from('series').upsert({ owner_id: me(), name, parts: merged, updated_at: new Date().toISOString() });
      if (!e1) { if (ex) ex.parts = merged; else S.series.push({ owner_id: me(), name, parts: merged }); }
    }
    const now = new Date().toISOString();
    await Promise.all(batch.map(async (b) => {
      const v = data.books?.[b.id];
      const up = { series_checked_at: now, ...(v ? { series_name: v.series, series_index: v.index } : {}) };
      const { error: e2 } = await sb.from('books').update(up).eq('id', b.id);
      if (!e2) Object.assign(b, up);
    }));
    done += batch.length;
  }
  bar.remove(); seriesState.running = false;
  const n = new Set(S.books.filter((b) => b.series_name).map((b) => b.series_name)).size;
  toast(stop ? (stop === 'limit' || stop === 'no_key' ? deepErrorText(stop) : 'Hledání sérií se nepovedlo. Zkus to znovu.') : `Hotovo, máš knihy z ${n} ${plural(n, 'série', 'sérií', 'sérií')}`);
  if (!$sheet.innerHTML) render();
}
// All series she owns at least one part of, with parts from the catalogue.
function seriesList() {
  const names = [...new Set(S.books.filter((b) => b.series_name).map((b) => b.series_name))];
  return names.map((name) => {
    const owned = S.books.filter((b) => b.series_name === name);
    const cat = S.series.find((s) => s.name === name)?.parts || [];
    const idx = new Set([...cat.map((p) => p.index), ...owned.map((b) => +b.series_index).filter(Boolean)]);
    const ownedIdx = new Set(owned.filter((b) => b.list === 'library').map((b) => +b.series_index));
    return { name, owned, cat, total: idx.size, have: ownedIdx.size };
  }).sort((a, b) => cmpCs(a.name, b.name));
}
function openSeriesList() {
  const list = seriesList();
  const { el, close } = sheet(`${head('Série')}
    ${list.length ? `<div class="list">${list.map((s) => `<button class="li" data-ser="${esc(s.name)}" style="width:100%;text-align:left">
        <div class="ser-covers">${s.owned.slice(0, 3).map((b) => `<div class="thumb">${coverHtml(b)}</div>`).join('')}</div>
        <div class="grow"><b>${esc(s.name)}</b><span>máš ${s.have} z ${s.total}</span><div class="bar"><i style="width:${Math.round((s.have / Math.max(1, s.total)) * 100)}%"></i></div></div></button>`).join('')}</div>`
    : '<p class="sub">Zatím žádné série. V knihovně klikni na „Najít série“, nebo sérii vyplň v úpravě knihy.</p>'}`, null, openSeriesList);
  el.querySelectorAll('[data-ser]').forEach((b) => (b.onclick = () => { close(); openSeries(b.dataset.ser); }));
}
function openSeries(name) {
  const owned = S.books.filter((b) => b.series_name === name);
  const cat = S.series.find((s) => s.name === name)?.parts || [];
  const indices = [...new Set([...cat.map((p) => p.index), ...owned.map((b) => +b.series_index).filter(Boolean)])].sort((a, b) => a - b);
  const noIdx = owned.filter((b) => !b.series_index);
  const row = (i) => {
    const mine = owned.filter((b) => +b.series_index === i);
    const part = cat.find((p) => p.index === i);
    if (mine.length) return mine.map((b) => `<button class="li book" data-id="${b.id}" data-own="1" style="width:100%;text-align:left"><span class="ser-n">${i}</span><div class="thumb" style="width:36px">${coverHtml(b)}</div>
      <div class="grow"><b>${esc(b.title)}</b><span>${b.list === 'wishlist' ? 've wishlistu' : statusLabel(b)}${b.format && b.format !== 'book' ? ' · ' + fmtOne(b.format).toLowerCase() : ''}</span></div>${b.list === 'library' ? '<span class="ok">✓</span>' : ''}</button>`).join('');
    return `<div class="li missing"><span class="ser-n">${i}</span><div class="grow"><b>${esc(part?.title || `${i}. díl`)}</b><span>chybí</span></div><button class="mini" data-wish="${i}">Do wishlistu</button></div>`;
  };
  const have = new Set(owned.filter((b) => b.list === 'library').map((b) => +b.series_index));
  const { el, close } = sheet(`${head(name)}
    <p class="sub">Máš ${have.size} z ${indices.length} dílů</p>
    <div class="list" style="margin-top:12px">${indices.map(row).join('')}${noIdx.map((b) => `<button class="li book" data-id="${b.id}" data-own="1" style="width:100%;text-align:left"><span class="ser-n">?</span><div class="grow"><b>${esc(b.title)}</b><span>bez čísla dílu</span></div></button>`).join('')}</div>
    <p class="hint">Číslo dílu nebo sérii opravíš v úpravě knihy.</p>`, null, () => openSeries(name));
  el.querySelectorAll('.book').forEach((b) => (b.onclick = () => { close(); openBook(b.dataset.id, true); }));
  el.querySelectorAll('[data-wish]').forEach((btn) => (btn.onclick = async () => {
    const i = +btn.dataset.wish, part = cat.find((p) => p.index === i);
    const sample = owned[0] || {};
    btn.disabled = true;
    const { data: saved, error } = await sb.from('books').insert({ list: 'wishlist', title: part?.title || `${name} ${i}`, author: sample.author || null,
      language: sample.language || guessLang(part?.title), format: 'book', series_name: name, series_index: i, series_checked_at: new Date().toISOString() }).select();
    if (error) { btn.disabled = false; return toast('Nepodařilo se uložit.'); }
    await loadBooks(); toast('Přidáno do wishlistu'); close(); openSeries(name);
    if (saved?.[0]) enrichMany([saved[0]]);
  }));
}

/* ====================================================================
   Gift reservations (friend's wishlist) and loan requests
   ==================================================================== */
async function loadFriendReservations() {
  S.friendRes = {};
  const ids = S.friendBooks.filter((b) => b.list === 'wishlist').map((b) => b.id);
  if (!ids.length) return;
  const { data } = await sb.from('gift_reservations').select('book_id,reserver_id').in('book_id', ids);
  (data || []).forEach((r) => (S.friendRes[r.book_id] = r.reserver_id === me() ? 'me' : 'other'));
}
async function loadMyReservations() {
  const { data } = await sb.from('gift_reservations').select('book_id, created_at, books(title, author, owner_id)').eq('reserver_id', me());
  S.myRes = (data || []).filter((r) => r.books);
}
async function loadLoans() {
  const { data } = await sb.from('loan_requests').select('*, books(title, author)').order('created_at', { ascending: false });
  S.loanReqs = data || [];
}
const incomingLoans = () => (S.loanReqs || []).filter((r) => r.owner_id === me() && r.status === 'pending');
function friendsExtraHtml() {
  const inc = incomingLoans();
  const mine = (S.loanReqs || []).filter((r) => r.requester_id === me() && r.status !== 'closed').slice(0, 10);
  const name = (id) => esc(S.profilesById[id]?.display_name || 'Kamarádka');
  const ST = { pending: 'čeká na odpověď', accepted: 'půjčeno', declined: 'teď ne' };
  return `${inc.length ? `<h2>Žádosti o půjčení</h2><div class="list">${inc.map((r) => `<div class="li"><div class="grow"><b>${name(r.requester_id)} chce půjčit: ${esc(r.books?.title || '')}</b>
      ${r.message ? `<span>„${esc(r.message)}“</span>` : ''}<div class="row" style="margin-top:8px"><button class="mini primary" data-lend="${r.id}">Půjčit</button><button class="mini" data-nolend="${r.id}">Teď ne</button></div></div></div>`).join('')}</div>` : ''}
    ${(S.myRes || []).length ? `<h2>Dárky, které jsem zamluvila</h2><div class="list">${S.myRes.map((r) => `<div class="li"><div class="grow"><b>${esc(r.books.title)}</b><span>pro ${name(r.books.owner_id)}${r.books.author ? ' · ' + esc(r.books.author) : ''}</span></div><button class="mini" data-unres="${r.book_id}">Zrušit</button></div>`).join('')}</div>` : ''}
    ${mine.length ? `<h2>Moje žádosti o půjčení</h2><div class="list">${mine.map((r) => `<div class="li"><div class="grow"><b>${esc(r.books?.title || '')}</b><span>od ${name(r.owner_id)} · ${ST[r.status] || r.status}</span></div>${r.status === 'pending' ? `<button class="mini" data-cancelreq="${r.id}">Zrušit</button>` : ''}</div>`).join('')}</div>` : ''}`;
}
function bindFriendsExtra() {
  $app.querySelectorAll('[data-lend]').forEach((b) => (b.onclick = async () => {
    const r = S.loanReqs.find((x) => x.id === b.dataset.lend); if (!r) return;
    b.disabled = true;
    const who = S.profilesById[r.requester_id]?.display_name || null;
    const { error } = await sb.from('books').update({ loan_type: 'lent', loan_person: who }).eq('id', r.book_id);
    if (error) { b.disabled = false; return toast('Nepodařilo se uložit.'); }
    await sb.from('loan_requests').update({ status: 'accepted' }).eq('id', r.id);
    await Promise.all([loadBooks(), loadLoans()]); toast(`Půjčeno: ${who || ''}`); render();
  }));
  $app.querySelectorAll('[data-nolend]').forEach((b) => (b.onclick = async () => {
    await sb.from('loan_requests').update({ status: 'declined' }).eq('id', b.dataset.nolend);
    await loadLoans(); render();
  }));
  $app.querySelectorAll('[data-cancelreq]').forEach((b) => (b.onclick = async () => {
    await sb.from('loan_requests').delete().eq('id', b.dataset.cancelreq); await loadLoans(); render();
  }));
  $app.querySelectorAll('[data-unres]').forEach((b) => (b.onclick = async () => {
    await sb.from('gift_reservations').delete().eq('book_id', b.dataset.unres); await loadMyReservations(); render();
  }));
}
// Buttons in the detail of a FRIEND's book.
function friendBookActions(b) {
  if (b.list === 'wishlist') {
    const r = S.friendRes?.[b.id];
    if (r === 'me') return `<div class="card res-card"><b>${I.heart} Zamluvila sis ji jako dárek</b><span>${esc(S.friend?.display_name || 'Kamarádka')} to nevidí.</span><button class="mini" id="unres">Zrušit zamluvení</button></div>`;
    if (r === 'other') return `<p class="hint" style="text-align:center">Už je zamluvená jako dárek.</p>`;
    return `<button class="btn" id="res">${I.heart}Zamluvit jako dárek</button><p class="hint" style="text-align:center;margin-top:-4px">${esc(S.friend?.display_name || 'Kamarádka')} neuvidí, že je zamluvená. Ostatní ano.</p>`;
  }
  const mine = (S.loanReqs || []).find((x) => x.book_id === b.id && x.requester_id === me() && ['pending', 'accepted'].includes(x.status));
  if (mine?.status === 'accepted' && b.loan_type === 'lent') return `<p class="hint" style="text-align:center">Máš ji půjčenou.</p>`;
  if (b.loan_type === 'lent') return `<p class="hint" style="text-align:center">Teď je půjčená.</p>`;
  if (mine?.status === 'pending') return `<div class="card res-card"><b>Žádost o půjčení odeslána</b><span>Čeká na odpověď.</span><button class="mini" id="unloan">Zrušit žádost</button></div>`;
  return `<button class="btn" id="borrow">${I.books}Půjčíš mi ji?</button>`;
}
function bindFriendBookActions(el, b, close) {
  const res = el.querySelector('#res');
  if (res) res.onclick = async () => {
    res.disabled = true;
    const { error } = await sb.from('gift_reservations').insert({ book_id: b.id });
    if (error) { res.disabled = false; return toast(error.code === '23505' ? 'Už ji mezitím někdo zamluvil.' : 'Nepodařilo se zamluvit.'); }
    S.friendRes[b.id] = 'me'; await loadMyReservations(); close(); render(); toast('Zamluveno jako dárek');
  };
  const unres = el.querySelector('#unres');
  if (unres) unres.onclick = async () => {
    await sb.from('gift_reservations').delete().eq('book_id', b.id);
    delete S.friendRes[b.id]; await loadMyReservations(); close(); render(); toast('Zamluvení zrušeno');
  };
  const borrow = el.querySelector('#borrow');
  if (borrow) borrow.onclick = () => {
    close();
    const s = sheet(`${head('Půjčíš mi ji?')}
      <p class="sub">${esc(b.title)} · od ${esc(S.friend?.display_name || '')}</p>
      <label class="f" for="lmsg">Zpráva (nepovinné)</label><textarea class="inp" id="lmsg" maxlength="300" placeholder="Vrátím do konce měsíce :)"></textarea>
      <div class="err" id="lerr"></div><button class="btn primary" id="lsend" style="margin-top:8px">Poslat žádost</button>`);
    s.el.querySelector('#lsend').onclick = async () => {
      const { error } = await sb.from('loan_requests').insert({ book_id: b.id, owner_id: b.owner_id, message: s.el.querySelector('#lmsg').value.trim() || null });
      if (error) return (s.el.querySelector('#lerr').textContent = error.code === '23505' ? 'Žádost už jsi poslala.' : 'Nepodařilo se odeslat.');
      await loadLoans(); s.close(); toast('Žádost odeslána'); render();
    };
  };
  const unloan = el.querySelector('#unloan');
  if (unloan) unloan.onclick = async () => {
    const r = S.loanReqs.find((x) => x.book_id === b.id && x.requester_id === me() && x.status === 'pending');
    if (r) await sb.from('loan_requests').delete().eq('id', r.id);
    await loadLoans(); close(); toast('Žádost zrušena');
  };
}

/* ---------- Boot ---------- */
async function boot() {
  if (!S.session) return renderAuth();
  await loadProfile();
  if (!S.profile) return renderProfileSetup();
  await Promise.all([loadBooks(), loadFriends(), loadGoals(), loadSeries(), loadLoans(), loadMyReservations(), loadFavs()]);
  let pritel = null;
  try { pritel = localStorage.getItem('tsundoku_pritel'); localStorage.removeItem('tsundoku_pritel'); } catch (e) {}
  if (pritel) {
    S.view = 'friends'; render();
    if (pritel !== S.profile.username) await addFriend(pritel);
    return;
  }
  render();
  if (S.recovery) { S.recovery = false; openPassword(true); }
  setTimeout(backfillCovers, 1500);
}
// Once a day, quietly try free catalogues for books that still have no cover.
async function backfillCovers() {
  const day = new Date().toISOString().slice(0, 10);
  let tried = {};
  try { tried = JSON.parse(localStorage.getItem('tsundoku_cover_tried2') || '{}'); if (tried.day !== day) tried = { day, ids: [] }; } catch (e) { tried = { day, ids: [] }; }
  const todo = S.books.filter((b) => !safeUrl(b.cover_url) && !tried.ids.includes(b.id)).slice(0, 60);
  if (!todo.length) return;
  let changed = 0;
  for (const b of todo) {
    tried.ids.push(b.id);
    try {
      let up = null;
      const c = await findCover(b.isbn, b.title, b.author);
      if (c) up = { cover_url: c, cover_is_original: false };
      else { const o = await findOriginalCover(b.original_title, b.author); if (o) up = { cover_url: o, cover_is_original: true }; }
      if (up) { const { error } = await sb.from('books').update(up).eq('id', b.id); if (!error) { Object.assign(b, up); changed++; } }
    } catch (e) {}
  }
  try { localStorage.setItem('tsundoku_cover_tried2', JSON.stringify(tried)); } catch (e) {}
  if (changed && !$sheet.innerHTML) render();
}
{
  const p = new URLSearchParams(location.search).get('pritel');
  if (p) { try { localStorage.setItem('tsundoku_pritel', p); } catch (e) {} history.replaceState(null, '', location.pathname); }
}
let booted = false;
sb.auth.onAuthStateChange((ev, session) => {
  // Opened the "forgotten password" link: ask for a new password once the app has loaded.
  if (ev === 'PASSWORD_RECOVERY') { if (S.profile && booted) setTimeout(() => openPassword(true), 300); else S.recovery = true; }
  const changedUser = (S.session?.user?.id || null) !== (session?.user?.id || null);
  S.session = session;
  if (!booted || changedUser) {
    booted = true;
    if (!session) { S.profile = null; S.books = []; S.friendships = []; S.friend = null; S.view = 'library'; }
    setTimeout(boot, 0);
  }
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
