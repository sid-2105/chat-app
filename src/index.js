const http = require('http')
const path = require('path')
const express = require ('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocation} = require('./utils/messages')
const {addUser, removeUser, getUser, getUserInRoom} = require('./utils/users')
const app =express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

//let count = 0

//server (emit) -> client(recieve) - countUpdated
//client (emit) ->server(recieve) -increment

io.on('connection',(socket)=>{
    console.log('New websocket connection')

    // socket.emit('countUpdated',count)

    socket.on('join',(options,callback) =>{
        const {error, user}=addUser({id:socket.id, ...options})

        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin','Welcome!!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUserInRoom(user.room)
        })
        
        callback()
    })
   
    socket.on('sendMessage',(msg, callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message',generateMessage(user.username, msg))
        callback()
    })

    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocation(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left the chat!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUserInRoom(user.room)
            })
        }
      
    })

    // socket.on('increment',()=>{
    //     count++
    //     //socket.emit('countUpdated',count)
    //     io.emit('countUpdated',count)
    //})
    
})

server.listen(port,()=>{
    console.log(`Server is running on port ${port}!`)
})

