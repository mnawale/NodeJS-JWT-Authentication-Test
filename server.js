const express = require('express');
const jwt = require('jsonwebtoken');
const ex_jwt = require('express-jwt');
const app=express();
const port=3000;
const path = require('path');
const bodyParser =require('body-parser');
const secretKey = 'My Super secret key';

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers','Content-type,Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const jwtMW = ex_jwt({
    secret: secretKey,
    algorithms: ['HS256'],
    isRevoked: isRevokedCallback
});

let users = [ 
    {
        id: 1,
        username: 'megha',
        password: '123'
    },
    {
        id: 2,
        username: 'nawale',
        password: '789'
    }
];

var isRevokedCallback = function(req, payload, done){
    var issuer = payload.iss;
    var tokenId = payload.jti;
  
    data.getRevokedToken(issuer, tokenId, function(err, token){
      if (err) { return done(err); }
      return done(null, !!token);
    });
  };
  
  
app.post("/login",(req,res) => {
    const { username, password } =req.body;

    for (let user of users ) {
        if (username == user.username && password == user.password) {
            let refresh = jwt.sign({ id: user.id, username: user.username},"refresh", { expiresIn: '7d'});
            let token = jwt.sign({ id: user.id, username: user.username}, secretKey, { expiresIn: 18});
            return res.status(201).json({
                success: true,
                err: null,
                token,
                refresh
            });
        
            break;
        }
    }    
    res.status(401).json({
        success: false,
        token: null,
        err: 'Username or Password is incorrect'
    });
        
    
});

app.get('/api/dashboard',jwtMW, (req,res)=> {
    console.log(req);
    res.json ({
        success: true,
        myContent: 'Welcome!!! This is dashboard page.'
    });
});
app.get('/api/settings',jwtMW, (req,res)=> {
    console.log(req);
    res.json ({
        success: true,
        myContent: 'Here You can update your account details.'
    });
});

app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname,'index.html'));
});

app.use (function (err, req, res, next) {
    console.log(err.name === 'UnauthorizedError');
    console.log(err);
    if(err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Provide correct username and password'
        });        
    }
    else {
        next(err);
    }
});


app.listen(port,()=> {
    console.log(`listening on :${port}`);
});