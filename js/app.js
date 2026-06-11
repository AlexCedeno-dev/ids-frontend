/* ─── Config ─────────────────────────────────────────────────────────────────── */
const API   = 'http://192.168.1.80:5000';
const TICK  = 5000;   // ms

/* ─── State ──────────────────────────────────────────────────────────────────── */
let wlType       = 'ip';
let timer        = null;
let progTimer    = null;
let progVal      = 100;
let modalAction  = null;

/* ─── Clock ──────────────────────────────────────────────────────────────────── */
function tickClock() {
  document.getElementById('clock').textContent =
    new Date().toLocaleTimeString('es-MX', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
}
setInterval(tickClock, 1000);
tickClock();

/* ─── View switch ────────────────────────────────────────────────────────────── */
function switchView(v) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('view-' + v).classList.add('active');
  document.getElementById('tab-' + v).classList.add('active');
  if (v === 'control') loadWhitelist();
}

/* ─── Progress bar ───────────────────────────────────────────────────────────── */
function startProg() {
  progVal = 100;
  clearInterval(progTimer);
  const fill = document.getElementById('prog');
  fill.style.width = '100%';
  const step = 100 / (TICK / 80);
  progTimer = setInterval(() => {
    progVal = Math.max(0, progVal - step);
    fill.style.width = progVal + '%';
  }, 80);
}

/* ─── Connection UI ──────────────────────────────────────────────────────────── */
function setConn(ok) {
  const dot   = document.getElementById('conn-dot');
  const lbl   = document.getElementById('conn-lbl');
  const badge = document.getElementById('api-badge');
  if (ok) {
    dot.classList.remove('off'); dot.classList.add('ok');
    lbl.textContent = 'Conectado';
    if (badge) { badge.className = 'badge b-ok'; badge.innerHTML = '<i class="fas fa-circle"></i> En linea'; }
  } else {
    dot.classList.add('off'); dot.classList.remove('ok');
    lbl.textContent = 'Sin conexion';
    if (badge) { badge.className = 'badge b-err'; badge.innerHTML = '<i class="fas fa-circle"></i> Sin conexion'; }
  }
}

/* ─── Fetch dashboard ────────────────────────────────────────────────────────── */
async function fetchDash() {
  startProg();
  try {
    const r = await fetch(API + '/api/dashboard', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4200)
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    setConn(true);
    render(d);
    const t = new Date().toLocaleTimeString('es-MX', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
    document.getElementById('last-upd').innerHTML = '<i class="fas fa-rotate"></i> Ultima actualizacion: ' + t;
    const cu = document.getElementById('ctrl-upd');
    if (cu) cu.textContent = t;
  } catch(e) {
    setConn(false);
    console.warn('Dashboard error:', e.message);
  }
}

/* ─── Render ─────────────────────────────────────────────────────────────────── */
function render(d) {
  const st = d.stats ?? {};

  /* Stats — campos reales de la API */
  setStat('s-dns', st.total_consultas);
  setStat('s-dom', st.dominios_unicos);
  setStat('s-ips', st.ips_activas);

  const alertArr = Array.isArray(d.alertas) ? d.alertas : [];
  setStat('s-alr', alertArr.length);

  /* Semaforo — derivado de los datos, la API no lo envía explícito:
     - rojo   : hay IPs de la blacklist detectadas en el tráfico
     - amarillo: hay consultas no autorizadas (alertas)
     - verde  : sin incidencias */
  const amenazas   = Array.isArray(d.amenazas) ? d.amenazas : [];
  const hayPeligro = amenazas.some(a => a.detectada);
  const lvl = hayPeligro ? 'red' : alertArr.length > 0 ? 'yellow' : 'green';
  setLight(lvl);

  /* Panel de alertas */
  renderAlerts(alertArr);

  /* Tabla DNS */
  const qs = Array.isArray(d.dns_recent) ? d.dns_recent : [];
  renderDns(qs);
}

function setStat(id, v) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = (v == null) ? '—' : (typeof v === 'number' ? v.toLocaleString('es-MX') : v);
}

