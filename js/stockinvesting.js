
/* ============================================================
   Share Ownership Simulator
   Module 3: "How the stock market works"
   ============================================================ */

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
    priceEl.textContent = '£' + price.toFixed(2);
    valueEl.textContent = '£' + (owned * price).toFixed(2);
}

if (ownedEl && ownershipEl && priceEl && valueEl) {
    document.getElementById('buy').addEventListener('click', () => {
        if (owned < TOTAL_SHARES) owned++;
        updateUI();
    });

    document.getElementById('sell').addEventListener('click', () => {
        if (owned > 0) owned--;
        updateUI();
    });

    document.getElementById('changePrice').addEventListener('click', () => {
        // Random price between £5 and £25
        price = parseFloat((Math.random() * 20 + 5).toFixed(2));
        updateUI();
    });

    updateUI();
}

/* ============================================================
   Module 5 milestone planner logic
   "Saving for big milestones" slide
   ============================================================ */

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
            description:
                'Saving towards a first car, even a used one, usually means putting aside a few thousand pounds over several years.',
            hint:
                'Investing a portion of your savings could help you reach the deposit sooner.'
        },
        uni: {
            name: 'University',
            goal: 15000,
            monthly: 150,
            description:
                'University comes with fees plus living costs. Starting early gives your money more time to grow.',
            hint:
                'Investing regularly can help your savings keep up with rising costs over time.'
        },
        home: {
            name: 'Moving out',
            goal: 6000,
            monthly: 120,
            description:
                'Moving into your own place often needs a deposit, furniture and emergency money.',
            hint:
                'A mix of saving and investing can build a move-out fund without relying only on last-minute loans.'
        },
        job: {
            name: 'First job',
            goal: 3000,
            monthly: 90,
            description:
                'Your first job might mean travel, clothes or relocating to a new city.',
            hint:
                'Having an invested pot ready can make it easier to say yes to the right opportunity.'
        },
        travel: {
            name: 'Travel',
            goal: 3000,
            monthly: 60,
            description:
                'Trips and experiences can be big spends. Planning for them removes a lot of money stress.',
            hint:
                'Investing for longer trips can turn smaller monthly amounts into a meaningful travel fund.'
        }
    };

    const visualMultiplier = {
        car: 2.4,      // was 2.0 – fills a bit slower, not maxed at 10 yrs
        uni: 1.9,      // was 2.4 – fills more for this big long-term goal
        home: 2.6,     // was 2.1 – slows down a little (was full by 8 yrs)

        job: 5.0,      // was 3.5 – needs more time before it looks “full”

        travel: 3.0    // was 2.6 – slightly slower, should be ~90% at 10 yrs
    };

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

        const annualReturn = 0.05;
        const r = annualReturn / 12;
        const factor = Math.pow(1 + r, months);
        const investedTotal = monthly * ((factor - 1) / r);

        const mult = visualMultiplier[currentKey] || 2.2;
        const visualMax = goal * mult;

        let cashProgress = cashTotal / visualMax;
        let investProgress = investedTotal / visualMax;

        cashProgress = Math.max(0, Math.min(cashProgress, 1));
        investProgress = Math.max(0, Math.min(investProgress, 1));

        const minVisible = 0.08;

        const cashHeight = (minVisible + (1 - minVisible) * cashProgress) * 100;
        const investHeight = (minVisible + (1 - minVisible) * investProgress) * 100;

        jarSaving.style.height = cashHeight + '%';
        jarInvesting.style.height = investHeight + '%';

        nameEl.textContent = data.name;
        descEl.textContent = data.description;
        goalEl.textContent = formatMoney(goal);
        monthlyEl.textContent = formatMoney(monthly);
        amountSavingEl.textContent = formatMoney(cashTotal);
        amountInvestingEl.textContent = formatMoney(investedTotal);
        hintEl.textContent = data.hint;

        updateYearsLabel();
    }

    steps.forEach(step => {
        step.addEventListener('click', () => {
            const key = step.dataset.milestone;
            if (!milestoneData[key]) return;

            currentKey = key;

            steps.forEach(s => s.classList.remove('active'));
            step.classList.add('active');

            updateMilestoneView();
        });
    });

    yearsSlider.addEventListener('input', updateMilestoneView);

    updateMilestoneView();
})();
