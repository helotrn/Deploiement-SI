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
    '<tr><td colspan="7" class="loading">Chargement des automates...</td></tr>';

  try {
    const automates = await fetchJSON(`${API_BASE}/automates`);

    if (!automates.length) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="empty-state">Aucun automate enregistré.</td></tr>';
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
            // if (data.alarme) nbWithAlarms++;
          }
        } catch {
          // on laisse "—"
        }
      }

      const tr = document.createElement('tr');

      // cellules existantes
      const tdNom = document.createElement('td');
      tdNom.textContent = a.nom;

      const tdIp = document.createElement('td');
      tdIp.textContent = a.adresse_ip;

      const tdEmp = document.createElement('td');
      tdEmp.textContent = a.emplacement || '—';

      const tdOp = document.createElement('td');
      tdOp.textContent = a.operateur || '—';

      const tdStatut = document.createElement('td');
      tdStatut.innerHTML = renderStatusBadge(online);

      const tdDerniere = document.createElement('td');
      tdDerniere.textContent = lastMeasureText;

      // nouvelle colonne Actions
      const tdActions = document.createElement('td');

      const btnVoir = document.createElement('button');
      btnVoir.textContent = 'Voir mesures';
      btnVoir.classList.add('btn-secondary', 'btn-small');
      btnVoir.addEventListener('click', () => {
        // page d’historique/graph par automate
        window.location.href = `historique.html?automate_id=${a.id}`;
      });

      const btnConf = document.createElement('button');
      btnConf.textContent = 'Configurer variables';
      btnConf.classList.add('btn-secondary', 'btn-small');
      btnConf.style.marginLeft = '0.5rem';
      btnConf.addEventListener('click', () => {
        window.location.href = `automate.html?id=${a.id}`;
      });

      const btnDel = document.createElement('button');
      btnDel.textContent = 'Supprimer';
      btnDel.classList.add('btn-danger', 'btn-small');
      btnDel.style.marginLeft = '0.5rem';
      btnDel.addEventListener('click', async () => {
        const ok = confirm(
          `Êtes-vous sûr de vouloir supprimer l'automate "${a.nom}" ?`
        );
        if (!ok) return;

        try {
          await fetch(`${API_BASE}/automates/${a.id}`, { method: 'DELETE' });
          await loadAutomates();
        } catch (err) {
          console.error(err);
          const msg = document.getElementById('auto-message');
          msg.textContent = `Erreur de suppression : ${err.message}`;
          msg.className = 'message message-error';
          msg.style.display = 'block';
        }
      });

      tdActions.appendChild(btnVoir);
      tdActions.appendChild(btnConf);
      tdActions.appendChild(btnDel);

      tr.appendChild(tdNom);
      tr.appendChild(tdIp);
      tr.appendChild(tdEmp);
      tr.appendChild(tdOp);
      tr.appendChild(tdStatut);
      tr.appendChild(tdDerniere);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    }

    updateGlobalStatus(automates.length, nbOnline, nbWithAlarms);
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="7" class="error">Erreur de chargement : ${err.message}</td></tr>`;
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
