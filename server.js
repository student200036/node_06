const express = require('express')
const app = express()

const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: true }))

const dotenv = require('dotenv')
dotenv.config()
const host = process.env.HOST
const port = process.env.PORT

const uuidv4 = require('uuid').v4
let users = {}

app.get('/', (req, res) => {
    res.render('index.ejs')
})


io.on('connection', (socket) => {
    socket.on('auth', (user) => {
        if (user.token) return
        user.token = uuidv4()
        users[socket.id] = user
        let data = {
            user: user,
            users: users,
        }
        console.log(data)
        socket.emit('logined', data)
        socket.broadcast.emit('user_joined', data)
    })

    socket.on('message', (data) => {
        console.log(data)
        data.datetime = Date.now()
        io.emit('message', data)
    })
    
    socket.on('upload_stamp', (data) => {
        data.datetime = Date.now()
        console.log(data)
        io.emit('load_stamp', data)
    })

    socket.on('upload_image', (data) => {
        data.dateTime = Date.now()
        console.log(data)
        io.emit('load_image', data)
    })

    const logout = (socket) => {
        const user = users[socket.id]
        delete users[socket.io]
        socket.broadcast.emit('user_left', {
            user: user,
            users: users,
        })
    }

    socket.on('logout', () => {
        logout(socket)
    })
    socket.on('disconnect', () => {
        logout(socket)
    })
})

http.listen(port, host, () => {
    console.log('http://' + host + ':' + port)
})