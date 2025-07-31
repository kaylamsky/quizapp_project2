const express = require("express");
const path = require("path");
const port = process.env.PORT || 3000; 
const app = express();
const fs = require("fs");
require('dotenv').config(); 
const { connectToDB, getCollection } = require('./db');



app.get('/', (req, res) => {
  res.redirect('/signup');
});

app.use(express.urlencoded({extended: false})); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname)));

app.get('/results', (req, res) => {
  res.sendFile(path.join(__dirname, "results.html"));
});

app.get('/quiz', (req, res) => {
  res.sendFile(path.join(__dirname, "quiz.html"));
});

app.get('/questions', async (req, res) => {
  try {
    const apiRes = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
    const data = await apiRes.json();

    const formattedQuestions = data.results.map((q) => {
      const allOptions = [...q.incorrect_answers];
      const correctIndex = Math.floor(Math.random() * (allOptions.length + 1));
      allOptions.splice(correctIndex, 0, q.correct_answer); // Insert correct answer randomly

      return {
        question: q.question,
        optionA: allOptions[0],
        optionB: allOptions[1],
        optionC: allOptions[2],
        optionD: allOptions[3],
        answer: q.correct_answer,
      };
    });

     res.json(formattedQuestions);
  } catch (err) {
    console.error('Trivia API fetch failed:', err);
    res.status(500).json({ error: 'Failed to load questions.' });
  }
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

app.post('/score', async (req, res) => {
  //gets the answers from request body (a,b,c, or d)
  let userAnswers = req.body.answers;
  //gets the questions that were asked
  let questions = req.body.questions; 
  let username = req.body.username; 
  let score = 0; 
  //questions[i].asnwer is the answer field from questions.json, checks that correct answer with user answer
  for (let i = 0; i < questions.length; i++){
    if (userAnswers[i] === questions[i].answer){
      score++;
    }
  }
  //save score to DB
  const users = getCollection("users");
  await users.updateOne(
    {usernmae: username},
    {$push: {scores: score}}
  );

  // sends the score back as json, display to be fixed in script.js
  res.json({score: score}); 
})

//CONNECTION TO DB
app.get('/signup', function(req, res, next) {
  res.sendFile(path.join(__dirname, "signup.html")); 
});

app.get('/signin', function(req, res, next){
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
    return res.redirect("/signup?error=username"); 
  }

  await users.insertOne({
    username: req.body.username,
    password: req.body.password 
  }); 

  res.sendFile(path.join(__dirname, "quiz.html")); 
});

app.post("/signin/submit", async (req, res) =>{
  const users = getCollection("users"); 
  const usernameInput = req.body.username;
  const passwordInput = req.body.password;

  //find user 
  const user = await users.findOne({
    username: usernameInput,
    password: passwordInput
  });

  if (user){
    res.sendFile(path.join(__dirname, "quiz.html"));
  } else {
    console.log("Sign in failed");
    res.redirect("/signin?error=invalid")
  }

}); 

app.post('/save-quiz', async (req, res) => {
  const users = getCollection("users");
  const { username, score, category, date } = req.body;

  try {
    await users.updateOne(
      { username: username },
      { $push: { quizHistory: { score, category, date } } }
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Error saving quiz result:', err);
    res.status(500).send("Failed to save quiz");
  }
});

app.get('/profile', async (req, res) => {
  const users = getCollection("users");
  const username = req.query.username; // Send this from frontend

  const user = await users.findOne({ username: username });
  if (!user) return res.status(404).send("User not found");

  res.send(user.quizHistory || []);
});


app.get('/leaderboard', async (req, res) => {
  const users = getCollection("users");

  const leaderboard = await users.aggregate([
    { $unwind: "$quizHistory" },
    {
      $group: {
        _id: "$username",
        avgScore: { $avg: "$quizHistory.score" },
        totalGames: { $sum: 1 }
      }
    },
    { $sort: { avgScore: -1 } },
    { $limit: 10 }
  ]).toArray();

  res.json(leaderboard);
});



//connect to mongoDB 
(async() =>{
  try{
    await connectToDB();
    console.log('Database initialized');

  app.listen(port, () => {
  console.log(`App listening on port ${port}`)
  });
  } catch(error){
    console.error('Failed to start database', error);
    process.exit(1); 
  }
})();



