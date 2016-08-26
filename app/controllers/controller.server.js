'use strict';

function ioHandler(io, db) {
	var stocks = db.collection('stocks');
    
    io.on('connection', function(socket) {
    	console.log('connected');
    	
        socket.on('getStocks', function() {
            stocks.find({}, {_id: 0})
                .toArray(function(err, docs) {
                    if (err) throw err;
                    
                    socket.emit('stocks', JSON.stringify(docs)); 
                });
        });
        
        socket.on('add', function(json) {
            var data = JSON.parse(json);
            
            socket.broadcast.emit('user-add', JSON.stringify({code: data.code, info: data.info}));
            stocks.insert({
                code: data.code,
                info: data.info
            });
        });
        
        socket.on('del', function(code) {
            
            socket.broadcast.emit('user-del', code);
            console.log(code);
            stocks.remove({code: code}, function(err) {
            	if (err) throw err;
            	
            	console.log('deleted');
            });
        });
    });
}

module.exports = ioHandler;

/*
function Controller(db) {
	var stocks = db.collection('stocks');
	
	this.getStocks = function(req, res) {
		stocks.find({}, {_id: 0})
			.toArray(function(err, docs) {
				if (err) throw err;
				
				res.json(docs);
			});
	};
	
	this.addStock = function(req, res) {
		stocks.insert({
			code: req.body.code,
			info: req.body.info
		}, function(err) {
			if (err) throw err;
			
			stocks.find({}, {_id: 0})
				.toArray(function(err, docs) {
					if (err) throw err;
					
					res.json(docs);
				});	
		});
	};
	
	this.deleteStock = function(req, res) {
		stocks.remove({code: req.params.code}, function(err) {
			if (err) throw err;
			
			stocks.find({}, {_id: 0})
				.toArray(function(err, docs) {
					if (err) throw err;
					
					res.json(docs);
				});
		});
	};
}

module.exports = Controller;
*/
/*
function ClickHandler () {

	this.getClicks = function (req, res) {
		Users
			.findOne({ 'github.id': req.user.github.id }, { '_id': false })
			.exec(function (err, result) {
				if (err) { throw err; }

				res.json(result.nbrClicks);
			});
	};

	this.addClick = function (req, res) {
		Users
			.findOneAndUpdate({ 'github.id': req.user.github.id }, { $inc: { 'nbrClicks.clicks': 1 } })
			.exec(function (err, result) {
					if (err) { throw err; }

					res.json(result.nbrClicks);
				}
			);
	};

	this.resetClicks = function (req, res) {
		Users
			.findOneAndUpdate({ 'github.id': req.user.github.id }, { 'nbrClicks.clicks': 0 })
			.exec(function (err, result) {
					if (err) { throw err; }

					res.json(result.nbrClicks);
				}
			);
	};

}

module.exports = ClickHandler;
*/