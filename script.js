// --- Global State ---
let currentQuestionIndex = 0;
let userAnswers = {};

// --- Data ---
const questions = [
    {
        question: "Hey, what subjects do you find super interesting or fun in school?",
        options: ["Science", "Mathematics", "Arts", "Commerce"],
        id: "q1",
    },
    {
        question: "Imagine you're working on a cool project – would you love it to be more about:",
        options: ["Solving puzzles with numbers", "Creating something artistic", "Figuring out how things work", "Exploring ideas with friends"],
        id: "q2",
    },
    {
        question: "Do you think you'd enjoy a career where you're mostly:",
        options: ["Learning new tech stuff", "Working with people", "Doing something creative(like designing)","Exploring nature or environment"],
        id: "q3",
    },
    {
        question: "When you tackle a problem, do you like:",
        options: ["Breaking it down step-by-step logically", "Going with your gut feeling and creativity", "Asking others for a different perspective", "Mixing both logic and creativity"],
        id: "q4",
    },
    {
        question:"Are you someone who prefers:",
        options: ["Hands-on activities and making things", "Reading and discussing ideas", "Observing and analyzing before acting", "Mixing both practical and theoretical approaches"],
        id: "q5",
    },
    {
        question:"Would you rather:",
        options: ["Work on a team project", "Go solo on something you're passionate about", "Start alone and then collaborate", "Support others as they lead"],
        id: "q6",
    },
    {
        question:"If you could pick any job in the world, what would it be?",
        options: ["Scientist", "Engineer", "Writer", "Designer/Artist", "Entrepreneur", "Teacher", "Doctor", "Environmentalist"],
        id: "q7",
    },
    {
        question:"Do careers like Data Science, Environmental Work, or AI sound exciting?",
        options: ["Very exciting", "Somewhat exciting", "Not sure", "Not really my interest"],
        id: "q8",
    },
    {
        question:"How important are skills like problem-solving, communication, or creativity for you?",
        options: ["Very important", "Important", "Somewhat important", "Not that important"],
        id: "q9",
    },
    {
        question:"What do you think are your top strengths in school?",
        options: ["Strong subject knowledge", "Practical skills", "Problem-solving mindset", "Teamwork and communication"],
        id: "q10",
    },
    {
        question:"Do you have any hobbies that connect to a future career?",
        options: ["Coding/Tech", "Arts(Drawing, music, writing)", "Sports/Outdoor", "Other hobbies"],
        id: "q11",
    },
    {
        question:"When facing a tough challenge, do you prefer:",
        options: ["Figuring it out yourself", "Asking friends for help", "Looking for resources online", "Combining all approaches"],
        id: "q12",
    }


];

// --- DOM Elements ---
const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");
const startAssessmentBtn = document.getElementById("start-assessment-btn");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const submitBtn = document.getElementById("submit-btn");
const restartAssessmentBtn = document.getElementById("restart-assessment-btn");
const recommendationsContainer = document.getElementById("recommendations-container");
const collegeFilterForm = document.getElementById("college-filter-form");
const collegesContainer = document.getElementById("colleges-container");
const loginForm = document.getElementById("login-form");
const authLink = document.getElementById("auth-link");

// --- Page Navigation Functions ---
function showPage(id) {
    pages.forEach(page => {
        page.classList.remove("active");
    });
    navLinks.forEach(link => {
        link.classList.remove("active");
    });
    document.getElementById(id).classList.add("active");
    const correspondingLink = document.querySelector(`a[href="#${id}"]`);
    if (correspondingLink) {
        correspondingLink.classList.add("active");
    }
}

navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const pageId = link.getAttribute("href").substring(1);
        showPage(pageId);
    });
});

startAssessmentBtn.addEventListener("click", () => {
    showPage("assessment");
    loadQuestion();
});

restartAssessmentBtn.addEventListener("click", () => {
    currentQuestionIndex = 0;
    userAnswers = {};
    showPage("assessment");
    loadQuestion();
});

// --- Assessment Functions ---
function loadQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    questionText.textContent = currentQuestion.question;
    optionsContainer.innerHTML = "";

    currentQuestion.options.forEach((option, index) => {
        const optionDiv = document.createElement("div");
        optionDiv.className = "option";
        const radioInput = document.createElement("input");
        radioInput.type = "radio";
        radioInput.name = currentQuestion.id;
        radioInput.value = option;
        radioInput.id = `${currentQuestion.id}-option-${index}`;
        radioInput.checked = userAnswers[currentQuestion.id] === option;
        radioInput.addEventListener("change", (e) => {
            userAnswers[currentQuestion.id] = e.target.value;
        });

        const label = document.createElement("label");
        label.htmlFor = radioInput.id;
        label.textContent = option;

        optionDiv.appendChild(radioInput);
        optionDiv.appendChild(label);
        optionsContainer.appendChild(optionDiv);
    });

    updateNavigationButtons();
}

