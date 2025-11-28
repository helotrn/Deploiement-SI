const API_BASE = 'http://localhost:3000/api';

function getCurrentUser() {
  const raw = localStorage.getItem('currentUser');
  return raw ? JSON.parse(raw) : null;
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Erreur HTTP ${res.status}`);
  }
  return res.json();
}

async function loadAutomatesForFilter() {
  const select = document.getElementById('filter-automate');
  try {
    const automates = await fetchJSON(`${API_BASE}/automates`);
    automates.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = `${a.nom} (${a.adresse_ip})`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Erreur chargement automates pour filtre:', err);
  }
}

// Construit l’URL /api/mesures?automateId=&from=&to=
function buildHistoryUrl() {
  const automateId = document.getElementById('filter-automate').value;
  const from = document.getElementById('filter-from').value;
  const to = document.getElementById('filter-to').value;

  const params = new URLSearchParams();
  if (automateId) params.set('automateId', automateId);
  if (from) params.set('from', from);
  if (to) params.set('to', to);

  const qs = params.toString();
  return qs ? `${API_BASE}/mesures?${qs}` : `${API_BASE}/mesures`;
}

function renderAlarmBadge(alarme) {
  if (!alarme) return '<span class="badge">OK</span>';
  return '<span class="badge badge-error">ALERTE</span>';
}

function renderHistoryRows(mesures) {
  const tbody = document.getElementById('history-tbody');
  tbody.innerHTML = '';

  if (!mesures.length) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="empty-state">Aucune mesure trouvée pour ces filtres.</td></tr>';
    return;
  }

  mesures.forEach(m => {
    const tr = document.createElement('tr');
    const date = new Date(m.horodatage || m.date_mesure || m.date || m.created_at);
    tr.innerHTML = `
      <td>${date.toLocaleString()}</td>
      <td>${m.nom_automate || m.id_automate}</td>
      <td>${m.temperature ?? '-'}</td>
      <td>${m.pression ?? '-'}</td>
      <td>${m.valeur ?? '-'}</td>
      <td>${renderAlarmBadge(m.alarme)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderAlarms(mesures) {
  const container = document.getElementById('alarms-container');
  container.innerHTML = '';

  const alarms = mesures.filter(m => m.alarme);
  if (!alarms.length) {
    container.innerHTML =
      '<div class="empty-state">Aucune alarme enregistrée sur la période sélectionnée.</div>';
    return;
  }

  alarms.forEach(m => {
    const date = new Date(m.horodatage || m.date_mesure || m.date || m.created_at);
    const div = document.createElement('div');
    div.className = 'alarm-item';
    div.innerHTML = `
      <div>
        <strong>${date.toLocaleString()}</strong> – Automate ${
          m.nom_automate || m.id_automate
        }
        <br/>
        Température : <strong>${m.temperature ?? '-'}</strong> °C,
        Pression : <strong>${m.pression ?? '-'}</strong> bar
      </div>
      <span class="badge badge-error">ALERTE</span>
    `;
    container.appendChild(div);
  });
}

async function loadHistory(e) {
  if (e) e.preventDefault();
  const msg = document.getElementById('history-message');
  msg.style.display = 'none';

  const tbody = document.getElementById('history-tbody');
  tbody.innerHTML =
    '<tr><td colspan="6" class="loading">Chargement des mesures...</td></tr>';

  try {
    const url = buildHistoryUrl();
    const mesures = await fetchJSON(url);
    renderHistoryRows(mesures);
    renderAlarms(mesures);
  } catch (err) {
    console.error(err);
    tbody.innerHTML =
      '<tr><td colspan="6" class="error">Erreur lors du chargement des mesures.</td></tr>';
    msg.textContent = `Erreur : ${err.message}`;
    msg.className = 'message message-error';
    msg.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  const label = document.getElementById('current-user-label');
  if (!user) {
    label.textContent = 'Aucun utilisateur connecté';
  } else {
    label.textContent = `Opérateur connecté : ${user.nom} (${user.role || 'Opérateur'})`;
  }

  document.getElementById('btn-go-home').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  document.getElementById('btn-dashboard').addEventListener('click', () => {
    window.location.href = 'accueil.html';
  });

  document
    .getElementById('filters-form')
    .addEventListener('submit', loadHistory);

  loadAutomatesForFilter();
  loadHistory();
});
