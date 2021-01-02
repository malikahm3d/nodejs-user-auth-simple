const express = require('express');
const app = express();
const User = require('./models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');



mongoose.connect('mongodb://localhost:27017/loginDemo', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })


app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));
// course: app.use(session({ secret: 'notagoodsecret' }))
app.use(session({
    secret: 'notagoodsecret',
    resave: false,
    saveUninitialized: true,
    //cookie: { secure: true }
  }));

//malik's beautiful code:
  //NOTE: we want to move as much code as possible OUT of the route handler.
  //I have left all original code in place, to help set a pattren for future apps.
const isLoggedIn = (req, res, next) => {
    //removed from route handler
    if(!req.session.user_id){
        console.log('NEVER SHOULD HAVE COME HERE!');
        return res.redirect('/login');
    } else {
        //res.render('secret');
        next();
    }

}
app.get('/', (req, res) => {
    res.send('HOME PAGE')
})

app.get('/register', (req, res) => {
    res.render('register')
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    // const hashedPassword = await bcrypt.hash(password, 12);
    // const user = new User({
    //     username: username,
    //     password: hashedPassword
    // });
    const user = new User({ username, password });
    //a much  shorter way of creating a user
    //mongoose middleware .pre('save') will do the hashing
    await user.save();
    req.session.user_id = user._id;
    //set user id in the session to the registred user's id
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // const user = await User.findOne({ username: username});
    // const validPassword = await bcrypt.compare(password, user.password);
    const foundUser = await User.findAndValidate(username, password)
    if(foundUser){
        req.session.user_id = foundUser._id;
        //set user id in the session to the logged in user's id
        res.send('YAYY UR BACK!!');
    } else {
        res.send('UR NOT REAL~!!11!!');
    }
});

app.get('/secret', isLoggedIn, (req, res) => {
    // if(!req.session.user_id){
    //     console.log('NEVER SHOULD HAVE COME HERE!');
    //     res.redirect('/login');
    // } else {
    //     res.render('secret');
    // };
    res.render('secret');
});

app.post('/logout', (req, res) => {
    req.session.user_id = null;
    //more so:
    //req.session.destroy();
    res.redirect('/login');
});

app.listen(3000, () => {
    console.log("SERVING YOUR APP!")
})