/* ─── Traffic light ──────────────────────────────────────────────────────────── */
function setLight(lvl) {
  document.getElementById('l-red').className    = 'light l-red';
  document.getElementById('l-yellow').className = 'light l-yellow';
  document.getElementById('l-green').className  = 'light l-green';

  const sb   = document.getElementById('sb');
  const ico  = document.getElementById('sb-ico');
  const ttl  = document.getElementById('sb-ttl');
  const desc = document.getElementById('sb-desc');

  sb.className = 'status-banner';

  const isDanger  = /red|danger|critical/.test(lvl);
  const isWarning = /yellow|warn/.test(lvl);

  if (isDanger) {
    document.getElementById('l-red').classList.add('on');
    sb.classList.add('red');
    ico.className  = 'fas fa-circle-exclamation sb-icon';
    ttl.textContent  = 'Peligro — Amenaza Detectada';
    desc.textContent = 'Se detecto actividad maliciosa. Contacte al administrador de inmediato.';
  } else if (isWarning) {
    document.getElementById('l-yellow').classList.add('on');
    sb.classList.add('yellow');
    ico.className  = 'fas fa-triangle-exclamation sb-icon';
    ttl.textContent  = 'Advertencia — Actividad Inusual';
    desc.textContent = 'Se detecto actividad sospechosa. El administrador esta siendo notificado.';
  } else {
    document.getElementById('l-green').classList.add('on');
    sb.classList.add('green');
    ico.className  = 'fas fa-shield-check sb-icon';
    ttl.textContent  = 'Red Segura';
    desc.textContent = 'No se han detectado amenazas. La red funciona con normalidad.';
  }
}

/* ─── Alerts panel ───────────────────────────────────────────────────────────── */
function renderAlerts(arr) {
  const el = document.getElementById('alerts-list');
  if (!arr || arr.length === 0) {
    el.innerHTML = '<div class="no-alerts"><i class="fas fa-circle-check" style="color:var(--green);margin-right:5px;"></i>No hay alertas activas</div>';
    return;
  }
  /* Cada alerta tiene: timestamp, ip_origen, mac_origen, dominio
     Son siempre consultas no autorizadas → clase "yellow"             */
  el.innerHTML = arr.slice(0, 6).map(a => {
    const ip  = a.ip_origen  ?? '';
    const mac = a.mac_origen ?? '';
    const dom = a.dominio    ?? '';
    const ts  = a.timestamp  ? fmtTime(a.timestamp) : '';
    const msg = dom ? 'Consulta no autorizada a ' + esc(dom) : 'Dispositivo no autorizado detectado';
    const meta = [ip && 'IP: ' + esc(ip), mac && 'MAC: ' + esc(mac), ts].filter(Boolean).join(' &bull; ');
    return `<div class="alert-item yellow">
      <i class="fas fa-triangle-exclamation ai-ico"></i>
      <div><div class="ai-msg">${msg}</div>${meta ? '<div class="ai-meta">' + meta + '</div>' : ''}</div>
    </div>`;
  }).join('');
}

/* ─── DNS table ──────────────────────────────────────────────────────────────── */
function renderDns(qs) {
  const tbody = document.getElementById('dns-body');
  const cnt   = document.getElementById('q-count');
  if (cnt) cnt.textContent = qs.length;

  if (!qs.length) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty"><i class="fas fa-satellite-dish"></i><p>Sin consultas recientes</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = qs.slice(0, 60).map(q => {
    /* ── Estado ── */
    const auth  = q.autorizado;
    const isErr = auth === 0 || auth === '0' || auth === false;
    const stCls = isErr ? 'b-err' : 'b-ok';
    const stLbl = isErr
      ? '<i class="fas fa-triangle-exclamation"></i> Alerta'
      : '<i class="fas fa-circle-check"></i> Normal';

    /* ── Hora ── */
    const ts = q.timestamp ? fmtTime(q.timestamp) : '—';

    /* ── Dispositivo ── */
    const rawIp = q.ip_origen ?? '—';
    let ipCell;
    if (rawIp.startsWith('fe80::')) {
      ipCell = `<span class="tip-wrap" style="cursor:default">
        <span style="color:var(--txt2)">Dispositivo Local</span>
        <i class="fas fa-circle-info tip-ico"></i>
        <span class="tip-box">Direccion interna del equipo: ${esc(rawIp)}</span>
      </span>`;
    } else if (rawIp.startsWith('2806:') || rawIp.startsWith('192.168.')) {
      const short = rawIp.slice(-4);
      ipCell = `<span class="tip-wrap" style="cursor:default">
        <span class="code-tag">...${esc(short)}</span>
        <i class="fas fa-circle-info tip-ico"></i>
        <span class="tip-box">IP completa: ${esc(rawIp)}</span>
      </span>`;
    } else {
      ipCell = `<span class="code-tag">${esc(rawIp)}</span>`;
    }

    /* ── Tipo ── */
    const rawTyp = String(q.tipo_query ?? 'A').toUpperCase();
    let typCell;
    if (['A', 'AAAA', '65'].includes(rawTyp)) {
      typCell = `<span class="badge b-info"><i class="fas fa-globe"></i> Busqueda web</span>`;
    } else if (rawTyp === 'PTR') {
      typCell = `<span class="badge b-muted"><i class="fas fa-network-wired"></i> Red local</span>`;
    } else {
      typCell = `<span class="badge b-info">${esc(rawTyp)}</span>`;
    }

    const dom = esc(q.dominio ?? '—');
    return `<tr>
      <td class="dim" style="font-family:monospace">${esc(ts)}</td>
      <td>${ipCell}</td>
      <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${dom}">${dom}</td>
      <td>${typCell}</td>
      <td><span class="badge ${stCls}">${stLbl}</span></td>
    </tr>`;
  }).join('');
}

