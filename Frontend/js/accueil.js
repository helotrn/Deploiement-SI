// Page d'accueil Netflix opérateur, cartes bleu dashboard
const operateurs = [
  { nom:"Alice ALMELA", icon:"👱‍♀️", color:"op-card-blue" },
  { nom:"Heloise Tournelle ", icon:"👩‍🦰", color:"op-card-blue" },
  { nom:"Marie Durand", icon:"👩‍💼", color:"op-card-blue" }
];
function renderGrid() {
  const grid = document.getElementById('opGrid');
  grid.innerHTML = operateurs.map(op=>`
    <div class="operateur-card ${op.color}" onclick="selectOp('${op.nom}')">
      <div class="operateur-icon">${op.icon}</div>
      <div class="operateur-name">${op.nom}</div>
    </div>
  `).join('') +
  `<div class="operateur-card op-card-blue" onclick="ajouterOp()">
    <div class="operateur-icon">+</div>
    <div class="operateur-name">Ajouter</div>
  </div>`;
}
window.selectOp = function(nom) {
  localStorage.setItem('operateur', nom);
  window.location = "index.html";
};
window.ajouterOp = function() {
  let nom = prompt("Nom de l'opérateur ?");
  if(nom) {
    operateurs.push({nom, icon:"🧑‍💻", color:"op-card-blue"});
    renderGrid();
  }
};
document.addEventListener('DOMContentLoaded', renderGrid);
