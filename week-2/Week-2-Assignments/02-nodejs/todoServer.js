/**
  You need to create an express HTTP server in Node.js which will handle the logic of a todo list app.
  - Don't use any database, just store all the data in an array to store the todo list data (in-memory)
  - Hard todo: Try to save responses in files, so that even if u exit the app and run it again, the data remains (similar to databases)

  Each todo has a title and a description. The title is a string and the description is a string.
  Each todo should also get an unique autogenerated id every time it is created
  The expected API endpoints are defined below,
  1.GET /todos - Retrieve all todo items
    Description: Returns a list of all todo items.
    Response: 200 OK with an array of todo items in JSON format.
    Example: GET http://localhost:3000/todos
    
  2.GET /todos/:id - Retrieve a specific todo item by ID
    Description: Returns a specific todo item identified by its ID.
    Response: 200 OK with the todo item in JSON format if found, or 404 Not Found if not found.
    Example: GET http://localhost:3000/todos/123
    
  3. POST /todos - Create a new todo item
    Description: Creates a new todo item.
    Request Body: JSON object representing the todo item.
    Response: 201 Created with the ID of the created todo item in JSON format. eg: {id: 1}
    Example: POST http://localhost:3000/todos
    Request Body: { "title": "Buy groceries", "completed": false, description: "I should buy groceries" }
    
  4. PUT /todos/:id - Update an existing todo item by ID
    Description: Updates an existing todo item identified by its ID.
    Request Body: JSON object representing the updated todo item.
    Response: 200 OK if the todo item was found and updated, or 404 Not Found if not found.
    Example: PUT http://localhost:3000/todos/123
    Request Body: { "title": "Buy groceries", "completed": true }
    
  5. DELETE /todos/:id - Delete a todo item by ID
    Description: Deletes a todo item identified by its ID.
    Response: 200 OK if the todo item was found and deleted, or 404 Not Found if not found.
    Example: DELETE http://localhost:3000/todos/123

    - For any other route not defined in the server return 404

  Testing the server - run `npm run test-todoServer` command in terminal
 */
const express = require('express');
const bodyParser = require('body-parser');

const jsonPath = './data/todos.json';
const fs = require("fs");

const app = express();

app.use(bodyParser.json());

function getTimeStamp() {
  return Math.floor(Date.now()/100);
}

// Allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
})

// Get all todo items
app.get('/todos', (req, res) => {
  fs.readFile(jsonPath, "utf8", (err, data) => {
    if (err) throw err;
    res.json(JSON.parse(data));
  });
  
});

// Find index of a specific todo item by ID
function findIndex(arr, id) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === id) return i;
  }
  return -1;
}

// Get a specific todo item by ID
app.get('/todos/:id', (req, res) => {
  fs.readFile(jsonPath, "utf8", (err, data) => {
    if (err) throw err;
    const todos = JSON.parse(data);
    const todoIndex = findIndex(todos, parseInt(req.params.id));
    if (todoIndex === -1) {
      res.status(404).json({ status:false, message: 'Todo not found'});
    } else {
      res.json(todos[todoIndex]);
    }
  });
});

// Create a new todo item
app.post('/todos', (req, res) => {
  const newTodo = {
    id: getTimeStamp(), // unique random id
    title: req.body.title,
    description: req.body.description
  };
  fs.readFile(jsonPath, "utf8", (err, data) => {
    if (err) throw err;
    const todos = JSON.parse(data);
    todos.push(newTodo);
    fs.writeFile(jsonPath, JSON.stringify(todos), (err) => {
      if (err) throw err;
      res.status(201).json(newTodo);
    });
  });
});

// Update an existing todo item by ID
app.put('/todos/:id', (req, res) => {
  fs.readFile(jsonPath, "utf8", (err, data) => {
    if (err) throw err;
    const todos = JSON.parse(data);
    const todoIndex = findIndex(todos, parseInt(req.params.id));
    if (todoIndex === -1) {
      res.status(404).json({ status:false, message: 'Todo not found'});
    }
    else {
      const updatedTodo = {
        id: todos[todoIndex].id,
        title: req.body.title,
        description: req.body.description
      };
      todos[todoIndex] = updatedTodo;
      fs.writeFile(jsonPath, JSON.stringify(todos), (err) => {
        if (err) res.status(500).json({ status:false, message: 'Something went wrong'});
        res.status(200).json({status:true, todo:updatedTodo});
      });
    }
  });
});

// Remove an existing todo item by ID
function removeAtIndex(arr, index) {
  let newArray = [];
  for (let i = 0; i < arr.length; i++) {
    if (i !== index) newArray.push(arr[i]);
  }
  return newArray;
}

// Delete a todo item by ID
app.delete('/todos/:id', (req, res) => {
  fs.readFile(jsonPath, "utf8", (err, data) => {
    if(err) res.status(500).json({ status:false, message: 'Something went wrong'});
    let todos = JSON.parse(data);
    const todoIndex = findIndex(todos, parseInt(req.params.id));
    if(todoIndex == -1) {
      res.status(404).json({ status:false, message: 'Todo not found'});
    }
    else {
      todos = removeAtIndex(todos, todoIndex);
      fs.writeFile(jsonPath, JSON.stringify(todos), (err) => {
        if (err) res.status(500).json({ status:false, message: 'Something went wrong'});
        res.status(200).send({status:true, message: 'Todo item deleted successfully'});
      });
    }
  });
})

app.get('*', (req, res) => {
  res.status(404).json({ status:false, message: 'Page not found'});
});

// // Start the server
// app.listen(3000, () => {
//   console.log('Server listening on port 3000');
// });

module.exports = app;
