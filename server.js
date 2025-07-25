const express = require("express");
const path = require("path");
const port = 3000; 
const app = express();
const fs = require("fs");

app.use(express.static('.'));
app.use(express.json()); 

app.get('/', (req, res) => {
  res.sendFile("./index.html");
});

app.get('/results', (req, res) => {
  res.sendFile("./results.html");
});

app.get('/quiz', (req, res) => {
  res.sendFile("./quiz.html");
});

app.get('/questions', (req, res) => {
  //calls getQuestions function to randomly generate 10 questions
  const questions = getQuestions(); 
  //sends the 10 questions 
  res.json(questions); 
});

/*like function in index.js on blog class project*/
function getQuestions(){
  let data = fs.readFileSync("./questions.json", "utf-8"); 
  //storing all the questions so they can all be shuffled at every new iteration
  let allData = JSON.parse(data); 
  allData.sort(() => Math.random()-0.5); 
  //returns the first 10 questions, will be different everytime bc its being shuffled and no repeats
  return allData.slice(0,10); 
}

app.post('/score', (req, res) => {
  //gets the answers from request body (a,b,c, or d)
  let userAnswers = req.body.answers;
  //gets the questions that were asked
  let questions = req.body.questions; 
  let score = 0; 
  //questions[i].asnwer is the answer field from questions.json, checks that correct answer with user answer
  for (let i = 0; i < questions.length; i++){
    if (userAnswers[i] === questions[i].answer){
      score++;
    }
  }
  // sends the score back as json, display to be fixed in script.js
  res.json({score: score}); 
})
app.listen(port, () => {
  console.log(`App listening on port 3000`)
});

