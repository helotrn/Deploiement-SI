let dayList = []; let dayIdx = 0;
const API = "http://localhost:3000/api";
const varId = new URLSearchParams(window.location.search).get("var");

document.getElementById('filtrer').onclick = loadHistory;
document.getElementById('exporter').onclick = ()=>{
  let debut = document.getElementById('debut').value;
  let fin = document.getElementById('fin').value;
  window.open(`${API}/exports/mesures?variable_id=${varId}&date_debut=${debut}&date_fin=${fin}`, '_blank');
};

async function loadHistory() {
  let debut = document.getElementById('debut').value;
  let fin = document.getElementById('fin').value;
  let url = `/mesures?variable_id=${varId}`;
  if (debut) url += `&date_debut=${debut}`;
  if (fin)   url += `&date_fin=${fin}`;
  const res = await fetch(API + url);
  const mesures = await res.json();

  const groupByDay = {};
  mesures.forEach(m=>{
    const day = m.horodatage.substr(0,10);
    (groupByDay[day]=groupByDay[day]||[]).push(m);
  });
  dayList = Object.keys(groupByDay).sort().reverse();
  dayIdx = 0; // Reset sur chaque filtre
  displayDay(groupByDay, dayList[dayIdx] || dayList[0]);

  // Pagination
  document.getElementById('prevDay').onclick = ()=>{
    if(dayIdx < dayList.length-1){ dayIdx++; displayDay(groupByDay, dayList[dayIdx]); }
  };
  document.getElementById('nextDay').onclick = ()=>{
    if(dayIdx > 0){ dayIdx--; displayDay(groupByDay, dayList[dayIdx]); }
  };
}

function displayDay(groupByDay, day) {
  if(!day) { document.getElementById('histo-content').innerHTML = "<div class='empty-state'>Aucune donnée pour ce jour</div>"; return; }
  let data = groupByDay[day];
  document.getElementById('histo-content').innerHTML = `
    <div class="history-day">
      <div class="badge badge-info">${day}</div>
      <table class="pieces-table">
        <tr><th>Heure</th><th>Valeur</th><th>Opérateur</th></tr>
        ${data.map(m=>`<tr><td>${m.horodatage.substr(11,8)}</td><td>${m.valeur}</td><td>${m.operateur||"-"}</td></tr>`).join('')}
      </table>
      <canvas id="chart-${day}" height="85"></canvas>
    </div>
  `;
  let ctx = document.getElementById(`chart-${day}`).getContext('2d');
  new Chart(ctx, {
    type:'line',
    data:{labels: data.map(m=>m.horodatage.substr(11,8)), datasets:[{data: data.map(m=>m.valeur), borderColor:'#37d897'}]},
    options:{responsive:true,scales:{y:{beginAtZero:true}},plugins:{legend:{display:false}}}
  });
}

document.addEventListener('DOMContentLoaded',loadHistory);
