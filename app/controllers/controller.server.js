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
