const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

let allQuestions = JSON.parse(fs.readFileSync("questions.json", "utf8"));

app.get("/api/questions", (req, res) => {
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 10);
  res.json(selected);
});

app.post("/api/score", (req, res) => {
  const { answers, questions } = req.body;

  let score = 0;

  questions.forEach((q, index) => {
    const correct = q.answer;
    if (answers[index] === correct) score++;
  });

  res.json({ score });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
