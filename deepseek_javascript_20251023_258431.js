// DOM elements
const currentQuestionElement = document.getElementById('current-question');
const totalQuestionsElement = document.getElementById('total-questions');
const totalDisplayElement = document.getElementById('total-display');
const currentScoreElement = document.getElementById('current-score');
const answeredElement = document.getElementById('answered');
const correctElement = document.getElementById('correct');
const scoreElement = document.getElementById('score');
const progressBarElement = document.getElementById('progress-bar');
const progressPercentElement = document.getElementById('progress-percent');
const questionTopicElement = document.getElementById('question-topic');
const questionTextElement = document.getElementById('question-text');
const optionsContainerElement = document.getElementById('options-container');
const explanationElement = document.getElementById('explanation');
const explanationTextElement = document.getElementById('explanation-text');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
const submitButton = document.getElementById('submit-btn');
const resultContainer = document.getElementById('result-container');
const finalScoreElement = document.getElementById('final-score');
const scoreTextElement = document.getElementById('score-text');
const restartButton = document.getElementById('restart-btn');
const categoryFilterElement = document.getElementById('category-filter');
const timerElement = document.getElementById('timer');
const bookmarkBtn = document.getElementById('bookmark-btn');
const bookmarkedQuestionsElement = document.getElementById('bookmarked-questions');
const bookmarkedListElement = document.getElementById('bookmarked-list');

// Quiz state
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = new Array(allQuestions.length).fill(null);
let answeredCount = 0;
let correctCount = 0;
let startTime;
let timerInterval;
let bookmarkedQuestions = new Set();
let currentCategory = "All";

// Extract unique categories
const categories = ["All", ...new Set(allQuestions.map(q => q.category))];

// Initialize quiz
function initQuiz() {
    totalQuestionsElement.textContent = allQuestions.length;
    totalDisplayElement.textContent = allQuestions.length;
    updateQuestion();
    updateProgressBar();
    updateStats();
    setupCategoryFilter();
    startTimer();
    updateBookmarkButton();
}

// Setup category filter
function setupCategoryFilter() {
    categoryFilterElement.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = `category-btn ${category === currentCategory ? 'active' : ''}`;
        button.textContent = category;
        button.addEventListener('click', () => {
            currentCategory = category;
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentQuestionIndex = 0;
            updateQuestion();
            updateProgressBar();
        });
        categoryFilterElement.appendChild(button);
    });
}

// Filter questions by category
function getFilteredQuestions() {
    if (currentCategory === "All") return allQuestions;
    return allQuestions.filter(q => q.category === currentCategory);
}

// Get current question index in filtered list
function getCurrentFilteredIndex() {
    const filteredQuestions = getFilteredQuestions();
    const currentQuestion = allQuestions[currentQuestionIndex];
    return filteredQuestions.findIndex(q => q.question === currentQuestion.question);
}

// Update question display
function updateQuestion() {
    const currentQuestion = allQuestions[currentQuestionIndex];
    const filteredQuestions = getFilteredQuestions();
    const filteredIndex = getCurrentFilteredIndex();
    
    currentQuestionElement.textContent = filteredIndex + 1;
    questionTopicElement.textContent = currentQuestion.category;
    questionTextElement.textContent = currentQuestion.question;
    
    // Clear previous options
    optionsContainerElement.innerHTML = '';
    
    // Add new options
    currentQuestion.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        
        if (userAnswers[currentQuestionIndex] === index) {
            optionElement.classList.add('selected');
        }
        
        const optionLetter = document.createElement('div');
        optionLetter.className = 'option-letter';
        optionLetter.textContent = String.fromCharCode(65 + index); // A, B, C, D
        
        const optionText = document.createElement('div');
        optionText.className = 'option-text';
        optionText.textContent = option;
        
        optionElement.appendChild(optionLetter);
        optionElement.appendChild(optionText);
        
        optionElement.addEventListener('click', () => selectOption(index));
        optionsContainerElement.appendChild(optionElement);
    });
    
    // Update navigation buttons
    const filteredQuestionsCount = filteredQuestions.length;
    prevButton.disabled = filteredIndex === 0;
    
    if (filteredIndex === filteredQuestionsCount - 1) {
        nextButton.style.display = 'none';
        submitButton.style.display = 'block';
    } else {
        nextButton.style.display = 'block';
        submitButton.style.display = 'none';
    }
    
    // Hide explanation when moving to a new question
    explanationElement.style.display = 'none';
    
    // Update bookmark button
    updateBookmarkButton();
}

