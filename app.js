const QUADRANTS = [
  { key:'S', label:'Stärken',  sub:'Interne Vorteile',      cls:'s-badge', color:'#639922', textColor:'#3B6D11' },
  { key:'W', label:'Schwächen',sub:'Interne Nachteile',      cls:'w-badge', color:'#E24B4A', textColor:'#A32D2D' },
  { key:'O', label:'Chancen',  sub:'Externe Möglichkeiten', cls:'o-badge', color:'#1D9E75', textColor:'#0F6E56' },
  { key:'T', label:'Risiken',  sub:'Externe Bedrohungen',   cls:'t-badge', color:'#BA7517', textColor:'#854F0B' }
];

let state = {
  S: [{ id: 1, text: '', rating: 0 }],
  W: [{ id: 2, text: '', rating: 0 }],
  O: [{ id: 3, text: '', rating: 0 }],
  T: [{ id: 4, text: '', rating: 0 }]
};
let nextId = 5;

// ── Scoring ────────────────────────────────────────────────────────────────

function avgRating(items) {
  const rated = items.filter(i => i.rating > 0);
  if (!rated.length) return 0;
  return rated.reduce((s, i) => s + i.rating, 0) / rated.length;
}

function calcScore() {
  const s = avgRating(state.S);
  const w = avgRating(state.W);
  const o = avgRating(state.O);
  const t = avgRating(state.T);
  return { s, w, o, t, net: (s + o) - (w + t) };
}

function getVerdict(net) {
  const hasData = QUADRANTS.some(q => state[q.key].some(i => i.rating > 0));
  if (!hasData)  return { icon:'?',  bg:'#f1efe8', iconBg:'#B4B2A9', title:'Noch keine Bewertungen',      desc:'Trage Argumente ein und bewerte sie mit Sternen, um ein Ergebnis zu erhalten.', titleColor:'#1a1a18', descColor:'#5F5E5A' };
  if (net >= 3)  return { icon:'✓',  bg:'#EAF3DE', iconBg:'#639922', title:'Starke Ausgangsposition',     desc:'Die Stärken und Chancen überwiegen deutlich. Strategisch empfiehlt sich ein offensives Vorgehen.', titleColor:'#3B6D11', descColor:'#3B6D11' };
  if (net >= 1)  return { icon:'↗',  bg:'#E1F5EE', iconBg:'#1D9E75', title:'Leicht positive Bilanz',      desc:'Mehr Potenzial als Risiko. Chancen nutzen und gleichzeitig Schwächen gezielt adressieren.', titleColor:'#0F6E56', descColor:'#0F6E56' };
  if (net >= -1) return { icon:'=',  bg:'#FAEEDA', iconBg:'#BA7517', title:'Ausgeglichene Situation',     desc:'Stärken und Schwächen halten sich die Waage. Eine klare Priorisierung ist entscheidend.', titleColor:'#854F0B', descColor:'#854F0B' };
  if (net >= -3) return { icon:'!',  bg:'#FCEBEB', iconBg:'#E24B4A', title:'Herausfordernde Lage',        desc:'Risiken und Schwächen dominieren. Defensivstrategie empfohlen — Risiken minimieren, Kernstärken schützen.', titleColor:'#A32D2D', descColor:'#A32D2D' };
  return         { icon:'✕',  bg:'#FCEBEB', iconBg:'#A32D2D', title:'Kritische Risikobewertung',  desc:'Erhebliche Schwächen und Bedrohungen erkannt. Strategische Neuausrichtung oder intensive Risikominimierung nötig.', titleColor:'#A32D2D', descColor:'#A32D2D' };
}

// ── Templates ──────────────────────────────────────────────────────────────

function starSVG(filled, color) {
  return `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><polygon points="8,1.5 9.9,6.5 15.3,6.5 11,9.8 12.7,15 8,11.8 3.3,15 5,9.8 0.7,6.5 6.1,6.5" fill="${filled ? color : '#B4B2A9'}"/></svg>`;
}

