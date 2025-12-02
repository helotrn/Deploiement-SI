// js/historique.js
const API_BASE = 'http://localhost:3000/api';

let chartInstance = null;

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

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function chargerAutomates(selectElt, selectedId) {
  const automates = await fetchJSON(`${API_BASE}/automates`);
  selectElt.innerHTML = '';

  if (!automates.length) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Aucun automate';
    selectElt.appendChild(opt);
    return;
  }

  automates.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = `${a.nom} (${a.adresse_ip})`;
    if (String(a.id) === String(selectedId)) {
      opt.selected = true;
    }
    selectElt.appendChild(opt);
  });
}

async function chargerVariables(automateId, selectElt) {
  selectElt.innerHTML = '';
  if (!automateId) return;

  const vars = await fetchJSON(`${API_BASE}/variables?automate_id=${automateId}`);

  if (!vars.length) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Aucune variable';
    selectElt.appendChild(opt);
    return;
  }

  vars.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = `${v.nom} (${v.type}${v.unite ? ' ' + v.unite : ''})`;
    selectElt.appendChild(opt);
  });
}

function majTableau(mesures) {
  const tbody = document.getElementById('mesures-tbody');
  tbody.innerHTML = '';

  if (!mesures.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 2;
    td.textContent = 'Aucune mesure disponible.';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  mesures.forEach(m => {
    const tr = document.createElement('tr');
    const tdDate = document.createElement('td');
    const tdVal = document.createElement('td');

    tdDate.textContent = new Date(m.date_mesure).toLocaleString();
    tdVal.textContent = m.valeur;

    tr.appendChild(tdDate);
    tr.appendChild(tdVal);
    tbody.appendChild(tr);
  });
}

function majGraphique(mesures) {
  const ctx = document.getElementById('mesures-chart').getContext('2d');

  if (!mesures.length) {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  const labels = mesures
    .map(m => new Date(m.date_mesure))
    .sort((a, b) => a - b)
    .map(d => d.toLocaleTimeString());

  const dataPoints = mesures
    .sort((a, b) => new Date(a.date_mesure) - new Date(b.date_mesure))
    .map(m => m.valeur);

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Valeur',
          data: dataPoints,
          borderColor: '#2596ff',
          backgroundColor: 'rgba(37,150,255,0.15)',
          tension: 0.2,
          pointRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'Temps' }
        },
        y: {
          title: { display: true, text: 'Valeur' },
          beginAtZero: false
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

async function chargerHistorique() {
  const msg = document.getElementById('hist-message');
  msg.style.display = 'none';

  const varId = document.getElementById('select-variable').value;
  if (!varId) {
    msg.textContent = 'Sélectionne une variable.';
    msg.className = 'message message-error';
    msg.style.display = 'block';
    return;
  }

  try {
    const mesures = await fetchJSON(
      `${API_BASE}/mesures?variable_id=${encodeURIComponent(varId)}&limit=200`
    );

    majTableau(mesures);
    majGraphique(mesures);
  } catch (err) {
    console.error(err);
    msg.textContent = `Erreur de chargement : ${err.message}`;
    msg.className = 'message message-error';
    msg.style.display = 'block';
  }
}

function exporterCSV() {
  const varId = document.getElementById('select-variable').value;
  if (!varId) {
    alert('Sélectionne une variable avant export.');
    return;
  }
  const url = `${API_BASE}/mesures/export/csv?variable_id=${encodeURIComponent(
    varId
  )}`;
  window.location.href = url;
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('btn-dashboard').addEventListener('click', () => {
    window.location.href = 'accueil.html';
  });

  const selectAuto = document.getElementById('select-automate');
  const selectVar = document.getElementById('select-variable');
  const automateFromUrl = getQueryParam('automate_id');

  await chargerAutomates(selectAuto, automateFromUrl);
  await chargerVariables(selectAuto.value, selectVar);

  selectAuto.addEventListener('change', async () => {
    await chargerVariables(selectAuto.value, selectVar);
  });

  document.getElementById('btn-load').addEventListener('click', chargerHistorique);
  document.getElementById('btn-export').addEventListener('click', exporterCSV);
});
