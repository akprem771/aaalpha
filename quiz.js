// 🧠 Fixed quiz time (24‑hour format)
const QUIZ_START = "13:00"; // 1:00 PM
const QUIZ_END   = "14:17"; // 2:17 PM

const students = [
  { code: "STU001", password: "pass123", name: "Rahul" },
  { code: "STU002", password: "pass456", name: "Priya" },
  { code: "STU003", password: "pass789", name: "Amit" },
  { code: "ADMIN", password: "admin123", name: "Admin", isAdmin: true }
];

let questions = [
  { q: "2 + 2 = ?", options: ["A) 3","B) 4","C) 5","D) 6"], answer: 1 },
  { q: "Capital of India?", options: ["A) Delhi","B) Mumbai","C) Kolkata","D) Chennai"], answer: 0 },
  { q: "5 × 3 = ?", options: ["A) 10","B) 15","C) 20","D) 25"], answer: 1 }
];

let currentStudent = null;
let currentQuestionIndex = 0;
let score = 0;
let timer;
const QUESTION_TIME = 10;

// 🟢 LOGIN
function login() {
  const code = document.getElementById("code").value.trim();
  const password = document.getElementById("password").value.trim();
  const student = students.find(s => s.code === code && s.password === password);

  if (!student) return alert("❌ Invalid code or password!");

  currentStudent = student;
  document.getElementById("studentName").innerText = "Welcome " + student.name;
  document.getElementById("quizArea").classList.remove("hidden");

  if (student.isAdmin) {
    showTopThree();
  } else {
    const now = new Date();
    const today = now.toDateString();
    const startTime = new Date(`${today} ${QUIZ_START}`).getTime();
    const endTime = new Date(`${today} ${QUIZ_END}`).getTime();

    // 🕒 Show animated clock popup only before quiz start
    if (now.getTime() < startTime) showClockPopup(QUIZ_START, QUIZ_END);

    // 🧩 Check if student already attempted
    const prevData = localStorage.getItem(student.code);
    if (prevData) {
      const parsed = JSON.parse(prevData);
      const quizEnd = new Date(endTime);
      if (now.getTime() < endTime) {
        alert(`⏳ You have already attempted the quiz.\nPlease wait for results at ${quizEnd.toLocaleTimeString()}.`);
        showWaitingScreen();
        return;
      } else {
        alert("✅ You have already completed the quiz. Check your result below.");
        showTopThree();
        return;
      }
    }

    if (now.getTime() < startTime) {
      alert("⏰ Quiz अभी शुरू नहीं हुआ है! कृपया निर्धारित समय पर login करें।");
    } else if (now.getTime() > endTime) {
      alert("🚫 Quiz का समय समाप्त हो गया है!");
      showTopThree();
    } else {
      currentQuestionIndex = 0;
      score = 0;
      loadQuestion();
    }
  }
}

// 🕒 Animated Clock Popup
function showClockPopup(start, end) {
  const popup = document.createElement("div");
  popup.className = "clock-popup";
  popup.innerHTML = `
    <div class="clock-face">
      <div class="clock-hand"></div>
      <p>🕓 Quiz Time<br>${start} से ${end} तक</p>
    </div>
  `;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 5000);
}

// 🟣 Question Loader
function loadQuestion() {
  clearInterval(timer);
  const quizDiv = document.getElementById("quiz");
  const q = questions[currentQuestionIndex];
  quizDiv.innerHTML = `
    <div class="question-card">
      <h3>${q.q}</h3>
      ${q.options.map((opt, j) => `<label><input type="radio" name="q${currentQuestionIndex}" value="${j}"> ${opt}</label><br>`).join("")}
      <p id="timer">Time left: ${QUESTION_TIME}s</p>
      <button onclick="nextQuestion()">Next</button>
    </div>
  `;
  let timeLeft = QUESTION_TIME;
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      nextQuestion();
    }
  }, 1000);
}

function nextQuestion() {
  clearInterval(timer);
  const selected = document.querySelector(`input[name="q${currentQuestionIndex}"]:checked`);
  if (selected && parseInt(selected.value) === questions[currentQuestionIndex].answer) score++;
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) loadQuestion();
  else submitQuiz();
}

function submitQuiz() {
  const result = { name: currentStudent.name, score, date: Date.now() };
  localStorage.setItem(currentStudent.code, JSON.stringify(result));
  alert(`${currentStudent.name}, your score is ${score}/${questions.length}`);
  showWaitingScreen();
}

// ⏳ Waiting Screen until quiz end
function showWaitingScreen() {
  const quizDiv = document.getElementById("quiz");
  quizDiv.innerHTML = `
    <div class="waiting-card">
      <h3>⏳ Waiting for Results...</h3>
      <p>Results will be available after ${QUIZ_END}</p>
    </div>
  `;
}

// 🏆 Admin Panel (Top 3 only)
function showTopThree() {
  const quizDiv = document.getElementById("quiz");
  let allResults = [];
  students.forEach(s => {
    const data = localStorage.getItem(s.code);
    if (data && !s.isAdmin) allResults.push(JSON.parse(data));
  });
  allResults.sort((a,b) => b.score - a.score);
  const top3 = allResults.slice(0,3);
  let html = "<h3>🏆 Top 3 Students</h3><table><tr><th>Rank</th><th>Name</th><th>Score</th></tr>";
  top3.forEach((r,i) => html += `<tr><td>${i+1}</td><td>${r.name}</td><td>${r.score}</td></tr>`);
  html += "</table>";
  quizDiv.innerHTML = html;
}
