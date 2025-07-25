let timer;
let timeLeft = 30;

let currentQuestionIndex = 0;
let questions = [];
let userAnswers = [];

document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname.includes("quiz.html")) {
    await loadQuestions();
    showQuestion();
    startTimer();
    document.getElementById("nextBtn").addEventListener("click", handleNext);
  }
});

async function loadQuestions() {
  try {
    const res = await fetch("/api/questions");
    questions = await res.json();
  } catch (err) {
    alert("Failed to load questions.");
    console.error(err);
  }
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 30;

  const timerEl = document.getElementById("timer");
  const bar = document.getElementById("timerBar");
  const timeUpMsg = document.getElementById("timeUpMsg");

  timerEl.textContent = `Time Left: ${timeLeft}s`;
  timeUpMsg.style.display = "none";
  bar.style.width = "100%";

  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time Left: ${timeLeft}s`;
    bar.style.width = `${(timeLeft / 30) * 100}%`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      userAnswers[currentQuestionIndex] = null;
      timeUpMsg.style.display = "block";

      setTimeout(() => {
        timeUpMsg.style.display = "none";
        handleNext();
      }, 1000);
    }
  }, 1000);
}


function showQuestion() {
  const q = questions[currentQuestionIndex];
  const qEl = document.getElementById("question");

  qEl.textContent = q.question;
  qEl.classList.remove("fade-in");
  void qEl.offsetWidth;
  qEl.classList.add("fade-in");

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  ["A", "B", "C", "D"].forEach((opt) => {
    const btn = document.createElement("button");
    btn.textContent = `${opt}: ${q[opt]}`;
    btn.onclick = () => {
      userAnswers[currentQuestionIndex] = opt;
      document.querySelectorAll("#options button").forEach(b => b.disabled = true);

      if (opt === q.answer) {
        btn.style.backgroundColor = "#81c784";
      } else {
        btn.style.backgroundColor = "#e57373";
      }

      document.getElementById("nextBtn").disabled = false;
    };
    optionsDiv.appendChild(btn);
  });

  document.getElementById("nextBtn").disabled = true;
  startTimer();
}

function handleNext() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    submitQuiz();
  }
}

async function submitQuiz() {
  clearInterval(timer);

  const res = await fetch("/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      answers: userAnswers,
      questions: questions
    })
  });

  const data = await res.json();
  localStorage.setItem("quizScore", data.score);
  window.location.href = "results.html";
}