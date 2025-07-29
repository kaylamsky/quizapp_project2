const express = require("express");
const path = require("path");
const port = 3000; 
const app = express();
const fs = require("fs");
require('dotenv').config(); 
const { connectToDB, getCollection } = require('./db');



app.get('/', (req, res) => {
  res.redirect('/signup');
});

app.use(express.static('.'));
app.use(express.urlencoded({extended: false})); 
app.use(express.json()); 

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

//CONNECTION TO DB
app.get('/signup', function(req, res, next) {
  res.sendFile(path.join(__dirname, "signup.html")); 
});

app.get('/signin', function(reqe, res, next){
  res.sendFile(path.join(__dirname, "signin.html")); 
})


//need to add what if username is already been taken! 
app.post("/signup/submit", async (req, res) => {
  const users = getCollection("users"); 
  const usernameInput = req.body.username;

  //what if username has already been taken
  const existingUser = await users.findOne(
    {username : usernameInput}
  ); 
  if (existingUser){
    console.log("Username is already taken");
    return res.redirect("/signup"); 
  }

  await users.insertOne({
    username: req.body.username,
    password: req.body.password 
  }); 

  res.redirect("/quiz.html"); 
});

app.post("/signin", async (req, res) =>{
   const users = getCollection("users"); 
  const usernameInput = req.body.username;

  //find user 
  const user = await users.findOne({
    username: usernameInput
  }); 

  if (user){
    res.redirect("/quiz.html");
  } else {
    res.redirect("/signin")
  }

}); 

//connect to mongoDB 
(async() =>{
  try{
    await connectToDB();
    console.log('Database initialized');
  } catch(error){
    console.error('Failed to start database', error);
  }
})();

app.listen(port, () => {
  console.log(`App listening on port 3000`)
});


