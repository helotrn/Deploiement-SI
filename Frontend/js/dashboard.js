const API_BASE = 'http://localhost:3000/api';

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

function getCurrentUser() {
  const raw = localStorage.getItem('currentUser');
  return raw ? JSON.parse(raw) : null;
}

// Vérifie si un automate est en ligne via Modbus
async function checkAutomateOnline(adresseIp) {
  try {
    const res = await fetch(
      `${API_BASE}/mesures/ping?ip=${encodeURIComponent(adresseIp)}`
    );
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return data && data.online === true;
  } catch {
    return false;
  }
}

function renderStatusBadge(online) {
  const cls = online ? 'badge badge-success' : 'badge badge-error';
  const txt = online ? 'En ligne' : 'Hors ligne';
  const dotColor = online ? 'status-dot-green' : 'status-dot-red';
  return `<span class="${cls}"><span class="status-dot ${dotColor}"></span>${txt}</span>`;
}

async function loadAutomates() {
  const tbody = document.getElementById('automates-tbody');
  tbody.innerHTML =
    '<tr><td colspan="6" class="loading">Chargement des automates...</td></tr>';

  try {
    const automates = await fetchJSON(`${API_BASE}/automates`);

    if (!automates.length) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="empty-state">Aucun automate enregistré.</td></tr>';
      updateGlobalStatus(0, 0, 0);
      return;
    }

    tbody.innerHTML = '';
    let nbOnline = 0;
    let nbWithAlarms = 0;

    for (const a of automates) {
      // 1) Statut en ligne / hors ligne
      const online = await checkAutomateOnline(a.adresse_ip);
      if (online) nbOnline++;

      // 2) Lecture live température / pression
      let lastMeasureText = '—';
      if (online) {
        try {
          const res = await fetch(
            `${API_BASE}/mesures/live?ip=${encodeURIComponent(a.adresse_ip)}`
          );
          if (res.ok) {
            const data = await res.json();
            const t = data.temperature;
            const p = data.pression;
            lastMeasureText = `${t ?? '-'} °C / ${p ?? '-'} bar`;

            // si tu ajoutes une logique d'alarme côté backend, tu pourras compter ici
            // if (data.alarme) nbWithAlarms++;
          }
        } catch {
          // on laisse "—" en cas d'erreur
        }
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${a.nom}</td>
        <td>${a.adresse_ip}</td>
        <td>${a.emplacement || '—'}</td>
        <td>${a.operateur || '—'}</td>
        <td>${renderStatusBadge(online)}</td>
        <td>${lastMeasureText}</td>
      `;
      tbody.appendChild(tr);
    }

    updateGlobalStatus(automates.length, nbOnline, nbWithAlarms);
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="6" class="error">Erreur de chargement : ${err.message}</td></tr>`;
  }
}

function updateGlobalStatus(total, online, alarms) {
  const box = document.getElementById('global-status');
  const title = document.getElementById('global-status-title');
  const text = document.getElementById('global-status-text');

  if (!total) {
    box.className = 'statut-global non-conforme';
    title.textContent = 'Aucun automate configuré';
    text.textContent =
      'Ajoute un premier automate pour démarrer la supervision.';
    return;
  }

  const ratio = online / total;
  if (alarms > 0) {
    box.className = 'statut-global non-conforme';
    title.textContent = 'Alarmes actives';
    text.textContent = `${alarms} automate(s) présentent des températures ou pressions hors limites.`;
  } else if (ratio >= 0.8) {
    box.className = 'statut-global conforme';
    title.textContent = 'Supervision nominale';
    text.textContent = `${online}/${total} automates en ligne, aucun dépassement détecté.`;
  } else {
    box.className = 'statut-global non-conforme';
    title.textContent = 'Disponibilité partielle';
    text.textContent = `${online}/${total} automates en ligne. Vérifie la connectivité des équipements.`;
  }
}

async function handleAddAutomate(e) {
  e.preventDefault();
  const msg = document.getElementById('auto-message');
  msg.style.display = 'none';

  const user = getCurrentUser();
  if (!user) {
    alert('Aucun opérateur connecté, retour à la page de connexion.');
    window.location.href = 'index.html';
    return;
  }

  const nom = document.getElementById('auto-nom').value.trim();
  const adresse_ip = document.getElementById('auto-ip').value.trim();
  const emplacement = document.getElementById('auto-emplacement').value.trim();

  if (!nom || !adresse_ip) return;

  try {
    await fetchJSON(`${API_BASE}/automates`, {
      method: 'POST',
      body: JSON.stringify({
        nom,
        adresse_ip,
        emplacement,
        operateur: user.nom
      })
    });

    msg.textContent = 'Automate ajouté avec succès.';
    msg.className = 'message message-success';
    msg.style.display = 'block';
    document.getElementById('add-automate-form').reset();
    await loadAutomates();
  } catch (err) {
    msg.textContent = `Erreur : ${err.message}`;
    msg.className = 'message message-error';
    msg.style.display = 'block';
  }
}

function renderAlarmsDummy() {
  const c = document.getElementById('alarms-container');
  c.innerHTML = `
    <div class="empty-state">
      Aucune alarme enregistrée pour le moment. Les dépassements de température / pression
      apparaîtront ici lorsque la logique côté backend sera ajoutée.
    </div>
  `;
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

  document.getElementById('btn-historique').addEventListener('click', () => {
    window.location.href = 'historique.html';
  });

  document
    .getElementById('add-automate-form')
    .addEventListener('submit', handleAddAutomate);

  loadAutomates();
  renderAlarmsDummy();
});
