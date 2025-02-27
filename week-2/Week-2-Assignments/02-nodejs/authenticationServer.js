/**
  You need to create a HTTP server in Node.js which will handle the logic of an authentication server.
  - Don't need to use any database to store the data.

  - Save the users and their signup/login data in an array in a variable
  - You can store the passwords in plain text (as is) in the variable for now

  The expected API endpoints are defined below,
  1. POST /signup - User Signup
    Description: Allows users to create an account. This should be stored in an array on the server, and a unique id should be generated for every new user that is added.
    Request Body: JSON object with username, password, firstName and lastName fields.
    Response: 201 Created if successful, or 400 Bad Request if the username already exists.
    Example: POST http://localhost:3000/signup

  2. POST /login - User Login
    Description: Gets user back their details like firstname, lastname and id
    Request Body: JSON object with username and password fields.
    Response: 200 OK with an authentication token in JSON format if successful, or 401 Unauthorized if the credentials are invalid.
    Example: POST http://localhost:3000/login

  3. GET /data - Fetch all user's names and ids from the server (Protected route)
    Description: Gets details of all users like firstname, lastname and id in an array format. Returned object should have a key called users which contains the list of all users with their email/firstname/lastname.
    The users username and password should be fetched from the headers and checked before the array is returned
    Response: 200 OK with the protected data in JSON format if the username and password in headers are valid, or 401 Unauthorized if the username and password are missing or invalid.
    Example: GET http://localhost:3000/data

  - For any other route not defined in the server return 404

  Testing the server - run `npm run test-authenticationServer` command in terminal
 */

const express = require("express")
const PORT = 3000;
const app = express();
// write your logic here, DONT WRITE app.listen(3000) when you're running tests, the tests will automatically start the server

// JSON Parse Middle Ware
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
})

//Empty User Array
let userList = [];

// Get Unique Timestamp
function getTimeStamp() {
  return Math.floor(Date.now()/100);
}

// Check if user exists
function checkUserExists(email) {
  return userList.some((element) => {
    return element.email == email;
  });
}

// Login User
function loginUser(email, password) {
  return userList.find((element) => {
    return (element.email == email && element.password == password);
  });
}

// Sign up 
app.post("/signup", (req, res) => {
  if(!checkUserExists(req.body.email)) {
    const newUser = {
      id: getTimeStamp(), // unique random id
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    };

    userList.push(newUser);
    res.status(201).send("Signup successful");
  }
  else {
    console.log(userList);
    res.status(400).send("User already exists");
  }
  
});

// Get Data
app.get("/data", (req, res) => {
  const user = loginUser(req.headers.email, req.headers.password);
  if(user!=undefined) {
    const users = userList.map((user) => {
      return {"email":user.email, "firstname":user.firstName, "lastname":user.lastName};
    });
    res.status(200).json({users:users});
  }
  else {
    res.status(401).send("Unauthorized");
  }
});

// Login User
app.post("/login", (req, res) => {
  const user = loginUser(req.body.email, req.body.password)
  //If user exists
  if(user!=undefined) {
    res.status(200).json({email:user.email, firstName:user.firstName, lastName:user.lastName});
  }
  //Invalid credentials
  else {
    res.status(401).send("Invalid credentials");
  }
});

// app.listen(3000, (() => {
//   console.log("Server listening on port 3000");
// }))

module.exports = app;
