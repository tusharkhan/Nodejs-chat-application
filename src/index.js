const express = require('express');
const http = require('http');
const path = require('path');
const socket = require('socket.io');
const Profane = require('bad-words');
const app = express();
const server = http.createServer(app);
const io = socket(server);

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname ,  '../public');
app.use( express.static(publicPath) );

const helper = require('../public/js/helper');

io.on('connection', (socket) => {
    socket.on('sendMessage', (data, callback) => {
        let profane = new Profane();

        if( profane.isProfane(data) ) return callback('bad word');
        if( !(data) ) return callback('No data');

        io.emit('message', helper.createMessage(data));
        callback();
    });

    socket.on('shareLocation', (data, callback) => {
        if( ! data ) return callback('Error !');

        io.emit('location', helper.createMessage(`http://maps.google.com/?q=${data.latitude},${data.longitude}`));
        callback()
    })

    socket.on('call', (data) => {
        socket.broadcast.emit('message',helper.createMessage(data));
    })

    socket.on('join', ( {username, room} ) => {
        socket.join(room);
        socket.broadcast.to(room).emit('message', helper.createMessage( username+ ' has joined the room'));
    })

    socket.on('disconnect', () => {
        io.emit('message', {
            text: 'User disconnected',
            createdAt: new Date().getTime()
        });
    })
});


server.listen(port, () => { console.log('Port is running in ' + port) });