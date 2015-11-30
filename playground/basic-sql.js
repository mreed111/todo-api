var Sequelize =  require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	"dialect": "sqlite",
	"storage": __dirname + "/basic-sqlite-database.sqlite"
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			notEmpty: true,
			len: [1, 255]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

sequelize.sync({
	//force: true
}).then(function () {
	console.log('Everything is Synced');
	
	Todo.findOne({ 
		where: {id: 2} 
	}).then(function(todo) {
		if (todo) {
			console.log(todo.toJSON());
		} else {
			console.log('Item not found.');
		}
	});
	// Todo.create({
	// 	description: 'Walk my dog',
	// 	//completed: false
	// }).then(function (todo) {
	// 	console.log('Finnished!');
	// 	console.log(todo);
	// }).catch(function (e) {
	// 	console.log('Error: ' + e);
	// });
});

