const INITIAL_CASH = 1000;

const LS = {
    cash: "vp_cash",
    holdings: "vp_holdings",
    points: "vp_points"
};

let cash = parseFloat(localStorage.getItem(LS.cash)) || INITIAL_CASH;
let holdings = JSON.parse(localStorage.getItem(LS.holdings)) || {};
let points = parseInt(localStorage.getItem(LS.points)) || 0;

let companies = [
    { symbol: "AAPL", name: "Apple", price: 170, prev:170 },
    { symbol: "MSFT", name: "Microsoft", price: 320, prev:320 },
    { symbol: "GOOGL", name: "Google", price:130, prev:130 },
    { symbol: "AMZN", name: "Amazon", price:110, prev:110 },
    { symbol: "TSLA", name: "Tesla", price:230, prev:230 },
    { symbol: "NVDA", name: "NVIDIA", price:480, prev:480 }
];

const gbp = n => "£" + n.toFixed(2);

// ---------------- GRAPH STATE (YOUR PART) ----------------

// [MY CHANGE] Colours + per-company history (percentage change vs starting price)
const COLORS = {
    AAPL: "#0d6efd",
    MSFT: "#198754",
    GOOGL: "#fd7e14",
    AMZN: "#6f42c1",
    TSLA: "#dc3545",
    NVDA: "#20c997"
};

const MAX_POINTS = 60;          // [MY CHANGE] how many recent points to keep
let priceHistory = {};          // [MY CHANGE] symbol -> array of % changes
const BASE_PRICES = {};         // [MY CHANGE] remember starting price for each symbol

// [MY CHANGE] Initialise base prices and history arrays from starting prices
function initMarketHistory() {
    companies.forEach(c => {
        BASE_PRICES[c.symbol] = c.price;
        priceHistory[c.symbol] = [0]; // start at 0% change
    });
}

// --------------------------------------------------------

function save(){
    localStorage.setItem(LS.cash, cash);
    localStorage.setItem(LS.holdings, JSON.stringify(holdings));
    localStorage.setItem(LS.points, points);
}

function portfolioValue(){
    let total = 0;
    for (let s in holdings) {
        let c = companies.find(x => x.symbol === s);
        total += holdings[s].qty * c.price;
    }
    return total;
}

/* -------------------------------------------
   RENDER UI
------------------------------------------- */
function renderDropdown(){
    const sel = document.getElementById("dropdown-company");

    // Save the current selected value
    const current = sel.value;

    sel.innerHTML = "";
    companies.forEach(c=>{
        sel.innerHTML += `<option value="${c.symbol}">${c.name} (${c.symbol})</option>`;
    });

    // Restore the previously selected value if it still exists
    if (current) sel.value = current;
}


function renderHeader(){
    document.getElementById("cash-display").innerText = "Cash: " + gbp(cash);
    document.getElementById("points-display").innerText = "Points: " + points;
}

function renderPortfolioValue(){
    document.getElementById("portfolio-value").innerText = gbp(portfolioValue());
}

function renderMarket(){
    let tb = document.querySelector("#market-table tbody");
    tb.innerHTML = "";

    companies.forEach(c=>{
        let diff = c.price - c.prev;
        let diffPct = (diff / c.prev) * 100;
        let cls = diff > 0 ? "text-success" : diff < 0 ? "text-danger" : "";

        tb.innerHTML += `
        <tr>
            <td>${c.name} <div class="small text-muted">${c.symbol}</div></td>
            <td class="${cls}">${gbp(c.price)}</td>
            <td class="${cls}">${diff >= 0 ? "+" : ""}${diff.toFixed(2)} (${diffPct >= 0 ? "+" : ""}${diffPct.toFixed(2)}%)</td>
            <td><button class="btn btn-success btn-sm" onclick="buy('${c.symbol}',1)">Buy</button></td>
        </tr>`;
    });
}

function renderHoldings(){
    let tb = document.querySelector("#portfolio-table tbody");
    tb.innerHTML = "";

    if (Object.keys(holdings).length === 0) {
        tb.innerHTML = `<tr><td colspan="6" class="text-muted">No assets yet.</td></tr>`;
        return;
    }

    for (let sym in holdings) {
        let h = holdings[sym];
        let c = companies.find(x=>x.symbol === sym);

        let pct = ((c.price - h.avg) / h.avg) * 100;
        let pctCls = pct > 0 ? "text-success" : pct < 0 ? "text-danger" : "";

        tb.innerHTML += `
        <tr>
            <td>${c.name}</td>
            <td>${h.qty}</td>
            <td>${gbp(c.price)}</td>
            <td>${gbp(h.qty * c.price)}</td>
            <td class="${pctCls}">${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%</td>
            <td><button class="btn btn-warning btn-sm" onclick="sell('${sym}',1)">Sell</button></td>
        </tr>`;
    }
}

// ------------- GRAPH RENDERING (YOUR PART) -------------

// [MY CHANGE] Legend under the chart so users know which colour is which
function renderMarketLegend() {
    const legend = document.getElementById("market-legend");
    if (!legend) return;

    legend.innerHTML = "";
    companies.forEach(c => {
        const color = COLORS[c.symbol] || "#198754";
        legend.innerHTML += `
            <span class="me-3">
                <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color};margin-right:4px;"></span>
                ${c.symbol}
            </span>`;
    });
}

