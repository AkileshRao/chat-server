const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const cors = require('cors')
const PORT = process.env.PORT | 5000
const { addUser, getUser, deleteUser, getUsers } = require('./users')


app.use(cors())

io.on('connection', (socket) => {
    socket.on('login', ({ name, room }, callback) => {
        const { user, error } = addUser(socket.id, name, room)
        console.log(getUsers());
        console.log("From login", socket.id);
        if (error) return callback(error)
        socket.join(room)
        console.log(room, name);
        io.to(room).emit('notification', `${name} has joined ${room}`)
        callback()
    })

    socket.on('chat', msg => {
        io.emit('chat', msg)
    })

    socket.on('sendMessage', message => {
        console.log("From send", socket.id);
        const user = getUser(socket.id)
        io.to(user.room).emit('message', { user: user.name, text: message });
    })

    socket.on("disconnect", () => {
        deleteUser(socket.id)
        console.log("User disconnected");
    })


})

app.get('/', (req, res) => {
    res.send("Server is up and running")
})

http.listen(PORT, () => {
    console.log(`Listening to ${PORT}`);
})