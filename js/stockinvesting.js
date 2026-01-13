// Share trading simulation
const ownedEl = document.getElementById('owned');
const ownershipEl = document.getElementById('ownership');
const priceEl = document.getElementById('price');
const valueEl = document.getElementById('value');

const TOTAL_SHARES = 100;
let owned = 0;
let price = 10;

// Update UI
function updateUI() {
    ownedEl.textContent = owned;
    ownershipEl.textContent = ((owned / TOTAL_SHARES) * 100).toFixed(1) + '%';
    priceEl.textContent = '$' + price.toFixed(2);
    valueEl.textContent = '$' + (owned * price).toFixed(2);
}

// Buy one share
document.getElementById('buy').addEventListener('click', () => {
    if (owned < TOTAL_SHARES) owned++;
    updateUI();
});

// Sell one share
document.getElementById('sell').addEventListener('click', () => {
    if (owned > 0) owned--;
    updateUI();
});

// Randomly change the share price
document.getElementById('changePrice').addEventListener('click', () => {
    price = parseFloat((Math.random() * 20 + 5).toFixed(2));
    updateUI();
});

updateUI();

/* Module 5 milestone planner logic (added) */
(function () {
    const steps = document.querySelectorAll('.milestone-step');
    const yearsSlider = document.getElementById('milestoneYears');
    const yearsLabel = document.getElementById('milestoneYearsLabel');
    const nameEl = document.getElementById('milestoneName');
    const descEl = document.getElementById('milestoneDescription');
    const goalEl = document.getElementById('milestoneGoal');
    const monthlyEl = document.getElementById('milestoneMonthly');
    const amountSavingEl = document.getElementById('amountSaving');
    const amountInvestingEl = document.getElementById('amountInvesting');
    const jarSaving = document.getElementById('jarSaving');
    const jarInvesting = document.getElementById('jarInvesting');
    const hintEl = document.getElementById('milestoneHint');

    if (!steps.length || !yearsSlider || !nameEl) {
        return;
    }

    // Data for different milestones
    const milestoneData = {
        car: {
            name: 'First car',
            goal: 5000,
            monthly: 80,
            description: 'Saving towards a first car, even a used one, usually means putting aside a few thousand pounds over several years.',
            hint: 'Investing a portion of your savings could help you reach the deposit sooner.'
        },
        uni: {
            name: 'University',
            goal: 15000,
            monthly: 150,
            description: 'University comes with fees plus living costs. Starting early gives your money more time to grow.',
            hint: 'Investing regularly can help your savings keep up with rising costs over time.'
        },
        home: {
            name: 'Moving out',
            goal: 6000,
            monthly: 120,
            description: 'Moving into your own place often needs a deposit, furniture and emergency money.',
            hint: 'A mix of saving and investing can build a move-out fund without relying only on last-minute loans.'
        },
        job: {
            name: 'First job',
            goal: 3000,
            monthly: 90,
            description: 'Your first job might mean travel, clothes or relocating to a new city.',
            hint: 'Having an invested pot ready can make it easier to say yes to the right opportunity.'
        },
        travel: {
            name: 'Travel',
            goal: 3000,
            monthly: 60,
            description: 'Trips and experiences can be big spends. Planning for them removes a lot of money stress.',
            hint: 'Investing for longer trips can turn smaller monthly amounts into a meaningful travel fund.'
        }
    };

    // Format money
    function formatMoney(value) {
        return '£' + Math.round(value).toLocaleString('en-GB');
    }

    let currentKey = 'car';

    // Update year display based on slider value
    function updateYearsLabel() {
        const years = yearsSlider.value;
        yearsLabel.textContent = years + (years === '1' ? ' year' : ' years');
    }

    // Update milestone visual
    function updateMilestoneView() {
        const data = milestoneData[currentKey];
        const years = parseInt(yearsSlider.value, 10);
        const months = years * 12;
        const monthly = data.monthly;
        const goal = data.goal;

        // Calculate total frim simple cahnges
        const cashTotal = monthly * months;

        // Calculate total from compound interest invest
        const r = 0.05 / 12; // Monthly interest rate
        const factor = Math.pow(1 + r, months);
        const investedTotal = monthly * ((factor - 1) / r);

        // Update text content
        nameEl.textContent = data.name;
        descEl.textContent = data.description;
        goalEl.textContent = formatMoney(goal);
        monthlyEl.textContent = formatMoney(monthly);
        amountSavingEl.textContent = formatMoney(cashTotal);
        amountInvestingEl.textContent = formatMoney(investedTotal);
        hintEl.textContent = data.hint;

        // Calculate fill percentages
        const cashPercent = Math.max(8, Math.min(100, (cashTotal / goal) * 100));
        const investPercent = Math.max(8, Math.min(100, (investedTotal / goal) * 100));

        // Update visual
        jarSaving.style.height = cashPercent + '%';
        jarInvesting.style.height = investPercent + '%';
    }

    // Add click handers to milestone buttons
    steps.forEach(function (step) {
        step.addEventListener('click', function () {
            const key = this.dataset.milestone;
            if (!milestoneData[key]) {
                return;
            }
            currentKey = key;
            steps.forEach(function (s) { s.classList.remove('active'); });
            this.classList.add('active');
            updateMilestoneView();
        });
    });

    // Update when time chanegs
    yearsSlider.addEventListener('input', function () {
        updateYearsLabel();
        updateMilestoneView();
    });

    updateYearsLabel();
    updateMilestoneView();
})();