/* ─── Whitelist type selector ────────────────────────────────────────────────── */
function selWlType(btn) {
  document.querySelectorAll('[data-wlt]').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  wlType = btn.dataset.wlt;
  const inp  = document.getElementById('wl-val');
  const help = document.getElementById('wl-help');
  if (wlType === 'mac') {
    inp.placeholder  = 'Ej: AA:BB:CC:DD:EE:FF';
    help.textContent = 'Ingrese la direccion MAC. Formato: AA:BB:CC:DD:EE:FF';
  } else {
    inp.placeholder  = 'Ej: 192.168.1.100';
    help.textContent = 'Ingrese la direccion IP del dispositivo a autorizar.';
  }
}

/* ─── Whitelist CRUD ─────────────────────────────────────────────────────────── */
async function addWhitelist() {
  const val  = document.getElementById('wl-val').value.trim();
  const desc = document.getElementById('wl-desc').value.trim();
  if (!val) { toast('Ingrese un valor valido.', 'warn'); return; }
  if (wlType === 'ip'  && !validIP(val))  { toast('Formato de IP invalido. Ej: 192.168.1.100', 'err'); return; }
  if (wlType === 'mac' && !validMAC(val)) { toast('Formato MAC invalido. Ej: AA:BB:CC:DD:EE:FF', 'err'); return; }
  try {
    const r = await apiFetch('POST', '/api/whitelist', { type: wlType, value: val, description: desc });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    toast('"' + val + '" agregado a la lista blanca.', 'ok');
    document.getElementById('wl-val').value  = '';
    document.getElementById('wl-desc').value = '';
    loadWhitelist();
  } catch(e) { toast('Error al agregar: ' + e.message, 'err'); }
}

async function loadWhitelist() {
  const tbody = document.getElementById('wl-body');
  const cnt   = document.getElementById('wl-count');
  tbody.innerHTML = '<tr><td colspan="5"><div class="empty"><p>Cargando...</p></div></td></tr>';
  try {
    const r = await apiFetch('GET', '/api/whitelist');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d   = await r.json();
    const arr = d.entries ?? d.whitelist ?? (Array.isArray(d) ? d : []);
    if (cnt) cnt.textContent = arr.length + ' entrada' + (arr.length !== 1 ? 's' : '');
    if (!arr.length) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty"><i class="fas fa-list-check"></i><p>La lista blanca esta vacia.</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = arr.map(e => {
      const id   = escA(e.id ?? e._id ?? e.value ?? '');
      const typ  = String(e.type ?? 'ip').toUpperCase();
      const val  = esc(e.value ?? e.ip ?? e.mac ?? '');
      const desc = esc(e.description ?? e.descripcion ?? '—');
      const dt   = e.created_at ?? e.createdAt ?? e.date ?? '';
      return `<tr>
        <td><span class="badge ${typ === 'MAC' ? 'b-info' : 'b-ok'}">
          <i class="fas fa-${typ === 'MAC' ? 'microchip' : 'circle-nodes'}"></i> ${typ}
        </span></td>
        <td><span class="code-tag">${val}</span></td>
        <td class="dim">${desc}</td>
        <td class="dim">${dt ? esc(fmtDate(dt)) : '—'}</td>
        <td style="text-align:center">
          <button class="btn btn-danger btn-sm" onclick="removeWL('${id}','${val}')">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </td>
      </tr>`;
    }).join('');
  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty"><i class="fas fa-triangle-exclamation" style="color:var(--red)"></i><p>Error: ${esc(e.message)}</p></div></td></tr>`;
  }
}

function removeWL(id, val) {
  openModal(
    'Eliminar "' + val + '" de la lista blanca',
    'Esta a punto de eliminar <strong>' + val + '</strong> de la lista blanca. El dispositivo podra generar alertas a partir de ese momento.',
    async () => {
      try {
        const r = await apiFetch('DELETE', '/api/whitelist/' + encodeURIComponent(id));
        if (!r.ok) throw new Error('HTTP ' + r.status);
        toast('"' + val + '" eliminado de la lista blanca.', 'ok');
        loadWhitelist();
      } catch(e) { toast('Error al eliminar: ' + e.message, 'err'); }
    }
  );
}

