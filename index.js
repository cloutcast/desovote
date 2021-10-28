var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var createError = require("http-errors");

var indexRouter = require('./routes/index');

const {validateJwt} = require("./auth.js");
const { default: axios } = require('axios');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let {votedAlready} = require("./lib/sheet");

app.use('/api', async (req,res,next) => {
  try {
    const genericError = "You do not meet the criteria to vote. Please check the user you're authenticating with, and try again.";
    console.log(req.headers);
    let publicKey = req.headers['x-deso-publickey'] || null;
    let jwt = req.headers['x-deso-jwt'] || null;

    let jwtValid = validateJwt(publicKey, jwt);

    if (jwtValid == false) {
      return next(new Error('stop trying to break me.'));
    } else if (jwtValid == 'voted') {
      return next(new Error(genericError));
    } else {

      console.log(jwtValid);

      let didVote = await votedAlready(publicKey);

      if (didVote == true) {
        return next(new Error(genericError));
      } else {

        let  userProfileGet = await axios.get(`https://cloutcast.io/bitclout/user/${publicKey}/get.json`)
        let userProfile = userProfileGet.data;

        let {CoinPriceDeSoNanos = 0, followerCount = 0, Username = null} = userProfile;

        if (CoinPriceDeSoNanos < 100000000 || followerCount < 25) {
          return next(new Error(genericError));
        } else if (Username == null) {
          return next(new Error(genericError));
        } else {
          res.setHeader('x-deso-username', Username);
          return next(undefined);
        }

      }
      

     
    }
  } catch (ex) {  
    console.error(ex);
    return next(new Error(ex));
  }

}, indexRouter);




app.use((req, res, next) => {

  res.status(404);
  return next(createError(404));

});


app.use((err, req,res,next) => {
  if (res.statusCode == 200) {
    console.error(err);
    res.status(500);
  }

  return res.json({
    status: res.statusCode,
    success: false,
    err: err.message || null
  });
});


module.exports = app;