function updateNavigationButtons() {
    prevBtn.classList.toggle("hidden", currentQuestionIndex === 0);
    nextBtn.classList.toggle("hidden", currentQuestionIndex === questions.length - 1);
    submitBtn.classList.toggle("hidden", currentQuestionIndex !== questions.length - 1);
}

prevBtn.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
});

nextBtn.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
});

submitBtn.addEventListener("click", async () => {
    await submitQuiz();
});

async function submitQuiz() {
    // Send all collected answers to the backend
    try {
        const response = await fetch("http://127.0.0.1:5000/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers: userAnswers })
        });
        const data = await response.json();
        
        // This is the CRITICAL change:
        // Pass the value of the `recommendations` key to the display function
        displayRecommendations(data.recommendations);
        showPage("recommendations");
        
    } catch (error) {
        console.error("Error submitting quiz:", error);
        recommendationsContainer.innerHTML = "<p>Could not connect to the server. Please try again later.</p>";
        showPage("recommendations");
    }
}

function displayRecommendations(recs) {
    recommendationsContainer.innerHTML = "";
    if (!recs || recs.length === 0) {
        recommendationsContainer.innerHTML = "<p>No recommendations were found based on your answers.</p>";
        return;
    }
    
    // Now loop through each recommendation to create a card
    recs.forEach(rec => {
        const recCard = document.createElement("div");
        recCard.className = "result-card";
        recCard.innerHTML = `
            <h3>${rec.title}</h3>
            <p class="match-score">Match Score: ${rec.score}</p>
            <p>${rec.description}</p>
        `;
        recommendationsContainer.appendChild(recCard);
    });
}

// --- College Search Functions ---
const allColleges = [
    { name: "IIT Bombay", city: "Mumbai", course: "Engineering", type: "Public" },
    { name: "Delhi University", city: "Delhi", course: "Arts", type: "Public" },
    { name: "St. Xavier's College", city: "Mumbai", course: "Arts", type: "Private" },
    { name: "Vellore Institute of Technology", city: "Vellore", course: "Engineering", type: "Private" },
    { name: "AIIMS Delhi", city: "Delhi", course: "Medicine", type: "Public" },
    { name: "Amity University", city: "Noida", course: "Commerce", type: "Private" },
    { name: "SRM Institute of Science and Technology", city: "Chennai", course: "Engineering", type: "Private" },
    { name: "Jawaharlal Nehru University", city: "Delhi", course: "Arts", type: "Public" },
    { name: "Lady Shri Ram College for Women", city: "Delhi", course: "Commerce", type: "Public" },
];

collegeFilterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const location = document.getElementById("location").value.toLowerCase();
    const course = document.getElementById("course").value.toLowerCase();
    const type = document.getElementById("college-type").value.toLowerCase();
    filterColleges(location, course, type);
});

function filterColleges(location, course, type) {
    const filtered = allColleges.filter(college => {
        const matchesLocation = location === "" || college.city.toLowerCase().includes(location);
        const matchesCourse = course === "" || college.course.toLowerCase() === course;
        const matchesType = type === "" || college.type.toLowerCase() === type;
        return matchesLocation && matchesCourse && matchesType;
    });
    displayColleges(filtered);
}

function displayColleges(colleges) {
    collegesContainer.innerHTML = "";
    if (colleges.length === 0) {
        collegesContainer.innerHTML = "<p>No colleges found matching your criteria.</p>";
        return;
    }
    colleges.forEach(college => {
        const collegeCard = document.createElement("div");
        collegeCard.className = "result-card";
        collegeCard.innerHTML = `
            <h3>${college.name}</h3>
            <p><strong>City:</strong> ${college.city}</p>
            <p><strong>Course:</strong> ${college.course}</p>
            <p><strong>Type:</strong> ${college.type}</p>
        `;
        collegesContainer.appendChild(collegeCard);
    });
}

// --- Login Functions ---
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Login functionality is for demonstration only. No data is stored.");
    showPage("home");
});

// --- Initial Setup ---
document.addEventListener("DOMContentLoaded", () => {
    showPage("home");
    // Pre-populate colleges on page load
    displayColleges(allColleges);
});