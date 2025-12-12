// GAMIFIED QUIZ JAVASCRIPT
// ----------------------------------------------------------
// This script provides the core logic for a gamified quiz
// experience, including:
// - Question lifecycle and navigation
// - Timer and per-question countdown handling
// - Lives system with persistence via sessionStorage
// - Score tracking and persistence
// - Visual feedback (correct/incorrect, confetti, game over)
// - UI state management (enabling/disabling options & buttons)
// ----------------------------------------------------------

class GamifiedQuiz {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = 0;
        this.lives = 3;
        this.maxLives = 3;
        this.timeLimit = 30; // seconds per question
        this.timeLeft = this.timeLimit;
        this.timer = null;
        this.score = 0;
        this.answered = false;
        this.selectedAnswer = null;
        this.isGameOver = false;

        // Centralized references to key DOM elements used by this class
        this.elements = {
            livesContainer: null,
            timerDisplay: null,
            scoreDisplay: null,
            questionCounter: null,
            progressBar: null,
            answerOptions: null,
            nextButton: null,
            prevButton: null,
            questionText: null,
            quizForm: null
        };

// Perform initial setup once an instance is constructed
        this.init();
    }

    /**
     * Initializes the quiz:
     * - Resolves and caches DOM elements required by the game
     * - Verifies that we are on an appropriate quiz page
     * - Sets up listeners, loads persisted state, and starts the timer
     */

    init() {
        //console.log('GamifiedQuiz initializing...');

        // Find required DOM elements
        this.elements.livesContainer = document.getElementById('lives-container');
        this.elements.timerDisplay = document.getElementById('timer-display');
        this.elements.scoreDisplay = document.getElementById('score-display');
        this.elements.questionCounter = document.getElementById('question-counter');
        this.elements.progressBar = document.getElementById('progress-bar-gamified');
        this.elements.answerOptions = document.querySelectorAll('.answer-option');
        this.elements.nextButton = document.getElementById('next-button');
        this.elements.prevButton = document.getElementById('prev-button');
        this.elements.questionText = document.getElementById('question-text');
        this.elements.quizForm = document.querySelector('.quiz-form');

       /* console.log('Elements found:', {
            livesContainer: !!this.elements.livesContainer,
            timerDisplay: !!this.elements.timerDisplay,
            answerOptions: this.elements.answerOptions?.length || 0,
            nextButton: !!this.elements.nextButton,
            quizForm: !!this.elements.quizForm
        });*/

        // Only initialize if we're on a quiz question page
        if (!this.elements.quizForm || !this.elements.timerDisplay) {
            console.log('Not on quiz question page, skipping initialization');
            return;
        }

        // Get current question from data attribute or URL
        const urlParams = new URLSearchParams(window.location.search);
        const quizParam = urlParams.get('quiz');

        // Initialize lives display
        this.renderLives();

        // Attach click handlers to each answer option
        this.setupAnswerListeners();

        // Attach handlers for navigation controls (next/previous)
        this.setupControlListeners();

        // Load score from previous quiz question in the same session, if any
        this.loadScoreFromSession();

        // Start timer
        this.startTimer();

        // Update progress
        //this.updateProgress();

        //console.log('GamifiedQuiz initialized successfully');
    }
    /**
     * Loads the current score from sessionStorage, if present.
     * If no score is stored, initializes it to 0 and persists it.
     * Also updates the on-screen score display.
     */

    loadScoreFromSession() {
        // Try to load score from sessionStorage
        const savedScore = sessionStorage.getItem('quiz_score');
        if (savedScore) {
            this.score = parseInt(savedScore);
        } else {
            this.score = 0;
            sessionStorage.setItem('quiz_score', '0');
        }

        // Reflect score in the UI, if the score display element exists
        if (this.elements.scoreDisplay) {
            this.elements.scoreDisplay.textContent = this.score;
        }
    }

    /**
     * Persists the current score to sessionStorage.
     * This allows the score to be carried over between question pages.
     */

    saveScoreToSession() {
        sessionStorage.setItem('quiz_score', this.score.toString());
    }

    /**
     * Renders the lives (hearts) UI:
     * - Loads lives from sessionStorage if available
     * - Creates visual heart elements based on maxLives and current lives
     */

    renderLives() {
        if (!this.elements.livesContainer) return;

        this.elements.livesContainer.innerHTML = '';

        const livesLabel = document.createElement('div');
        livesLabel.className = 'lives-label';
        livesLabel.textContent = 'Lives:';
        this.elements.livesContainer.appendChild(livesLabel);

        const heartsContainer = document.createElement('div');
        heartsContainer.className = 'lives';

        // Load lives from sessionStorage or use default
        const savedLives = sessionStorage.getItem('quiz_lives');
        if (savedLives) {
            this.lives = parseInt(savedLives);
        }
// Create heart elements based on maxLives and mark lost ones
        for (let i = 0; i < this.maxLives; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart';
            if (i >= this.lives) {
                heart.classList.add('lost');
            }
            heartsContainer.appendChild(heart);
        }

        this.elements.livesContainer.appendChild(heartsContainer);
    }

    /**
     * Persists the current number of lives to sessionStorage.
     */
    saveLivesToSession() {
        sessionStorage.setItem('quiz_lives', this.lives.toString());
    }

    /**
     * Starts or restarts the question countdown timer:
     * - Clears any existing timer interval
     * - Resets the timeLeft to the configured timeLimit
     * - Schedules a 1-second interval to update the display and check for timeout
     */
    startTimer() {
        //console.log('Starting timer...');

        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timeLeft = this.timeLimit;
        this.updateTimerDisplay();

        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.handleTimeout();
            }
        }, 1000);

        //console.log('Timer started');
    }

    /**
     * Updates the visual timer display:
     * - Formats remaining time as MM:SS
     * - Applies appropriate CSS classes for warning/critical thresholds
     */

    updateTimerDisplay() {
        if (!this.elements.timerDisplay) return;

        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.elements.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update visual state
        this.elements.timerDisplay.classList.remove('warning', 'critical');
// Apply warning and critical visual cues based on time remaining
        if (this.timeLeft <= 10) {
            this.elements.timerDisplay.classList.add('critical');
        } else if (this.timeLeft <= 20) {
            this.elements.timerDisplay.classList.add('warning');
        }
    }

    /**
     * Handles the scenario where the timer reaches zero:
     * - Stops the timer
     * - If no answer has been submitted, deducts a life and shows feedback
     * - Optionally auto-submits after a brief delay
     */

    handleTimeout() {
        //console.log('Time out!');
        clearInterval(this.timer);

        if (!this.answered) {
            this.loseLife();
            this.showFeedback('Time\'s Up!', false);

            // Automatically proceed/submit after a short delay
            setTimeout(() => {
                this.autoSubmit();
            }, 2000);
        }
    }

    /**
     * Performs an automatic submission in timeout scenarios:
     * - If not answered and game is still active, randomly selects an answer
     *   and processes it as if the user had chosen it
     * - If no options are available, simply submits the form
     */
    autoSubmit() {
        if (this.answered || this.isGameOver) return;

        // Select a random answer
        if (this.elements.answerOptions && this.elements.answerOptions.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.elements.answerOptions.length);
            this.selectAnswer(randomIndex);
        } else {
            // If we can't select, just submit the form
            this.submitForm();
        }
    }

    /**
     * Submits the underlying quiz form to move to the next step/page.
     */
    submitForm() {
        if (this.elements.quizForm) {
            this.elements.quizForm.submit();
        }
    }

    /**
     * Attaches click event listeners to each answer option:
     * - On click, selects the corresponding answer if the question is still active
     */
    setupAnswerListeners() {
        if (!this.elements.answerOptions || this.elements.answerOptions.length === 0) {
           // console.log('No answer options found');
            return;
        }

       // console.log('Setting up answer listeners for', this.elements.answerOptions.length, 'options');

        this.elements.answerOptions.forEach((option, index) => {
            option.addEventListener('click', (e) => {
                //console.log('Answer option clicked:', index);
                if (this.answered || this.isGameOver) return;

                this.selectAnswer(index);
            });
        });
    }

    /**
     * Handles answer selection:
     * - Visually marks the selected option
     * - Synchronizes the associated radio input
     * - Checks correctness using a data attribute on the form
     * - Updates score/lives and provides visual feedback
     * - Stops timer and enables navigation to next question
     *
     * @param {number} index - Zero-based index of the selected answer option.
     */
    selectAnswer(index) {
        //console.log('Selecting answer:', index);
        if (this.answered) {
            //console.log('Already answered');
            return;
        }

        // Remove previous selection
        this.elements.answerOptions.forEach(opt => {
            opt.classList.remove('selected');
        });

        // Mark as selected
        const selectedOption = this.elements.answerOptions[index];
        selectedOption.classList.add('selected');
        this.selectedAnswer = index;

        // Check which radio input corresponds to this option
        const radioInput = document.getElementById(`option${index}`);
        if (radioInput) {
            radioInput.checked = true;
        }

        // Get correct answer from data attribute
        const correctAnswer = this.elements.quizForm ?
            parseInt(this.elements.quizForm.dataset.correctAnswer) : 0;
        const isCorrect = (index === correctAnswer);

        //console.log('Selected:', index, 'Correct:', correctAnswer, 'Is correct:', isCorrect);

        // Disable all options
        this.answered = true;
        this.elements.answerOptions.forEach(opt => {
            opt.classList.add('disabled');
        });

        // Handle correct vs incorrect answer logic
        if (isCorrect) {
            selectedOption.classList.add('correct');
            this.score++;
            this.saveScoreToSession();
            this.showConfetti();
            this.showFeedback(this.getRandomMotivationalMessage(), true);
        } else {
            selectedOption.classList.add('wrong');
            // Highlight correct answer
            if (this.elements.answerOptions[correctAnswer]) {
                this.elements.answerOptions[correctAnswer].classList.add('correct');
            }

            // Deduct a life and check for game over
            this.loseLife();
            this.showFeedback(this.getRandomEncouragingMessage(), false);
        }

        // Update score display
        if (this.elements.scoreDisplay) {
            this.elements.scoreDisplay.textContent = this.score;
        }

        // Stop timer
        clearInterval(this.timer);

        // Enable next button
        if (this.elements.nextButton) {
            this.elements.nextButton.disabled = false;
            //console.log('Next button enabled');
        }

        // Automatically submit to move to the next question after a short delay
        setTimeout(() => {
            this.submitForm();
        }, 4000);
    }

    /**
     * Deducts one life from the player:
     * - Updates persisted lives in sessionStorage
     * - Updates heart visuals to mark one as "lost"
     * - Triggers game over when lives reach zero
     */
    loseLife() {
        this.lives--;
        this.saveLivesToSession();

        // Identify currently active hearts (those not marked "lost")
        const hearts = document.querySelectorAll('.heart:not(.lost)');
        if (hearts.length > 0) {
            const heart = hearts[hearts.length - 1];
            heart.classList.add('lost');

            // Force reflow to allow any CSS animation to re-run if needed
            heart.style.animation = 'none';
            setTimeout(() => {
                heart.style.animation = '';
            }, 10);
        }

        // Trigger game over when no lives remain
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    /**
     * Handles the game-over state when the player runs out of lives:
     * - Stops active timers
     * - Clears sessionStorage entries related to this quiz
     * - Replaces the main quiz content with a dedicated game-over screen
     * - Disables navigation controls
     */
    gameOver() {
        console.log('Game Over!');
        this.isGameOver = true;
        clearInterval(this.timer);

        // Remove persisted score and lives so a new run starts fresh
        sessionStorage.removeItem('quiz_score');
        sessionStorage.removeItem('quiz_lives');

        // Create a new game-over view with score and actionable buttons
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over-screen fade-in';
        gameOverScreen.innerHTML = `
            <h2 class="game-over-title">Game Over!</h2>
            <div class="game-over-score">Score: ${this.score}</div>
            <p class="lead">You ran out of lives!</p>
            <div class="mt-4 d-flex justify-content-center gap-3">
                <form action="quiz.php" method="POST" class="d-inline">
                    <button type="submit" name="restart" class="game-button btn-next">
                        <i class="bi bi-arrow-repeat"></i> Play Again
                    </button>
                </form>
                                
                    <a href="learning_hub.php" class="game-button btn-prev">
                    <i class="bi bi-book"></i> Go To Learning Hub
                </a>
               
               
            </div>
        `;

        // Replace quiz content with game over screen
        const quizContent = document.querySelector('.question-card-gamified');
        if (quizContent) {
            quizContent.parentNode.replaceChild(gameOverScreen, quizContent);
        }

        // Disable navigation
        if (this.elements.nextButton) this.elements.nextButton.disabled = true;
        if (this.elements.prevButton) this.elements.prevButton.disabled = true;
    }

    /**
     * Displays a temporary feedback overlay:
     * - Styles differ for correct/incorrect feedback
     * - Automatically fades out and removes itself from the DOM
     *
     * @param {string} message - Text to display inside the feedback overlay.
     * @param {boolean} isCorrect - True for correct feedback styling, false for incorrect.
     */
    showFeedback(message, isCorrect) {
        const feedback = document.createElement('div');
        feedback.className = `feedback-message ${isCorrect ? 'correct' : 'wrong'}`;
        feedback.textContent = message;

        document.body.appendChild(feedback);

        // Remove after animation
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translate(-50%, -50%) scale(0.5)';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 1500);
    }

    /**
     * Returns a random motivational message used when an answer is correct.
     */
    getRandomMotivationalMessage() {
        const messages = [
            "Awesome! 🎉",
            "Brilliant! ⭐",
            "Perfect! ✅",
            "You're a genius! 🧠",
            "Excellent! 💯",
            "Fantastic! 🚀",
            "Well done! 👏",
            "Outstanding! 🌟",
            "Superb! 😎",
            "You rock! 🎸"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Returns a random encouraging message used when an answer is incorrect.
     */
    getRandomEncouragingMessage() {
        const messages = [
            "Almost! 😊",
            "Good try! 💪",
            "Don't give up! 🏃",
            "Next one! 🔜",
            "Keep going! 📈",
            "You'll get it! 🤞",
            "Nice attempt! 👍",
            "Almost there! 🎯",
            "Keep learning! 📚",
            "Try again! 🔄"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Renders a temporary confetti celebration:
     * - Creates a dedicated container if none exists
     * - Spawns multiple animated confetti particles with random colors
     * - Cleans up DOM elements after animations complete
     */
    showConfetti() {
        // Create confetti container if it doesn't exist
        let confettiContainer = document.querySelector('.confetti-container');
        if (!confettiContainer) {
            confettiContainer = document.createElement('div');
            confettiContainer.className = 'confetti-container';
            document.body.appendChild(confettiContainer);
        }

        // Create confetti particles
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = this.getRandomColor();
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.top = '0';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.opacity = '0.8';
            confetti.style.zIndex = '9999';

            confettiContainer.appendChild(confetti);

            // Configure and start falling animation for each particle
            const animation = confetti.animate([
                {
                    transform: 'translateY(0) rotate(0deg)',
                    opacity: 1
                },
                {
                    transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 720}deg)`,
                    opacity: 0
                }
            ], {
                duration: Math.random() * 2000 + 1000,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
            });

            // Remove confetti element once its animation completes
            animation.onfinish = () => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            };
        }

        // Remove container after all confetti is gone
        setTimeout(() => {
            if (confettiContainer.children.length === 0 && confettiContainer.parentNode) {
                confettiContainer.parentNode.removeChild(confettiContainer);
            }
        }, 3000);
    }

    /**
     * Utility method returning a random color used for confetti particles.
     */
    getRandomColor() {
        const colors = [
            '#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ff6348',
            '#3742fa', '#7bed9f', '#70a1ff', '#ff7f50', '#ff6b81'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Attaches event listeners to navigation controls:
     * - Next button: prevents navigation if no answer has been selected
     * - Previous button: clears session data when navigating backwards
     */
    setupControlListeners() {
        if (this.elements.nextButton) {
            this.elements.nextButton.addEventListener('click', (e) => {
                if (!this.answered && !this.isGameOver) {
                    e.preventDefault();
                    this.showFeedback('Please select an answer first!', false);
                }
            });
        }

        if (this.elements.prevButton) {
            this.elements.prevButton.addEventListener('click', (e) => {
                // Clear session storage when going back
                sessionStorage.removeItem('quiz_score');
                sessionStorage.removeItem('quiz_lives');
            });
        }
    }

    /**
     * Convenience method for programmatically progressing to the next question:
     * - Triggers a click on the "Next" button if it is enabled
     */
    goToNextQuestion() {
        if (this.elements.nextButton && !this.elements.nextButton.disabled) {
            this.elements.nextButton.click();
        }
    }

    /**
     * Updates the visual progress bar and question counter:
     * - Uses a "q" query parameter from the URL to determine the current question index
     * - Computes progress percentage based on totalQuestions
     * - Updates both the progress bar width and the textual counter
     *
     * Note: totalQuestions must be set externally for this to be accurate.
     */
    updateProgress() {
        if (this.elements.progressBar) {
            // Get current question from URL or default to 1
            const urlParams = new URLSearchParams(window.location.search);
            const currentQ = parseInt(urlParams.get('q')) || 1;
            const progress = ((currentQ - 1) / this.totalQuestions) * 100;
            this.elements.progressBar.style.width = `${progress}%`;
        }

        if (this.elements.questionCounter) {
            // Get current question from URL or default to 1
            const urlParams = new URLSearchParams(window.location.search);
            const currentQ = parseInt(urlParams.get('q')) || 1;
            this.elements.questionCounter.textContent =
                `Question ${currentQ} of ${this.totalQuestions}`;
        }
    }
}


// ----------------------------------------------------------
// GLOBAL INITIALIZATION
// ----------------------------------------------------------

// Initialize the gamified quiz once the DOM is fully loaded.
// Only runs on pages that actually contain an active quiz
// (identified by presence of .quiz-form and #timer-display).

document.addEventListener('DOMContentLoaded', () => {
    //console.log('DOM loaded, initializing quiz...');

    // Check if we're on a quiz question page (has quiz-form)
    const quizForm = document.querySelector('.quiz-form');
    const timerDisplay = document.getElementById('timer-display');

    if (quizForm && timerDisplay) {
        //console.log('Quiz page detected, initializing gamified quiz...');
        window.quizGame = new GamifiedQuiz();
    } else {
        //console.log('Not a quiz question page or already showing results');
    }
});

// ----------------------------------------------------------
// SESSION CLEANUP ON PAGE UNLOAD
// ----------------------------------------------------------
//
// Clears sessionStorage entries related to the quiz when the user leaves
// the page, *unless* the form is in a valid state (which indicates that
// the user is likely submitting an answer and transitioning to the next
// question in the flow).

window.addEventListener('beforeunload', () => {
    // Don't clear if we're submitting the form
    if (!document.querySelector('.quiz-form')?.checkValidity()) {
        sessionStorage.removeItem('quiz_score');
        sessionStorage.removeItem('quiz_lives');
    }
});