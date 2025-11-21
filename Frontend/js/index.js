const API = 'http://localhost:3000/api';

document.addEventListener("DOMContentLoaded", ()=>{
  // Affiche l’opérateur
  const op = localStorage.getItem('operateur') || 'Utilisateur';
  document.getElementById('operateur').textContent = op;
  updateAutosGrid();

  document.getElementById('ajout-automate').onsubmit = async function(e){
    e.preventDefault();
    let form = e.target;
    let ok = true;
    ["nom", "adresse_ip"].forEach(field => {
      if(form[field].value.trim() === "") {
        form[field].classList.add("input-error"); form[field].classList.remove("input-success"); ok = false;
      } else { form[field].classList.remove("input-error"); form[field].classList.add("input-success"); }
    });
    if(!ok){
      showMessage("Complétez tous les champs obligatoires (nom/IP)", "error");
      return;
    }
    let data = {
      nom: form.nom.value,
      adresse_ip: form.adresse_ip.value,
      emplacement: form.emplacement.value,
      operateur: localStorage.getItem('operateur')
    };
    let resp = await fetch(API + '/automates', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    if (resp.ok) {
      showMessage("Automate ajouté avec succès !","success");
      form.reset();
      updateAutosGrid();
    } else {
      showMessage("Erreur lors de l’ajout, vérifiez les infos…","error");
    }
  };
});

function showMessage(txt, type) {
  let msg = document.querySelector('.form-message');
  msg.textContent = txt;
  msg.className = 'form-message ' + type;
  msg.style.display = 'block';
  setTimeout(()=>msg.style.display='none',2300);
}

async function updateAutosGrid() {
  const res = await fetch(API + '/automates');
  const list = await res.json();
  const grid = document.getElementById('autosGrid');
  grid.innerHTML = list.length === 0
    ? `<div class="empty-state">Aucun automate connecté.<br>Ajoutez-en un ci-dessus.</div>`
    : list.map((a,i) => `
        <div class="operateur-card" style="background:linear-gradient(135deg,#257bee 60%,#${a.etat==="ok"?"2dcf8b":"f05951"} 110%);" onclick="window.location='automate.html?id=${a.id}'">
          <div class="operateur-icon">🛠️</div>
          <div class="operateur-name">${a.nom}</div>
          <div class="badge ${a.etat === 'ok' ? 'badge-success' : 'badge-danger'}">${a.etat === 'ok' ? 'En ligne' : 'Hors ligne'}</div>
          <div class="badge badge-info">${a.adresse_ip}</div>
          <div style="opacity:.75;margin-top:.33em;font-size:.99em;">${a.emplacement||""}</div>
          <div style="opacity:.7; font-size:.88em; margin-top:.7em;">Ajouté par : ${a.operateur || "—"}</div>
          <button class="btn-info btn-historique" style="width:90%;margin-top:.9em;" onclick="event.stopPropagation();window.location='historique.html?auto='+${a.id}">📊 Historique</button>
        </div>
      `).join('');
}
