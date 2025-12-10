let cash = parseFloat(localStorage.getItem("cash")) || 10000;
let points = parseInt(localStorage.getItem("points")) || 0;
let holdings = JSON.parse(localStorage.getItem("holdings")) || {};
let portfolioHistory = JSON.parse(localStorage.getItem("portfolioHistory")) || [];

let assets = [
    { name: "GreenTech Co.", price: 100 },
    { name: "FutureFoods Ltd.", price: 150 },
    { name: "BrightEnergy Inc.", price: 200 },
    { name: "EduGrow Corp.", price: 80 }
];

// --- SAVE FUNCTION ---
function save() {
    localStorage.setItem("cash", cash);
    localStorage.setItem("points", points);
    localStorage.setItem("holdings", JSON.stringify(holdings));
    localStorage.setItem("portfolioHistory", JSON.stringify(portfolioHistory));
}

// --- UI UPDATES ---
let portfolioValue = 0;
function updateUI() {
    document.getElementById("cash-display").innerText = `Cash: €${cash.toFixed(2)}`;
    document.getElementById("points-display").innerText = `Points: ${points}`;

    portfolioValue = cash;
    Object.keys(holdings).forEach(name => {
        let asset = assets.find(a => a.name === name);
        portfolioValue += holdings[name] * asset.price;
    });
    document.getElementById("portfolio-value").innerText = `€${portfolioValue.toFixed(2)}`;

    // Badges
    let badgeText = "";
    if (Object.keys(holdings).length >= 3) badgeText = "Badge: Diversifier!";
    if (portfolioValue >= 10500) badgeText = "Badge: Steady Growth!";
    document.getElementById("badge-display").innerText = badgeText;
}

// --- RENDER MARKET ---
function renderMarket() {
    const body = document.querySelector("#market-table tbody");
    body.innerHTML = "";
    assets.forEach(asset => {
        body.innerHTML += `
      <tr>
        <td>${asset.name}</td>
        <td>€${asset.price.toFixed(2)}</td>
        <td><button class="btn btn-success btn-sm" onclick="buy('${asset.name}')">Buy</button></td>
      </tr>
    `;
    });
}

// --- RENDER PORTFOLIO ---
function renderPortfolio() {
    const body = document.querySelector("#portfolio-table tbody");
    body.innerHTML = "";
    Object.keys(holdings).forEach(name => {
        let asset = assets.find(a => a.name === name);
        let qty = holdings[name];
        let total = qty * asset.price;
        body.innerHTML += `
      <tr>
        <td>${name}</td>
        <td>${qty}</td>
        <td>€${asset.price.toFixed(2)}</td>
        <td>€${total.toFixed(2)}</td>
        <td><button class="btn btn-warning btn-sm" onclick="sell('${name}')">Sell</button></td>
      </tr>
    `;
    });
}

// --- BUY / SELL ---
function buy(name) {
    let asset = assets.find(a => a.name === name);
    if(cash >= asset.price){
        cash -= asset.price;
        holdings[name] = (holdings[name] || 0) + 1;
        points += 5;
        save(); updateUI(); renderPortfolio();
    }
}
function sell(name) {
    if(holdings[name] > 0){
        let asset = assets.find(a => a.name === name);
        cash += asset.price;
        holdings[name]--;
        points += 3;
        if(holdings[name]===0) delete holdings[name];
        save(); updateUI(); renderPortfolio();
    }
}

// --- PRICE UPDATE (MILD VOLATILITY + UPWARD TREND) ---
function updatePrices() {
    assets.forEach(asset => {
        let change = (Math.random() - 0.5) * 0.01; // -0.5% to +0.5%
        asset.price *= (1 + change + 0.001); // slight upward bias
    });
}

// --- CHART SETUP ---
const ctx = document.getElementById('portfolioChart').getContext('2d');
const portfolioChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: portfolioHistory.map((_, i) => i),
        datasets: [{
            label: 'Portfolio Value',
            data: portfolioHistory,
            borderColor: 'green',
            backgroundColor: 'rgba(0,255,0,0.2)',
            tension: 0.2,
            fill: true
        }]
    },
    options: {
        responsive: true,
        animation: false,
        scales: { y: { beginAtZero: false } }
    }
});

function updateGraph() {
    portfolioHistory.push(portfolioValue);
    if(portfolioHistory.length>60) portfolioHistory.shift();
    portfolioChart.data.labels = portfolioHistory.map((_,i)=>i);
    portfolioChart.data.datasets[0].data = portfolioHistory;
    portfolioChart.update();
    save();
}

// --- MAIN LOOP ---
function tick(){
    updatePrices();
    updateUI();
    renderMarket();
    renderPortfolio();
    updateGraph();
}
setInterval(tick, 1000);

// --- INITIAL LOAD ---
updateUI();
renderMarket();
renderPortfolio();
updateGraph();