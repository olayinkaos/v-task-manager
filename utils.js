let utils = {
	getColumn: function(arr, name) {
		return arr.map(function(el) {
			// gets corresponding 'column'
			return el[name];
			// removes undefined values
		}).filter(function(el) { return typeof el != 'undefined'; }); 
	}
}


module.exports = utils;