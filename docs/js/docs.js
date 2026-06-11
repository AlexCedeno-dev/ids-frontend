'use strict';

/* ============================================================
   IDS Institucional — Documentacion Tecnica
   Todo el contenido se construye desde JS para dificultar
   el scraping automatico con herramientas como HTTrack.
   ============================================================ */

// ── Utilidades ────────────────────────────────────────────────────────────────

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Aplica syntax highlighting basico a Python/bash */
function highlight(code, lang = 'python') {
  let s = esc(code);
  if (lang === 'python' || lang === 'py') {
    s = s
      .replace(/(@\w[\w.]*)/g, '<span class="tk-op">$1</span>')
      .replace(/\b(import|from|def|class|return|if|elif|else|for|in|try|except|with|as|not|and|or|True|False|None|pass|raise|lambda|yield|async|await)\b/g, '<span class="tk-kw">$1</span>')
      .replace(/(#[^\n]*)/g, '<span class="tk-cmt">$1</span>')
      .replace(/(&quot;[^&]*&quot;|&#39;[^&#]*&#39;|&quot;&quot;&quot;[\s\S]*?&quot;&quot;&quot;)/g, '<span class="tk-str">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="tk-num">$1</span>');
  } else if (lang === 'json') {
    s = s
      .replace(/(&quot;[^&]*&quot;)\s*:/g, '<span class="tk-cls">$1</span>:')
      .replace(/:\s*(&quot;[^&]*&quot;)/g, ': <span class="tk-str">$1</span>')
      .replace(/:\s*(true|false|null)\b/g, ': <span class="tk-kw">$1</span>')
      .replace(/:\s*(\d+)/g, ': <span class="tk-num">$1</span>');
  } else if (lang === 'bash' || lang === 'sh') {
    s = s
      .replace(/(#[^\n]*)/g, '<span class="tk-cmt">$1</span>')
      .replace(/\b(sudo|python3|pip|apt|export|source|cd|ls|cat|echo|chmod)\b/g, '<span class="tk-kw">$1</span>')
      .replace(/(&quot;[^&]*&quot;)/g, '<span class="tk-str">$1</span>');
  } else if (lang === 'env') {
    s = s
      .replace(/(#[^\n]*)/g, '<span class="tk-cmt">$1</span>')
      .replace(/^(\w+)=/gm, '<span class="tk-cls">$1</span>=')
      .replace(/=(.+)$/gm, '=<span class="tk-str">$1</span>');
  }
  return s;
}

function codeBlock(code, lang = 'python', label) {
  const lbl = label || lang.toUpperCase();
  return `
<div class="code-block">
  <div class="code-header">
    <span class="code-lang">${esc(lbl)}</span>
    <button class="code-copy" onclick="copyCode(this)" title="Copiar">
      <i class="far fa-copy"></i> Copiar
    </button>
  </div>
  <pre><code>${highlight(code, lang)}</code></pre>
</div>`;
}

function copyCode(btn) {
  const pre = btn.closest('.code-block').querySelector('pre');
  const text = pre.textContent;
  navigator.clipboard.writeText(text).then(() => {
    btn.innerHTML = '<i class="fas fa-check"></i> Copiado';
    setTimeout(() => { btn.innerHTML = '<i class="far fa-copy"></i> Copiar'; }, 2000);
  });
}

function tag(label, cls = 'tag-blue') {
  return `<span class="tag ${cls}">${esc(label)}</span>`;
}

function alertBox(icon, text, cls = 'alert-info') {
  return `<div class="alert-box ${cls}"><i class="${icon}"></i><p>${text}</p></div>`;
}

function sectionHeader(iconCls, iconColor, title, subtitle) {
  return `
<div class="section-header">
  <div class="section-icon ${iconColor}"><i class="${iconCls}"></i></div>
  <div class="section-title">
    <h2>${esc(title)}</h2>
    <p>${esc(subtitle)}</p>
  </div>
</div>`;
}

// ── Definicion de secciones ───────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'arquitectura',
    icon: 'fas fa-sitemap',
    color: 'icon-blue',
    label: 'Arquitectura del Sistema',
    nav: 'Arquitectura',
    navIcon: 'fas fa-sitemap',
    render: renderArquitectura,
  },
  {
    id: 'osi',
    icon: 'fas fa-layer-group',
    color: 'icon-cyan',
    label: 'Diagrama de Flujo OSI',
    nav: 'Diagrama OSI',
    navIcon: 'fas fa-layer-group',
    render: renderOSI,
  },
  {
    id: 'modulos',
    icon: 'fas fa-cubes',
    color: 'icon-purple',
    label: 'Modulos del Sistema',
    nav: 'Modulos (.py)',
    navIcon: 'fas fa-cubes',
    render: renderModulos,
  },
  {
    id: 'credenciales',
    icon: 'fas fa-key',
    color: 'icon-yellow',
    label: 'Proteccion de Credenciales',
    nav: 'Credenciales (.env)',
    navIcon: 'fas fa-key',
    render: renderCredenciales,
  },
  {
    id: 'juridico',
    icon: 'fas fa-scale-balanced',
    color: 'icon-red',
    label: 'Analisis Juridico Mexicano',
    nav: 'Marco Juridico',
    navIcon: 'fas fa-scale-balanced',
    render: renderJuridico,
  },
  {
    id: 'privacidad',
    icon: 'fas fa-file-shield',
    color: 'icon-green',
    label: 'Politica de Privacidad',
    nav: 'Privacidad',
    navIcon: 'fas fa-file-shield',
    render: renderPrivacidad,
  },
];

// ── Contenido: Arquitectura ───────────────────────────────────────────────────

function renderArquitectura() {
  return `
${sectionHeader('fas fa-sitemap', 'icon-blue', 'Arquitectura del Sistema', 'Componentes, tecnologias y flujo de operacion')}

<div class="card">
  <div class="card-title"><i class="fas fa-info-circle"></i> Descripcion General</div>
  <p>El IDS Institucional es un sistema de deteccion de intrusos de red basado en inspeccion de paquetes DNS. Opera en modo pasivo sobre la red local, captura todas las consultas DNS del segmento, las compara contra listas blancas y negras, y genera alertas automaticas cuando detecta actividad no autorizada o conexiones a IPs peligrosas conocidas.</p>
  <p>El sistema esta disenado para funcionar sin agente instalado en los equipos clientes: solo requiere que el host sensor tenga acceso promiscuo a la red.</p>
</div>

<div class="grid-2">
  <div class="card">
    <div class="card-title"><i class="fas fa-server"></i> Capa de Captura</div>
    <p>${tag('Scapy')} ${tag('Python 3', 'tag-green')} ${tag('Raw Sockets', 'tag-yellow')}</p>
    <p>El modulo <code>sniffer.py</code> captura paquetes en modo promiscuo sobre la interfaz de red configurada. Filtra unicamente paquetes UDP al puerto 53 (DNS) para minimizar la carga del procesador.</p>
  </div>
  <div class="card">
    <div class="card-title"><i class="fas fa-database"></i> Capa de Persistencia</div>
    <p>${tag('SQLite3')} ${tag('JSON', 'tag-purple')} ${tag('Log plano', 'tag-gray')}</p>
    <p>Las consultas DNS se almacenan en <code>data/logs.db</code>. Las listas blanca y negra se mantienen en archivos JSON para edicion manual sin necesidad de migraciones.</p>
  </div>
  <div class="card">
    <div class="card-title"><i class="fas fa-globe"></i> Capa de Presentacion</div>
    <p>${tag('Flask')} ${tag('Flask-CORS')} ${tag('REST API', 'tag-cyan')}</p>
    <p>El modulo <code>dashboard.py</code> expone una API REST JSON. El frontend en HTML/CSS/JS vanilla consume el endpoint unificado <code>/api/dashboard</code> cada 5 segundos.</p>
  </div>
  <div class="card">
    <div class="card-title"><i class="fas fa-bell"></i> Capa de Alertas</div>
    <p>${tag('SMTP')} ${tag('Gmail', 'tag-red')} ${tag('Threading', 'tag-yellow')}</p>
    <p>Las alertas de correo se envian en hilos separados para no bloquear la captura de paquetes. El sistema implementa anti-spam por sesion para evitar saturar al administrador.</p>
  </div>
</div>

${alertBox('fas fa-triangle-exclamation', 'El sistema requiere privilegios de superusuario (sudo) para abrir sockets en modo promiscuo. El dashboard Flask puede ejecutarse sin sudo en un puerto mayor a 1024.', 'alert-warning')}

<div class="card" style="margin-top:16px">
  <div class="card-title"><i class="fas fa-diagram-project"></i> Flujo de datos principal</div>
</div>

<div class="flow-diagram">
  ${flowStep('1','#388bfd','fas fa-wifi','Captura de paquete','El kernel entrega el paquete raw a Scapy en sniffer.py. Se filtra por protocolo DNS (UDP/53) antes de procesarlo.')}
  ${flowStep('2','#d29922','fas fa-list-check','Validacion IAA','whitelist.py verifica si la IP y MAC de origen estan autorizadas. Si no, registra alerta y notifica por correo (una sola vez por sesion).')}
  ${flowStep('3','#bc8cff','fas fa-database','Registro DNS','dns_monitor.py extrae el dominio consultado y lo guarda en SQLite con timestamp, IP, MAC, tipo de query y estado de autorizacion.')}
  ${flowStep('4','#f85149','fas fa-skull-crossbones','Threat Intelligence','threat_intel.py compara la IP de destino contra blacklist_ips.json. Si hay coincidencia, dispara alerta de EMERGENCIA.')}
  ${flowStep('5','#3fb950','fas fa-magnifying-glass','Analisis Forense','forensic.py consulta ipwhois y AbuseIPDB sobre la IP peligrosa y envia reporte completo al administrador.',true)}
</div>`;
}

function flowStep(num, color, icon, title, desc, last = false) {
  return `
<div class="flow-step">
  <div class="flow-left">
    <div class="flow-circle" style="background:${color}22;color:${color}">
      <i class="${icon}"></i>
    </div>
    ${last ? '' : '<div class="flow-line"></div>'}
  </div>
  <div class="flow-body">
    <h4><span style="color:${color};margin-right:6px">${num}.</span>${esc(title)}</h4>
    <p>${esc(desc)}</p>
  </div>
</div>`;
}

// ── Contenido: OSI ────────────────────────────────────────────────────────────

function renderOSI() {
  const layers = [
    {
      num: 7, name: 'Aplicacion', proto: 'DNS / HTTP / SMTP',
      color: '#f85149', detail: 'El IDS procesa consultas DNS a nivel de aplicacion. Extrae dominio, tipo de query (A/AAAA/PTR/65) e identifica dispositivos por nombre en la whitelist.',
      active: true, ids: 'dns_monitor.py, dashboard.py',
    },
    {
      num: 6, name: 'Presentacion', proto: 'TLS / Encoding',
      color: '#ff9e64', detail: 'Las consultas DNS viajan sin cifrar (UDP claro). El dashboard usa JSON sobre HTTP. Las alertas de correo usan TLS via SMTP STARTTLS.',
      active: false, ids: 'email_alert.py',
    },
    {
      num: 5, name: 'Sesion', proto: 'Sockets / Scapy',
      color: '#d29922', detail: 'Scapy abre un socket raw para recibir todos los paquetes del segmento. El modo promiscuo permite capturar trafico no dirigido al host sensor.',
      active: true, ids: 'sniffer.py',
    },
    {
      num: 4, name: 'Transporte', proto: 'UDP (53) / TCP',
      color: '#a5d6ff', detail: 'El filtro de Scapy limita la captura a UDP/53 para eficiencia. DNS sobre TCP se usa para respuestas grandes (>512 bytes) pero es menos comun.',
      active: true, ids: 'sniffer.py (filtro BPF)',
    },
    {
      num: 3, name: 'Red', proto: 'IPv4 / IPv6',
      color: '#79c0ff', detail: 'El IDS captura tanto trafico IPv4 (192.168.x.x) como IPv6 link-local (fe80::). threat_intel.py evalua las IPs de destino contra la blacklist.',
      active: true, ids: 'threat_intel.py',
    },
    {
      num: 2, name: 'Enlace de Datos', proto: 'Ethernet / ARP',
      color: '#3fb950', detail: 'La direccion MAC se extrae de la trama Ethernet y se usa como segundo factor de autenticacion en whitelist.py (IAA: Identificacion, Autenticacion, Autorizacion).',
      active: true, ids: 'whitelist.py',
    },
    {
      num: 1, name: 'Fisica', proto: 'NIC / Cable / WiFi',
      color: '#6e7681', detail: 'El sensor debe estar conectado al mismo segmento de red (switch sin VLAN adicional) para recibir el trafico broadcast DNS de todos los dispositivos.',
      active: false, ids: 'Infraestructura de red',
    },
  ];

  const rows = layers.map(l => `
<div class="osi-layer" style="background:${l.color}08;border-color:${l.color}33">
  <div class="osi-num" style="background:${l.color}22;color:${l.color}">${l.num}</div>
  <div class="osi-name">
    ${esc(l.name)}
    <small>${esc(l.proto)}</small>
  </div>
  <div class="osi-detail">
    ${esc(l.detail)}
    <br><span class="osi-badge ${l.active ? 'badge-active' : 'badge-passive'}">${l.active ? 'Activo en IDS' : 'Pasivo'}</span>
    <span style="font-size:0.68rem;color:#6e7681;margin-left:4px">${esc(l.ids)}</span>
  </div>
</div>`).join('');

  return `
${sectionHeader('fas fa-layer-group', 'icon-cyan', 'Diagrama de Flujo OSI', 'Como el IDS actua en cada capa del modelo OSI')}

<div class="card">
  <div class="card-title"><i class="fas fa-info-circle"></i> Modelo OSI y el IDS</div>
  <p>El sistema opera principalmente en las capas 2 (MAC para autenticacion), 3 (IP para threat intelligence), 4 (filtro UDP/53) y 7 (inspeccion del payload DNS). Las capas 1, 5 y 6 son infraestructura transparente.</p>
</div>

<div class="osi-diagram">${rows}</div>

${alertBox('fas fa-circle-info', 'Para capturar trafico de toda la red, el sensor debe conectarse a un puerto SPAN/espejo del switch, o bien la red debe operar en modo hub/broadcast sin segmentacion adicional por VLAN.', 'alert-info')}

<div class="card" style="margin-top:16px">
  <div class="card-title"><i class="fas fa-route"></i> Ruta de un paquete DNS tipico</div>
  ${codeBlock(
    '# 1. PC cliente genera consulta DNS\n' +
    'Origen: 192.168.1.45:52301  →  Destino: 8.8.8.8:53\n' +
    'Trama Ethernet: MAC_cliente → MAC_gateway\n\n' +
    '# 2. Scapy captura la trama en modo promiscuo (Capa 2)\n' +
    'pkt[Ether].src  = "c4:03:a8:2d:a8:ca"   # MAC del cliente\n' +
    'pkt[IP].src     = "192.168.1.45"          # IP de origen\n' +
    'pkt[DNS].qd.qname = b"google.com."        # Dominio consultado\n\n' +
    '# 3. sniffer.py delega a los modulos\n' +
    'whitelist.verificar(ip, mac)    # Capa 2-3: autorizacion\n' +
    'dns_monitor.registrar(paquete)  # Capa 7: persistencia\n' +
    'threat_intel.verificar_destino(ip_destino)  # Capa 3: blacklist',
    'python', 'Python — Scapy packet parsing'
  )}
</div>`;
}

// ── Contenido: Modulos ────────────────────────────────────────────────────────

function moduleCard(filename, role, desc, funcs, tags = []) {
  const tagHtml = tags.map(([l, c]) => tag(l, c)).join(' ');
  const funcRows = funcs.map(([name, d]) =>
    `<li><span class="func-name">${esc(name)}()</span><span class="func-desc">${esc(d)}</span></li>`
  ).join('');
  return `
<div class="module-card">
  <div class="module-header">
    <i class="fas fa-file-code" style="color:var(--purple)"></i>
    <span class="module-filename">${esc(filename)}</span>
    <span class="module-role">${esc(role)}</span>
  </div>
  <div class="module-body">
    <div style="margin-bottom:10px">${tagHtml}</div>
    <p class="module-desc">${esc(desc)}</p>
    <ul class="func-list">${funcRows}</ul>
  </div>
</div>`;
}

function renderModulos() {
  return `
${sectionHeader('fas fa-cubes', 'icon-purple', 'Modulos del Sistema', 'Descripcion tecnica de cada archivo Python')}

${moduleCard('main.py', 'Punto de entrada', 'Inicializa todos los componentes del sistema. Configura el logging centralizado, arranca el sniffer en un hilo de captura, muestra el banner de inicio y gestiona la salida limpia con Ctrl+C.', [
  ['main()', 'Funcion principal. Parsea argumentos CLI (--reporte, --test-email) y orquesta el arranque.'],
  ['banner()', 'Muestra el encabezado ASCII con version y configuracion activa.'],
  ['_shutdown(sig, frame)', 'Manejador de senal SIGINT/SIGTERM para cierre ordenado.'],
], [['Orchestrator', 'tag-blue'], ['Threading', 'tag-yellow'], ['Logging', 'tag-gray']])}

${moduleCard('config.py', 'Configuracion global', 'Centraliza el acceso a todas las variables de entorno cargadas desde el archivo .env. Ningún otro modulo tiene credenciales hardcoded; todo se obtiene a traves de este modulo. Si una variable obligatoria falta, el sistema termina con mensaje claro.', [
  ['_require(var_name)', 'Obtiene una variable obligatoria del entorno. Termina el proceso si no esta definida.'],
], [['python-dotenv', 'tag-green'], ['Singleton', 'tag-purple'], ['Seguridad', 'tag-red']])}

${moduleCard('sniffer.py', 'Nucleo de captura', 'Nucleo del IDS. Abre un socket raw sobre la interfaz de red configurada y captura todos los paquetes en modo promiscuo. Filtra paquetes DNS (UDP/53) y delega el procesamiento a los demas modulos. Tambien detecta trafico ARP sospechoso (ARP spoofing).', [
  ['iniciar_captura()', 'Llama a scapy.sniff() con el filtro BPF "udp port 53" y callback procesar_paquete.'],
  ['procesar_paquete(pkt)', 'Callback principal. Extrae IP, MAC y query DNS del paquete y coordina los modulos.'],
  ['_es_arp_sospechoso(pkt)', 'Heuristica basica para detectar ARP reply no solicitados.'],
], [['Scapy', 'tag-blue'], ['Raw Sockets', 'tag-yellow'], ['ARP Detection', 'tag-red']])}

${moduleCard('dns_monitor.py', 'Monitor DNS', 'Registra todas las consultas DNS capturadas en la base de datos SQLite. Mantiene una bitacora en texto plano para consulta rapida. Provee funciones de reporte y estadisticas.', [
  ['inicializar_db()', 'Crea la tabla dns_log si no existe. Se llama una sola vez al arrancar.'],
  ['registrar_consulta(ip, mac, dominio, tipo, autorizado)', 'Inserta una fila en la base de datos con timestamp automatico.'],
  ['mostrar_reporte()', 'Imprime en consola las ultimas N consultas con formato tabular.'],
], [['SQLite3', 'tag-blue'], ['Logging', 'tag-gray'], ['Persistencia', 'tag-green']])}

${codeBlock(
  '# Esquema de la tabla principal\nCREATE TABLE dns_log (\n    id          INTEGER PRIMARY KEY AUTOINCREMENT,\n    timestamp   TEXT    NOT NULL,\n    ip_origen   TEXT    NOT NULL,\n    mac_origen  TEXT    NOT NULL,\n    dominio     TEXT    NOT NULL,\n    tipo_query  TEXT    DEFAULT \'A\',\n    autorizado  INTEGER DEFAULT 1  -- 1=autorizado, 0=no autorizado\n)',
  'python', 'SQL — Esquema dns_log'
)}

${moduleCard('whitelist.py', 'Control de acceso IAA', 'Implementa el modelo IAA (Identificacion, Autenticacion, Autorizacion) usando la whitelist de dispositivos. Lee whitelist.json para determinar si una IP/MAC tiene acceso permitido. Sistema anti-spam: cada dispositivo no autorizado genera solo UNA alerta de correo por sesion.', [
  ['cargar_whitelist()', 'Lee whitelist.json y construye un set de IPs/MACs permitidas.'],
  ['verificar_dispositivo(ip, mac)', 'Retorna True si el dispositivo esta autorizado. Genera alerta si no lo esta.'],
  ['_ya_alertado(ip)', 'Verifica si ya se envio alerta para esta IP en la sesion actual (anti-spam).'],
], [['IAA', 'tag-blue'], ['Anti-spam', 'tag-yellow'], ['JSON', 'tag-green']])}

${moduleCard('threat_intel.py', 'Inteligencia de amenazas', 'Carga la lista negra de IPs maliciosas desde blacklist_ips.json. Para cada paquete con destino sospechoso, verifica si la IP aparece en la blacklist. Al detectar una coincidencia, marca el campo detectada=true y dispara una alerta de EMERGENCIA con nivel critico.', [
  ['cargar_blacklist()', 'Carga blacklist_ips.json al inicio. Recarga periodicamente en segundo plano.'],
  ['verificar_destino(ip_destino)', 'Consulta si la IP esta en la lista negra. Thread-safe con Lock.'],
  ['_alertar_amenaza(ip, entrada)', 'Dispara email de EMERGENCIA y registra en el log de alertas.'],
], [['Threat Intel', 'tag-red'], ['Threading', 'tag-yellow'], ['BlackList', 'tag-gray']])}

${moduleCard('forensic.py', 'Automatizacion forense', 'Modulo de respuesta automatica. Cuando threat_intel detecta una IP peligrosa, forensic.py realiza OSINT automatizado: consulta ipwhois (RDAP/Whois gratuito, sin API key) y opcionalmente AbuseIPDB (requiere API key en .env). Genera un reporte estructurado con pais, ASN, proveedor y contacto de abuso.', [
  ['analizar_ip(ip)', 'Funcion principal. Lanza ipwhois y AbuseIPDB en paralelo y combina resultados.'],
  ['_whois(ip)', 'Consulta RDAP/Whois sin API key usando la libreria ipwhois.'],
  ['_abuseipdb(ip)', 'Consulta AbuseIPDB API si ABUSEIPDB_API_KEY esta configurada en .env.'],
  ['generar_reporte(ip, datos)', 'Formatea el reporte HTML y lo envia por correo via email_alert.py.'],
], [['ipwhois', 'tag-cyan'], ['AbuseIPDB', 'tag-red'], ['OSINT', 'tag-purple']])}

${moduleCard('email_alert.py', 'Sistema de alertas', 'Gestiona el envio de correos electronicos al administrador usando SMTP con STARTTLS. Soporta tres tipos de alerta con plantillas HTML: ADVERTENCIA (dispositivo no autorizado), EMERGENCIA (IP peligrosa detectada) y FORENSE (reporte completo de analisis).', [
  ['enviar_advertencia(ip, mac, dominio)', 'Alerta de nivel medio: dispositivo no autorizado detectado.'],
  ['enviar_emergencia(ip_peligrosa, nivel)', 'Alerta critica: conexion a IP en blacklist. Enviada en hilo separado.'],
  ['enviar_forense(ip, reporte_html)', 'Reporte completo con datos de OSINT adjuntos como HTML en el correo.'],
  ['_conectar_smtp()', 'Abre conexion SMTP con STARTTLS usando credenciales de .env.'],
], [['SMTP', 'tag-blue'], ['STARTTLS', 'tag-green'], ['Threading', 'tag-yellow']])}

${moduleCard('dashboard.py', 'API REST y Dashboard', 'Servidor Flask que expone la API REST consumida por el frontend. Lee datos de SQLite y los archivos JSON en cada request (sin cache) para garantizar datos frescos. Implementa CORS para permitir el acceso desde el navegador. Incluye endpoints de administracion para gestionar whitelist, blacklist, configuracion y limpieza de logs.', [
  ['api_dashboard()', 'GET /api/dashboard — Endpoint unificado con stats, DNS, alertas, amenazas y top dominios.'],
  ['api_whitelist_get()', 'GET /api/whitelist — Retorna dispositivos autorizados de whitelist.json.'],
  ['api_whitelist_post()', 'POST /api/whitelist — Agrega un dispositivo nuevo con validacion de IP.'],
  ['api_whitelist_delete(ip)', 'DELETE /api/whitelist/<ip> — Elimina un dispositivo por IP.'],
  ['api_blacklist_get()', 'GET /api/blacklist — Retorna IPs peligrosas de blacklist_ips.json.'],
  ['api_blacklist_post()', 'POST /api/blacklist — Agrega IP peligrosa con nivel de riesgo.'],
  ['api_config_email()', 'POST /api/config/email — Actualiza ADMIN_EMAIL en el archivo .env.'],
  ['api_logs_clear()', 'POST /api/logs/clear — Reinicializa la tabla dns_log en SQLite.'],
], [['Flask', 'tag-blue'], ['REST API', 'tag-cyan'], ['Flask-CORS', 'tag-green'], ['SQLite', 'tag-purple']])}`;
}

// ── Contenido: Credenciales ───────────────────────────────────────────────────

function renderCredenciales() {
  return `
${sectionHeader('fas fa-key', 'icon-yellow', 'Proteccion de Credenciales', 'Gestion segura de secretos mediante archivo .env')}

<div class="card">
  <div class="card-title"><i class="fas fa-shield-halved"></i> Principio de separacion de secretos</div>
  <p>Ningun archivo de codigo fuente (.py) contiene credenciales, contrasenas ni API keys hardcoded. Todos los secretos se almacenan exclusivamente en el archivo <code>.env</code> que <strong>nunca debe subirse a un repositorio de control de versiones</strong>.</p>
</div>

${alertBox('fas fa-ban', 'El archivo .env debe estar incluido en .gitignore. Exponer credenciales SMTP en un repositorio publico permite a atacantes enviar correos desde tu cuenta y superar limites de envio de Gmail.', 'alert-danger')}

<div class="card">
  <div class="card-title"><i class="fas fa-file-code"></i> Estructura del archivo .env</div>
</div>

${codeBlock(
  '# ── SMTP (Gmail recomendado con App Password) ──\n' +
  'SMTP_HOST=smtp.gmail.com\n' +
  'SMTP_PORT=587\n' +
  'SMTP_USER=tu_correo@gmail.com\n' +
  'SMTP_PASSWORD=xxxx xxxx xxxx xxxx   # App Password de 16 caracteres\n\n' +
  '# ── Administrador ──\n' +
  'ADMIN_EMAIL=admin@institucion.mx\n\n' +
  '# ── Organizacion ──\n' +
  'ORG_NAME=Institucion Ejemplo S.A. de C.V.\n\n' +
  '# ── Red ──\n' +
  'NETWORK_INTERFACE=eth0   # o wlan0, enp3s0, etc.\n\n' +
  '# ── APIs externas (opcionales) ──\n' +
  'ABUSEIPDB_API_KEY=     # Dejar vacio si no se usa\n\n' +
  '# ── Nivel de log ──\n' +
  'LOG_LEVEL=INFO   # DEBUG, INFO, WARNING, ERROR',
  'env', '.env — Variables de entorno'
)}

<div class="card">
  <div class="card-title"><i class="fab fa-google"></i> Configurar App Password de Gmail</div>
  <p>Gmail no permite usar la contrasena normal de la cuenta en aplicaciones de terceros. Se debe generar una <strong>App Password</strong> especifica para el IDS:</p>
</div>

${codeBlock(
  '# 1. Activar verificacion en dos pasos en Google Account\n' +
  '#    myaccount.google.com > Seguridad > Verificacion en 2 pasos\n\n' +
  '# 2. Generar App Password\n' +
  '#    myaccount.google.com > Seguridad > Contrasenas de aplicaciones\n' +
  '#    Seleccionar: Correo + Otro (nombre: IDS-Institucional)\n\n' +
  '# 3. Copiar las 16 letras generadas al .env\n' +
  'SMTP_PASSWORD=abcd efgh ijkl mnop   # Ejemplo de formato',
  'bash', 'Bash — Pasos para App Password'
)}

<h3 style="font-size:0.95rem;font-weight:700;color:var(--txt1);margin:24px 0 12px">Variables del sistema</h3>

<table class="doc-table">
  <thead>
    <tr>
      <th>Variable</th>
      <th>Obligatoria</th>
      <th>Descripcion</th>
      <th>Ejemplo</th>
    </tr>
  </thead>
  <tbody>
    ${[
      ['SMTP_HOST',         'No',  'Servidor SMTP de correo saliente',     'smtp.gmail.com'],
      ['SMTP_PORT',         'No',  'Puerto SMTP (587=STARTTLS, 465=SSL)',   '587'],
      ['SMTP_USER',         'Si',  'Cuenta de correo que envia las alertas','ids@empresa.mx'],
      ['SMTP_PASSWORD',     'Si',  'Contrasena o App Password SMTP',        'xxxx xxxx xxxx xxxx'],
      ['ADMIN_EMAIL',       'Si',  'Correo del administrador que recibe alertas','admin@empresa.mx'],
      ['ORG_NAME',          'No',  'Nombre de la organizacion para reportes','Empresa S.A.'],
      ['NETWORK_INTERFACE', 'No',  'Interfaz de red a monitorear',          'eth0'],
      ['ABUSEIPDB_API_KEY', 'No',  'API key de AbuseIPDB para reportes forenses','(vacio)'],
      ['LOG_LEVEL',         'No',  'Nivel de detalle del log del sistema',  'INFO'],
    ].map(([v, o, d, e]) => `
    <tr>
      <td><code>${esc(v)}</code></td>
      <td><span class="tag ${o === 'Si' ? 'tag-red' : 'tag-gray'}">${esc(o)}</span></td>
      <td>${esc(d)}</td>
      <td><code style="color:var(--txt3)">${esc(e)}</code></td>
    </tr>`).join('')}
  </tbody>
</table>

<div class="card">
  <div class="card-title"><i class="fas fa-lock"></i> Permisos del archivo .env</div>
</div>

${codeBlock(
  '# Restringir lectura solo al dueno del proceso\nchmod 600 .env\nchown root:root .env   # Si el sistema corre como root\n\n# Verificar que .gitignore lo excluye\ngrep ".env" .gitignore\n\n# Archivo .gitignore recomendado\necho ".env" >> .gitignore\necho "*.pyc" >> .gitignore\necho "__pycache__/" >> .gitignore\necho "venv/" >> .gitignore',
  'bash', 'Bash — Permisos de seguridad'
)}`;
}

// ── Contenido: Juridico ───────────────────────────────────────────────────────

function renderJuridico() {
  return `
${sectionHeader('fas fa-scale-balanced', 'icon-red', 'Analisis Juridico Mexicano', 'Marco legal aplicable al monitoreo de redes institucionales en Mexico')}

${alertBox('fas fa-triangle-exclamation', 'Este analisis tiene fines informativos y academicos. No constituye asesoria legal. Para implementaciones en entornos de produccion, consulte con un abogado especializado en derecho informatico mexicano.', 'alert-warning')}

<div class="card">
  <div class="card-title"><i class="fas fa-balance-scale"></i> Fundamento de legalidad del monitoreo</div>
  <p>El monitoreo de redes institucionales es <strong>legal y obligatorio</strong> en el contexto de seguridad de la informacion cuando se cumplen tres condiciones: (1) existe una politica de uso aceptable publicada y firmada por los usuarios, (2) el monitoreo se realiza sobre infraestructura propia de la organizacion, y (3) los datos recopilados se usan exclusivamente para fines de seguridad.</p>
</div>

<h3 style="font-size:0.95rem;font-weight:700;color:var(--txt1);margin:24px 0 12px">
  <i class="fas fa-book" style="color:var(--red);margin-right:8px"></i>
  Leyes y articulos aplicables
</h3>

<div class="legal-article">
  <div class="legal-ref">LFPDPPP — Ley Federal de Proteccion de Datos Personales en Posesion de los Particulares (2010)</div>
  <p><strong>Articulo 16:</strong> El responsable debera adoptar las medidas de seguridad administrativas, fisicas y tecnicas para proteger los datos personales contra dano, perdida, alteracion o acceso no autorizado. <strong>El IDS cumple con este articulo</strong> al monitorear el acceso a la red para detectar accesos no autorizados.</p>
</div>

<div class="legal-article">
  <div class="legal-ref">LGPDPPSO — Ley General de Proteccion de Datos Personales en Posesion de Sujetos Obligados (2017)</div>
  <p><strong>Articulo 31:</strong> Los sujetos obligados deberan establecer y mantener medidas de seguridad de caracter administrativo, fisico y tecnico para la proteccion de datos personales. Aplica a entidades publicas. <strong>El IDS es un mecanismo de cumplimiento</strong> de este articulo para instituciones gubernamentales.</p>
</div>

<div class="legal-article">
  <div class="legal-ref">Codigo Penal Federal — Articulo 211 bis 1 (Acceso ilicito a sistemas)</div>
  <p>Sanciona con 6 meses a 2 anos de prision a quien <strong>sin autorizacion</strong> modifique, destruya o provoque perdida de informacion en sistemas informaticos. <strong>El IDS detecta y registra</strong> estos intentos como evidencia digital para denuncias formales ante el Ministerio Publico Federal.</p>
</div>

<div class="legal-article">
  <div class="legal-ref">Codigo Penal Federal — Articulo 211 bis 2 (Agravantes en sistemas protegidos)</div>
  <p>Las penas se duplican cuando el acceso ilicito afecta sistemas de instituciones financieras, educativas, de salud o gubernamentales. Los logs generados por el IDS constituyen <strong>prueba digital admisible</strong> conforme al Articulo 217 del Codigo Federal de Procedimientos Penales.</p>
</div>

<div class="legal-article">
  <div class="legal-ref">NOM-151-SCFI-2016 — Conservacion de mensajes de datos y digitalizacion</div>
  <p>Establece los requisitos para la conservacion de mensajes de datos con validez legal. Los logs del IDS deben conservarse con <strong>integridad, autenticidad y disponibilidad</strong>. Se recomienda firma digital de los archivos de log para garantizar no repudio.</p>
</div>

<div class="legal-article">
  <div class="legal-ref">Ley Federal del Trabajo — Articulo 134, fraccion X</div>
  <p>Establece la obligacion del trabajador de observar las medidas de seguridad e higiene que dicte el patron. Una <strong>Politica de Uso Aceptable (AUP)</strong> firmada por empleados ampara juridicamente el monitoreo de red institucional.</p>
</div>

<h3 style="font-size:0.95rem;font-weight:700;color:var(--txt1);margin:24px 0 12px">
  <i class="fas fa-clipboard-list" style="color:var(--yellow);margin-right:8px"></i>
  Requisitos para monitoreo legal
</h3>

<div class="grid-2">
  <div class="card">
    <div class="card-title"><i class="fas fa-file-signature"></i> Documentacion obligatoria</div>
    <ul style="list-style:none;padding:0">
      ${[
        'Politica de Uso Aceptable (AUP) firmada por todos los usuarios',
        'Aviso de privacidad publicado (LFPDPPP Art. 15-16)',
        'Procedimiento de respuesta a incidentes documentado',
        'Registro de actividades de tratamiento de datos personales',
        'Designacion de Responsable de Proteccion de Datos',
      ].map(i => `<li style="padding:5px 0;border-bottom:1px solid var(--border);font-size:0.82rem;color:var(--txt2);display:flex;gap:8px"><i class="fas fa-check" style="color:var(--green);margin-top:3px;flex-shrink:0"></i>${esc(i)}</li>`).join('')}
    </ul>
  </div>
  <div class="card">
    <div class="card-title"><i class="fas fa-shield-halved"></i> Limitaciones del monitoreo</div>
    <ul style="list-style:none;padding:0">
      ${[
        'Solo monitorear infraestructura propia de la organizacion',
        'No interceptar contenido cifrado (HTTPS) de sitios personales',
        'No almacenar datos por mas tiempo del necesario para seguridad',
        'Restringir acceso a logs solo al personal de TI autorizado',
        'No usar los datos recopilados para fines distintos a la seguridad',
      ].map(i => `<li style="padding:5px 0;border-bottom:1px solid var(--border);font-size:0.82rem;color:var(--txt2);display:flex;gap:8px"><i class="fas fa-minus" style="color:var(--yellow);margin-top:3px;flex-shrink:0"></i>${esc(i)}</li>`).join('')}
    </ul>
  </div>
</div>

<div class="card" style="margin-top:16px">
  <div class="card-title"><i class="fas fa-gavel"></i> Valor probatorio de los logs</div>
  <p>Los registros del IDS pueden usarse como prueba digital en procesos judiciales si se garantiza su <strong>cadena de custodia</strong>: los archivos de log no deben ser modificables por el administrador, deben tener timestamp sincronizado con NTP y, de ser posible, deben firmarse digitalmente con hash SHA-256 al momento de escritura.</p>
</div>`;
}

// ── Contenido: Privacidad ─────────────────────────────────────────────────────

function renderPrivacidad() {
  const fecha = '10 de junio de 2026';
  return `
${sectionHeader('fas fa-file-shield', 'icon-green', 'Politica de Privacidad', 'Aviso de privacidad conforme a la LFPDPPP')}

<div class="card">
  <div class="card-title"><i class="fas fa-building"></i> Responsable del tratamiento de datos</div>
  <p>El responsable del Sistema IDS Institucional es la organizacion propietaria de la red monitoreada. Los datos personales recopilados se tratan conforme a la Ley Federal de Proteccion de Datos Personales en Posesion de los Particulares (LFPDPPP) y su Reglamento.</p>
  <p style="margin-top:8px;font-size:0.75rem;color:var(--txt3)">Ultima actualizacion: ${esc(fecha)}</p>
</div>

<h3 style="font-size:0.95rem;font-weight:700;color:var(--txt1);margin:24px 0 12px">1. Datos que recopila el sistema</h3>

<table class="doc-table">
  <thead>
    <tr><th>Dato</th><th>Tipo</th><th>Finalidad</th><th>Retencion</th></tr>
  </thead>
  <tbody>
    ${[
      ['Direccion IP de origen',    'Tecnico',  'Identificacion de dispositivo en la red',                   'Hasta limpieza manual o 90 dias'],
      ['Direccion MAC',             'Tecnico',  'Autenticacion de dispositivo (IAA)',                        'Hasta limpieza manual o 90 dias'],
      ['Dominio DNS consultado',    'Tecnico',  'Deteccion de accesos a sitios no autorizados',             'Hasta limpieza manual o 90 dias'],
      ['Timestamp de la consulta',  'Tecnico',  'Correlacion de eventos y analisis forense',                 'Hasta limpieza manual o 90 dias'],
      ['Tipo de query DNS',         'Tecnico',  'Clasificacion del trafico de red',                         'Hasta limpieza manual o 90 dias'],
      ['Estado de autorizacion',    'Tecnico',  'Registro de accesos permitidos o bloqueados',              'Hasta limpieza manual o 90 dias'],
    ].map(([d, t, f, r]) => `<tr><td><code>${esc(d)}</code></td><td>${tag(t, 'tag-blue')}</td><td>${esc(f)}</td><td style="font-size:0.78rem;color:var(--txt3)">${esc(r)}</td></tr>`).join('')}
  </tbody>
</table>

<h3 style="font-size:0.95rem;font-weight:700;color:var(--txt1);margin:24px 0 12px">2. Finalidades del tratamiento</h3>

<div class="card">
  <ul style="list-style:none;padding:0">
    ${[
      ['Primaria', 'Deteccion de intrusos y accesos no autorizados a la red institucional'],
      ['Primaria', 'Identificacion de dispositivos conectados a la red'],
      ['Primaria', 'Deteccion de conexiones a IPs catalogadas como peligrosas'],
      ['Primaria', 'Generacion de evidencia digital para procesos de seguridad informatica'],
      ['Secundaria', 'Estadisticas agregadas de uso de la red (sin identificacion individual)'],
      ['Secundaria', 'Mejora de las listas blancas y negras del sistema'],
    ].map(([t, d]) => `<li style="padding:7px 0;border-bottom:1px solid var(--border);font-size:0.82rem;color:var(--txt2);display:flex;gap:10px;align-items:flex-start">
      ${tag(t, t === 'Primaria' ? 'tag-blue' : 'tag-gray')} ${esc(d)}
    </li>`).join('')}
  </ul>
</div>

<h3 style="font-size:0.95rem;font-weight:700;color:var(--txt1);margin:24px 0 12px">3. Transferencia de datos</h3>

<div class="card">
  <p>Los datos recopilados <strong>no se transfieren ni venden</strong> a terceros con fines comerciales. Unicamente se comparten en los siguientes casos:</p>
  <ul style="margin-top:10px;padding-left:20px">
    <li style="font-size:0.82rem;color:var(--txt2);margin-bottom:6px">Autoridades competentes mediante orden judicial o requerimiento de Ministerio Publico.</li>
    <li style="font-size:0.82rem;color:var(--txt2);margin-bottom:6px">Servicios externos de verificacion de amenazas (AbuseIPDB) — solo IPs, sin datos de usuario.</li>
    <li style="font-size:0.82rem;color:var(--txt2)">Proveedores de hosting del dashboard si este se aloja fuera de la red local.</li>
  </ul>
</div>

<h3 style="font-size:0.95rem;font-weight:700;color:var(--txt1);margin:24px 0 12px">4. Derechos ARCO</h3>

<div class="grid-2">
  ${[
    ['A', 'Acceso', 'fas fa-eye', 'Solicitar informacion sobre los datos que el sistema tiene registrados del dispositivo.'],
    ['R', 'Rectificacion', 'fas fa-pen', 'Corregir datos incorrectos, como un nombre erroneo en la whitelist.'],
    ['C', 'Cancelacion', 'fas fa-trash', 'Solicitar la eliminacion de registros especificos del historial DNS.'],
    ['O', 'Oposicion', 'fas fa-hand', 'Oponerse al monitoreo de un dispositivo especifico (sujeto a politica institucional).'],
  ].map(([letra, nombre, icon, desc]) => `
  <div class="card">
    <div class="card-title"><i class="${icon}"></i> Derecho de ${esc(nombre)} (${letra})</div>
    <p>${esc(desc)}</p>
    <p style="margin-top:8px;font-size:0.75rem;color:var(--txt3)">Plazo de respuesta: 20 dias habiles (LFPDPPP Art. 32)</p>
  </div>`).join('')}
</div>

<h3 style="font-size:0.95rem;font-weight:700;color:var(--txt1);margin:24px 0 12px">5. Medidas de seguridad implementadas</h3>

<div class="card">
  <ul style="list-style:none;padding:0">
    ${[
      'Credenciales SMTP almacenadas en archivo .env con permisos 600 (lectura solo para el propietario)',
      'Comunicaciones de alerta via SMTP con cifrado STARTTLS (TLS 1.2+)',
      'Acceso al dashboard protegido por red local (no expuesto a Internet por default)',
      'Base de datos SQLite con permisos de sistema de archivos restringidos',
      'Logs de alertas en texto plano con acceso solo para el administrador del sistema',
      'Sin almacenamiento de contrasenas, tokens de sesion ni credenciales de usuarios finales',
    ].map(m => `<li style="padding:6px 0;border-bottom:1px solid var(--border);font-size:0.82rem;color:var(--txt2);display:flex;gap:8px"><i class="fas fa-lock" style="color:var(--green);margin-top:3px;flex-shrink:0"></i>${esc(m)}</li>`).join('')}
  </ul>
</div>

${alertBox('fas fa-circle-info', 'Para ejercer derechos ARCO o reportar incidentes de privacidad, contacte al Responsable de Proteccion de Datos de su organizacion. El INAI (inai.org.mx) es la autoridad de proteccion de datos en Mexico.', 'alert-info')}`;
}

// ── Construir navegacion y renderizar ─────────────────────────────────────────

function buildNav() {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = SECTIONS.map(s => `
<div class="nav-item" id="nav-${s.id}" onclick="scrollToSection('${s.id}')">
  <i class="${s.navIcon}"></i>
  ${esc(s.nav)}
</div>`).join('');
}

function scrollToSection(id) {
  const el = document.getElementById('section-' + id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setActiveNav(id);
  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

function setActiveNav(id) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const item = document.getElementById('nav-' + id);
  if (item) item.classList.add('active');
}

function buildContent() {
  const root = document.getElementById('content-root');
  root.innerHTML = SECTIONS.map(s => `
<section class="doc-section" id="section-${s.id}">
  ${s.render()}
</section>`).join('');
}

function setupScrollSpy() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id.replace('section-', '');
        setActiveNav(id);
      }
    });
  }, { threshold: 0.2, rootMargin: '-80px 0px -60% 0px' });

  SECTIONS.forEach(s => {
    const el = document.getElementById('section-' + s.id);
    if (el) observer.observe(el);
  });
}

function setupSidebarToggle() {
  const btn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  btn.addEventListener('click', () => sidebar.classList.toggle('open'));
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  buildContent();
  setupScrollSpy();
  setupSidebarToggle();

  // Activar primera seccion
  if (SECTIONS.length > 0) setActiveNav(SECTIONS[0].id);
});
