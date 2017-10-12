var express = require('express');
var router = express.Router();
const mongoose = require( 'mongoose' );
const Project = mongoose.model('Project');

// save new project
router.post('/', (req, res, next) => {
	new Project({
		name: req.body.name,
		description: req.body.description
	}).save((err, todo, count) => {
		if(err) {
			console.log(err);
			req.flash('errors', err.errors.content);
		} else {
			req.flash('success', 'Project created!')
		}
		res.redirect("/");
	});
})
.get('/destroy/:id', (req, res, next) => {
	let id = req.params.id;
	Project.findById(id, (err, project) => {
		project.remove((err, project) => {
			req.flash('info', `Project ("${project.name}") has been deleted!`);
			res.redirect("/");
		})
	});
});

module.exports = router;