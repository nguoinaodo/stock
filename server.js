'use strict';

var http = require('http');
var express = require('express');
var ioHandler = require(process.cwd() + '/app/controllers/controller.server.js');
var routes = require('./app/routes/index.js');
var socketIO = require('socket.io');
var MongoClient = require('mongodb').MongoClient;

var app = express();
var server = http.createServer(app);
var io = socketIO.listen(server);

require("dotenv").load();


MongoClient.connect(process.env.MONGO_URI, function(err, db) {
    if (err) throw err;
    
    app.use('/public', express.static(process.cwd() + '/public'));
    app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
    
    routes(app);
    ioHandler(io, db);

    server.listen(process.env.PORT,  function () {
    	console.log('Server is listening on port ' + process.env.PORT + '...');
    }); 
});