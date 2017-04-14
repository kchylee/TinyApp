const express = require('express');
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

let urlDataBase = {
  "b2xVn2": {
    id:"b2xVn2",
    long: "http://www.lighthouselabs.ca",
    userID: "skratchbastid"
  },
  "9sm5xK": {
    id: "9sm5xK",
    long: "http://www.google.com",
    userID: "thevinylkiller"
  }
};

let users = {
  "skratchbastid":{
    id: "skratchbastid",
    email: "paul@skratchbastid.com",
    password: "skratch"
  },
  "thevinylkiller":{
    id: "thevinylkiller",
    email: "lee@udjschool.com",
    password: "pug"
  }
};

//Hello page with username, and no username when logged out
app.get("/", function(req, res){
  if (req.cookies["user_id"] === undefined){
    res.send("Hello!");
  }else{
    res.send(`Hello! ${req.cookies["user_id"]}`);
  }
});

//Receives GET request from broser for registration page
app.get("/register", (req, res) => {
  res.render("register");
})

//Receives POST request from register.ejs to parse email and password
app.post("/register", (req, res) => {
  let user = generateRandomString(7);
  if (req.body.email === ""){
    res.status(400).end("Error 400: Email is required");
  }else if(req.body.password === ""){
    res.status(400).end("Error 400: Password is required");
  }
  for (i in users){
    if (users[i].email == req.body.email){
      res.status(400).end("Error 400: Email already exists");
    }
  }
  users[user] = {};
  users[user].id = user;
  users[user].email = req.body.email;
  users[user].password = req.body.password;
  res.cookie("user_id", users[user].id);
  console.log(users);
  res.redirect("/")
});

//Receives GET request from header log-in button
app.get("/login", (req, res) => {
  res.render("login");
})

//Receives POST request from login page
app.post("/login", (req, res) => {
  for (i in users){
    if (users[i].email === req.body.email && users[i].password === req.body.password){
      res.cookie("user_id", users[i].id);
      console.log(req.cookies.user_id);
      res.redirect("/");
      return;
    }
  }
  res.status(403).end("Error 403: Wrong email and/or password");
});

//Receives POST request from _header
app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.cookies["user_id"]);
  res.redirect("/");
});

app.get("/urls.json", function(req, res){
  res.json(urlDataBase);
});

//Returns ALL url pairs in urlDataBase
app.get("/urls", (req, res) => {
  let templateVars = {urls: {}, user: req.cookies.user_id};

  for (i in urlDataBase){
    console.log("userID: " + urlDataBase[i].userID);
    console.log("cookie: " + req.cookies.user_id);
    if(req.cookies.user_id == urlDataBase[i].userID){
      templateVars.urls[urlDataBase[i].id] = urlDataBase[i].long;
      console.log("urls " + urlDataBase[i].long + " passed to index page");
    }
  }
  res.render("urls_index", templateVars);
});

//Gets POST request from urls_new.ejs after user input
app.post("/urls", (req, res) => {
  shortURL = generateRandomString(6);
  urlDataBase[shortURL] = {};
  urlDataBase[shortURL].id = shortURL;
  urlDataBase[shortURL].long = req.body.longURL;
  urlDataBase[shortURL].userID = req.cookies.user_id;
  console.log(urlDataBase);
  res.redirect(`/urls/${shortURL}`);
});

//Prints user form for url input
app.get("/urls/new", (req, res) => {
  if(!req.cookies.user_id){
    res.redirect("/login");
  }else{
    let templateVars = {user: req.cookies.user_id};
  res.render("urls_new", templateVars);
  }
});

//Take POST request to delete data entry from urls_index
app.post("/urls/:id/delete", (req, res) => {
  if(req.cookies.user_id = urlDataBase[req.params.id].userID){
    delete urlDataBase[req.params.id];
    // res.redirect("/urls");
  }else{
    res.send("Not Authorized");
  }
  res.redirect("/urls");
})

//Prints single long-short url pair as specified
app.get("/urls/:id", (req, res) => {
  let templateVars = {shortURL: req.params.id, URL: urlDataBase[req.params.id], user: req.cookies.user_id};
  res.render("urls_show", templateVars);
});
//Takes POST request from urls_show to UPDATE shortURL
app.post("/urls/:id", (req, res) => {
  if(req.cookies.user_id = urlDataBase[req.params.id].userID){
    urlDataBase[req.params.id].long = req.body.longURL;
  }else{
    res.send("Not Authorized");
  }
  res.redirect("/urls");
})

//Redirects page based on shortURL in request
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDataBase[req.params.shortURL].long;
  console.log(longURL);
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//from 48 to 122
function generateRandomString(length){
  var rStr = "";
  while (rStr.length < length){
    var rNum = Math.floor(Math.random() * (122 - 48 + 1) + 48);
      if (rNum > 57 && rNum < 65){
        continue;
      }else if(rNum > 90 && rNum < 97){
        continue;
      }else{
        rStr += String.fromCharCode(rNum);
      }
  }
  return rStr;
}



