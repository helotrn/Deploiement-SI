// Frontend/accueil.js
const API_BASE = 'http://localhost:3000/api';

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

async function chargerAutomates() {
  const tbody = document.querySelector('#table-automates tbody');
  tbody.innerHTML = '';

  try {
    const automates = await fetchJSON(`${API_BASE}/automates`);

    automates.forEach(a => {
      const tr = document.createElement('tr');

      const tdNom = document.createElement('td');
      tdNom.textContent = a.nom;

      const tdIp = document.createElement('td');
      tdIp.textContent = a.adresse_ip;

      const tdEmp = document.createElement('td');
      tdEmp.textContent = a.emplacement || '';

      const tdOp = document.createElement('td');
      tdOp.textContent = a.operateur || '';

      const tdActions = document.createElement('td');
      const btnConf = document.createElement('button');
      btnConf.textContent = 'Configurer variables';
      btnConf.classList.add('btn', 'btn-secondary');
      btnConf.addEventListener('click', () => {
        window.location.href = `automate.html?id=${a.id}`;
      });
      tdActions.appendChild(btnConf);

      tr.appendChild(tdNom);
      tr.appendChild(tdIp);
      tr.appendChild(tdEmp);
      tr.appendChild(tdOp);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    const msg = document.getElementById('automate-message');
    msg.textContent = "Erreur lors du chargement des automates.";
    msg.classList.add('error');
  }
}

async function onSubmitAutomate(event) {
  event.preventDefault();
  const msg = document.getElementById('automate-message');
  msg.textContent = '';
  msg.className = 'message';

  const nom = document.getElementById('auto-nom').value.trim();
  const adresse_ip = document.getElementById('auto-ip').value.trim();
  const emplacement = document.getElementById('auto-emplacement').value.trim();
  const operateur = document.getElementById('auto-operateur').value.trim();

  if (!nom || !adresse_ip) {
    msg.textContent = 'Nom et adresse IP sont obligatoires.';
    msg.classList.add('error');
    return;
  }

  try {
    await fetchJSON(`${API_BASE}/automates`, {
      method: 'POST',
      body: JSON.stringify({ nom, adresse_ip, emplacement, operateur })
    });

    msg.textContent = 'Automate ajouté.';
    msg.classList.add('success');

    document.getElementById('automate-form').reset();
    await chargerAutomates();
  } catch (err) {
    console.error(err);
    msg.textContent = "Erreur lors de l'ajout de l'automate.";
    msg.classList.add('error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  chargerAutomates();

  const form = document.getElementById('automate-form');
  form.addEventListener('submit', onSubmitAutomate);
});
