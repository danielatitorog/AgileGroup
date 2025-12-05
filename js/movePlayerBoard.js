let position = 0;
const ageButton = document.getElementById("ageButton");
const player = document.querySelector(".player-container");
const steps = document.querySelectorAll("#board .step-circle");
const boardParent = document.getElementById("board").parentElement;

function movePlayerTo(index) {
    const target = steps[index];
    const rectParent = boardParent.getBoundingClientRect();
    const rectTarget = target.getBoundingClientRect();
    const playerWidth = player.offsetWidth;
    const playerHeight = player.offsetHeight;
    const offsetX = rectTarget.left - rectParent.left + rectTarget.width / 2 - playerWidth / 2;
    const offsetY = rectTarget.top - rectParent.top - playerHeight - 15;

    player.classList.add("fading");
    setTimeout(() => {
        player.style.left = offsetX + "px";
        player.style.top = offsetY + "px";
        setTimeout(() => {
            player.classList.remove("fading");
        }, 300);
    }, 300);
}

function triggerRandomEvent() {
    const chance = Math.random();
    if (chance < 0.25) {
        const eventModalEl = document.getElementById('eventModal');
        const eventModal = new bootstrap.Modal(eventModalEl);
        ageButton.disabled = true;
        eventModal.show();
        eventModalEl.addEventListener('hidden.bs.modal', () => {
            ageButton.disabled = false;
        }, { once: true });
        return true;
    }
    return false;
}

const AVERAGE_SALARY = 33000;
const INVEST_FRACTION = 0.05;
const ANNUAL_RETURN = 0.18;

let portfolio = {
    invested: 0
};

let tradeAllowed = true;

const cashEl = document.getElementById("cashDisplay");
const investedEl = document.getElementById("investedDisplay");
const buyBtn = document.getElementById("buyButton");
const sellBtn = document.getElementById("sellButton");
const investAmountDisplay = document.getElementById("investAmountText");

function getInvestAmount() {
    return Math.round(AVERAGE_SALARY * INVEST_FRACTION / 12);
}

function updatePortfolioUI() {
    if (!cashEl || !investedEl) return;
    cashEl.textContent = AVERAGE_SALARY.toFixed(2);
    investedEl.textContent = portfolio.invested.toFixed(2);
}

function updateInvestAmountUI() {
    if (investAmountDisplay) investAmountDisplay.textContent = getInvestAmount();
}

if (buyBtn) {
    buyBtn.addEventListener("click", () => {
        if (!tradeAllowed) {
            showModal("You can only trade once per age.");
            return;
        }

        const amount = getInvestAmount();

        portfolio.invested += amount;
        tradeAllowed = false;

        updatePortfolioUI();
    });
}

if (sellBtn) {
    sellBtn.addEventListener("click", () => {
        if (!tradeAllowed) {
            showModal("You can only trade once per age.");
            return;
        }

        const amount = getInvestAmount();

        if (portfolio.invested < amount) {
            showModal("Not enough invested to sell.");
            return;
        }

        portfolio.invested -= amount;
        tradeAllowed = false;

        updatePortfolioUI();
    });
}

ageButton.addEventListener("click", () => {
    if (position < steps.length - 1) {
        position++;
        movePlayerTo(position);

        if (portfolio.invested > 0) {
            portfolio.invested = +(portfolio.invested * (1 + ANNUAL_RETURN)).toFixed(2);
            updatePortfolioUI();
        }

        tradeAllowed = true;
        triggerRandomEvent();
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const infoModalEl = document.getElementById('infoModal');
    const infoModal = new bootstrap.Modal(infoModalEl);
    infoModal.show();
    movePlayerTo(0);
    updatePortfolioUI();
    updateInvestAmountUI();
});
