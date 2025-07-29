# quizapp_project2

Some special features in our project include:
- a 30 second timer for each question
- correct answers show up as green after an answer is selected, even if the users answers were wrong it will show in green what the correct choice was
- wrong answers show up as red
- correct answers have a ding sound effect
- wrong answers have a buzzer sound effect
- option at the end of the quiz to play again
- results page at the end of the 10 quiz questions that display your score 


To run our server: 
1. Install node.js has to be on installed on your computer so the node server.js will work. 
2. Clone our repository to your terminal using: git clone https://github.com/kaylamsky/quizapp_project2 
3. In terminal, g to the folder of the cloned project and run npm install
4. Now you can run the server using node server.js
5. After you run the server, terminal should output a message saying that the app is listening on port 3000
6. On your browser, go to localhost:3000 to see the website 

Team Members Role: 
Kayla Motiram 
- server.js: starts the server, sends pages to the browser, sends random questions from the questions.json file to the browser, checks the users answers and sends the score
- updated my partners arrow function "onclick" function in script.js to add features such as sound for correct and wrong answers, and changing the color of the answer choice depending if its right or wrong, and always displaying the correct answer in green if a wrong answer was chosen
- updated script.js so that it works directly with server.js for example the server routes, /questions in script.js is getting the questions from the questions.json file
- contributed to style.css
  
Haneen Mustafa
- script.js: displays one question at a time with multiple choice options, tracks user answers and disables the inputs after selection, adds a 30-second timer per question with a visual progress bar, auto-skips unanswered questions displayed "Time's up"
- created the different pages by created separate html files like results.html, quiz.html and index.html
- contributed to style.css 
