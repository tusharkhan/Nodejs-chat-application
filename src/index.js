const express = require('express');
const http = require('http');
const path = require('path');
const socket = require('socket.io');
const Profane = require('bad-words');
const { addUser, removeUser, getUser, getUsersInRoom } = require('../public/js/users');
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

        let user = getUser(socket.id);

        io.to(user.room).emit('message', helper.createMessage(user, data));
        callback();
    });

    socket.on('shareLocation', (data, callback) => {
        if( ! data ) return callback('Error !');
        let user = getUser(socket.id);

        io.to(user.room).emit('location', helper.createMessage(user, `http://maps.google.com/?q=${data.latitude},${data.longitude}`));
        callback()
    })

    socket.on('call', (data) => {
        socket.broadcast.emit('message',helper.createMessage(data));
    })

    socket.on('join', ( userdatas, callback ) => {
        let {error, user} = addUser({
            id: socket.id,
            ...userdatas
        });

        if (error) return callback(error);

        socket.join(user.room);
        socket.broadcast.to(user.room).emit('message', helper.createMessage(user,  userdatas.username+ ' has joined the room'));
        callback();
    })

    socket.on('disconnect', () => {
        let remove = removeUser(socket.id);

        if (remove) {
            io.to(remove.room).emit('message', helper.createMessage(removeUser, remove.username + ' is disconnected'));
        }
    })
});


server.listen(port, () => { console.log('Port is running in ' + port) });