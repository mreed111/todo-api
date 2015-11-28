var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	//
	res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function (req, res) {
	//
	res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
	//
	var todoId = req.params.id;
	console.log('todoId = ' + todoId);
	var i = 0;
	while (i < todos.length && todos[i].id.toString() !== todoId) {
		i++;
	}
	if (i !== todos.length) {
		res.json(todos[i]);
	} else {
		res.status(404).send();
	}
	//res.send('get ID = ' + req.params.id);
});

//POST /todos
app.post('/todos', function (req,res) {
	var body = req.body;
	console.log('description: ' + body.description);
	
	// add id field
	body.id = todoNextId;
	todoNextId++;
	
	// push body into array
	todos.push(body);
	
	res.json(body);
});

app.listen(PORT, function () {
	//
	console.log('Express listening on port ' + PORT);
});
