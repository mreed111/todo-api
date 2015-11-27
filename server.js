var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
	id: 1,
	description: 'lunch',
	completed: false	
},{
	id: 2,
	description: 'shop',
	completed: false	
},{
	id: 3,
	description: 'breakfast',
	completed: true	
}];

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

app.listen(PORT, function () {
	//
	console.log('Express listening on port ' + PORT);
});
