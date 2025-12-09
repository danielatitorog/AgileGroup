// wait for the entire page to load before running any script
    document.addEventListener('DOMContentLoaded', function() {
    const ageOptions = document.querySelectorAll('.age-option');
    const startBtn = document.getElementById('startBtn');
    let selectedAge = null;

    // Handle age selection
    ageOptions.forEach(option => {
    option.addEventListener('click', function() {
    // Remove selected class from all options
    ageOptions.forEach(opt => {
    opt.classList.remove('selected');
});

    // Add selected class to clicked option
    this.classList.add('selected');

    // Check the corresponding radio button
    const radioId = this.getAttribute('for');
    document.getElementById(radioId).checked = true;

    // Enable start button
    startBtn.disabled = false;
    selectedAge = this.querySelector('h3').textContent;

    // Update button text
    startBtn.innerHTML = `<i class="bi bi-play-fill"></i> Start ${selectedAge} Survey`;
});
});

    // Form submission
    document.getElementById('ageForm').addEventListener('submit', function(e) {
    if (!selectedAge) {
    e.preventDefault();
    alert('Please select an age group first.');
}
});

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
    if (e.key === '1') {
    document.getElementById('age_12_15').click();
}
    if (e.key === '2') {
    document.getElementById('age_15_18').click();
}
    if (e.key === 'Enter' && !startBtn.disabled) {
    startBtn.click();
}
});
});