function renderQuadrant(q) {
  const items = state[q.key];
  return `<div class="quadrant">
    <div class="q-header">
      <div class="q-badge ${q.cls}">${q.key}</div>
      <div><div class="q-title">${q.label}</div><div class="q-sub">${q.sub}</div></div>
    </div>
    <div class="item-list">
      ${items.map(item => `
        <div class="item-row">
          <input class="item-text" type="text" placeholder="Argument eintragen…" value="${item.text.replace(/"/g, '&quot;')}" data-id="${item.id}" data-key="${q.key}" />
          <div class="rating-wrap">
            ${[1,2,3,4,5].map(n => `<button class="star" data-id="${item.id}" data-key="${q.key}" data-val="${n}" title="${n} Stern${n > 1 ? 'e' : ''}">${starSVG(n <= item.rating, q.color)}</button>`).join('')}
          </div>
          <button class="del-btn" data-del="${item.id}" data-key="${q.key}" title="Entfernen">×</button>
        </div>
      `).join('')}
    </div>
    <button class="add-btn" data-add="${q.key}">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      Argument hinzufügen
    </button>
  </div>`;
}

function renderResult() {
  const { s, w, o, t, net } = calcScore();
  const verdict = getVerdict(net);
  const pct = v => Math.round((v / 5) * 100);

  const bars = [
    { label:'Stärken (S)',   val:s, color:'#639922' },
    { label:'Schwächen (W)', val:w, color:'#E24B4A' },
    { label:'Chancen (O)',   val:o, color:'#1D9E75' },
    { label:'Risiken (T)',   val:t, color:'#BA7517'  }
  ];
  const scoreCards = [
    { label:'Stärken',   val:s.toFixed(1), color:'#3B6D11' },
    { label:'Schwächen', val:w.toFixed(1), color:'#A32D2D' },
    { label:'Chancen',   val:o.toFixed(1), color:'#0F6E56' },
    { label:'Risiken',   val:t.toFixed(1), color:'#854F0B' }
  ];

  return `
    <div class="result-header">Ergebnis</div>
    <div class="score-grid">
      ${scoreCards.map(c => `<div class="score-card"><div class="score-label">${c.label}</div><div class="score-val" style="color:${c.color}">${c.val}</div></div>`).join('')}
    </div>
    <div class="bar-section">
      ${bars.map(b => `
        <div style="margin-bottom:8px;">
          <div class="bar-label"><span>${b.label}</span><span>${b.val.toFixed(1)} / 5.0</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct(b.val)}%;background:${b.color};"></div></div>
        </div>`).join('')}
    </div>
    <div class="verdict-box" style="background:${verdict.bg};">
      <div class="verdict-icon" style="background:${verdict.iconBg};">${verdict.icon}</div>
      <div>
        <div class="verdict-title" style="color:${verdict.titleColor};">${verdict.title}</div>
        <div class="verdict-desc"  style="color:${verdict.descColor};">${verdict.desc}</div>
      </div>
    </div>`;
}

// ── Render & events ────────────────────────────────────────────────────────

function updateHeading() {
  const nameInput = document.getElementById('analysis-name');
  const heading   = document.getElementById('analysis-heading');
  const value     = nameInput.value.trim();
  heading.textContent = value || '';
}

function render() {
  document.getElementById('swot-grid').innerHTML   = QUADRANTS.map(renderQuadrant).join('');
  document.getElementById('result-panel').innerHTML = renderResult();
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('.item-text').forEach(input => {
    input.addEventListener('input', e => {
      const item = state[e.target.dataset.key].find(i => i.id === +e.target.dataset.id);
      if (item) {
        item.text = e.target.value;
        document.getElementById('result-panel').innerHTML = renderResult();
      }
    });
  });

  document.querySelectorAll('.star').forEach(btn => {
    btn.addEventListener('click', e => {
      const b    = e.currentTarget;
      const item = state[b.dataset.key].find(i => i.id === +b.dataset.id);
      if (item) {
        item.rating = item.rating === +b.dataset.val ? 0 : +b.dataset.val;
        render();
      }
    });
  });

  document.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', e => {
      const key = e.currentTarget.dataset.key;
      if (state[key].length > 1) {
        state[key] = state[key].filter(i => i.id !== +e.currentTarget.dataset.del);
        render();
      }
    });
  });

  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', e => {
      const key = e.currentTarget.dataset.add;
      state[key].push({ id: nextId++, text: '', rating: 0 });
      render();
      const inputs = document.querySelectorAll(`[data-key="${key}"].item-text`);
      inputs[inputs.length - 1]?.focus();
    });
  });
}

// ── Init ───────────────────────────────────────────────────────────────────

document.getElementById('analysis-name').addEventListener('input', updateHeading);
render();