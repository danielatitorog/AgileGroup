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

    return null; // Should never happen
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

    return 0; // fallback
}

// Send AJAX request to save progress
function saveProgress(slideIndex) {
    const moduleId = getModuleForSlide(slideIndex);
    const percent = getModuleProgress(slideIndex);
    const page = slideIndex;

    fetch("saveProgress.php", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: `module=${moduleId}&percent=${percent}&page=${page}`
    }).catch(err => console.error("Progress save failed:", err));
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

        currentSlide = index;
        updateProgress(currentSlide);

        setTimeout(() => {
            next.classList.remove("fade-in");
            next.style.zIndex = 1;

            currentSlide = index;
            updateProgress(currentSlide);

            saveProgress(currentSlide);

            if (currentSlide === 1) alignPlayer();

            isTransitioning = false;
        }, 500);
    }, 500);
}


prevBtn.addEventListener("click", () => showSlide(currentSlide - 1));
nextBtn.addEventListener("click", () => showSlide(currentSlide + 1));

slides[currentSlide].classList.add("active");
updateProgress();


document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const target = parseInt(btn.dataset.slide);
        showSlide(target);
    });
});
function triggerRandomEvent() {
    const chance = Math.random();
    if (chance < 0.25) {
        const eventModalEl = document.getElementById('eventModal');
        const eventModal = new bootstrap.Modal(eventModalEl);
        ageButton.disabled = true;
        eventModal.show();
        eventModalEl.addEventListener('hidden.bs.modal', () => {
            ageButton.disabled = false;
        }, {once: true});
    }
}


// inflation slider
document.addEventListener("DOMContentLoaded", function() {
    const slider = document.getElementById('inflationSlider');
    const moneyCircle = document.getElementById('moneyCircle');
    const yearsText = document.getElementById('yearsText');
    const valueText = document.getElementById('valueText');
    const startAmount = 100;
    const inflationRate = 0.03;

    slider.addEventListener('input', function() {
        const years = this.value;

        let purchasingPower = startAmount / Math.pow((1 + inflationRate), years);

        yearsText.textContent = years + (years == 1 ? " Year" : " Years");
        valueText.textContent = '£' + purchasingPower.toFixed(2);

        const scale = purchasingPower / startAmount;
        moneyCircle.style.transform = `scale(${scale})`;

        if (purchasingPower < 50) {
            moneyCircle.style.backgroundColor = '#dc3545';
            valueText.className = 'fw-bold text-danger';
        } else {
            moneyCircle.style.backgroundColor = '#198754';
            valueText.className = 'fw-bold text-success';
        }
    });
});

// avoiding scams visual representation
document.addEventListener("DOMContentLoaded", function() {
    const toggle = document.getElementById('scannerToggle');
    const messageBox = document.querySelector('.message-box');
    const scamWords = document.querySelectorAll('.scam-word');
    const redFlags = document.getElementById('redFlags');
    const toggleLabel = document.getElementById('toggleLabel');

    toggle.addEventListener('change', function() {
        if(this.checked) {
            toggleLabel.textContent = "Highlighted View";

            messageBox.style.borderLeftColor = "#b60111";

            redFlags.classList.remove('d-none');

            scamWords.forEach(word => {
                word.style.backgroundColor = "#ffc107";
                word.style.fontWeight = "bold";
            });

        } else {
            toggleLabel.textContent = "Normal View";
            toggleLabel.classList.remove('text-danger');

            messageBox.style.borderLeftColor = "#0d6efd";

            redFlags.classList.add('d-none');

            scamWords.forEach(word => {
                word.style.backgroundColor = "transparent";
                word.style.fontWeight = "normal";
                word.style.textDecoration = "none";
            });
        }
    });
});

// creating safe habits online visual representation
document.addEventListener("DOMContentLoaded", function() {
    const toggle = document.getElementById('defenseToggle');
    const btn = document.getElementById('btnHack');

    const door = document.getElementById('doorPanel');
    const lock2Container = document.getElementById('lock2Container');
    const light1 = document.getElementById('light1');
    const resultText = document.getElementById('hackResultText');

    toggle.addEventListener('change', function() {
        resetSim();
        if(this.checked) {
            lock2Container.style.opacity = "1";
            resultText.textContent = "Defenses Up. Try to hack now.";
        } else {
            lock2Container.style.opacity = "0.3";
            resultText.textContent = "Defenses Down. Vulnerable.";
        }
    });

    btn.addEventListener('click', function() {
        btn.disabled = true;
        resultText.textContent = "Attempting to crack password...";

        setTimeout(() => {
            light1.classList.remove('bg-secondary');
            light1.classList.add('bg-danger');

            if(toggle.checked) {
                setTimeout(() => {
                    attemptResult(false);
                }, 800);
            } else {
                attemptResult(true);
            }
        }, 600);
    });

    function attemptResult(hackerWon) {
        setTimeout(() => {
            if(hackerWon) {
                door.style.backgroundColor = "#ffcccc";
                door.style.borderColor = "#dc3545";

                resultText.innerHTML = "<strong>SYSTEM HACKED</strong><br>Without 2FA, the password was not enough.";
                resultText.className = "text-center small text-danger border-top pt-2";
            } else {
                door.style.backgroundColor = "#d1e7dd";
                door.style.borderColor = "#198754";

                resultText.innerHTML = "<strong>ATTACK BLOCKED</strong><br>The hacker has the password, but 2FA stopped the attack.";
                resultText.className = "text-center small text-success border-top pt-2";
            }

            setTimeout(() => {
                resetSim();
            }, 4000);
        }, 300);
    }

    function resetSim() {
        btn.disabled = false;
        door.style.backgroundColor = "#ffffff";
        door.style.borderColor = "#dee2e6";

        light1.classList.remove('bg-danger');
        light1.classList.add('bg-secondary');

        if(toggle.checked) {
            resultText.textContent = "Defenses Up. Ready to attack.";
            resultText.className = "text-center small fw-bold text-muted border-top pt-2";
        } else {
            resultText.textContent = "Defenses Down. Ready to attack.";
            resultText.className = "text-center small fw-bold text-muted border-top pt-2";
        }
window.addEventListener('DOMContentLoaded', () => {
    movePlayerTo(0);
    updatePortfolioUI();
    const infoModalEl = document.getElementById('infoModal');
    if (infoModalEl) {
        const infoModal = new bootstrap.Modal(infoModalEl);
        infoModal.show();
    }
});

// building wealth overtime visual representation
document.addEventListener("DOMContentLoaded", function() {
    const slider = document.getElementById('timeSlider');
    const yearsLabel = document.getElementById('yearsLabel');

    const barCash = document.getElementById('barCash');
    const barInterest = document.getElementById('barInterest');

    const valCash = document.getElementById('valCash');
    const valInvested = document.getElementById('valInvested');

    const monthly = 100;
    const rate = 0.08;
    const maxScale = 149036;

    slider.addEventListener('input', function() {
        const years = parseInt(this.value);
        yearsLabel.textContent = years;

        const totalCash = monthly * 12 * years;

        const monthlyRate = rate / 12;
        const months = years * 12;
        let totalInvested = 0;

        if (years > 0) {
            totalInvested = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        }

        const cashPerc = Math.min((totalCash / maxScale) * 100, 100);
        const totalInvPerc = Math.min((totalInvested / maxScale) * 100, 100);

        const interestPerc = totalInvPerc;

        barCash.style.width = cashPerc + "%";
        barInterest.style.width = interestPerc + "%";

        const fmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });

        valCash.textContent = fmt.format(totalCash);
        valInvested.textContent = fmt.format(totalInvested);
    });
});