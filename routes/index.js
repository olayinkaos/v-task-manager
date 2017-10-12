var express = require('express');
var router = express.Router();
const mongoose = require( 'mongoose' );
const Project = mongoose.model('Project');

/* GET home page. */
router.get('/', (req, res, next) => {
	let flash = {
		success: req.flash('success'),
		info: req.flash('info'),
		error: req.flash('error'),
		errors: req.flash('errors')
	}
	Project.find()
	.sort("-createdAt").
	exec(( err, projects, count ) => {
		res.render( 'project/index', {
			projects, flash,
			title : 'All Projects'
		});
	});
});

module.exports = router;