// [MY CHANGE] Draw multi-line chart of % change vs starting price
function renderMarketChart() {
    const canvas = document.getElementById("market-chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 200;

    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gather min/max of percentage changes across all companies
    let min = Infinity;
    let max = -Infinity;
    companies.forEach(c => {
        const hist = priceHistory[c.symbol] || [];
        hist.forEach(v => {
            if (v < min) min = v;
            if (v > max) max = v;
        });
    });
    if (!isFinite(min) || !isFinite(max)) return;

    // [MY CHANGE] Add a little padding so lines aren't squashed
    const extra = (max - min) * 0.1 || 1;
    min -= extra;
    max += extra;

    const range = (max - min) || 1;

    const padding = 20;
    const innerW = canvas.width - 2 * padding;
    const innerH = canvas.height - 2 * padding;

    // [MY CHANGE] light vertical grid lines to show time steps
    ctx.strokeStyle = "#f3f4f6";
    ctx.lineWidth = 1;
    const gridCount = 4;
    for (let i = 1; i < gridCount; i++) {
        const x = padding + (i / gridCount) * innerW;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvas.height - padding);
        ctx.stroke();
    }

    // [MY CHANGE] Draw 0% reference line if it is in range
    if (min <= 0 && max >= 0) {
        const zeroY = canvas.height - padding - ((0 - min) / range) * innerH;
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, zeroY);
        ctx.lineTo(canvas.width - padding, zeroY);
        ctx.stroke();

        // label "0%" on the left
        ctx.fillStyle = "#9ca3af";
        ctx.font = "10px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.fillText("0%", padding + 2, zeroY - 2);
    }

    // [MY CHANGE] Labels for approx min / max % on the left
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(max.toFixed(1) + "%", padding + 2, padding + 8);
    ctx.fillText(min.toFixed(1) + "%", padding + 2, canvas.height - padding - 2);

    // Draw each company's percentage-change line
    companies.forEach(c => {
        const hist = priceHistory[c.symbol] || [];
        if (hist.length === 0) return;

        ctx.beginPath();
        hist.forEach((val, i) => {
            const x = padding + (i / Math.max(hist.length - 1, 1)) * innerW;
            const y = canvas.height - padding - ((val - min) / range) * innerH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = COLORS[c.symbol] || "#198754";
        ctx.lineWidth = 1.8;
        ctx.stroke();
    });
}

// --------------------------------------------------------

/* -------------------------------------------
   BUY / SELL
------------------------------------------- */
function buy(sym, qty){
    qty = parseInt(qty);
    let c = companies.find(x=>x.symbol === sym);
    let cost = qty * c.price;

    if(cost > cash){ alert("Not enough cash!"); return; }

    cash -= cost;

    if(!holdings[sym]){
        holdings[sym] = { qty, avg: c.price };
    } else {
        let h = holdings[sym];
        let newQty = h.qty + qty;
        h.avg = ((h.avg * h.qty) + (c.price * qty)) / newQty;
        h.qty = newQty;
    }

    points += 5;
    save();
    renderAll();
}

function sell(sym, qty){
    qty = parseInt(qty);

    if(!holdings[sym] || holdings[sym].qty < qty) return;

    let c = companies.find(x=>x.symbol === sym);

    holdings[sym].qty -= qty;
    cash += qty * c.price;

    if(holdings[sym].qty <= 0) delete holdings[sym];

    points += 3;
    save();
    renderAll();
}

function dropdownBuy(){
    buy(document.getElementById("dropdown-company").value, document.getElementById("dropdown-qty").value);
}
function dropdownSell(){
    sell(document.getElementById("dropdown-company").value, document.getElementById("dropdown-qty").value);
}

/* -------------------------------------------
   LIVE PRICE MOVEMENT
------------------------------------------- */
const VOL = 0.008;
const TREND = 0.001;

function updatePrices(){
    companies.forEach(c=>{
        c.prev = c.price;
        let movement = (Math.random()*2 - 1) * VOL + TREND;
        c.price *= (1 + movement);

        if(c.price < 0.5) c.price = 0.5;
    });

    // [MY CHANGE] Push latest percentage change into each company's history
    companies.forEach(c => {
        if (!priceHistory[c.symbol]) priceHistory[c.symbol] = [];

        const base = BASE_PRICES[c.symbol] || c.price;
        const pctChange = ((c.price - base) / base) * 100;
        priceHistory[c.symbol].push(pctChange);

        if (priceHistory[c.symbol].length > MAX_POINTS) {
            priceHistory[c.symbol].shift();
        }
    });
}

/* -------------------------------------------
   RENDER ALL
------------------------------------------- */
function renderAll(){
    renderDropdown();
    renderHeader();
    renderMarket();
    renderHoldings();
    renderPortfolioValue();
    renderMarketLegend();   // [MY CHANGE] keep legend in sync
    renderMarketChart();    // [MY CHANGE] draw/update multi-line chart
}

/* -------------------------------------------
   MAIN LOOP
------------------------------------------- */
window.addEventListener("load", () => {
    initMarketHistory();
    renderAll();
});


setInterval(()=>{
    updatePrices();
    renderAll();
}, 1000);