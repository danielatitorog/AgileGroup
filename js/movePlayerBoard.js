// -------------------------------
// Slide Navigation + Progress
// -------------------------------

const slides = document.querySelectorAll(".slide");
const progressBar = document.getElementById("progressBar");
const prevBtn = document.getElementById("prevSlide");
const nextBtn = document.getElementById("nextSlide");

let currentSlide = typeof LAST_PAGE !== "undefined" ? LAST_PAGE : 0;
let isTransitioning = false;

function updateProgress(index = currentSlide) {
    progressBar.style.width = ((index + 1) / slides.length) * 100 + "%";
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === slides.length - 1;
}

function getModuleForSlide(slideIndex) {
    let accumulated = 0;

    for (const module of MODULES) {
        const start = accumulated;
        const end = accumulated + module.total_pages - 1;

        if (slideIndex >= start && slideIndex <= end) {
            return module.module_id;
        }
        accumulated += module.total_pages;
    }
    return null;
}

function getModuleProgress(slideIndex) {
    let accumulated = 0;

    for (const module of MODULES) {
        const start = accumulated;
        const end = accumulated + module.total_pages - 1;

        if (slideIndex >= start && slideIndex <= end) {
            const pageInModule = slideIndex - start + 1;
            return Math.round((pageInModule / module.total_pages) * 100);
        }
        accumulated += module.total_pages;
    }
    return 0;
}

function saveProgress(slideIndex) {
    const moduleId = getModuleForSlide(slideIndex);
    const percent = getModuleProgress(slideIndex);

    fetch("saveProgress.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `module=${moduleId}&percent=${percent}&page=${slideIndex}`
    }).catch(err => console.error("Progress save failed:", err));
}

function showSlide(index) {
    if (isTransitioning || index === currentSlide || index < 0 || index >= slides.length) return;
    isTransitioning = true;

    const current = slides[currentSlide];
    const next = slides[index];

    current.classList.add("fade-out");

    setTimeout(() => {
        current.classList.remove("active", "fade-out");
        next.classList.add("active", "fade-in");

        currentSlide = index;
        updateProgress();

        setTimeout(() => {
            next.classList.remove("fade-in");
            saveProgress(currentSlide);
            isTransitioning = false;
        }, 500);
    }, 500);
}

// Navigation buttons
prevBtn.addEventListener("click", () => showSlide(currentSlide - 1));
nextBtn.addEventListener("click", () => showSlide(currentSlide + 1));

// -------------------------------
// LOAD USER'S LAST VISITED SLIDE
// -------------------------------

// Remove old default "active"
slides.forEach(s => s.classList.remove("active"));

// Activate correct slide
slides[currentSlide].classList.add("active");

// Update progress bar immediately
updateProgress(currentSlide);

// Sync database (keeps last page consistent)
saveProgress(currentSlide);


document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const target = parseInt(btn.dataset.slide);
        showSlide(target);
    });
});

// -------------------------------
// Inflation Slider
// -------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("inflationSlider");
    if (!slider) return;

    const moneyCircle = document.getElementById("moneyCircle");
    const yearsText = document.getElementById("yearsText");
    const valueText = document.getElementById("valueText");

    const startAmount = 100;
    const inflationRate = 0.03;

    slider.addEventListener("input", function () {
        const years = this.value;
        const power = startAmount / Math.pow(1 + inflationRate, years);
        yearsText.textContent = `${years} Year${years === "1" ? "" : "s"}`;
        valueText.textContent = `£${power.toFixed(2)}`;

        const scale = power / startAmount;
        moneyCircle.style.transform = `scale(${scale})`;

        if (power < 50) {
            moneyCircle.style.backgroundColor = "#dc3545";
            valueText.className = "fw-bold text-danger";
        } else {
            moneyCircle.style.backgroundColor = "#198754";
            valueText.className = "fw-bold text-success";
        }
    });
});