// Select an option
function selectOption(optionIndex) {
    if (userAnswers[currentQuestionIndex] === null) {
        answeredCount++;
    }
    
    userAnswers[currentQuestionIndex] = optionIndex;
    
    const currentQuestion = allQuestions[currentQuestionIndex];
    if (optionIndex === currentQuestion.correct) {
        correctCount++;
        score++;
    } else if (userAnswers[currentQuestionIndex] !== null && optionIndex !== currentQuestion.correct) {
        // If changing from correct to incorrect answer
        if (userAnswers[currentQuestionIndex] === currentQuestion.correct) {
            correctCount--;
            score--;
        }
    }
    
    updateQuestion();
    updateStats();
}

// Update progress bar
function updateProgressBar() {
    const filteredQuestions = getFilteredQuestions();
    const filteredIndex = getCurrentFilteredIndex();
    const progress = ((filteredIndex + 1) / filteredQuestions.length) * 100;
    progressBarElement.style.width = `${progress}%`;
    progressPercentElement.textContent = `${Math.round(progress)}%`;
}

// Update stats
function updateStats() {
    answeredElement.textContent = answeredCount;
    correctElement.textContent = correctCount;
    currentScoreElement.textContent = score;
    const percentage = allQuestions.length > 0 ? Math.round((correctCount / allQuestions.length) * 100) : 0;
    scoreElement.textContent = `${percentage}%`;
}

// Show explanation for current question
function showExplanation() {
    const currentQuestion = allQuestions[currentQuestionIndex];
    explanationTextElement.textContent = currentQuestion.explanation;
    explanationElement.style.display = 'block';
    
    // Highlight correct and incorrect answers
    const options = optionsContainerElement.querySelectorAll('.option');
    options.forEach((option, index) => {
        option.classList.remove('correct', 'incorrect');
        
        if (index === currentQuestion.correct) {
            option.classList.add('correct');
        } else if (index === userAnswers[currentQuestionIndex] && userAnswers[currentQuestionIndex] !== currentQuestion.correct) {
            option.classList.add('incorrect');
        }
    });
}

// Start timer
function startTimer() {
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
}

