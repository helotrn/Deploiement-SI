// Frontend/automate.js
const API_BASE = 'http://localhost:3000/api';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status} : ${txt}`);
  }
  return res.json();
}

let automateId = null;

async function chargerAutomate() {
  const infoElt = document.getElementById('automate-info');

  try {
    const auto = await fetchJSON(`${API_BASE}/automates/${automateId}`);
    infoElt.textContent = `${auto.nom} – IP ${auto.adresse_ip} – ${auto.emplacement || '—'}`;
  } catch (err) {
    console.error(err);
    infoElt.textContent = "Impossible de charger l'automate.";
  }
}

function extraireAdresseDepuisDescription(desc) {
  const parts = (desc || '').split('|');
  return parts[1] || '';
}

async function chargerVariables() {
  const tbody = document.querySelector('#variables-table tbody');
  tbody.innerHTML = '';

  try {
    const vars = await fetchJSON(`${API_BASE}/variables?automate_id=${automateId}`);

    vars.forEach(v => {
      const tr = document.createElement('tr');

      const tdNom = document.createElement('td');
      tdNom.textContent = v.nom;

      const tdType = document.createElement('td');
      tdType.textContent = v.type;

      const tdAdr = document.createElement('td');
      tdAdr.textContent = extraireAdresseDepuisDescription(v.description);

      const tdUnite = document.createElement('td');
      tdUnite.textContent = v.unite || '';

      tr.appendChild(tdNom);
      tr.appendChild(tdType);
      tr.appendChild(tdAdr);
      tr.appendChild(tdUnite);

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    const msg = document.getElementById('variable-message');
    msg.textContent = "Erreur lors du chargement des variables.";
    msg.classList.add('error');
  }
}

async function onSubmitVariable(event) {
  event.preventDefault();
  const msg = document.getElementById('variable-message');
  msg.textContent = '';
  msg.className = 'message';

  const nom = document.getElementById('var-nom').value.trim();
  const type = document.getElementById('var-type').value;
  const adresse = document.getElementById('var-adresse').value.trim();
  const unite = document.getElementById('var-unite').value.trim();

  if (!nom || !type || !adresse || !unite) {
    msg.textContent = 'Tous les champs sont obligatoires.';
    msg.classList.add('error');
    return;
  }

  const description = `${automateId}|${adresse}`;

  try {
    await fetchJSON(`${API_BASE}/variables`, {
      method: 'POST',
      body: JSON.stringify({ nom, type, unite, description })
    });

    msg.textContent = 'Variable ajoutée.';
    msg.classList.add('success');

    document.getElementById('variable-form').reset();
    await chargerVariables();
  } catch (err) {
    console.error(err);
    msg.textContent = "Erreur lors de l'ajout de la variable.";
    msg.classList.add('error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  automateId = getQueryParam('id');
  if (!automateId) {
    alert("Aucun id d'automate fourni dans l'URL.");
    return;
  }

  chargerAutomate();
  chargerVariables();

  const form = document.getElementById('variable-form');
  form.addEventListener('submit', onSubmitVariable);
});
