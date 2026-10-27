const SUPABASE_URL = 'https://ukwoxnidopkcpcimhcrc.supabase.co';
// Google Books key: free (1000 requests/day), restricted to forkitneratovice.github.io and Books API only.
const GBOOKS_KEY = 'AIzaSyBMw_pc99KNGulZW7m3Yg-LLSSWTeMd5yE';
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
  tablet: ic('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6M9 11h6M9 15h3"/>'),
  headphones: ic('<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="5" height="7" rx="2"/><rect x="16" y="14" width="5" height="7" rx="2"/>'),
  grid: ic('<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>'),
  list: ic('<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>'),
  user: ic('<circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>'),
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initials = (n) => (n || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
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
const grSurname = (a) => ((a || '').split(/[ ,]+/).filter(Boolean).pop() || '').replace(/ov[áa]$/i, '');
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
  // Czech feminine surnames: Flynnová → Flynn, Jacksonová → Jackson
  const last = ((author || '').split(/[ ,]+/).filter(Boolean).pop() || '').replace(/ov[áa]$/i, '');
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
  if (!b.gr_url && !up.gr_url) { try { const g = await resolveGoodreads({ ...b, ...up }); if (g) up.gr_url = g; } catch (e) {} }
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
  tagMany(S.books.filter((b) => ids.has(b.id) && !b.tagged_at));
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

async function lookupIsbnCatalogs(isbn) {
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
    <p class="about-line">積ん読 · kupovat knihy a nechat je ležet na hromádce nepřečtené</p>
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

/* ---------- Book lists: search, filters, sorting, grid/list ---------- */
const PREFS_KEY = 'tsundoku_prefs';
const prefs = (() => { try { return { layout: 'grid', sort: 'added', ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }; } catch (e) { return { layout: 'grid', sort: 'added' }; } })();
const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) {} };
// Per-screen state: search text, status filter, genre.
const UI = { library: { q: '', filter: 'all', genre: '', format: 'book', lang: '' }, wishlist: { q: '', filter: 'all', genre: '', format: 'all', lang: '' }, friend: { q: '', filter: 'all', genre: '', format: 'book', lang: '' } };
const filtersFor = (audio) => [['all', 'Vše'], ['read', audio ? 'Poslechnuto' : 'Přečteno'], ['reading', audio ? 'Poslouchám' : 'Čtu'], ['unread', audio ? 'Neposlechnuto' : 'Nepřečteno'], ['paused', 'Odloženo'], ['loaned', 'Půjčené']];
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
  return sortBooks(books.filter((b) => {
    if (!u.q && u.format && u.format !== 'all' && (b.format || 'book') !== u.format) return false;
    if (u.filter === 'loaned') { if (!b.loan_type) return false; }
    else if (u.filter !== 'all' && b.status !== u.filter) return false;
    if (u.genre && !(b.tags || []).includes(u.genre)) return false;
    if (u.lang && (b.language || 'cs') !== u.lang) return false;
    return matchQ(b, u.q);
  }), prefs.sort);
}
const loanText = (b) => (b.loan_type === 'lent' ? `Půjčeno${b.loan_person ? ': ' + b.loan_person : ''}` : b.loan_type === 'borrowed' ? `Vypůjčeno${b.loan_person ? ' od: ' + b.loan_person : ''}` : '');
function booksHtml(list, own = true) {
  if (prefs.layout === 'list') {
    const swipeable = (b) => own && b.list === 'library';
    // Always offer just "reading" and "read"; the current one is ticked ("read" again lets her change the rating).
    const acts = (b) => ['reading', 'read'].map((k) => `<button type="button" class="sw-btn st-${k}${b.status === k ? ' cur' : ''}" data-setst="${k}" data-bid="${b.id}">${b.status === k ? '✓ ' : ''}${statusMap(isAudio(b))[k]}</button>`).join('');
    return `<div class="list blist">${list.map((b) => `${swipeable(b) ? `<div class="swipe" data-sid="${b.id}"><div class="sw-actions">${acts(b)}</div>` : ''}<button class="book brow" data-id="${b.id}" data-own="${own ? 1 : 0}">
      <div class="thumb">${coverHtml(b)}</div>
      <div class="grow"><b>${esc(b.title)}</b><span>${esc([b.author, b.year].filter(Boolean).join(' · '))}</span>
        <div class="meta">${b.rating ? `<span class="stars">${starsTxt(b.rating)}</span>` : ''}${b.language && b.language !== 'cs' ? `<span class="lang">${b.language.toUpperCase()}</span>` : ''}
          ${b.list === 'library' ? `<span class="pill sm st-${b.status}">${statusLabel(b)}</span>` : ''}
          ${b.loan_type ? `<span class="pill sm wine">${esc(loanText(b))}</span>` : ''}
          ${(b.tags || []).slice(0, 3).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div></div></button>${swipeable(b) ? '</div>' : ''}`).join('')}</div>
      ${list.some(swipeable) && !hintSeen() ? '<p class="hint" style="text-align:center">Tip: posuň knihu prstem doleva a rychle ji označíš jako Čtu nebo Přečteno.</p>' : ''}`;
  }
  return `<div class="grid">${list.map((b) => `<button class="book" data-id="${b.id}" data-own="${own ? 1 : 0}">
    ${coverHtml(b)}<div class="t">${b.language && b.language !== 'cs' ? `<span class="lang">${b.language.toUpperCase()}</span> ` : ''}${esc(b.title)}</div><div class="a">${esc(b.author || '')}</div>
    ${b.rating ? `<div class="stars">${starsTxt(b.rating)}</div>` : ''}
    ${b.loan_type ? `<div class="loan">${esc(loanText(b))}</div>` : ''}</button>`).join('')}</div>`;
}
// Search box with clear button + status chips + sort / genre / layout toolbar.
function langChips(key, books) {
  const u = UI[key], cnt = {};
  books.forEach((b) => { const l = b.language || 'cs'; cnt[l] = (cnt[l] || 0) + 1; });
  const langs = LANGS.filter(([k]) => cnt[k]);
  if (langs.length < 2 && !u.lang) return '';
  return `<div class="chips langs">${langs.map(([k, l]) => `<button class="chip sm ${u.lang === k ? 'on' : ''}" data-lang="${k}" data-langk="${key}">${l} <span class="n">${cnt[k]}</span></button>`).join('')}</div>`;
}
function controlsHtml(key, booksAll, { chips = true, placeholder = 'Hledat' } = {}) {
  const u = UI[key];
  const nF = { book: 0, ebook: 0, audio: 0 };
  booksAll.forEach((b) => (nF[b.format || 'book'] = (nF[b.format || 'book'] || 0) + 1));
  if (key !== 'library' && u.format !== 'all' && u.format !== 'book' && !nF[u.format]) u.format = 'book';
  const showFmt = key === 'library' || (key === 'friend' && (nF.audio || nF.ebook));
  const books = u.format === 'all' ? booksAll : booksAll.filter((b) => (b.format || 'book') === u.format);
  const counts = {};
  books.forEach((b) => (b.tags || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
  const genres = Object.keys(counts).sort(cmpCs);
  if (u.genre && !counts[u.genre]) u.genre = '';
  return `${showFmt ? `<div class="seg fmtseg">${[['all', 'Vše', booksAll.length], ...FORMATS.map(([k, , , sh]) => [k, sh, nF[k]])].map(([k, l, n]) => `<button type="button" data-fmt="${k}" data-fmtk="${key}" class="${u.format === k ? 'on' : ''}">${k === 'all' ? '' : fmtIcon(k)}${l} <span class="n">${n}</span></button>`).join('')}</div>` : ''}
    <div class="searchbox"><span class="sico">${I.search}</span>
      <input class="search" data-q="${key}" type="text" inputmode="search" enterkeyhint="search" placeholder="${esc(placeholder)}" value="${esc(u.q)}" autocomplete="off">
      <button class="sclear" data-clear="${key}" aria-label="Smazat hledání" ${u.q ? '' : 'hidden'}>${I.x}</button></div>
    ${langChips(key, books)}
    ${chips ? `<div class="chips">${filtersFor(u.format === 'audio').map(([k, l]) => `<button class="chip ${u.filter === k ? 'on' : ''}" data-f="${k}" data-fk="${key}">${l}</button>`).join('')}</div>` : ''}
    <div class="toolbar">
      <select class="sel" data-sort aria-label="Řazení">${SORTS.map(([k, l]) => `<option value="${k}" ${prefs.sort === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
      ${genres.length ? `<select class="sel" data-genre="${key}" aria-label="Žánr"><option value="">Žánr: vše</option>${genres.map((g) => `<option value="${esc(g)}" ${u.genre === g ? 'selected' : ''}>${esc(g)} (${counts[g]})</option>`).join('')}</select>` : ''}
      <div class="seg layout"><button type="button" data-layout="grid" class="${prefs.layout === 'grid' ? 'on' : ''}" aria-label="Obálky">${I.grid}</button><button type="button" data-layout="list" class="${prefs.layout === 'list' ? 'on' : ''}" aria-label="Seznam">${I.list}</button></div>
    </div>
    <div id="results-${key}"></div>`;
}
const listSource = (key) => key === 'library' ? S.books.filter((b) => b.list === 'library')
  : key === 'wishlist' ? S.books.filter((b) => b.list === 'wishlist')
  : S.friendBooks.filter((b) => b.list === S.friendTab);
function updateResults(key) {
  const box = document.getElementById('results-' + key);
  if (!box) return;
  const u = UI[key];
  const all = listSource(key).filter((b) => u.q || !u.format || u.format === 'all' || (b.format || 'book') === u.format);
  const list = applyUI(all, key);
  const filtered = list.length !== all.length;
  const across = u.q && u.format !== 'all' && listSource(key).some((b) => (b.format || 'book') !== u.format);
  box.innerHTML = (across ? `<p class="count">Hledám ve všem: v knihách, e-knihách i audioknihách</p>` : '')
    + (filtered && !across ? `<p class="count">${list.length} z ${all.length}${u.genre ? ` · žánr ${esc(u.genre)} <button class="link" data-genre-off="${key}">zrušit</button>` : ''}${u.lang ? ` · ${LANG_NAME[u.lang]}` : ''}</p>` : '')
    + (list.length ? booksHtml(list, key !== 'friend')
      : key === 'library' && (u.format === 'audio' || u.format === 'ebook') && !u.q && !listSource(key).some((b) => b.format === u.format)
        ? (u.format === 'audio'
          ? `<div class="empty"><h3>Zatím žádné audioknihy</h3><p>Přidej první. Stačí název, nebo screenshot z aplikace, kde posloucháš. Ze screenshotu jich přidáš i víc najednou.</p><br><button class="btn primary" data-addfmt2="audio">${I.headphones}Přidat audioknihy</button></div>`
          : `<div class="empty"><h3>Zatím žádné e-knihy</h3><p>Přidej první. Stačí název, nebo screenshot knihovny z Kindlu či jiné čtečky. Ze screenshotu jich přidáš i víc najednou.</p><br><button class="btn primary" data-addfmt2="ebook">${I.tablet}Přidat e-knihy</button></div>`)
        : `<div class="empty">Nic tu neodpovídá hledání ani filtru.</div>`);
  const aa = box.querySelector('[data-addfmt2]'); if (aa) aa.onclick = () => { S.defaultFormat = aa.dataset.addfmt2; S.defaultList = 'library'; S.view = 'add'; render(); window.scrollTo(0, 0); };
  box.querySelectorAll('.book').forEach((b) => (b.onclick = () => {
    if (b.dataset.swiped) { delete b.dataset.swiped; return; }
    if (closeSwipes(box)) return;
    openBook(b.dataset.id, b.dataset.own === '1');
  }));
  bindSwipes(box, key);
  const off = box.querySelector('[data-genre-off]'); if (off) off.onclick = () => { u.genre = ''; render(); };
}
function bindControls() {
  $app.querySelectorAll('[data-q]').forEach((inp) => {
    const key = inp.dataset.q, clr = $app.querySelector(`[data-clear="${key}"]`);
    inp.oninput = () => { UI[key].q = inp.value; clr.hidden = !inp.value; updateResults(key); };
    inp.onkeydown = (e) => { if (e.key === 'Enter') inp.blur(); };
    clr.onclick = () => { inp.value = ''; UI[key].q = ''; clr.hidden = true; updateResults(key); inp.focus(); };
  });
  $app.querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => { UI[b.dataset.fk].filter = b.dataset.f; render(); }));
  $app.querySelectorAll('[data-sort]').forEach((sel) => (sel.onchange = () => { prefs.sort = sel.value; savePrefs(); $app.querySelectorAll('[id^="results-"]').forEach((r) => updateResults(r.id.slice(8))); }));
  $app.querySelectorAll('[data-genre]').forEach((sel) => (sel.onchange = () => { UI[sel.dataset.genre].genre = sel.value; updateResults(sel.dataset.genre); }));
  $app.querySelectorAll('[data-lang]').forEach((b) => (b.onclick = () => { const u = UI[b.dataset.langk]; u.lang = u.lang === b.dataset.lang ? '' : b.dataset.lang; render(); }));
  $app.querySelectorAll('[data-fmt]').forEach((b) => (b.onclick = () => { const u = UI[b.dataset.fmtk]; u.format = b.dataset.fmt; u.filter = 'all'; u.genre = ''; render(); }));
  $app.querySelectorAll('[data-layout]').forEach((b) => (b.onclick = () => { prefs.layout = b.dataset.layout; savePrefs(); render(); }));
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
  b.status = status; b.updated_at = new Date().toISOString();
  updateResults(key);
  const { error } = await sb.from('books').update({ status }).eq('id', b.id);
  if (error) { b.status = prev; updateResults(key); return toast('Nepodařilo se uložit. Zkus to znovu.'); }
  if (status === 'read') askRating(b, key);
  else toast(`${b.title}: ${statusLabel(b)}`);
}
function askRating(b, key) {
  let r = b.rating || 0;
  const { el, close } = sheet(`${head(isAudio(b) ? 'Poslechnuto! Jak se ti líbila?' : 'Přečteno! Jak se ti líbila?')}
    <div class="detail" style="align-items:center"><div class="rcv">${coverHtml(b)}</div><div><b>${esc(b.title)}</b><p class="sub">${esc(b.author || '')}</p></div></div>
    <div class="rate big" id="qr">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-n="${n}" class="${r >= n ? 'on' : ''}" aria-label="${n} z 5">★</button>`).join('')}</div>
    <div class="stack" style="margin-top:12px"><button class="btn primary" id="qrs">Uložit hodnocení</button><button class="btn ghost" id="qrx">Teď ne</button></div>`);
  const draw = () => el.querySelectorAll('#qr button').forEach((x) => x.classList.toggle('on', r >= +x.dataset.n));
  el.querySelectorAll('#qr button').forEach((x) => (x.onclick = () => { r = +x.dataset.n; draw(); }));
  el.querySelector('#qrx').onclick = () => { close(); toast(`${b.title}: ${statusLabel(b)}`); };
  el.querySelector('#qrs').onclick = async () => {
    if (!r) return close();
    const { error } = await sb.from('books').update({ rating: r }).eq('id', b.id);
    close();
    if (error) return toast('Hodnocení se nepodařilo uložit.');
    b.rating = r; updateResults(key); toast(`${b.title}: ${starsTxt(r)}`);
  };
}

function viewLibrary() {
  const lib = S.books.filter((b) => b.list === 'library');
  const year = new Date().getFullYear();
  const readYear = lib.filter((b) => b.status === 'read' && new Date(b.updated_at).getFullYear() === year).length;
  const loaned = lib.filter((b) => b.loan_type).length;
  const nA = lib.filter(isAudio).length, nE = lib.filter(isEbook).length, nB = lib.length - nA - nE;
  return `<div class="top"><div><button class="h1btn" id="about" aria-label="Co znamená tsundoku"><h1>Tsundoku</h1><span class="jp">積ん読</span></button><p class="sub">${nB} ${plural(nB, 'kniha', 'knihy', 'knih')}${nE ? ` · ${nE} ${plural(nE, 'e-kniha', 'e-knihy', 'e-knih')}` : ''}${nA ? ` · ${nA} ${plural(nA, 'audiokniha', 'audioknihy', 'audioknih')}` : ''} · ${readYear} letos dočteno${loaned ? ` · ${loaned} půjčeno` : ''}</p></div>
    <button class="icon-btn" id="me" aria-label="Můj účet">${I.user}</button></div>
    ${missingBanner()}${tagBanner()}
    ${lib.length ? controlsHtml('library', lib, { placeholder: 'Hledat název, autora, žánr…' })
    : `<div class="empty"><h3>Začni plnit knihovnu</h3><p>Naskenuj čárový kód na zadní straně knihy nebo vyfoť obálku.</p><br><button class="btn primary" data-go="add">${I.scan}Přidat první knihu</button></div>`}`;
}
function missingBanner() {
  const miss = S.books.filter((b) => !b.enriched_at && !enrichState.ids.has(b.id));
  if (!miss.length || enrichState.ids.size) return '';
  const kc = Math.max(1, Math.round(miss.length * 0.5));
  return `<div class="card banner"><div class="grow"><b>U ${miss.length} ${plural(miss.length, 'knihy', 'knih', 'knih')} chybí děj a údaje</b>
    <span>Rok, nakladatel, obálka a o čem kniha je. Asi ${kc} Kč celkem.</span></div><button class="mini primary" id="enr-all">Doplnit</button></div>`;
}
function tagBanner() {
  const miss = S.books.filter((b) => !b.tagged_at);
  if (!miss.length || tagState.running || enrichState.ids.size) return '';
  return `<div class="card banner"><div class="grow"><b>${miss.length} ${plural(miss.length, 'kniha nemá', 'knihy nemají', 'knih nemá')} žánry</b>
    <span>Přiřadí je AI podle názvu, autora a děje. Za celou knihovnu méně než 1 Kč.</span></div><button class="mini primary" id="tag-all">Přiřadit</button></div>`;
}
function viewWishlist() {
  const w = S.books.filter((b) => b.list === 'wishlist');
  return `<div class="top"><div><h1>Wishlist</h1><p class="sub">Knihy, které chceš. Přátelé je uvidí, až budou vybírat dárek.</p></div></div>
    ${w.length ? controlsHtml('wishlist', w, { chips: false, placeholder: 'Hledat ve wishlistu' })
    : `<div class="empty"><h3>Zatím nic nechceš?</h3><p>Při přidávání knihy zvol „Wishlist“ místo „Knihovna“.</p><br><button class="btn primary" data-go="add" data-list="wishlist">${I.heart}Přidat do wishlistu</button></div>`}`;
}
function viewAdd() {
  const f = S.defaultFormat || 'book', audio = f === 'audio', ebook = f === 'ebook', digital = audio || ebook;
  const word = audio ? 'audioknih' : 'e-knih';
  return `<div class="top"><div><h1>${audio ? 'Přidat audioknihu' : ebook ? 'Přidat e-knihu' : 'Přidat knihu'}</h1><p class="sub">Údaje a obálku doplníme automaticky.</p></div></div>
  <div class="seg fmtseg" style="margin-bottom:14px">${FORMATS.map(([k, , one]) => `<button type="button" data-addfmt="${k}" class="${f === k ? 'on' : ''}">${fmtIcon(k)}${one}</button>`).join('')}</div>
  <div class="add-opts">
    ${digital ? `<button class="add-opt" id="o-list"><div class="ic">${fmtIcon(f)}</div><div><b>Víc ${word} ze screenshotu</b><span>${audio ? 'Screenshot knihovny z Audiolibrixu, Storytelu…' : 'Screenshot knihovny z Kindlu, Palmknih, Kosmasu…'} AI vypíše všechny, seznam pak zkontroluješ.</span></div></button>`
      : `<button class="add-opt" id="o-shelf"><div class="ic">${I.books}</div><div><b>Vyfotit celou poličku</b><span>Víc knih najednou podle hřbetů. Seznam pak zkontroluješ.</span></div></button>`}
    <button class="add-opt" id="o-search"><div class="ic">${I.search}</div><div><b>Najít podle názvu</b><span>Nebo zadat úplně ručně.</span></div></button>
    <button class="add-opt" id="o-photo"><div class="ic">${I.camera}</div><div><b>${digital ? 'Fotka nebo screenshot jedné obálky' : 'Vyfotit obálku'}</b><span>${digital ? 'Pozná ji AI.' : 'Pro knihy bez kódu. Pozná ji AI.'}</span></div></button>
    ${digital ? '' : `<button class="add-opt" id="o-scan"><div class="ic">${I.barcode}</div><div><b>Naskenovat čárový kód</b><span>Kód ISBN na zadní straně. Nejrychlejší.</span></div></button>`}
  </div>
  <input type="file" id="photo-in" accept="image/*" ${digital ? '' : 'capture="environment"'} hidden>
  <input type="file" id="shelf-in" accept="image/*" hidden>
  ${digital ? '<p class="hint" style="margin-top:16px">Tip: na screenshotu ať jsou vidět názvy celé. Když je seznam dlouhý, udělej víc screenshotů a nahraj je postupně.</p>' : '<p class="hint" style="margin-top:16px">Tip pro poličku: foť zepředu, rovně a při dobrém světle, nejvýš jednu nebo dvě police najednou, aby byly hřbety čitelné.</p>'}`;
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
  const all = S.friendBooks.filter((b) => b.list === S.friendTab);
  const chip = (k, l) => `<button class="chip ${S.friendTab === k ? 'on' : ''}" data-ft="${k}">${l}</button>`;
  return `<button class="back" id="back">${I.left}Přátelé</button>
    <div class="top"><div><h1>${esc(p.display_name)}</h1><p class="sub">@${esc(p.username)} · ${S.friendBooks.filter((b) => b.list === 'library').length} knih</p></div><div class="av">${esc(initials(p.display_name))}</div></div>
    <div class="chips">${chip('library', 'Knihovna')}${chip('wishlist', 'Wishlist')}</div>
    ${all.length ? controlsHtml('friend', all, { chips: false, placeholder: 'Hledat' }) : `<div class="empty">${S.friendTab === 'wishlist' ? 'Wishlist je zatím prázdný.' : 'Knihovna je zatím prázdná.'}</div>`}`;
}
const plural = (n, a, b, c) => (n === 1 ? a : n >= 2 && n <= 4 ? b : c);

function bindView() {
  $app.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => { S.view = b.dataset.go; S.defaultList = b.dataset.list || 'library'; render(); }));
  $app.querySelectorAll('[data-ft]').forEach((b) => (b.onclick = () => { S.friendTab = b.dataset.ft; UI.friend.genre = ''; render(); }));
  bindControls();
  const ta = document.getElementById('tag-all'); if (ta) ta.onclick = () => tagMany(S.books.filter((b) => !b.tagged_at));
  const meBtn = document.getElementById('me'); if (meBtn) meBtn.onclick = openAccount;
  const ab = document.getElementById('about'); if (ab) ab.onclick = openAbout;
  const ea = document.getElementById('enr-all'); if (ea) ea.onclick = () => { enrichMany(S.books.filter((b) => !b.enriched_at)); render(); };
  const back = document.getElementById('back'); if (back) back.onclick = () => { S.friend = null; render(); };

  if (S.view === 'add') {
    $app.querySelectorAll('[data-addfmt]').forEach((b) => (b.onclick = () => { S.defaultFormat = b.dataset.addfmt; render(); }));
    const osc = document.getElementById('o-scan'); if (osc) osc.onclick = openScanner;
    document.getElementById('o-search').onclick = () => openSearch();
    const pin = document.getElementById('photo-in');
    document.getElementById('o-photo').onclick = () => pin.click();
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
  S.friend = S.profilesById[id]; S.friendBooks = data || []; S.friendTab = 'library'; UI.friend = { q: '', filter: 'all', genre: '', format: 'book', lang: '' }; render(); window.scrollTo(0, 0);
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
  const meta = [LANG_NAME[b.language || 'cs'], isAudio(b) && b.narrator && `čte ${b.narrator}`, (isAudio(b) || isEbook(b)) && b.audio_source, b.publisher, b.original_title && `orig. ${b.original_title}`].filter(Boolean).join(' · ');
  const { el, close } = sheet(`${head('')}
    <div class="detail"><div id="dcv">${coverHtml(b)}${b.cover_is_original && safeUrl(b.cover_url) ? '<p class="cover-note">Obálka originálu</p>' : ''}</div><div><h2>${esc(b.title)}</h2><p class="sub">${esc([b.author, b.year].filter(Boolean).join(' · '))}</p>
      ${meta ? `<p class="sub" style="font-size:12px">${esc(meta)}</p>` : ''}
      ${b.rating ? `<div class="stars" style="font-size:18px">${starsTxt(b.rating)}</div>` : ''}
      <span class="pill ${b.list === 'wishlist' ? 'wine' : 'st-' + b.status}">${b.list === 'wishlist' ? 'Wishlist' : statusLabel(b)}</span>${isAudio(b) || isEbook(b) ? `<span class="pill">${fmtOne(b.format)}</span>` : ''}
      ${b.loan_type ? `<span class="pill wine">${esc(loanText(b))}</span>` : ''}</div></div>
    ${(b.tags || []).length ? `<div class="tags-row">${b.tags.map((t) => `<button class="tag big" data-tag="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : ''}
    ${b.description ? `<label class="f">O čem to je</label><p class="desc">${esc(b.description)}</p>`
      : own ? `<div class="card" style="padding:10px 12px;margin-top:10px"><p class="sub" style="margin-bottom:8px">${pending ? 'Děj a údaje se právě dohledávají…' : 'Děj ani podrobnosti zatím nemáme.'}</p>
        ${pending ? '' : `<button class="mini primary" id="enr">Dohledat děj a údaje</button>`}</div>` : ''}
    ${b.note ? `<label class="f">${own ? 'Moje poznámka' : 'Poznámka'}</label><div class="card" style="padding:10px 12px;font-size:14px;white-space:pre-wrap">${esc(b.note)}</div>` : ''}
    <div class="stack" style="margin-top:16px">
      <div class="row"><a class="btn" id="gr" href="${esc(goodreadsUrl(b))}" target="_blank" rel="noopener">${I.ext}Goodreads</a>
        <a class="btn" href="${esc(dbkUrl(b))}" target="_blank" rel="noopener">${I.ext}Databáze knih</a></div>
      ${own ? `<button class="btn primary" id="ed">${I.edit}Upravit, hodnotit</button>
        <button class="btn" id="cph">${I.camera}${safeUrl(b.cover_url) ? 'Vyměnit obálku za vlastní fotku' : 'Vyfotit obálku'}</button>
        <input type="file" id="cph-in" accept="image/*" capture="environment" hidden>
        ${b.list === 'wishlist' ? `<button class="btn" id="mv">${I.books}Mám ji, přesunout do knihovny</button>` : ''}`
      : (iHave ? `<p class="hint" style="text-align:center">Tuhle knihu už máš.</p>` : `<button class="btn wine" id="want">${I.heart}Chci ji taky (do wishlistu)</button>`)}
    </div>
    ${friendsHave.length ? `<label class="f" style="margin-top:16px">Mají ji i přátelé</label><div class="friends-have">${friendsHave.map((p) => `<span class="av sm" title="${esc(p.display_name)}">${esc(initials(p.display_name))}</span>`).join('')}</div>` : ''}`);
  el.querySelectorAll('[data-tag]').forEach((t) => (t.onclick = () => {
    close();
    const key = own ? (b.list === 'wishlist' ? 'wishlist' : 'library') : 'friend';
    UI[key] = { q: '', filter: 'all', genre: t.dataset.tag, format: key === 'wishlist' ? 'all' : (b.format || 'book'), lang: '' };
    if (own) S.view = key; else S.friendTab = b.list;
    render(); window.scrollTo(0, 0);
  }));
  if (!b.gr_url) resolveGoodreads(b).then(async (u) => {
    if (!u) return;
    const a = el.querySelector('#gr'); if (a) a.href = u;
    b.gr_url = u;
    if (own) await sb.from('books').update({ gr_url: u }).eq('id', b.id);
  });
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
      await sb.from('books').update({ cover_url: url, cover_is_original: false }).eq('id', b.id);
      b.cover_url = url; b.cover_is_original = false; close(); render(); openBook(b.id, true); toast('Obálka uložena');
    };
    const mv = el.querySelector('#mv');
    if (mv) mv.onclick = async () => { await sb.from('books').update({ list: 'library' }).eq('id', b.id); await loadBooks(); close(); toast('Přesunuto do knihovny'); render(); };
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

function openEditor(data, isNew = false, photoFile = null) {
  const d = { list: S.defaultList || 'library', format: S.defaultFormat || 'book', status: 'unread', rating: null, note: '', loan_type: null, loan_person: '', narrator: '', audio_source: '', ...data };
  if (!d.format) d.format = 'book';
  if (!d.language) d.language = guessLang(d.title);
  d.tags = [...(data.tags || [])];
  const allTags = [...new Set([...GENRES, ...S.books.flatMap((b) => b.tags || [])])].sort(cmpCs);
  const { el, close } = sheet(`${head(isNew ? ({ audio: 'Nová audiokniha', ebook: 'Nová e-kniha' }[d.format] || 'Nová kniha') : ({ audio: 'Upravit audioknihu', ebook: 'Upravit e-knihu' }[d.format] || 'Upravit knihu'))}
    <form id="bf" novalidate>
      <div class="detail"><div id="cv" style="width:80px;flex-shrink:0">${coverHtml(d)}</div>
        <div style="flex:1;min-width:0"><label class="f" style="margin-top:0" for="bt">Název</label><input class="inp" id="bt" value="${esc(d.title || '')}" maxlength="300">
        <label class="f" for="ba">Autor</label><input class="inp" id="ba" value="${esc(d.author || '')}" maxlength="300"></div></div>
      <div class="row"><div style="flex:1"><label class="f" for="bi">ISBN</label><input class="inp" id="bi" value="${esc(d.isbn || '')}" inputmode="numeric" maxlength="17"></div>
        <div style="width:100px"><label class="f" for="by">Rok</label><input class="inp" id="by" value="${esc(d.year || '')}" inputmode="numeric" maxlength="4"></div></div>
      <label class="f" for="blg">Jazyk</label><select class="sel inp" id="blg">${LANGS.map(([k, l]) => `<option value="${k}" ${d.language === k ? 'selected' : ''}>${l}</option>`).join('')}${LANGS.some(([k]) => k === d.language) ? '' : `<option value="${esc(d.language)}" selected>${esc(d.language)}</option>`}</select>
      <label class="f">Formát</label><div class="seg" id="sf2">${FORMATS.map(([k, , l]) => `<button type="button" data-k="${k}" class="${d.format === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div id="audioonly" ${d.format === 'book' ? 'hidden' : ''}>
        <div class="row"><div style="flex:1" id="nrw" ${d.format === 'audio' ? '' : 'hidden'}><label class="f" for="bnr">Čte</label><input class="inp" id="bnr" maxlength="200" value="${esc(d.narrator || '')}" placeholder="Kdo audioknihu načetl"></div>
        <div style="flex:1"><label class="f" for="bas">Kde ji mám</label><input class="inp" id="bas" list="as-list" maxlength="60" value="${esc(d.audio_source || '')}" placeholder="${d.format === 'ebook' ? 'Kindle, Palmknihy…' : 'Audiolibrix, Storytel…'}"></div></div>
        <datalist id="as-list"></datalist>
      </div>
      <label class="f">Kam</label><div class="seg" id="sl">${['library', 'wishlist'].map((k) => `<button type="button" data-k="${k}" class="${d.list === k ? 'on' : ''}">${k === 'library' ? 'Knihovna' : 'Wishlist'}</button>`).join('')}</div>
      <div id="libonly" ${d.list === 'wishlist' ? 'hidden' : ''}>
        <label class="f">Stav</label><div class="seg seg4" id="ss">${Object.entries(statusMap(d.format === 'audio')).map(([k, l]) => `<button type="button" data-k="${k}" class="${d.status === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <label class="f">Hodnocení</label><div class="rate" id="rt">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-n="${n}" class="${d.rating >= n ? 'on' : ''}" aria-label="${n} z 5">★</button>`).join('')}</div>
        <label class="f">Půjčování</label><div class="seg" id="ln">${[[null, 'Doma'], ['lent', 'Půjčila jsem'], ['borrowed', 'Vypůjčená']].map(([k, l]) => `<button type="button" data-k="${k || ''}" class="${(d.loan_type || '') === (k || '') ? 'on' : ''}">${l}</button>`).join('')}</div>
        <input class="inp" id="lp" style="margin-top:8px" maxlength="100" value="${esc(d.loan_person || '')}" placeholder="${d.loan_type === 'borrowed' ? 'Od koho' : 'Komu'}" ${d.loan_type ? '' : 'hidden'}>
      </div>
      <label class="f">Žánry</label><div class="tags-edit" id="tg"></div>
      <div class="row" style="margin-top:6px"><input class="inp" id="tgi" list="tg-list" placeholder="Přidat žánr" maxlength="40"><button type="button" class="mini" id="tga" style="padding:10px 14px">Přidat</button></div>
      <datalist id="tg-list">${allTags.map((t) => `<option value="${esc(t)}">`).join('')}</datalist>
      <label class="f" for="bn">Poznámka</label><textarea class="inp" id="bn" maxlength="2000" placeholder="Komu jsem ji půjčila, co se mi líbilo…">${esc(d.note || '')}</textarea>
      ${photoFile && !safeUrl(d.cover_url) ? `<p class="hint">Jako obálku použijeme tvoji fotku.</p>` : ''}
      <div class="err" id="berr"></div>
      <div class="stack" style="margin-top:8px"><button class="btn primary" type="submit">${isNew ? 'Uložit do knihovny' : 'Uložit změny'}</button>
      ${!isNew ? `<button type="button" class="btn danger" id="bd">Smazat knihu</button>` : ''}</div>
    </form>`);
  el.querySelectorAll('#sl button').forEach((b) => (b.onclick = () => { d.list = b.dataset.k; el.querySelectorAll('#sl button').forEach((x) => x.classList.toggle('on', x === b)); el.querySelector('#libonly').hidden = d.list === 'wishlist'; }));
  el.querySelectorAll('#ss button').forEach((b) => (b.onclick = () => { d.status = b.dataset.k; el.querySelectorAll('#ss button').forEach((x) => x.classList.toggle('on', x === b)); }));
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
  const lp = el.querySelector('#lp');
  el.querySelectorAll('#ln button').forEach((b) => (b.onclick = () => {
    d.loan_type = b.dataset.k || null; el.querySelectorAll('#ln button').forEach((x) => x.classList.toggle('on', x === b));
    lp.hidden = !d.loan_type; lp.placeholder = d.loan_type === 'borrowed' ? 'Od koho' : 'Komu'; if (d.loan_type) lp.focus();
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
      loan_type: d.list === 'wishlist' ? null : d.loan_type, loan_person: d.list === 'wishlist' || !d.loan_type ? null : (lp.value.trim() || null),
      tags: d.tags, format: d.format, language: el.querySelector('#blg').value || null,
      narrator: d.format === 'audio' ? (el.querySelector('#bnr').value.trim() || null) : null,
      audio_source: d.format !== 'book' ? (el.querySelector('#bas').value.trim() || null) : null,
    };
    if (tgi.value.trim()) addTag(), (row.tags = d.tags);
    if (d.tagsEdited || (isNew && d.tags.length)) row.tagged_at = new Date().toISOString();
    if (isNew && row.isbn && S.books.some((b) => b.isbn === row.isbn && (b.format || 'book') === row.format) && !confirm('Tuhle knihu už máš. Přidat ji znovu?')) { btn.disabled = false; return; }
    const { data: saved, error } = isNew ? await sb.from('books').insert(row).select() : await sb.from('books').update(row).eq('id', d.id).select();
    btn.disabled = false;
    if (error) return (err.textContent = 'Nepodařilo se uložit. Zkus to znovu.');
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
    el.querySelector('#sh-save').textContent = n ? `Přidat do knihovny (${n})` : 'Vyber aspoň jednu';
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
      out[i] = { list: 'library', format, narrator: audio ? (r.narrator || '').trim() || null : null, audio_source: format !== 'book' ? (el.querySelector('#sh-src').value.trim() || null) : null, status, language: m?.language || guessLang(title), title, author: fullAuthor || m?.author || null, isbn: m?.isbn || null, year: m?.year || null, cover_url: safeUrl(m?.cover_url) || null };
      btn.textContent = `Doplňuji údaje… ${++done}/${pick.length}`;
    });
    const queue = [...work];
    await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await queue.shift()(); }));
    btn.textContent = 'Ukládám…';
    const { data: saved, error } = await sb.from('books').insert(out).select();
    if (error) { btn.disabled = false; sync(); return (err.textContent = 'Nepodařilo se uložit. Zkus to znovu.'); }
    await loadBooks(); close();
    toast(format === 'audio' ? `Přidáno ${pick.length} ${plural(pick.length, 'audiokniha', 'audioknihy', 'audioknih')}` : format === 'ebook' ? `Přidáno ${pick.length} ${plural(pick.length, 'e-kniha', 'e-knihy', 'e-knih')}` : `Přidáno ${pick.length} ${plural(pick.length, 'kniha', 'knihy', 'knih')}`);
    S.view = 'library'; UI.library.format = format; render();
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
    <div class="card" style="padding:12px 14px;margin-bottom:12px"><b class="jp-inline">積ん読 Tsundoku</b><p class="sub" style="margin-top:4px">${TSUNDOKU_DEF}</p></div>
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
  const changedUser = (S.session?.user?.id || null) !== (session?.user?.id || null);
  S.session = session;
  if (!booted || changedUser) {
    booted = true;
    if (!session) { S.profile = null; S.books = []; S.friendships = []; S.friend = null; S.view = 'library'; }
    setTimeout(boot, 0);
  }
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
