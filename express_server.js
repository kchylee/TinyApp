const express = require('express');
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

let urlDataBase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", function(req, res){//Hello page with username, and no username when logged out
  if (req.cookies["username"] === undefined){
    res.end("Hello!");
  }else{
    res.end(`Hello! ${req.cookies["username"]}`);
  }
});

app.post("/login", (req, res) => {//Receives POST request from _header
  res.cookie("username", req.body.username);
  res.redirect("/");
});

app.post("/logout", (req, res) => {//Receives POST request from _header
  res.clearCookie("username", req.cookies["username"]);
  res.redirect("/");
});

app.get("/urls.json", function(req, res){
  res.json(urlDataBase);
});

app.get("/urls", (req, res) => {//Returns ALL url pairs in urlDataBase
  let templateVars = {urls: urlDataBase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {//Gets POST request from urls_new.ejs after user input
  shortURL = generateRandomString(6);
  urlDataBase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {//Prints user form for url input
  res.render("urls_new");
});

app.post("/urls/:id/delete", (req, res) => {//Take POST request to delete data entry from urls_index
  delete urlDataBase[req.params.id];
  res.redirect("/urls");
})

app.get("/urls/:id", (req, res) => {//Prints single long-short url pair as specified
  let templateVars = {shortURL: req.params.id, URL: urlDataBase[req.params.id], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {//Takes POST request from urls_show to UPDATE shortURL
  urlDataBase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
})

app.get("/u/:shortURL", (req, res) => {//Redirects page based on shortURL in request
  let longURL = urlDataBase[req.params.shortURL];
  res.redirect(`http://${longURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(length){//from 48 to 122
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



