
// server file

const path =  require('path');  // core module
const http = require('http');  // core module
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');


const app = express();
const server = http.createServer(app); // this is done by express by default, we are jsut refactoring the code.
const io = socketio(server);        // socketio expects server to be called instead of app. So we had to change the code.

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath));

// server (emit) -> client (recieves) => countUpdated
// client (emit) -> server (recieves) => increment

                    // socket -> object which consists data about connected clients
io.on('connection',(socket)=>{                 // on establishing the connection, run this function. It runs times the number of connected clients
    console.log('New websocket connection');
                    
                    // callback
    socket.on('join',({ username, room }, callback)=>{

        const {error, user} = addUser({id: socket.id, username, room})

        if(error)
        {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('printMessageConsole', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('printMessageConsole',generateMessage('Admin',`${user.username} has joined`)) // broadcast sends message to all users except the client from which the message is sent.

        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();

        // socket.emit , io.emit -> send it to everyone , socket.broadcast.emit -> everyone except itself
        // io.to.emit -> send it to everyone in a particular room
        // socket.broadcast.to.emit -> send it to everyone except itself in a specific room
    })
                                        //this is for acknowledgement
    socket.on('sendMessageForm',(message,callback)=>{

        const user = getUser(socket.id)

        const filter = new Filter();

        if(filter.isProfane(message))
        {
            return callback('Profanity is not allowed!!')
        }

        io.to(user.room).emit('printMessageConsole',generateMessage(user.username,message));
        callback();
    })
                                    // this is callback for acknowledgement
    socket.on('sendLocation',(coords,callback)=>{

        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))

        callback();
    })

        

    socket.on('disconnect',()=>{    // inbuilt event -> disconnect

        const user = removeUser(socket.id)

        if(user)
        {
            io.to(user.room).emit('printMessageConsole',generateMessage(`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
});


server.listen(port,()=>{                          // app.listen is written as server.listen
    console.log('Server is up on port '+port)
})
