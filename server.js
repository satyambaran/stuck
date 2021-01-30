//to start can also use 'node server.js'
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const path = require('path')
const express = require('express')
const methodo = require('method-override')
const User = require('./models/user')
const bcrypt = require('bcrypt')
const passport = require('passport')
const app = express()
const flash = require('express-flash')
const session = require('express-session')
const multer = require('multer')
const uploadingPath = path.join('public', User.storePath)
const upload = multer({
    dest: uploadingPath
})
//express and app can be seen as class and object respectively
//so multiple instance can be possible
const appp = express()
//app.set('views', './views')    //to change the defeaults 
//app.set('view engine', 'ejs')  //can use different file type by changing here
const initializePassport = require('./passport-config')
const users = User.find({})
console.log(users)
initializePassport(passport,
    // email => User.find({
    //     email: email
    // }),
    // id => User.find({
    //     id: id
    // })
      email => users.find(user => user.email === email),
          id => users.find(user => user.id === id)
)
//const users = []
app.use(express.urlencoded({
    extended: false
}))
app.use(express.static('public'))
app.use(flash())
app.use(methodo('_metho'))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.get('/', checkAuthencited, (req, re) => {
    re.render('index.ejs', {
        name: req.user.name
    })
})
/* function fnName(params){

}
is same as
const fnName = (params)=>{

}
*/
app.get('/login', checkNotAuthencited, function (req, re) {
    re.render('login.ejs')
})
app.delete('/logout', function (req, res) {
    req.logOut()
    res.redirect('/login')
})
app.post('/login', checkNotAuthencited, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))
app.get('/register', checkNotAuthencited, (req, re) => {
    re.render('register.ejs')
})
app.post('/register', checkNotAuthencited, async (req, re) => {
    //re.render('register.ejs')
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    //https://softwareengineering.stackexchange.com/questions/236309/strategy-for-generating-unique-and-secure-identifiers-for-use-in-a-sometimes-of
    const user = new User({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    })
    try {
        const newUser = await user.save()
        console.log(newUser)
        re.redirect('/login')
    } catch (error) {
        re.redirect('/register')
    }
    //console.log(users)
})
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected'))


function checkAuthencited(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthencited(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(3000)
appp.get('/', (req, res) => {
    res.render('inde.ejs')
})
app.listen(4000) //these all show same thing
appp.listen(5000)