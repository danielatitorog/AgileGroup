// --- Portfolio State ---
let cash = 1000;
let invested = 0;

// Prevent investing/selling multiple times per age click
let canTrade = false;

const cashEl = document.getElementById("cashAmount");
const investedEl = document.getElementById("investedAmount");
const investBtn = document.getElementById("investBtn");
const sellBtn = document.getElementById("sellBtn");

// Update UI
function updatePortfolioUI() {
    cashEl.textContent = cash;
    investedEl.textContent = invested;
}

// Handle Invest
investBtn.addEventListener("click", () => {
    if (!canTrade) return showModal("You must age before you can trade again.", "Trading Locked");

    if (cash < 100) return showModal("Not enough cash to invest.", "Trade Failed");

    cash -= 100;
    invested += 100;
    updatePortfolioUI();

    canTrade = false;
});

// Handle Sell
sellBtn.addEventListener("click", () => {
    if (!canTrade) return showModal("You must age before you can trade again.", "Trading Locked");

    if (invested < 100) return showModal("You have no investments to sell.", "Trade Failed");

    cash += 100;
    invested -= 100;
    updatePortfolioUI();

    canTrade = false;
});
