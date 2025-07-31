let timer;
let timeLeft = 30;

let currentQuestionIndex = 0;
let questions = [];
let userAnswers = [];

document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname.includes("quiz")) {
    await loadQuestions();
    showQuestion();
    startTimer();
    document.getElementById("nextBtn").addEventListener("click", handleNext);
  }
});

async function loadQuestions() {
  try {
    const res = await fetch("/questions");
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
    btn.textContent = `${opt}: ${q["option" + opt]}`; 

    btn.onclick = () => {
      userAnswers[currentQuestionIndex] = opt;
      document.querySelectorAll("#options button").forEach(b => {
      //if the button is pressed
      if (b === btn){
      if (q["option" + opt] === q.answer) {
        btn.style.backgroundColor = "#81c784"; //green for correct
        new Audio ("correct.wav").play(); //sound for correct
      } else {
        btn.style.backgroundColor = "#e57373"; //red for wrong
        new Audio ("error.mp3").play(); //sound for wrong
      }

      } else {
        // shows correct answer in green
        if (q["option" + b.textContent[0]] === q.answer){
          b.style.backgroundColor = "#81c784"; 
        }
        b.style.opacity = "0.5"; 
        
      }
      });
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

  const username = localStorage.getItem("username"); 

  const res = await fetch("/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username : username,
      answers: userAnswers,
      questions: questions
    })
  });

  const data = await res.json();
  const score = data.score; 

//redirect to results
  localStorage.setItem("quizScore", score);
  window.location.href = "/results.html";
}