/* ─── Blacklist ──────────────────────────────────────────────────────────────── */
async function addBlacklist() {
  const ip     = document.getElementById('bl-ip').value.trim();
  const reason = document.getElementById('bl-reason').value.trim();
  const sev    = document.getElementById('bl-sev').value;
  if (!ip)         { toast('Ingrese una direccion IP.', 'warn'); return; }
  if (!validIP(ip)) { toast('Formato de IP invalido. Ej: 203.0.113.45', 'err'); return; }
  try {
    const r = await apiFetch('POST', '/api/blacklist', { ip, reason, severity: sev });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    toast('IP "' + ip + '" agregada a la lista negra.', 'ok');
    document.getElementById('bl-ip').value     = '';
    document.getElementById('bl-reason').value = '';
  } catch(e) { toast('Error al agregar: ' + e.message, 'err'); }
}

/* ─── Admin config ───────────────────────────────────────────────────────────── */
async function saveEmail() {
  const email = document.getElementById('adm-email').value.trim();
  if (!email)        { toast('Ingrese un correo electronico.', 'warn'); return; }
  if (!validEmail(email)) { toast('Formato de correo invalido.', 'err'); return; }
  try {
    const r = await apiFetch('PUT', '/api/admin/config', { admin_email: email });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    toast('Correo actualizado: ' + email, 'ok');
  } catch(e) { toast('Error al guardar correo: ' + e.message, 'err'); }
}

function confirmClearLogs() {
  openModal(
    'Limpiar todos los registros',
    'Esta a punto de eliminar <strong>TODOS</strong> los registros del sistema. Esta accion es permanente e irreversible. El historial de eventos, alertas y consultas DNS quedara vacio.',
    async () => {
      try {
        const r = await apiFetch('POST', '/api/logs/clear');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        toast('Registros eliminados correctamente.', 'ok');
      } catch(e) { toast('Error al limpiar logs: ' + e.message, 'err'); }
    }
  );
}

/* ─── Modal ──────────────────────────────────────────────────────────────────── */
function openModal(title, body, action) {
  document.getElementById('m-ttl').innerHTML  = '<i class="fas fa-triangle-exclamation"></i> ' + title;
  document.getElementById('m-body').innerHTML = body;
  modalAction = action;
  document.getElementById('backdrop').classList.add('show');
}
function closeModal() {
  document.getElementById('backdrop').classList.remove('show');
  modalAction = null;
}
document.getElementById('m-ok').addEventListener('click', async () => {
  if (modalAction) { await modalAction(); }
  closeModal();
});
document.getElementById('backdrop').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

/* ─── Toast ──────────────────────────────────────────────────────────────────── */
function toast(msg, type = 'ok') {
  const wrap = document.getElementById('toasts');
  const ico  = type === 'ok' ? 'fa-circle-check' : type === 'err' ? 'fa-circle-xmark' : 'fa-triangle-exclamation';
  const cls  = type === 'ok' ? 't-ok' : type === 'err' ? 't-err' : 't-warn';
  const el   = document.createElement('div');
  el.className = 'toast ' + cls;
  el.innerHTML = '<i class="fas ' + ico + '"></i><span>' + esc(msg) + '</span>';
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 320);
  }, 3600);
}

/* ─── API helper ─────────────────────────────────────────────────────────────── */
function apiFetch(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    signal: AbortSignal.timeout(5500)
  };
  if (body) opts.body = JSON.stringify(body);
  return fetch(API + path, opts);
}

/* ─── Validation ─────────────────────────────────────────────────────────────── */
function validIP(v) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(v) && v.split('.').every(n => +n <= 255);
}
function validMAC(v) {
  return /^([0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}$/.test(v);
}
function validEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/* ─── String helpers ─────────────────────────────────────────────────────────── */
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escA(s) {
  return String(s ?? '').replace(/'/g, "\\'").replace(/"/g, '\\"');
}
function fmtTime(ts) {
  try { const d = new Date(ts); return isNaN(d) ? ts : d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit',second:'2-digit'}); }
  catch { return ts; }
}
function fmtDate(ts) {
  try { const d = new Date(ts); return isNaN(d) ? ts : d.toLocaleString('es-MX',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
  catch { return ts; }
}

/* ─── Boot ───────────────────────────────────────────────────────────────────── */
fetchDash();
timer = setInterval(fetchDash, TICK);