// -------------------------------
// Avoiding Scams Widget
// -------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("scannerToggle");
    if (!toggle) return;

    const messageBox = document.querySelector(".message-box");
    const scamWords = document.querySelectorAll(".scam-word");
    const redFlags = document.getElementById("redFlags");
    const toggleLabel = document.getElementById("toggleLabel");

    toggle.addEventListener("change", function () {
        if (this.checked) {
            toggleLabel.textContent = "Highlighted View";

            messageBox.style.borderLeftColor = "#b60111";
            redFlags.classList.remove("d-none");

            scamWords.forEach(w => {
                w.style.backgroundColor = "#ffc107";
                w.style.fontWeight = "bold";
            });
        } else {
            toggleLabel.textContent = "Normal View";

            messageBox.style.borderLeftColor = "#0d6efd";
            redFlags.classList.add("d-none");

            scamWords.forEach(w => {
                w.style.backgroundColor = "transparent";
                w.style.fontWeight = "normal";
            });
        }
    });
});

// -------------------------------
// 2FA Simulation Widget
// -------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("defenseToggle");
    const btn = document.getElementById("btnHack");

    if (!toggle || !btn) return;

    const door = document.getElementById("doorPanel");
    const lock2Container = document.getElementById("lock2Container");
    const light1 = document.getElementById("light1");
    const resultText = document.getElementById("hackResultText");

    toggle.addEventListener("change", resetSim);
    btn.addEventListener("click", startAttack);

    function startAttack() {
        btn.disabled = true;
        resultText.textContent = "Attempting to crack password...";

        setTimeout(() => {
            light1.classList.replace("bg-secondary", "bg-danger");

            if (toggle.checked) {
                setTimeout(() => finishAttack(false), 800);
            } else {
                finishAttack(true);
            }
        }, 600);
    }

    function finishAttack(success) {
        if (success) {
            door.style.backgroundColor = "#ffcccc";
            door.style.borderColor = "#dc3545";
            resultText.innerHTML = "<strong>SYSTEM HACKED</strong><br>Without 2FA, the password was not enough.";
            resultText.className = "text-center small text-danger border-top pt-2";
        } else {
            door.style.backgroundColor = "#d1e7dd";
            door.style.borderColor = "#198754";
            resultText.innerHTML = "<strong>ATTACK BLOCKED</strong><br>2FA prevented the breach.";
            resultText.className = "text-center small text-success border-top pt-2";
        }

        setTimeout(resetSim, 4000);
    }

    function resetSim() {
        btn.disabled = false;

        door.style.backgroundColor = "#ffffff";
        door.style.borderColor = "#dee2e6";

        light1.classList.remove("bg-danger");
        light1.classList.add("bg-secondary");

        lock2Container.style.opacity = toggle.checked ? "1" : "0.3";

        resultText.textContent = toggle.checked
            ? "Defenses Up. Ready to attack."
            : "Defenses Down. Ready to attack.";

        resultText.className = "text-center small fw-bold text-muted border-top pt-2";
    }
});

// -------------------------------
// Wealth Over Time Widget
// -------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("timeSlider");
    if (!slider) return;

    const yearsLabel = document.getElementById("yearsLabel");
    const barCash = document.getElementById("barCash");
    const barInterest = document.getElementById("barInterest");
    const valCash = document.getElementById("valCash");
    const valInvested = document.getElementById("valInvested");

    const monthly = 100;
    const rate = 0.08;
    const maxScale = 149036;

    slider.addEventListener("input", function () {
        const years = parseInt(this.value);
        yearsLabel.textContent = years;

        const totalCash = monthly * 12 * years;
        const monthlyRate = rate / 12;
        const months = years * 12;

        let totalInvested =
            years > 0
                ? monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
                : 0;

        barCash.style.width = Math.min((totalCash / maxScale) * 100, 100) + "%";
        barInterest.style.width = Math.min((totalInvested / maxScale) * 100, 100) + "%";

        const fmt = new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
            maximumFractionDigits: 0
        });

        valCash.textContent = fmt.format(totalCash);
        valInvested.textContent = fmt.format(totalInvested);
    });
});
