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
async function lookupIsbn(isbn) {
  isbn = isbn.replace(/[^0-9Xx]/g, '');
  try {
    const r = await fetch('https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn);
    const j = await r.json();
    const v = j.items?.[0]?.volumeInfo;
    if (v) return fromGoogle(v, isbn);
  } catch (e) {}
  try {
    const r = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    const j = await r.json();
    const v = j['ISBN:' + isbn];
    if (v) return {
      title: v.title, author: v.authors?.map((a) => a.name).join(', ') || null, isbn,
      year: parseInt(v.publish_date?.match(/\d{4}/)?.[0]) || null,
      cover_url: v.cover?.medium || v.cover?.large || null,
    };
  } catch (e) {}
  return null;
}
function fromGoogle(v, isbn) {
  const ids = v.industryIdentifiers || [];
  const i13 = ids.find((x) => x.type === 'ISBN_13')?.identifier || ids.find((x) => x.type === 'ISBN_10')?.identifier;
  let cover = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || null;
  if (cover) cover = cover.replace('http://', 'https://').replace('&edge=curl', '');
  const is = isbn || i13 || null;
  if (!cover && is) cover = `https://covers.openlibrary.org/b/isbn/${is}-M.jpg`;
  return { title: v.title + (v.subtitle ? ': ' + v.subtitle : ''), author: v.authors?.join(', ') || null, isbn: is, year: parseInt(v.publishedDate) || null, cover_url: cover };
}
async function searchBooks(q) {
  const r = await fetch('https://www.googleapis.com/books/v1/volumes?maxResults=12&q=' + encodeURIComponent(q));
  const j = await r.json();
  return (j.items || []).map((it) => fromGoogle(it.volumeInfo));
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
    ${lib.length ? `<input class="search" id="q" type="search" placeholder="Hledat v knihovně" value="${esc(S.query)}">
    <div class="chips">${chip('all', 'Vše')}${chip('reading', 'Čtu')}${chip('read', 'Přečteno')}${chip('unread', 'Nepřečteno')}</div>
    ${list.length ? bookGrid(list) : `<div class="empty">Nic tu neodpovídá hledání.</div>`}`
    : `<div class="empty"><h3>Začni plnit knihovnu</h3><p>Naskenuj čárový kód na zadní straně knihy nebo vyfoť obálku.</p><br><button class="btn primary" data-go="add">${I.scan}Přidat první knihu</button></div>`}`;
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
    <button class="add-opt" id="o-scan"><div class="ic">${I.barcode}</div><div><b>Naskenovat čárový kód</b><span>Kód ISBN na zadní straně. Nejrychlejší.</span></div></button>
    <button class="add-opt" id="o-photo"><div class="ic">${I.camera}</div><div><b>Vyfotit obálku</b><span>Pro knihy bez kódu. Pozná ji AI.</span></div></button>
    <button class="add-opt" id="o-search"><div class="ic">${I.search}</div><div><b>Najít podle názvu</b><span>Nebo zadat úplně ručně.</span></div></button>
  </div>
  <input type="file" id="photo-in" accept="image/*" capture="environment" hidden>`;
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
  const back = document.getElementById('back'); if (back) back.onclick = () => { S.friend = null; render(); };

  if (S.view === 'add') {
    document.getElementById('o-scan').onclick = openScanner;
    document.getElementById('o-search').onclick = () => openSearch();
    const pin = document.getElementById('photo-in');
    document.getElementById('o-photo').onclick = () => pin.click();
    pin.onchange = () => { if (pin.files[0]) recognizePhoto(pin.files[0]); pin.value = ''; };
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
  const { el, close } = sheet(`${head('')}
    <div class="detail">${coverHtml(b)}<div><h2>${esc(b.title)}</h2><p class="sub">${esc([b.author, b.year].filter(Boolean).join(' · '))}</p>
      ${b.rating ? `<div class="stars" style="font-size:18px">${starsTxt(b.rating)}</div>` : ''}
      <span class="pill ${b.list === 'wishlist' ? 'wine' : ''}">${b.list === 'wishlist' ? 'Wishlist' : STATUS[b.status]}</span></div></div>
    ${b.note ? `<label class="f">${own ? 'Moje poznámka' : 'Poznámka'}</label><div class="card" style="padding:10px 12px;font-size:14px;white-space:pre-wrap">${esc(b.note)}</div>` : ''}
    <div class="stack" style="margin-top:16px">
      <a class="btn" href="${esc(goodreadsUrl(b))}" target="_blank" rel="noopener">${I.ext}Otevřít na Goodreads</a>
      ${own ? `<button class="btn primary" id="ed">${I.edit}Upravit, hodnotit</button>
        ${b.list === 'wishlist' ? `<button class="btn" id="mv">${I.books}Mám ji, přesunout do knihovny</button>` : ''}`
      : (iHave ? `<p class="hint" style="text-align:center">Tuhle knihu už máš.</p>` : `<button class="btn wine" id="want">${I.heart}Chci ji taky (do wishlistu)</button>`)}
    </div>
    ${friendsHave.length ? `<label class="f" style="margin-top:16px">Mají ji i přátelé</label><div class="friends-have">${friendsHave.map((p) => `<span class="av sm" title="${esc(p.display_name)}">${esc(initials(p.display_name))}</span>`).join('')}</div>` : ''}`);
  if (own) {
    el.querySelector('#ed').onclick = () => { close(); openEditor(b); };
    const mv = el.querySelector('#mv');
    if (mv) mv.onclick = async () => { await sb.from('books').update({ list: 'library' }).eq('id', b.id); await loadBooks(); close(); toast('Přesunuto do knihovny'); render(); };
  } else {
    const w = el.querySelector('#want');
    if (w) w.onclick = async () => {
      const { error } = await sb.from('books').insert({ list: 'wishlist', title: b.title, author: b.author, isbn: b.isbn, year: b.year, cover_url: b.cover_url });
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
    const { error } = isNew ? await sb.from('books').insert(row) : await sb.from('books').update(row).eq('id', d.id);
    btn.disabled = false;
    if (error) return (err.textContent = 'Nepodařilo se uložit. Zkus to znovu.');
    await loadBooks(); close();
    toast(isNew ? (row.list === 'wishlist' ? 'Přidáno do wishlistu' : 'Kniha je v knihovně') : 'Uloženo');
    if (isNew) S.view = row.list === 'wishlist' ? 'wishlist' : 'library';
    render();
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
async function handleIsbn(isbn) {
  const { close } = sheet(`<div class="empty"><div class="spin" style="margin:0 auto 12px;color:var(--green)"></div>Hledám knihu…</div>`);
  const book = await lookupIsbn(isbn);
  close();
  if (book) openEditor(book, true);
  else { toast('Knihu jsme v katalogu nenašli. Doplň ji ručně.'); openEditor({ isbn: isbn.replace(/[^0-9Xx]/g, ''), title: '' }, true); }
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
  const { close } = sheet(`<div class="empty"><div class="spin" style="margin:0 auto 12px;color:var(--green)"></div>Poznávám knihu na fotce…</div>`);
  let blob;
  try { blob = await resizeImage(file); } catch (e) { close(); return toast('Fotku se nepodařilo načíst.'); }
  const image = await blobToB64(blob);
  const { data, error } = await sb.functions.invoke('recognize-cover', { body: { image, mediaType: 'image/jpeg' } });
  if (error) {
    close();
    let code = '';
    try { code = (await error.context.json()).error; } catch (e) {}
    if (code === 'no_key') toast('Poznávání fotek zatím není zapnuté. Doplň knihu ručně.');
    else if (code === 'not_recognized') toast('Knihu se nepodařilo poznat. Doplň ji ručně.');
    else toast('Rozpoznání selhalo. Doplň knihu ručně.');
    return openEditor({ title: '' }, true, blob);
  }
  let book = null;
  if (data.isbn) book = await lookupIsbn(data.isbn);
  if (!book) {
    try {
      const q = `intitle:${data.title}` + (data.author ? ` inauthor:${data.author.split(',')[0]}` : '');
      const res = await searchBooks(q);
      if (res[0]) book = { ...res[0], title: data.title, author: data.author || res[0].author };
    } catch (e) {}
  }
  close();
  openEditor(book || { title: data.title, author: data.author, isbn: data.isbn, year: data.year }, true, blob);
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
    <div id="res" style="margin-top:12px"></div>
    <button class="btn ghost" id="manual" style="margin-top:12px">Zadat ručně</button>`);
  el.querySelector('#manual').onclick = () => { close(); openEditor({ title: '' }, true); };
  el.querySelector('#sf').onsubmit = async (e) => {
    e.preventDefault();
    const q = el.querySelector('#sq').value.trim();
    if (!q) return (el.querySelector('#sferr').textContent = 'Napiš název nebo autora.');
    el.querySelector('#sferr').textContent = '';
    const res = el.querySelector('#res');
    res.innerHTML = `<div class="empty" style="padding:20px"><div class="spin" style="margin:0 auto;color:var(--green)"></div></div>`;
    let items = [];
    try { items = await searchBooks(q); } catch (e) {}
    if (!items.length) { res.innerHTML = `<p class="sub">Nic jsme nenašli. Zkus jiná slova, nebo knihu zadej ručně.</p>`; return; }
    res.innerHTML = `<div class="list results">${items.map((b, i) => `<div class="li" data-i="${i}">${coverHtml(b)}<div class="grow"><b>${esc(b.title)}</b><span>${esc([b.author, b.year].filter(Boolean).join(' · '))}</span></div></div>`).join('')}</div>`;
    res.querySelectorAll('[data-i]').forEach((r) => (r.onclick = () => { close(); openEditor(items[+r.dataset.i], true); }));
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
