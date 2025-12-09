
    document.addEventListener('DOMContentLoaded', function() {
        const surveyForm = document.getElementById('surveyForm');
        if (!surveyForm) {
            console.error('Survey form not found!');
            return;
        }

        // Get totalQuestions from data attribute
        const totalQuestions = parseInt(surveyForm.dataset.totalQuestions) || 0;
        console.log('Total questions:', totalQuestions);

    let currentQuestionIndex = 0;
    const answeredQuestions = new Set();
    const userAnswers = {};

    // Initialize
    updateProgress();

    // Function to show a specific question WITHOUT scrolling
    function showQuestion(index) {
    // Hide all questions
    document.querySelectorAll('.question-card').forEach(card => {
    card.classList.add('d-none');
    card.classList.remove('active-question');
});

    // Show the requested question
    const questionCard = document.querySelector(`[data-question-index="${index}"]`);
    if (questionCard) {
    questionCard.classList.remove('d-none');
    questionCard.classList.add('active-question');
    currentQuestionIndex = index;

    // Update current question number
    document.getElementById('currentQuestionNum').textContent = index + 1;

    // Update question steps
    document.querySelectorAll('.question-step').forEach(step => {
    step.classList.remove('active-step', 'answered-step');
    const stepNum = parseInt(step.dataset.step);
    if (stepNum === index + 1) {
    step.classList.add('active-step');
}
    // Re-apply answered class if question was answered
    if (answeredQuestions.has(stepNum)) {
    step.classList.add('answered-step');
}
});

    // Show/hide buttons based on question status
    updateButtonVisibility();
}
}

    // Function to update progress
    function updateProgress() {
    const progressPercentage = Math.round((answeredQuestions.size / totalQuestions) * 100);
    document.getElementById('progressPercentage').textContent = progressPercentage + '%';
    document.getElementById('progressBar').style.width = progressPercentage + '%';
    document.getElementById('progressBar').setAttribute('aria-valuenow', progressPercentage);

    // Update progress bar color
    const progressBar = document.getElementById('progressBar');
    if (progressPercentage === 100) {
    progressBar.classList.remove('bg-danger', 'bg-warning');
    progressBar.classList.add('bg-success');
} else if (progressPercentage >= 50) {
    progressBar.classList.remove('bg-danger', 'bg-success');
    progressBar.classList.add('bg-warning');
} else {
    progressBar.classList.remove('bg-warning', 'bg-success');
    progressBar.classList.add('bg-danger');
}

    // Update answered count in modal
    document.getElementById('answeredCountText').textContent = answeredQuestions.size;
}

    // Function to update button visibility
    function updateButtonVisibility() {
    const currentQuestionId = document.querySelector('.active-question').dataset.questionId;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    if (!isLastQuestion) {
    // For questions 1 to (n-1): show Continue button
    const nextBtn = document.getElementById(`nextBtn-${currentQuestionId}`);
    if (nextBtn) {
    const hasAnswer = answeredQuestions.has(parseInt(currentQuestionId));
    nextBtn.disabled = !hasAnswer;
}
} else {
    // For last question: show Submit button
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
    const hasAnswer = answeredQuestions.has(parseInt(currentQuestionId));
    const allAnswered = answeredQuestions.size === totalQuestions;

    submitBtn.disabled = !allAnswered;

    if (allAnswered) {
    submitBtn.classList.remove('btn-secondary');
    submitBtn.classList.add('btn-success');
} else {
    submitBtn.classList.remove('btn-success');
    submitBtn.classList.add('btn-secondary');
}
}
}
}

    // Function to save answer
    function saveAnswer(questionId, answer) {
    userAnswers[questionId] = answer;
    answeredQuestions.add(parseInt(questionId));

    // Update hidden input
    const hiddenInput = document.getElementById(`hidden_q${questionId}`);
    if (hiddenInput) {
    hiddenInput.value = Array.isArray(answer) ? answer.join(', ') : answer;
}

    // Update question step
    document.querySelectorAll('.question-step').forEach(step => {
    if (parseInt(step.dataset.step) === (currentQuestionIndex + 1)) {
    step.classList.add('answered-step');
}
});

    updateProgress();
    updateButtonVisibility();
}

    // Event Listeners

    // Radio button click - save answer
    document.querySelectorAll('.question-radio').forEach(radio => {
    radio.addEventListener('change', function() {
    const questionId = this.dataset.questionId;
    const answer = this.value;
    saveAnswer(questionId, answer);

    // Remove highlight from all options in this question
    const questionCard = document.querySelector(`#questionCard-${questionId}`);
    questionCard.querySelectorAll('.list-group-item').forEach(item => {
    item.classList.remove('bg-light', 'border-primary');
});

    // Add highlight to selected option
    this.closest('.list-group-item').classList.add('bg-light', 'border-primary');
});
});

    // Checkbox change - update answer
    document.querySelectorAll('.question-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
    const questionId = this.dataset.questionId;
    const selectedCheckboxes = document.querySelectorAll(`#questionCard-${questionId} input[type="checkbox"]:checked`);
    const answer = Array.from(selectedCheckboxes).map(cb => cb.value);
    saveAnswer(questionId, answer.length > 0 ? answer : null);

    // Update highlight for checkboxes
    const listItem = this.closest('.list-group-item');
    if (this.checked) {
    listItem.classList.add('bg-light', 'border-primary');
} else {
    // Check if any checkbox is still checked
    const anyChecked = selectedCheckboxes.length > 0;
    if (!anyChecked) {
    listItem.classList.remove('bg-light', 'border-primary');
}
}
});
});

    // Next button click - manual advance only
    document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', function() {
    if (currentQuestionIndex < totalQuestions - 1 && !this.disabled) {
    showQuestion(currentQuestionIndex + 1);
}
});
});

    // Previous button click
    document.querySelectorAll('.prev-btn').forEach(btn => {
    btn.addEventListener('click', function() {
    if (currentQuestionIndex > 0) {
    showQuestion(currentQuestionIndex - 1);
}
});
});

    // Question step click - navigate to any question
    document.querySelectorAll('.question-step').forEach(step => {
    step.addEventListener('click', function() {
    const stepNum = parseInt(this.dataset.step);
    showQuestion(stepNum - 1);
});
});

    // Form submit handler
    document.getElementById('surveyForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Show confirmation modal
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();
});

    // Confirm submit button
    document.getElementById('confirmSubmit').addEventListener('click', function() {
    // Submit the form
    document.getElementById('surveyForm').submit();
});

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
    // Only allow navigation if not on last question
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    if ((e.key === 'ArrowRight' || e.key === 'Enter') && !isLastQuestion) {
    const currentQuestionId = document.querySelector('.active-question').dataset.questionId;
    const nextBtn = document.getElementById(`nextBtn-${currentQuestionId}`);
    if (nextBtn && !nextBtn.disabled) {
    e.preventDefault();
    nextBtn.click();
}
} else if (e.key === 'ArrowLeft') {
    const prevBtn = document.querySelector('.active-question .prev-btn');
    if (prevBtn && !prevBtn.classList.contains('invisible')) {
    e.preventDefault();
    prevBtn.click();
}
}
});

    // Initialize button states
    updateButtonVisibility();
});
