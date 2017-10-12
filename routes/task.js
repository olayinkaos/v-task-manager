const express = require('express');
const router = express.Router();
const mongoose = require( 'mongoose' );
const Project = mongoose.model('Project');
const Task = mongoose.model('Task');
const moment = require('moment');
const utils = require('../utils');

// retrieve all tasks
router.get('/', (req, res, next) => {
	let filters = getFilters(req), qParams = req.query,
	sort = req.query.sort || '-createdAt',
	flash = {
		success: req.flash('success'),
		info: req.flash('info'),
		error: req.flash('error'),
		errors: req.flash('errors')
	};
	Task.find(filters)
	.populate('project')
	.sort(sort)
	.exec(( err, tasks, count ) => {
		if (err) next;
		Project.find(( err, projects, count ) => {
			res.render( 'task/index', {
				tasks, flash, moment, projects, qParams,
				title : 'All Tasks',
				sort: req.query.sort
			});
		});
	});
})
// save new task
.post('/', (req, res, next) => {
	let params = req.body;
	Task.findOne({ name: params.name, project: params.project }, (err, task) => {
		if(task) {
			req.flash('error', `Task "${task.content}" already exists in this project!`);
			res.redirect("/task");
			return;
		}
		new Task(params).save((err, task, count) => {
			Project.findById(task.project, (err, project) => {
				if (err) next;
				project.completed = false;
				project.save((err, project) => {
					req.flash('success', 'Task successfully added!')
					res.redirect("/task");
				})
			});
		});
	});
})
// save new subtask
.post('/:id/subtask', (req, res, next) => {
	let params = req.body;
	Task.findById(req.params.id, (err, task) => {
		let exists = task.subtasks.find(t => t.content == params.content);
		if (exists) {
			req.flash('error', `Subtask ${exists.content} already exists in this task!`);
			res.redirect("/task");
			return;
		}
		task.subtasks.push(params);
		task.save((err, task, count) => {
			if (err) next;
			req.flash('success', 'Subtask successfully created!');
			res.redirect("/task");
		})
	});
})
// form to create new task
.get('/create', (req, res, next) => {
	let flash = {
		success: req.flash('success'),
		info: req.flash('info'),
		error: req.flash('error'),
		errors: req.flash('errors')
	}
	Project.find(( err, projects, count ) => {
		if (err) next;
		res.render( 'task/create', {
			projects, flash,
			title : 'Add task'
		});
	});
})
// retrieve single task
.get('/:id', (req, res, next) => {
	let flash = {
		success: req.flash('success'),
		info: req.flash('info'),
		error: req.flash('error'),
		errors: req.flash('errors')
	}
	Task.findById(req.params.id, (err, task) => {
		if (err) next;
		res.render("task/show", { task, flash, moment, title: task.content });
	});
})
// form to edit single task
.get('/:id/edit', (req, res, next) => {
	Task.findById(req.params.id, (err, task) => {
		Project.find(( err, projects, count ) => {
			if (err) next;
			res.render("task/edit", { task, projects, moment, title: `Edit ${task.content}` });
		});
	});
})
// update subtask
.post('/:id/subtask/update', (req, res, next) => {
	Task.findById(req.params.id, (err, task) => {
		let subtask = task.subtasks.id(req.body.subtask_id);
		subtask.set(req.body);
		task.save((err, task, count) => {
			if(err) next;
			req.flash('success', 'Subtask successfully updated!')
			res.redirect(`/task/${task.id}`);
		})
	});
})
// update single task
.post('/:id', (req, res, next) => {
	Task.findById(req.params.id, (err, task) => {
		task.content = req.body.content;
		task.priority = req.body.priority;
		task.dueDate = req.body.dueDate;
		task.project = req.body.project;
		task.updated_at = Date.now();
		task.save((err, task, count) => {
			if(err) next;
			req.flash('info', `Task ${task._id} updated`);
			res.redirect(`/task/${task.id}`);
		});
	});
})
// delete task
.get('/:id/destroy', (req, res, next) => {
	Task.findById(req.params.id, (err, task) => {
		task.remove((err, task) => {
			if(err) next;
			req.flash('info', `Task ("${task.content}") has been deleted!`);
			res.redirect("/task");
		})
	});
})
// delete subtask
.get('/:id/subtask/:subtaskId/destroy', (req, res, next) => {
	Task.findById(req.params.id, (err, task) => {
		task.subtasks.id(req.params.subtaskId).remove();
		task.save((err, task, count) => {
			if(err) next;
			req.flash('success', 'Subtask successfully removed!');
			res.redirect("/task");
		})
	});
})
// set task status
.get('/:id/status', (req, res, next) => {
	Task.findById(req.params.id, (err, task) => {
		let completed = req.query.s || 'complete';
		task.completed = (completed == 'complete' ? true : false);
		task.save((err, task, count) => {
			Task.find({project: task.project}, function(err, tasks) {
				let complArr = utils.getColumn(tasks, 'completed');
				Project.findById(task.project, (err, project) => {
					project.completed = false;
					if(complArr.every(el => el)) {
						project.completed = true;
					}
					project.save((err, project) => {
						if(err) next;
						req.flash('success', `Task '${task.content}' status changed!`);
						res.redirect(`/task`);
					})
				})
			})
		});
	});
})
// set subtask status
.get('/:id/subtask/:subtaskId/status', (req, res, next) => {
	Task.findById(req.params.id, (err, task) => {
		let completed = req.query.s || 'complete',
		subtask = task.subtasks.id(req.params.subtaskId);
		subtask.completed = (completed == 'complete' ? true : false);
		task.save((err, task, count) => {
			if(err) next;
			req.flash('success', `Subtask '${subtask.content}' for task '${task.content}' status changed!`);
			res.redirect(`/task`);
		});
	});
});

function getFilters(req) {
	let filters = {};
	if (req.query.task) {
		filters['content'] = new RegExp(req.query.task, "i");
	}
	if (req.query.date) {
		filters['createdAt'] = { $gte: moment(req.query.date).startOf('day').toDate(), $lt: moment(req.query.date).endOf('day').toDate()};
	}
	if (req.query.project) {
		filters['project'] = req.query.project;
	}
	if (req.query.priority) {
		filters['priority'] = req.query.priority;
	}
	if (req.query.overdue) {
		filters['dueDate'] = { $lt: moment().toDate() };
		filters['completed'] = false; 
	}
	return filters;
}

module.exports = router;