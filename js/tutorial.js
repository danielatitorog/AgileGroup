let tutorialSteps = [
    {
        target: "[data-tutorial='trade']",
        text: "This is the Trade panel. You can instantly buy or sell popular companies here. Select a company, choose an amount of shares, and execute your trade in seconds."
    },
    {
        target: "[data-tutorial='portfolio-value']",
        text: "This section displays your total portfolio value. It updates automatically as company prices change and as you make trades, giving real insight into how investing grows over time."
    },
    {
        target: "[data-tutorial='market']",
        text: "The Market section shows live-updating stock prices for well-known companies. Prices change every second to simulate real market movement, letting you experience how dynamic investing can be."
    },
    {
        target: "[data-tutorial='assets']",
        text: "Here are the assets you currently own. You can track how many shares you hold, how their value has changed since you bought them, and your total profit or loss."
    }
];

let currentStep = 0;
let backdrop = null;
let tutorialBox = null;
let highlightBox = null;
let activeTarget = null;

function startTutorial() {
    currentStep = 0;
    createBackdrop();
    nextStep();
}

function createBackdrop() {
    if (backdrop) return;
    backdrop = document.createElement("div");
    backdrop.className = "position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50";
    backdrop.style.zIndex = "1040";
    document.body.appendChild(backdrop);
}

function removeBackdrop() {
    if (backdrop) backdrop.remove();
    backdrop = null;
}

function createHighlightBox() {
    if (!highlightBox) {
        highlightBox = document.createElement("div");
        highlightBox.className = "position-absolute border border-primary rounded";
        highlightBox.style.background = "rgba(0,0,0,0.05)";
        highlightBox.style.zIndex = "1051";
        highlightBox.style.transition = "top 0.05s, left 0.05s";
        document.body.appendChild(highlightBox);
    }
}

function createTutorialBox() {
    if (!tutorialBox) {
        tutorialBox = document.createElement("div");
        tutorialBox.className = "card p-3 shadow position-absolute bg-white";
        tutorialBox.style.zIndex = "1052";
        tutorialBox.style.transition = "top 0.05s, left 0.05s";
        document.body.appendChild(tutorialBox);
    }
}

function updatePositions() {
    if (!activeTarget) return;

    let rect = activeTarget.getBoundingClientRect();

    // FIX HERE — convert viewport coords to page coords
    let pageLeft = rect.left + window.scrollX;
    let pageTop = rect.top + window.scrollY;

    highlightBox.style.left = pageLeft + "px";
    highlightBox.style.top = pageTop + "px";
    highlightBox.style.width = rect.width + "px";
    highlightBox.style.height = rect.height + "px";

    let boxRect = tutorialBox.getBoundingClientRect();
    let tutorialTop = pageTop + rect.height + 10;

    if (tutorialTop + boxRect.height > window.scrollY + window.innerHeight) {
        tutorialTop = pageTop - boxRect.height - 10;
    }

    tutorialBox.style.left = pageLeft + "px";
    tutorialBox.style.top = tutorialTop + "px";
}

function nextStep() {
    if (currentStep >= tutorialSteps.length) {
        endTutorial();
        return;
    }

    let step = tutorialSteps[currentStep];
    activeTarget = document.querySelector(step.target);
    if (!activeTarget) return;

    createHighlightBox();
    createTutorialBox();

    tutorialBox.innerHTML = `
    <div class="mb-2">${step.text}</div>
    <div class="d-flex justify-content-end">
        <button class="btn btn-primary btn-sm px-3">Next</button>
    </div>
`;


    tutorialBox.querySelector("button").onclick = () => {
        currentStep++;
        nextStep();
    };

    updatePositions();
}

function endTutorial() {
    if (tutorialBox) tutorialBox.remove();
    if (highlightBox) highlightBox.remove();
    removeBackdrop();
    activeTarget = null;
}

window.addEventListener("load", () => startTutorial());


window.addEventListener("scroll", updatePositions);
window.addEventListener("resize", updatePositions);
