const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const url = process.env.MONGOLAB_URI;

// ====================
// project model schema
let Project = new Schema({
	name: { type: String, required: true, unique: true, uniqueCaseInsensitive: true },
	description: { type: String },
	completed: { type: Boolean, default: false }
},{
	timestamps: true
});
Project.plugin(uniqueValidator);
mongoose.model( 'Project', Project );
// ====================


// ====================
// task model schema
let Task = new Schema();
Task.add({
	content : { type: String, required: true, unique: true, uniqueCaseInsensitive: true },
	project: { type: Schema.Types.ObjectId, ref: 'Project' },
	priority: {type: Number, min: 1, max: 5},
	dueDate: { type: Date },
	completed: { type: Boolean, default: false },
	subtasks: [Task],
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date  }
});
Task.plugin(uniqueValidator);
mongoose.model( 'Task', Task );

// update updated_at on save
Task.pre('save', next => {
  this.updatedAt = Date.now();
  next();
});
// ====================


console.log(url);
mongoose.connect(url, {
	useMongoClient: true
});