// Update timer
function updateTimer() {
    const currentTime = new Date();
    const elapsedTime = new Date(currentTime - startTime);
    
    const hours = String(elapsedTime.getUTCHours()).padStart(2, '0');
    const minutes = String(elapsedTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(elapsedTime.getUTCSeconds()).padStart(2, '0');
    
    timerElement.textContent = `Time: ${hours}:${minutes}:${seconds}`;
}

// Stop timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Toggle bookmark
function toggleBookmark() {
    if (bookmarkedQuestions.has(currentQuestionIndex)) {
        bookmarkedQuestions.delete(currentQuestionIndex);
    } else {
        bookmarkedQuestions.add(currentQuestionIndex);
    }
    updateBookmarkButton();
    updateBookmarkedList();
}

// Update bookmark button
function updateBookmarkButton() {
    if (bookmarkedQuestions.has(currentQuestionIndex)) {
        bookmarkBtn.textContent = '★';
        bookmarkBtn.classList.add('bookmarked');
    } else {
        bookmarkBtn.textContent = '☆';
        bookmarkBtn.classList.remove('bookmarked');
    }
}

// Update bookmarked list
function updateBookmarkedList() {
    bookmarkedListElement.innerHTML = '';
    
    if (bookmarkedQuestions.size === 0) {
        bookmarkedQuestionsElement.style.display = 'none';
        return;
    }
    
    bookmarkedQuestionsElement.style.display = 'block';
    
    bookmarkedQuestions.forEach(questionIndex => {
        const listItem = document.createElement('li');
        listItem.className = 'bookmarked-item';
        listItem.textContent = `Question ${questionIndex + 1}: ${allQuestions[questionIndex].question.substring(0, 50)}...`;
        listItem.addEventListener('click', () => {
            currentQuestionIndex = questionIndex;
            updateQuestion();
            updateProgressBar();
        });
        bookmarkedListElement.appendChild(listItem);
    });
}

// Calculate and display final score
function showResults() {
    score = correctCount;
    
    finalScoreElement.textContent = `${score}/${allQuestions.length}`;
    currentScoreElement.textContent = score;
    
    // Set score text based on performance
    const percentage = (score / allQuestions.length) * 100;
    if (percentage >= 80) {
        scoreTextElement.textContent = "Excellent! You're well prepared for the exam.";
    } else if (percentage >= 60) {
        scoreTextElement.textContent = "Good job! You have a solid understanding.";
    } else if (percentage >= 40) {
        scoreTextElement.textContent = "Fair performance. Consider reviewing more topics.";
    } else {
        scoreTextElement.textContent = "You need more preparation. Keep studying!";
    }
    
    // Show result container
    document.querySelector('.quiz-container').style.display = 'none';
    resultContainer.style.display = 'block';
    
    // Stop timer
    stopTimer();
}

// Event listeners
prevButton.addEventListener('click', () => {
    const filteredQuestions = getFilteredQuestions();
    const filteredIndex = getCurrentFilteredIndex();
    
    if (filteredIndex > 0) {
        // Find the previous question in the filtered list
        const prevFilteredIndex = filteredIndex - 1;
        const prevQuestion = filteredQuestions[prevFilteredIndex];
        currentQuestionIndex = allQuestions.findIndex(q => q.question === prevQuestion.question);
        
        updateQuestion();
        updateProgressBar();
    }
});

nextButton.addEventListener('click', () => {
    if (userAnswers[currentQuestionIndex] !== null) {
        showExplanation();
        
        // Wait a moment before moving to next question
        setTimeout(() => {
            const filteredQuestions = getFilteredQuestions();
            const filteredIndex = getCurrentFilteredIndex();
            
            if (filteredIndex < filteredQuestions.length - 1) {
                // Find the next question in the filtered list
                const nextFilteredIndex = filteredIndex + 1;
                const nextQuestion = filteredQuestions[nextFilteredIndex];
                currentQuestionIndex = allQuestions.findIndex(q => q.question === nextQuestion.question);
                
                updateQuestion();
                updateProgressBar();
            }
        }, 2000);
    } else {
        alert('Please select an answer before proceeding.');
    }
});

submitButton.addEventListener('click', () => {
    if (userAnswers[currentQuestionIndex] !== null) {
        showExplanation();
        
        // Wait a moment before showing results
        setTimeout(() => {
            showResults();
        }, 2000);
    } else {
        alert('Please select an answer before submitting.');
    }
});

restartButton.addEventListener('click', () => {
    // Reset quiz state
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = new Array(allQuestions.length).fill(null);
    answeredCount = 0;
    correctCount = 0;
    bookmarkedQuestions.clear();
    
    // Show quiz container and hide results
    document.querySelector('.quiz-container').style.display = 'block';
    resultContainer.style.display = 'none';
    
    // Reset UI
    currentScoreElement.textContent = '0';
    updateQuestion();
    updateProgressBar();
    updateStats();
    updateBookmarkedList();
    
    // Restart timer
    stopTimer();
    startTimer();
});

bookmarkBtn.addEventListener('click', toggleBookmark);

// Initialize the quiz when the page loads
window.addEventListener('DOMContentLoaded', initQuiz);