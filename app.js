const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyparser = require("body-parser");

const app=express();
const PORT = process.env.PORT || 3000;


app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");


mongoose.connect(
    `mongodb+srv://ravikanth9166:h9H8tToOXnslbXpZ@cluster0.spcs4b5.mongodb.net/flightSchema`,
 {
    connectTimeoutMS: 60000 
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});


//mongoose.connect("mongodb+srv://ravikanth9166:h9H8tToOXnslbXpZ@cluster0.spcs4b5.mongodb.net/flightSchema");

let allFlights=[];

const flightSchema = new mongoose.Schema({  
    name: String,
    date: String,
    flightNumber: Number,
    seatsBooked: Number
});
const flight= mongoose.model("flight",flightSchema);

const userSchema = new mongoose.Schema({  
    email: String,
    password: String
});
const user= mongoose.model("user",userSchema);

const adminSchema = new mongoose.Schema(
    {
       email:String,
       password:String
    }
);
const admin=mongoose.model("admin",adminSchema);


app.get('/',function(req,res){
    res.sendFile(__dirname+"/views/home.html");
    // console.log("email is :", req.body.username);
});

app.post('/type',function(req,res)
{

    let typeofUser=req.body.name;
    console.log("type:",typeofUser);
    res.render("rAndl",{typeOfUser:typeofUser});
});

app.post('/rAndl',function(req,res)
{

    let typeofUser=req.body.name;
    let rAndl=req.body.action;
    console.log("rAndl:",typeofUser,rAndl);
    res.render(rAndl,{typeOfUser:typeofUser});
});

// app.get('/login',function(req,res){
   
//     let typeofUser=req.body.name;
//     console.log("get login:",typeofUser);
//     res.render("login",{typeofUser:typeofUser});
// });

// app.get('/register',function(req,res){
//     let typeofUser=req.body.name;
//     console.log("get regisgter:",typeofUser);
//     res.render("register",{typeofUser:typeofUser});
// });

/*
app.post("/login",async function(req,res)
{
    // console.log("login email is :", req.body.username);

   
          
            let e=req.body.username;
            let p=req.body.password;
            let typeofUser=req.body.name;
            console.log("post login:",typeofUser);
            allFlights=await flight.find({});

            if(typeofUser==="User"){
            let fnd = await user.findOne({ email: e });
            if (fnd) {
             if(p===fnd.password)res.render("dashboard",{flights:allFlights})
             else {res.redirect("/Failure");}
            } else {
                res.redirect("/Failure");
            }
        }else {
            let adminfnd = await admin.findOne({ email: e });
            if (adminfnd) {
             if(p===adminfnd.password)res.render("founder",{flights:allFlights})
             else {res.redirect("/Failure");}
            } else {
                res.redirect("/Failure");
            }
        }

}
);
*/

app.post("/login", async function(req, res) {
    console.log("login email is :", req.body.username);
    try {
        const email = req.body.username;
        const password = req.body.password;
        const typeofUser = req.body.name;

        const allFlights = await flight.find({});

        if (typeofUser === "User") {
            const userFound = await user.findOne({ email: email });
            if (userFound && password === userFound.password) {
                // Redirect to dashboard upon successful login
                res.render("dashboard",{flights:allFlights});
            } else {
                res.redirect("/Failure");
            }
        } else {
            const adminFound = await admin.findOne({ email: email });
            if (adminFound && password === adminFound.password) {
                // Redirect to founder page upon successful login
                res.render("founder",{flights:allFlights});
            } else {
                res.redirect("/Failure");
            }
        }
    } catch (error) {
        console.error("Login error:", error);
        res.redirect("/Failure");
    }
});



app.post("/register", async function(req,res)
{
    let typeofUser=req.body.name;
    console.log("post register:",typeofUser);
    if(typeofUser==="User")
    {
        const usert=new user({
        email:req.body.username,
        password:req.body.password});
        await usert.save();
    }else 
    {
        const admint=new admin({
        email:req.body.username,
        password:req.body.password});
        await admint.save();
    }
    
    res.render("login",{typeOfUser:typeofUser});

});

app.post("/bookings",async function(req,res){
  let fname=req.body.book;
  let fnd= await flight.findOne({name:fname});
  let currBook=fnd.seatsBooked;
  let newboooks= await flight.updateOne({name:fname},{seatsBooked: currBook+1});
  allFlights=await flight.find({});
  res.render("dashboard",{flights:allFlights})
});

app.post("/addflight",async function(req,res){
    
    const nflight=new flight({
        name:req.body.name,
        date:req.body.date,
        flightNumber: parseInt(req.body.flightNumber), 
        seatsBooked: 60 - parseInt(req.body.seats) 
    });

    await nflight.save();

    allFlights=await flight.find({});
    res.render("founder",{flights:allFlights})
  });


app.get("/Failure",async function(req,res)
{
    res.sendFile(__dirname+"/views/Failure.html")

});

app.listen(PORT,function(){console.log("server started...")});