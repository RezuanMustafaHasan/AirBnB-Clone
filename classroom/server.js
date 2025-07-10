const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser("secretKey"));

app.get("/getsignedcookie", (req, res) => {
    res.cookie("Country", "Bangladesh", { signed: true });
    res.send("Signed cookie set");
});

app.get("/verify", (req, res) => {
    // console.log(req.cookies);
    console.log(req.signedCookies);
    res.send("verified");
});

app.get("/", (req, res) => {
    console.dir(req.cookies);
    res.send("Hello, World!");
});

app.get("/greet", (req, res) => {
    const name = req.cookies.name || "Guest";
    res.send(`Hello, ${name}!`);
});

app.get("/getcookie", (req, res) => {
    res.cookie("myCookie", "cookieValue2");
    res.cookie("name", "rezuan");
    res.cookie("age", "25");
    res.cookie("email", "hasanideal2002@gmail.com");
    res.send(`Cookie set`);
});

app.listen(3000, () => { 
    console.log("Server is running on port 3000");
});


