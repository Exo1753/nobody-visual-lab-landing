/* Valentina · burbuja de chat de Nobody Visual Lab (archivo: mrnobody.js)
   Se agrega a la página con:  <script src="/mrnobody.js" defer></script>
   Llena CONFIG con tus datos (la "anon key" de Supabase es pública por diseño: está bien que vaya aquí;
   la "service_role" NUNCA va en la página). */
(function () {
  var CONFIG = {
    servidor: 'https://desktop-0sbdm32.tailb7daf8.ts.net:10000', // tu PC (Tailscale Funnel)
    supabaseUrl: 'https://bnxvnftyblcgkgelbudb.supabase.co',
    supabaseAnon: 'sb_publishable_ltaNA7nnVozoSCOcZIjg', // Supabase → Settings → API Keys: la "publishable" (sb_publishable_…) o la "anon" vieja (eyJ…)
    whatsapp: '',                 // opcional, ej. '5216671234567' → muestra botón "Escríbenos por WhatsApp"
    dias: [1, 2, 3, 4, 5, 6],     // 1 = lunes … 7 = domingo
    desde: 9, hasta: 17,          // horario de oficina
    utcOffset: -7,                // Sinaloa / Sonora
    nombre: 'Valentina',          // el nombre que ve el cliente
    foto: '','/images/valentina-chat.jpg',// opcional: su foto en el círculo, ej. '/images/valentina-chat.jpg' (si está vacío sale la inicial)
    saludo: '¡Hola! Soy Valentina, de Nobody Visual Lab. ¿Qué te gustaría crear para tu marca?',
    video: '',                    // opcional: video corto en loop arriba del chat, ej. '/images/valentina-loop.mp4' (sin audio, 3-6 s)
  };
  if (window.__mrnobody) return; window.__mrnobody = true;

  // ── Horario (hora de México del Pacífico, sin importar la zona del visitante) ──
  var ahora = function () { var d = new Date(); return new Date(d.getTime() + d.getTimezoneOffset() * 60000 + CONFIG.utcOffset * 3600000); };
  var abierto = function () { var n = ahora(); var dia = n.getDay() || 7; return CONFIG.dias.indexOf(dia) >= 0 && n.getHours() >= CONFIG.desde && n.getHours() < CONFIG.hasta; };
  var DIAS = ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  var horarioTxt = function () { var d = CONFIG.dias; return (d.length ? (d.length === 1 ? DIAS[d[0]] : DIAS[d[0]] + ' a ' + DIAS[d[d.length - 1]]) + ' de ' : '') + CONFIG.desde + ':00 a ' + CONFIG.hasta + ':00'; };
  var ls = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  // ── Interfaz (en shadow DOM: no choca con los estilos de la página) ──
  var host = document.createElement('div'); host.id = 'mrnobody';
  document.body.appendChild(host);
  var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
  root.innerHTML = '<style>' +
    ':host{all:initial}*{box-sizing:border-box;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}' +
    '.bur{position:fixed;right:20px;bottom:20px;z-index:2147483000;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;background:#0d0d0f;color:#fff;box-shadow:0 8px 28px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;letter-spacing:-.02em;outline:1.5px solid rgba(255,255,255,.18)}' +
    '.bur img,.av img{width:100%;height:100%;object-fit:cover;object-position:center 20%;border-radius:50%;display:block}.av{overflow:hidden}.bur .ini{display:contents}' +
    '.bur:hover{transform:scale(1.05)}.bur .p{position:absolute;top:3px;right:3px;width:12px;height:12px;border-radius:50%;background:#3ddc97;border:2px solid #0d0d0f}.bur .p.off{background:#8a8a8f}' +
    '.ven{position:fixed;right:20px;bottom:92px;z-index:2147483000;width:min(370px,calc(100vw - 32px));height:min(560px,calc(100vh - 120px));background:#0d0d0f;color:#f2f2f3;border-radius:18px;border:1px solid rgba(255,255,255,.12);box-shadow:0 18px 60px rgba(0,0,0,.5);display:none;flex-direction:column;overflow:hidden}' +
    '.ven.on{display:flex}@media (max-width:480px){.ven{right:16px;left:16px;width:auto;bottom:86px}}' +
    '.cab{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:10px}.cab b{font-size:15px}.cab small{display:block;font-size:11.5px;color:#9b9ba1;margin-top:2px}.cab button{margin-left:auto;background:none;border:none;color:#9b9ba1;font-size:20px;cursor:pointer;line-height:1}' +
    '.av{width:34px;height:34px;border-radius:50%;background:#fff;color:#0d0d0f;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex:none}' +
    '.msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px}' +
    '.m{max-width:85%;padding:9px 12px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}.m.b{background:#1c1c20;align-self:flex-start;border-bottom-left-radius:4px}.m.u{background:#fff;color:#0d0d0f;align-self:flex-end;border-bottom-right-radius:4px}' +
    '.vid{align-self:stretch;margin:-14px -14px 4px;height:170px;overflow:hidden;position:relative;flex:none}.vid video{width:100%;height:100%;object-fit:cover;object-position:center 22%;display:block}.vid:after{content:"";position:absolute;inset:auto 0 0 0;height:60px;background:linear-gradient(transparent,#0d0d0f)}' +
    '.esc{align-self:flex-start;color:#9b9ba1;font-size:12.5px;padding:4px 2px}' +
    '.pie{padding:10px;border-top:1px solid rgba(255,255,255,.08);display:flex;gap:8px}.pie input{flex:1;background:#1c1c20;border:1px solid rgba(255,255,255,.1);color:#fff;border-radius:12px;padding:10px 12px;font-size:14px;outline:none}' +
    '.pie button,.btn{background:#fff;color:#0d0d0f;border:none;border-radius:12px;padding:0 14px;font-weight:700;font-size:13.5px;cursor:pointer}.pie button:disabled{opacity:.5;cursor:default}' +
    '.acc{display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 10px}.acc button{background:transparent;color:#f2f2f3;border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:6px 11px;font-size:12.5px;cursor:pointer}' +
    '.form{background:#16161a;border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:8px;align-self:stretch}' +
    '.form input,.form textarea{background:#0d0d0f;border:1px solid rgba(255,255,255,.12);color:#fff;border-radius:10px;padding:9px 10px;font-size:14px;outline:none;width:100%;resize:vertical}' +
    '.form .btn{padding:10px}.form small{color:#9b9ba1;font-size:11.5px}.ok{color:#3ddc97}.err{color:#ff8f8f}' +
    '</style>' +
    '<button class="bur" aria-label="Abrir chat" title="¿Dudas? Escríbeme"><span class="ini"></span><span class="p"></span></button>' +
    '<div class="ven" role="dialog" aria-label="Chat">' +
    '<div class="cab"><div class="av"><span class="ini"></span></div><div><b class="nom"></b><small class="est"></small></div><button class="x" aria-label="Cerrar">×</button></div>' +
    '<div class="msgs"></div><div class="acc"></div>' +
    '<form class="pie"><input class="txt" placeholder="Escribe tu pregunta…" maxlength="800" autocomplete="off"><button class="env" type="submit">Enviar</button></form></div>';

  var $ = function (s) { return root.querySelector(s); };
  var bur = $('.bur'), ven = $('.ven'), msgs = $('.msgs'), acc = $('.acc'), est = $('.est'), txt = $('.txt'), env = $('.env'), punto = $('.bur .p');
  root.querySelector('.nom').textContent = CONFIG.nombre; bur.setAttribute('aria-label', 'Abrir chat con ' + CONFIG.nombre); ven.setAttribute('aria-label', 'Chat con ' + CONFIG.nombre);
  root.querySelectorAll('.ini').forEach(function (el) {
    if (CONFIG.foto) { var im = document.createElement('img'); im.src = CONFIG.foto; im.alt = CONFIG.nombre; el.appendChild(im); } else el.textContent = CONFIG.nombre.charAt(0);
  });
  var hist = [], enLinea = null, formHecho = false, abiertoYa = false;
  var AVISO_FUERA = function () { return 'Ahorita estamos fuera de horario (' + horarioTxt() + '). Si gustas, déjanos tus datos con el botón de abajo y te respondemos en cuanto abramos.'; };
  var AVISO_APAGADO = function () { return 'Ahorita no puedo platicar. Si gustas, déjanos tus datos con el botón de abajo y te escribimos muy pronto.'; };
  var yo = ls.get('mrn_id') || (Math.random().toString(36).slice(2) + Date.now().toString(36)); ls.set('mrn_id', yo); // para el límite de mensajes por persona

  var add = function (quien, texto) { var d = document.createElement('div'); d.className = 'm ' + quien; d.textContent = texto; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; };
  var estado = function () {
    var on = abierto() && enLinea !== false;
    est.textContent = on ? 'En línea · te respondo al momento' : 'Fuera de línea · horario ' + horarioTxt();
    punto.className = 'p' + (on ? '' : ' off');
    txt.disabled = env.disabled = !on;
    $('.pie').style.display = on ? '' : 'none';
    txt.placeholder = on ? 'Escribe tu pregunta…' : 'Déjanos tus datos y te escribimos';
  };
  var botones = function () {
    acc.innerHTML = '';
    var b1 = document.createElement('button'); b1.textContent = 'Dejar mis datos'; b1.onclick = function () { formulario(''); }; acc.appendChild(b1);
    if (CONFIG.whatsapp) { var b2 = document.createElement('button'); b2.textContent = 'Escríbenos por WhatsApp'; b2.onclick = function () { window.open('https://wa.me/' + CONFIG.whatsapp, '_blank', 'noopener'); }; acc.appendChild(b2); }
  };

  // ¿Está prendida la PC? (4 s de espera)
  var revisar = function () {
    if (!abierto()) { enLinea = false; estado(); return Promise.resolve(false); }
    var ctl = window.AbortController ? new AbortController() : null; var t = setTimeout(function () { ctl && ctl.abort(); }, 4000);
    return fetch(CONFIG.servidor + '/salud', { signal: ctl ? ctl.signal : undefined }).then(function (r) { return r.json(); })
      .then(function (d) { enLinea = !!(d && d.ok && d.abierto); }).catch(function () { enLinea = false; })
      .then(function () { clearTimeout(t); estado(); return enLinea; });
  };

  // ── Guardar prospecto en Supabase (tabla prospectos: la página solo puede insertar) ──
  var charlaTxt = function () { return hist.map(function (m) { return (m.role === 'user' ? 'Cliente: ' : CONFIG.nombre + ': ') + m.content; }).join('\n').slice(-1600); };
  var guardar = function (p) {
    return fetch(CONFIG.supabaseUrl + '/rest/v1/prospectos', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json', apikey: CONFIG.supabaseAnon, Prefer: 'return=minimal' },
        /^eyJ/.test(CONFIG.supabaseAnon) ? { Authorization: 'Bearer ' + CONFIG.supabaseAnon } : {}),
      body: JSON.stringify({ nombre: (p.nombre || 'Sin nombre').slice(0, 120), whatsapp: p.whatsapp || null, correo: p.correo || null, marca: p.marca || null,
        mensaje: (p.mensaje || '').slice(0, 1000) || null, conversacion: charlaTxt() || null, origen: 'web', pagina: location.pathname.slice(0, 200) }),
    }).then(function (r) { if (!r.ok) throw new Error(r.status); ls.set('mrn_envio', String(Date.now())); formHecho = true; });
  };
  var guardado = '';
  // ── Formulario (opcional, con el botón "Dejar mis datos") ──
  var formulario = function (motivo) {
    if (formHecho) { add('b', '¡Ya tenemos tus datos! Te escribimos pronto.'); return; }
    if (root.querySelector('.form')) { root.querySelector('.form input').focus(); return; }
    if (motivo) add('b', motivo);
    var f = document.createElement('form'); f.className = 'form';
    f.innerHTML = '<input name="nombre" placeholder="Tu nombre" maxlength="120" required>' +
      '<input name="whatsapp" placeholder="Tu WhatsApp (10 dígitos)" maxlength="25" inputmode="tel">' +
      '<input name="correo" placeholder="o tu correo" maxlength="120" type="email">' +
      '<input name="marca" placeholder="Tu marca o Instagram (opcional)" maxlength="120">' +
      '<textarea name="mensaje" rows="2" placeholder="¿Qué te gustaría crear?" maxlength="1000"></textarea>' +
      '<button class="btn" type="submit">Enviar mis datos</button><small class="nota">Solo los usamos para contactarte.</small>';
    msgs.appendChild(f); msgs.scrollTop = msgs.scrollHeight; f.nombre.focus();
    f.onsubmit = function (e) {
      e.preventDefault();
      var nota = f.querySelector('.nota'), btn = f.querySelector('button');
      var tel = f.whatsapp.value.replace(/[^\d+]/g, ''), mail = f.correo.value.trim();
      if (tel && tel.replace(/\D/g, '').length < 10) { nota.className = 'nota err'; nota.textContent = 'Revisa tu WhatsApp: deben ser al menos 10 dígitos.'; return; }
      if (!tel && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) { nota.className = 'nota err'; nota.textContent = 'Déjanos tu WhatsApp o tu correo para poder contestarte.'; return; }
      var ult = Number(ls.get('mrn_envio') || 0);
      if (Date.now() - ult < 5 * 60000) { nota.className = 'nota err'; nota.textContent = 'Ya enviaste tus datos hace un momento. ¡Te escribimos pronto!'; return; }
      btn.disabled = true; btn.textContent = 'Enviando…';
      guardar({ nombre: f.nombre.value.trim(), whatsapp: tel.slice(0, 25), correo: mail || null, marca: f.marca.value.trim().slice(0, 120), mensaje: f.mensaje.value.trim() }).then(function () {
        f.remove();
        add('b', '¡Listo, ' + f.nombre.value.trim().split(' ')[0] + '! Recibimos tus datos. Te escribimos ' + (tel ? 'por WhatsApp ' : 'por correo ') + (abierto() ? 'muy pronto' : 'en cuanto abramos (' + horarioTxt() + ')') + '.');
      }).catch(function () {
        btn.disabled = false; btn.textContent = 'Enviar mis datos'; nota.className = 'nota err';
        nota.textContent = 'No se pudo enviar. Intenta de nuevo' + (CONFIG.whatsapp ? ' o escríbenos por WhatsApp.' : '.');
      });
    };
  };

  // ── Platicar con la PC ──
  var enviar = function (e) {
    e && e.preventDefault();
    var t = txt.value.trim(); if (!t || env.disabled) return;
    txt.value = ''; add('u', t); hist.push({ role: 'user', content: t });
    var esc = document.createElement('div'); esc.className = 'esc'; esc.textContent = CONFIG.nombre + ' está escribiendo…'; msgs.appendChild(esc); msgs.scrollTop = msgs.scrollHeight;
    env.disabled = true;
    var ctl = window.AbortController ? new AbortController() : null; var to = setTimeout(function () { ctl && ctl.abort(); }, 75000);
    fetch(CONFIG.servidor + '/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-MRN-Id': yo }, body: JSON.stringify({ mensajes: hist.slice(-10) }), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (d) {
        esc.remove();
        if (d.fuera) { enLinea = false; estado(); add('b', AVISO_FUERA()); return; }
        if (!d.respuesta) { add('b', d.error || 'Se me fue la señal. Si gustas, déjanos tus datos con el botón de abajo y te escribimos.'); return; }
        add('b', d.respuesta); hist.push({ role: 'assistant', content: d.respuesta });
        var c = d.contacto;
        if (c && (c.whatsapp || c.correo)) {  // dio sus datos en la plática: se guardan solos
          var clave = (c.whatsapp || '') + '|' + (c.correo || '');
          if (clave !== guardado) { guardado = clave; guardar({ nombre: c.nombre, whatsapp: c.whatsapp, correo: c.correo, mensaje: c.resumen }).catch(function () {}); }
        }
      })
      .catch(function () { esc.remove(); enLinea = false; estado(); add('b', AVISO_APAGADO()); })
      .then(function () { clearTimeout(to); if (enLinea !== false && abierto()) env.disabled = false; txt.focus(); });
  };
  $('.pie').addEventListener('submit', enviar);

  var abrir = function () {
    ven.classList.toggle('on');
    if (!ven.classList.contains('on')) return;
    if (!abiertoYa) {
      abiertoYa = true; botones();
      if (CONFIG.video) { var v = document.createElement('div'); v.className = 'vid'; v.innerHTML = '<video autoplay muted loop playsinline preload="auto"></video>'; v.firstChild.src = CONFIG.video; msgs.appendChild(v); }
      revisar().then(function (on) {
        if (on) { add('b', CONFIG.saludo); txt.focus(); }
        else if (!abierto()) add('b', '¡Hola! Soy ' + CONFIG.nombre + '. ' + AVISO_FUERA());
        else add('b', '¡Hola! Soy ' + CONFIG.nombre + '. ' + AVISO_APAGADO());
      });
    }
  };
  bur.addEventListener('click', abrir);
  $('.x').addEventListener('click', function () { ven.classList.remove('on'); });
  estado();
  setInterval(function () { if (abiertoYa) estado(); }, 60000);
})();
