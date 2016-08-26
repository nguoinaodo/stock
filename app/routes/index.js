'use strict';

//var Controller = require(process.cwd() + '/app/controllers/controller.server.js');

module.exports = function (app/*, db*/) {
	//var controller = new Controller(db);
	
	app.route('/')
	    .get(function(req, res) {
	        res.sendFile(process.cwd() + '/public/index.html');
	    });
	/*
	app.route('/api/stocks')
	    .get(controller.getStocks)
	    .post(controller.addStock);
	
	app.route('/api/delete/:code')
	    .get(controller.deleteStock);
	*/
};
