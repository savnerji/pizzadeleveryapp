const express = require("express");

const app = express();
const dotenv = require('dotenv');
dotenv.config();
const ejs = require("ejs");
const path = require("path");
const expressLayout = require("express-ejs-layouts");

const passport = require('passport')

const port = process.env.PORT || 3000
const session = require('express-session');

const flash = require('express-flash');
const mongoose = require("mongoose");
const Emitter = require('events')


const MongoDbStore = require('connect-mongo')(session) //in this right side of assignment i function calling



// Database connection
mongoose.connect(process.env.MONGO_CONNECTION_URL, { useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true, useFindAndModify : true });
const connection = mongoose.connection;

connection.once('open', () => {
    console.log('Database connected...');
}).catch(err => {
    console.log('Connection failed...')
});


//session store
let mongoStore = new MongoDbStore({
    mongooseConnection: connection,
    collection: 'sessions' // create collection in db namelike session
})


//Event emotter

const eventEmitter = new Emitter();
//bind the eventEmiter to the app server
app.set('eventEmitter',eventEmitter)

//session config
app.use(session({ 
    secret :process.env.COOKIE_SECRET,
    resave:false,
    store: mongoStore,
    saveUninitialized:false,
     cookie: {maxAge: 1000 * 60 * 60 * 24} // 24 hours life span
    
}))

//pasport config * it is laways comes after session configuration
const passportInit = require('./app/config/passport')

passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())



app.use(express.static('public'));
app.use(express.urlencoded({extended:false}))
app.use(express.json())


//global middleware

app.use((req,res,next)=>{
    res.locals.session = req.session
    res.locals.user=req.user
    next()
})

app.use(flash())
// set the Templet chain

app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')



//register the routes
require('./routes/web')(app)

app.use((req,res)=>{
res.status(404).render('errors/404')
})

//storing app.listen to server for io connections
const server =app.listen(port, () => {
    console.log(`server is listening at ${port}`);
})


//socket

const io = require('socket.io')(server)

io.on('connection',(socket)=>{

    // join 

    console.log(socket.id);

    //fetching req from the client app.js file for accepr connect with name join which is send from their
    socket.on('join',(orderId)=>{

        console.log(orderId);
        socket.join(orderId)

    })
})

eventEmitter.on('orderUpdated',(data)=>{

    
    io.to(`order_${data.id}`).emit('orderUpdated',data)
})

eventEmitter.on('orderPlaced',(data)=>{
    io.to('adminRoom').emit('orderPlaced',data)
})