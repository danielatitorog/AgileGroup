// Risk level visual
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.risk-card');
    const growthFill = document.getElementById('growthFill');
    const bumpsFill = document.getElementById('bumpsFill');
    const text = document.getElementById('riskJourneyText');

    if (!cards.length || !growthFill || !bumpsFill || !text) {
        return;
    }

    // Define visual for each risk level
    const states = {
        low: {
            growth: '40%',
            bumps: '20%',
            text: 'Low risk: the ride is calmer and usually more predictable, but growth is slower.'
        },
        medium: {
            growth: '65%',
            bumps: '45%',
            text: 'Medium risk: a more balanced journey, with some bumps but a good chance of growth over time.'
        },
        high: {
            growth: '85%',
            bumps: '75%',
            text: 'High risk: the ride is bumpier, with bigger ups and downs, but there\'s more potential for higher growth.'
        }
    };

    // Update UI to show risk level
    function setState(riskKey) {
        cards.forEach(card => {
            card.classList.toggle('active', card.dataset.risk === riskKey);
        });

        // Update progress bars and description text
        const state = states[riskKey];
        growthFill.style.height = state.growth;
        bumpsFill.style.height = state.bumps;
        text.textContent = state.text;
    }

    // Add click handlers
    cards.forEach(card => {
        card.addEventListener('click', () => setState(card.dataset.risk));
    });

    // initial state
    setState('low');
});

// Coin growth visualization over time
document.addEventListener('DOMContentLoaded', function () {
    var slider = document.getElementById('introYearSlider');
    var coin = document.getElementById('introCoin');
    var yearLabel = document.getElementById('introYearLabel');
    var balanceLabel = document.getElementById('introBalance');
    if (!slider || !coin || !yearLabel || !balanceLabel) return;

    var states = [
        { left: '20%', scale: 0.9, years: 'Today', amount: '£100' },
        { left: '40%', scale: 1.0, years: 'In 5 years', amount: 'about £130' },
        { left: '60%', scale: 1.1, years: 'In 10 years', amount: 'about £170' },
        { left: '80%', scale: 1.2, years: 'In 20 years', amount: 'about £280' }
    ];

    // Update visualization based on slider position
    function update(index) {
        var s = states[index] || states[0];
        coin.style.left = s.left;
        coin.style.transform = 'translateX(-50%) scale(' + s.scale + ')';
        yearLabel.textContent = s.years;
        balanceLabel.textContent = s.amount;
    }

    // Update when slider changes
    slider.addEventListener('input', function (e) {
        update(parseInt(e.target.value, 10));
    });

    // Set Initial state
    update(parseInt(slider.value, 10) || 0);
});
