// Automate: dashboard cartes variables, validation, historiques, SCADA moderne
const API = 'http://localhost:3000/api';
const idAutomate = new URLSearchParams(window.location.search).get("id");

async function chargerAutomate() {
  const automate = await fetch(API + '/automates/' + idAutomate).then(r=>r.json());
  document.getElementById('nom-automate').textContent = automate.nom;
  document.getElementById('ip-automate').textContent = automate.adresse_ip;
}

async function chargerVariables() {
  const res = await fetch(API + `/variables?automate_id=${idAutomate}`);
  const v = await res.json();
  const grid = document.getElementById('variables-grid');
  grid.innerHTML = v.length === 0 
    ? `<div class="empty-state">Aucune variable surveillée. Ajoutez-en une ci-dessus.</div>`
    : v.map(variable => `<div class="operateur-card">
      <div class="operateur-icon">🌡️</div>
      <div class="operateur-name">${variable.nom}<span class="badge badge-info">${variable.unite||''}</span></div>
      <div><span style="opacity:.72;">Registre</span>: <b>${variable.registre}</b></div>
      <div><span style="opacity:.72;">Fréquence</span>: <b>${variable.frequence}s</b></div>
      <div class="badge badge-success" id="valeur-${variable.id}">–</div>
      <canvas id="graph-${variable.id}" height="110"></canvas>
      <div style="opacity:.7; font-size:.92em; margin-top:.57em;">Dernière modif par : ${variable.operateur || "—"}</div>
      <button class="btn-info btn-historique" onclick="voirHistorique(${variable.id})" style="width:95%;margin-top:1.2em;">📈 Historique variable</button>
    </div>`).join('');
  v.forEach(refreshValeurEtGraphe);
}
function voirHistorique(variableId) {
  window.location = "historique.html?var="+variableId;
}

async function refreshValeurEtGraphe(v) {
  let m = await fetch(API+`/mesures?variable_id=${v.id}&limit=15`).then(r=>r.json());
  document.getElementById('valeur-'+v.id).textContent = m[0]?m[0].valeur:'–';
  let ctx = document.getElementById('graph-'+v.id).getContext('2d');
  new Chart(ctx, {
    type:'line',
    data: {labels: m.map(x=>x.horodatage.substr(11,5)), datasets:[{data: m.map(x=>x.valeur), borderColor:'#37d897', tension:.18}] },
    options:{responsive:true,scales:{y:{beginAtZero:true}},plugins:{legend:{display:false}}}
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  chargerAutomate();
  chargerVariables();
  document.getElementById('ajout-variable').onsubmit = async function(e) {
    e.preventDefault();
    let form = e.target;
    let ok = true;
    ["nom", "registre", "frequence"].forEach(field => {
      if(form[field].value.trim() === "") {
        form[field].classList.add("input-error");
        form[field].classList.remove("input-success");
        ok = false;
      } else {
        form[field].classList.remove("input-error");
        form[field].classList.add("input-success");
      }
    });
    if(!ok) {
      showMessage("Veuillez remplir tous les champs obligatoires.", "error");
      return;
    }
    let data = {
      nom: form.nom.value,
      registre: form.registre.value,
      unite: form.unite.value,
      frequence: form.frequence.value,
      automate_id: idAutomate,
      operateur: localStorage.getItem('operateur')
    };
    let resp = await fetch(API + '/variables', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(data)
    });
    if(resp.ok){
      showMessage("Variable ajoutée !", "success");
      form.reset();
      chargerVariables();
    } else {
      showMessage("Erreur lors de l’ajout.", "error");
    }
  };
});

function showMessage(txt, type) {
  let msg = document.querySelector('.form-message');
  msg.textContent = txt;
  msg.className = 'form-message ' + type;
  msg.style.display = 'block';
  setTimeout(()=>msg.style.display='none',2000);
}
