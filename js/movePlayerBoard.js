const slides = document.querySelectorAll(".slide");
const progressBar = document.getElementById("progressBar");
const prevBtn = document.getElementById("prevSlide");
const nextBtn = document.getElementById("nextSlide");

let currentSlide = 0;
let isTransitioning = false;

function updateProgress(index = currentSlide) {
    progressBar.style.width = ((index + 1) / slides.length) * 100 + "%";
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === slides.length - 1;
}

function showSlide(index) {
    if (isTransitioning || index === currentSlide) return;
    isTransitioning = true;

    const current = slides[currentSlide];
    const next = slides[index];

    current.classList.add("fade-out");

    setTimeout(() => {
        current.classList.remove("active", "fade-out");
        current.style.zIndex = 1;

        next.style.zIndex = 2;
        next.classList.add("active", "fade-in");

        setTimeout(() => {
            next.classList.remove("fade-in");
            next.style.zIndex = 1;

            currentSlide = index;
            updateProgress(currentSlide);

            if (currentSlide === 1) alignPlayer();

            isTransitioning = false;
        }, 500);
    }, 500);
}


prevBtn.addEventListener("click", () => showSlide(currentSlide - 1));
nextBtn.addEventListener("click", () => showSlide(currentSlide + 1));

slides[currentSlide].classList.add("active");
updateProgress();

const ageButton = document.getElementById("ageButton");
const player = document.querySelector(".player-container");
const steps = document.querySelectorAll("#board .step-circle");
const boardParent = document.querySelector(".roadmap-card");

let position = 0;
let cash = 33000;
let invested = 0;
const investFraction = 0.05;
const annualReturn = 0.07;
let tradeAllowed = true;

const cashDisplay = document.getElementById("cashDisplay");
const investedDisplay = document.getElementById("investedDisplay");
const buyButton = document.getElementById("buyButton");
const sellButton = document.getElementById("sellButton");

function movePlayerTo(index) {
    if (!steps[index]) return;
    const target = steps[index];
    const rectParent = boardParent.getBoundingClientRect();
    const rectTarget = target.getBoundingClientRect();
    const playerWidth = player.offsetWidth;
    const playerHeight = player.offsetHeight;

    const offsetX = rectTarget.left - rectParent.left + rectTarget.width / 2 - playerWidth / 2;
    const offsetY = rectTarget.top - rectParent.top - playerHeight - 10;

    player.style.left = offsetX + "px";
    player.style.top = offsetY + "px";
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
    }
}

function updatePortfolioUI() {
    cashDisplay.textContent = cash.toFixed(2);
    investedDisplay.textContent = invested.toFixed(2);
}

function getInvestAmount() {
    return Math.round(cash * investFraction);
}

buyButton.addEventListener("click", () => {
    if (!tradeAllowed) return;
    const amount = getInvestAmount();
    if (cash < amount) return alert("Not enough cash to invest!");
    cash -= amount;
    invested += amount;
    tradeAllowed = false;
    updatePortfolioUI();
});

sellButton.addEventListener("click", () => {
    if (!tradeAllowed) return;
    const amount = getInvestAmount();
    if (invested < amount) return alert("Not enough invested to sell!");
    invested -= amount;
    cash += amount;
    tradeAllowed = false;
    updatePortfolioUI();
});

ageButton.addEventListener("click", () => {
    if (position < steps.length - 1) {
        position++;
        invested = +(invested * (1 + annualReturn)).toFixed(2);
        updatePortfolioUI();
        tradeAllowed = true;
        movePlayerTo(position);
        triggerRandomEvent();
    }
});

function alignPlayer() {
    movePlayerTo(position);
}

window.addEventListener('DOMContentLoaded', () => {
    movePlayerTo(0);
    updatePortfolioUI();
    const infoModalEl = document.getElementById('infoModal');
    if(infoModalEl){
        const infoModal = new bootstrap.Modal(infoModalEl);
        infoModal.show();
    }
});

document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const target = parseInt(btn.dataset.slide);
        showSlide(target);
    });
});
