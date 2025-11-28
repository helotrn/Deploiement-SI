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

function saveCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function getCurrentUser() {
  const raw = localStorage.getItem('currentUser');
  return raw ? JSON.parse(raw) : null;
}

async function loadProfiles() {
  const container = document.getElementById('profile-list');
  container.innerHTML = '<div class="loading">Chargement des profils...</div>';

  try {
    const users = await fetchJSON(`${API_BASE}/utilisateurs`);
    container.innerHTML = '';

    if (!users.length) {
      container.innerHTML =
        '<div class="empty-state">Aucun profil créé pour le moment.</div>';
      return;
    }

    users.forEach(user => {
      const card = document.createElement('div');
      card.className = 'profile-card';
      card.innerHTML = `
        <div class="profile-avatar">${user.nom.charAt(0).toUpperCase()}</div>
        <div class="profile-name">${user.nom}</div>
        <div class="profile-role">${user.role || 'Opérateur'}</div>
      `;

      // clic sur la carte = connexion
      card.addEventListener('click', () => {
        saveCurrentUser(user);
        window.location.href = 'accueil.html';
      });

      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="error">Impossible de charger les profils : ${err.message}</div>`;
  }
}

async function handleAddProfile(e) {
  e.preventDefault();
  const messageEl = document.getElementById('profile-message');
  messageEl.style.display = 'none';

  const nom = document.getElementById('profile-name').value.trim();
  const role = document.getElementById('profile-role').value.trim();

  if (!nom) return;

  try {
    await fetchJSON(`${API_BASE}/utilisateurs`, {
      method: 'POST',
      body: JSON.stringify({ nom, role })
    });

    messageEl.textContent = 'Profil créé avec succès.';
    messageEl.className = 'message message-success';
    messageEl.style.display = 'block';

    document.getElementById('add-profile-form').reset();
    await loadProfiles();
  } catch (err) {
    messageEl.textContent = `Erreur : ${err.message}`;
    messageEl.className = 'message message-error';
    messageEl.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProfiles();
  document
    .getElementById('add-profile-form')
    .addEventListener('submit', handleAddProfile);
});
