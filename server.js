var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcryptjs');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

// GET /todos?completed=false&q=work
app.get('/todos', middleware.requireAuthentication, function (req, res) {
	var query = req.query;
	var where = {
		userId: req.user.get('id')
	}; // req.user.get('id');

	if (query.hasOwnProperty('completed')) {
		if (query.completed === 'true') {
			where.completed = true;
		} else if (query.completed === 'false') {
			where.completed = false;
		}
	}
	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		}
	}

	db.todo.findAll({ where: where }).then(function (todos) {
		//if (todos.length > 0) {
		res.json(todos);
		//} else {
		//	res.status(404).send();
		//}
	}, function (e) {
		res.status(500).send();
	});
});

// GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var where = {
		id: todoId,
		userId: req.user.get('id')
	};
	
	db.todo.findOne({ where: where }).then(function (todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function (e) {
		res.status(500).send();
	});
});

// POST /todos
app.post('/todos', middleware.requireAuthentication, function (req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function (todo) {
		req.user.addTodo(todo).then(function () {
			return todo.reload();
		}).then(function (todo){
			res.json(todo.toJSON());
		});
	}, function (e) {
		res.status(400).json(e);
	});
});

// DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var where = {
		id: todoId,
		userId: req.user.get('id')
	};
	
	db.todo.destroy({ where: where }).then(function (rowsDeleted) {
		//console.log('... Rows Deleted: ' + rowsDeleted);
		if (rowsDeleted === 1) {
			res.status(204).send();
		} else {
			res.status(404).json({
				error: 'No todo with ID ' + todoId + ' found.'
			});
		}
	}, function (e) {
		res.status(500).send();
	});
});

// PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};
	var where = {
		id: todoId,
		userId: req.user.get('id')
	};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findOne( {where: where} ).then(function (todo) {
		// promise resolved...
		if (todo) {
			todo.update(attributes).then(function (todo) {
				// todo.update promise resolve
				res.json(todo.toJSON());
			}, function (e) {
				// todo.update promise reject
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function () {
		// promise rejected
		res.status(500).send();
	});
});


// POST /users
app.post('/users', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function (user) {
		res.json(user.toPublicJSON());
	}, function (e) {
		res.status(400).json(e);
	});
});


// POST /users/login
app.post('/users/login', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function (user) {
		//console.log('User email ...' + body.email);
		//console.log('... user = ' + user.toPublicJSON());
		//console.log('... user auth: ' + user.generateToken('authentication'));
		var myToken = user.generateToken('authentication');
		if (myToken) {
			res.header('Auth', myToken).json(user.toPublicJSON());
		} else {
			res.status(401).send();
		}
	}, function (e) {
		console.error(e);
		res.status(401).send();
	});
});


db.sequelize.sync({ force: true }).then(function () {
	app.listen(PORT, function () {
		console.log('Express listening on port ' + PORT + '!');
	});
});