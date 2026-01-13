/* ============================================================
   Calculator + visual logic for:
   - Module 2: "Not investing vs investing" bars
   - Module 2: Inflation shrinking circle
   - Module 5: Cost of waiting calculator
   (Milestone jar logic is handled elsewhere, so it's removed here.)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    /* [MY CHANGE] Module 1: Intro investing slider (coin + label + balance) */
    initIntroInvesting();

    initWealthBars();
    initInflationWidget();
    initCostOfWaiting();
});

/* -------------------------------
   Helpers
-------------------------------- */

function formatCurrencyGBP(value) {
    return "£" + value.toLocaleString("en-GB", {
        maximumFractionDigits: 0
    });
}

function pluralYears(n) {
    return n + " year" + (n === 1 ? "" : "s");
}

/* -------------------------------
   Module 1: Intro "What is investing?" slider + coin
-------------------------------- */

function initIntroInvesting() {
    const slider = document.getElementById("introYearSlider");
    const coin = document.getElementById("introCoin");
    const yearLabel = document.getElementById("introYearLabel");
    const balance = document.getElementById("introBalance");

    if (!slider || !coin || !yearLabel || !balance) {
        return;
    }

    // Matches your 0..3 slider steps and UI labels
    const labels = ["Today", "5 yrs", "10 yrs", "20 yrs"];

    // Simple example values (not predictions) – adjust if you want
    const values = [100, 350, 900, 1800];

    function update() {
        const step = parseInt(slider.value, 10) || 0;

        yearLabel.textContent = labels[step] ?? "Today";
        balance.textContent = "£" + (values[step] ?? 100).toLocaleString("en-GB");

        // Move coin along the path from 20% to 80% (fits your CSS starting left: 20%)
        const max = parseInt(slider.max, 10) || 3;
        const percent = max === 0 ? 0 : step / max;
        const leftPercent = 20 + (60 * percent);

        coin.style.left = leftPercent + "%";
        coin.style.transform = `translateX(-50%) scale(${0.9 + 0.08 * percent})`;
    }

    slider.addEventListener("input", update);
    update();
}

/* -------------------------------
   Module 2: Not investing vs investing
   (Building wealth over time)
-------------------------------- */

function initWealthBars() {
    const slider = document.getElementById("timeSlider");
    const barCash = document.getElementById("barCash");
    const barInterest = document.getElementById("barInterest");
    const valCash = document.getElementById("valCash");
    const valInvested = document.getElementById("valInvested");
    const yearsLabel = document.getElementById("yearsLabel");

    if (!slider || !barCash || !barInterest || !valCash || !valInvested || !yearsLabel) {
        return; // widget not on this page
    }

    const monthly = 100;      // matches the text in the card
    const annualReturn = 0.08;

    function updateWealth() {
        const years = parseInt(slider.value, 10);
        const months = years * 12;

        const cash = monthly * months;

        // Future value of a series of monthly contributions
        const rMonthly = annualReturn / 12;
        const invested = rMonthly === 0
            ? cash
            : monthly * ((Math.pow(1 + rMonthly, months) - 1) / rMonthly);

        // Use the larger value as visual 100%
        const maxValue = Math.max(cash, invested, 1);
        const cashPct = (cash / maxValue) * 100;
        const invPct = (invested / maxValue) * 100;

        barCash.style.width = cashPct.toFixed(1) + "%";
        barInterest.style.width = invPct.toFixed(1) + "%";

        valCash.textContent = formatCurrencyGBP(cash);
        valInvested.textContent = formatCurrencyGBP(invested);

        yearsLabel.textContent = years;
    }

    slider.addEventListener("input", updateWealth);
    updateWealth();
}

/* -------------------------------
   Module 2: Inflation widget
-------------------------------- */

function initInflationWidget() {
    const slider = document.getElementById("inflationSlider");
    const moneyCircle = document.getElementById("moneyCircle");
    const yearsText = document.getElementById("yearsText");
    const valueText = document.getElementById("valueText");

    if (!slider || !moneyCircle || !yearsText || !valueText) {
        return;
    }

    const startingValue = 100;
    const annualInflation = 0.03;

    function updateInflation() {
        const years = parseInt(slider.value, 10);

        const realValue = startingValue / Math.pow(1 + annualInflation, years);

        yearsText.textContent = pluralYears(years);
        valueText.textContent = "£" + realValue.toFixed(2);

        // shrink the circle smoothly between 1 and 0.4 scaling
        const minScale = 0.4;
        const maxYears = parseInt(slider.max, 10) || 30;
        const t = years / maxYears;
        const scale = 1 - (1 - minScale) * t;

        moneyCircle.style.transform = `scale(${scale})`;
        moneyCircle.style.backgroundColor = years === 0 ? "#198754" : "#0f5132";
    }

    slider.addEventListener("input", updateInflation);
    updateInflation();
}

/* -------------------------------
   Module 5: Cost of Waiting calculator
-------------------------------- */

function initCostOfWaiting() {
    // The button in the HTML calls calculate() directly.
    window.calculate = function () {
        const ageInput = document.getElementById("age");
        const monthlyInput = document.getElementById("monthly");
        const returnInput = document.getElementById("returnRate");
        const delayInput = document.getElementById("delay");
        const resultsBox = document.getElementById("results");
        const nowValueEl = document.getElementById("nowValue");
        const waitValueEl = document.getElementById("waitValue");
        const costEl = document.getElementById("cost");

        if (
            !ageInput ||
            !monthlyInput ||
            !returnInput ||
            !delayInput ||
            !resultsBox ||
            !nowValueEl ||
            !waitValueEl ||
            !costEl
        ) {
            return;
        }

        const currentAge = parseFloat(ageInput.value) || 0;
        const monthly = parseFloat(monthlyInput.value) || 0;
        const annualReturn = (parseFloat(returnInput.value) || 0) / 100;
        const delayYears = parseFloat(delayInput.value) || 0;
        const retirementAge = 65;

        const yearsInvestingNow = Math.max(retirementAge - currentAge, 0);
        const yearsInvestingLater = Math.max(retirementAge - currentAge - delayYears, 0);

        function futureValue(monthlyAmount, years, rate) {
            const months = years * 12;
            const mRate = rate / 12;
            if (mRate === 0) return monthlyAmount * months;
            return monthlyAmount * ((Math.pow(1 + mRate, months) - 1) / mRate);
        }

        const fvNow = futureValue(monthly, yearsInvestingNow, annualReturn);
        const fvLater = futureValue(monthly, yearsInvestingLater, annualReturn);
        const waitingCost = fvNow - fvLater;

        nowValueEl.textContent = formatCurrencyGBP(Math.round(fvNow));
        waitValueEl.textContent = formatCurrencyGBP(Math.round(fvLater));
        costEl.textContent = formatCurrencyGBP(Math.round(waitingCost));

        resultsBox.style.display = "block";
    };
}
