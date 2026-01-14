// Interactive tutorial system for the investment simulator
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

// Start the interactive tutorial
function startTutorial() {
    currentStep = 0;
    createBackdrop();
    nextStep();
}

// Create semi-transparent backdrop to focus user attention
function createBackdrop() {
    if (backdrop) return;
    backdrop = document.createElement("div");
    backdrop.className = "position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50";
    backdrop.style.zIndex = "1040";
    document.body.appendChild(backdrop);
}

// Remove the backdrop when tutorial ends
function removeBackdrop() {
    if (backdrop) backdrop.remove();
    backdrop = null;
}

// Create highlight box that shows around the current tutorial element
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

// Create the tutorial text box with instructions
function createTutorialBox() {
    if (!tutorialBox) {
        tutorialBox = document.createElement("div");
        tutorialBox.className = "card p-3 shadow position-absolute bg-white";
        tutorialBox.style.zIndex = "1052";
        tutorialBox.style.transition = "top 0.05s, left 0.05s";
        document.body.appendChild(tutorialBox);
    }
}

// Update positions of highlight and tutorial boxes when scrolling/resizing
function updatePositions() {
    if (!activeTarget) return;

    let rect = activeTarget.getBoundingClientRect();

    // Convert viewport coordinates to page coordinates
    let pageLeft = rect.left + window.scrollX;
    let pageTop = rect.top + window.scrollY;

    // Position the highlight box around the target element
    highlightBox.style.left = pageLeft + "px";
    highlightBox.style.top = pageTop + "px";
    highlightBox.style.width = rect.width + "px";
    highlightBox.style.height = rect.height + "px";

    // Position tutorial box below or above the highlighted element
    let boxRect = tutorialBox.getBoundingClientRect();
    let tutorialTop = pageTop + rect.height + 10;

    // If box would go off screen, position it above instead
    if (tutorialTop + boxRect.height > window.scrollY + window.innerHeight) {
        tutorialTop = pageTop - boxRect.height - 10;
    }

    tutorialBox.style.left = pageLeft + "px";
    tutorialBox.style.top = tutorialTop + "px";
}

// Move to the next tutorial step
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

    // Build tutorial box content with current instruction
    tutorialBox.innerHTML = `
    <div class="mb-2">${step.text}</div>
    <div class="d-flex justify-content-end">
        <button class="btn btn-primary btn-sm px-3">Next</button>
    </div>
`;

    // Set up click handler for the Next button
    tutorialBox.querySelector("button").onclick = () => {
        currentStep++;
        nextStep();
    };

    updatePositions();
}

// Clean up tutorial when finished
function endTutorial() {
    if (tutorialBox) tutorialBox.remove();
    if (highlightBox) highlightBox.remove();
    removeBackdrop();
    activeTarget = null;

    // Mark tutorial as completed
    fetch("mark_tutorial_seen.php");
}

window.addEventListener("load", () => {
    if (!hasSeenTutorial) {
        startTutorial();
    }
});

// Update tutorial positions
window.addEventListener("scroll", updatePositions);
window.addEventListener("resize", updatePositions);
