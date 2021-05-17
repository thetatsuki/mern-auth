const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')


const app = express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())


const PORT = config.get('port') || 5000

// подключение к бд
mongoose.connect(config.get('mongoUri'), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, err => {
    if(err) throw err
    console.log("К бд подключился")
})

// роутинги
app.use('/user', require('./routes/userRoutes'))

app.listen(PORT, () => { console.log(`Сервер запущен: ${PORT}`); })