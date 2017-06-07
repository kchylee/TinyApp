const express = require('express');
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: "session",
  keys: ["N0vv4y", "_fUgg3t4b0Ut1t_"]
}));
const bcrypt = require("bcrypt");
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

let urlDataBase = {
  "b2xVn2": {
    id:"b2xVn2",
    long: "http://www.lighthouselabs.ca",
    userID: "skratchbastid",
    clickCount: 0
  },
  "9sm5xK": {
    id: "9sm5xK",
    long: "http://www.google.com",
    userID: "thevinylkiller",
    clickCount: 0
  }
};

let users = {
  "skratchbastid":{
    id: "skratchbastid",
    email: "paul@skratchbastid.com",
    password: bcrypt.hashSync("skratch", 10)
  },
  "thevinylkiller":{
    id: "thevinylkiller",
    email: "lee@udjschool.com",
    password: bcrypt.hashSync("pug", 10)
  }
};

//Hello page with username, and no username when logged out
app.get("/", function(req, res){
  if (req.session.user_id === undefined){
    res.redirect("/login");
  }else{
    res.redirect("/urls");
  }
});

//Receives GET request from broser for registration page
app.get("/register", (req, res) => {
  if(!users[req.session.user_id]){
    res.status(200);
    res.render("register");
  }else{
    res.redirect("/");
  }
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
  users[user].password = bcrypt.hashSync(req.body.password, 10);
  req.session.user_id = user;
  res.redirect("/")
});

//Receives GET request from header log-in button
app.get("/login", (req, res) => {
  if (!users[req.session.user_id]){
    res.status(200);
    res.render("login");
  }else{
    res.redirect("/");
  }
})

//Receives POST request from login page
app.post("/login", (req, res) => {
  for (i in users){
    if (users[i].email === req.body.email && bcrypt.compareSync(req.body.password, users[i].password)){
      req.session.user_id = users[i].id;
      res.redirect("/");
      return;
    }
  }
  res.status(401);
  res.render("error401_r");
});

//Receives POST request from _header
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.get("/urls.json", function(req, res){
  res.json(urlDataBase);
});

//Returns ALL url pairs in urlDataBase
app.get("/urls", (req, res) => {
  if (!users[req.session.user_id]){
    res.status(401);
    res.render("error401");
  }else{
    res.status(200);
    let templateVars = {urls: {}, user: users[req.session.user_id]};
    for (i in urlDataBase){
      if(req.session.user_id == urlDataBase[i].userID){
        templateVars.urls[urlDataBase[i].id] = {};
        templateVars.urls[urlDataBase[i].id].shortURL = urlDataBase[i].id;
        templateVars.urls[urlDataBase[i].id].longURL = urlDataBase[i].long;
        templateVars.urls[urlDataBase[i].id].click = urlDataBase[i].clickCount;
      }
    }
    res.render("urls_index", templateVars);
  }
});

//Gets POST request from urls_new.ejs after user input
app.post("/urls", (req, res) => {
  if(!req.session.user_id){
    res.status(401);
    res.render("error401");
  }else{
    shortURL = generateRandomString(6);
    urlDataBase[shortURL] = {};
    urlDataBase[shortURL].id = shortURL;
    if(req.body.longURL.includes("http")){
      var sliceIndex = req.body.longURL.indexOf("//");
      req.body.longURL = req.body.longURL.slice(sliceIndex+2);
    }
    urlDataBase[shortURL].long = "http://" + req.body.longURL;
    urlDataBase[shortURL].userID = req.session.user_id;
    urlDataBase[shortURL].clickCount = 0;
    res.redirect(`/urls/${shortURL}`);
  }
});

//Prints user form for url input
app.get("/urls/new", (req, res) => {
  if(!req.session.user_id){
    res.status(401);
    res.render("error401");
  }else{
    res.status(200);
    let templateVars = {user: users[req.session.user_id]};
    res.render("urls_new", templateVars);
  }
});

//Take POST request to delete data entry from urls_index
app.post("/urls/:id/delete", (req, res) => {
  if(req.session.user_id === urlDataBase[req.params.id].userID){
    delete urlDataBase[req.params.id];
  }else{
    res.send("Not Authorized");
  }
  res.redirect("/urls");
})

//Prints single long-short url pair as specified
app.get("/urls/:id", (req, res) => {
  if (!urlDataBase.hasOwnProperty(req.params.id)){
    res.status(404);
    res.render("error404");
  }
  if (!req.session.user_id){
    res.status(401);
    res.render("error401");
  }
  if(req.session.user_id !== urlDataBase[req.params.id].userID){
    res.status(403);
    res.render("error403");
  }
  res.status(200);
  let templateVars = {shortURL: req.params.id, URL: urlDataBase[req.params.id], user: users[req.session.user_id]};
  res.render("urls_show", templateVars);
});

//Takes POST request from urls_show to UPDATE shortURL
app.post("/urls/:id", (req, res) => {
  if(!urlDataBase.hasOwnProperty(req.params.id)){
    res.status(404);
    res.render("error404");
  }
  if(!req.session.user_id){
    res.status(401);
    res.render("error401");
  }
  if(req.session.user_id == urlDataBase[req.params.id].userID){
    if(req.body.longURL.includes("http")){
      var sliceIndex = req.body.longURL.indexOf("//");
      req.body.longURL = req.body.longURL.slice(sliceIndex+2);
    }
    urlDataBase[req.params.id].long = 'http://' + req.body.longURL;
    urlDataBase[req.params.id].clickCount = 0;
    res.redirect(`/urls/${req.params.id}`);
  }else{
    res.status(403);
    res.render("error403");
  }
})

//Redirects page based on shortURL in request
app.get("/u/:shortURL", (req, res) => {
  if(urlDataBase.hasOwnProperty(req.params.shortURL)){
    urlDataBase[req.params.shortURL].clickCount += 1;
    res.redirect(urlDataBase[req.params.shortURL].long);
  }else{
    res.status(404);
    res.render("error404");
  }
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
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



