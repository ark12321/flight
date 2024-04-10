require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyparser = require("body-parser");
const ld=require("lodash");
const bcrypt=require("bcrypt");


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

let allFlights=[];

const flightSchema = new mongoose.Schema({  
    name: String,
    date: String,
    flightNumber: String,
    seatsBooked: Number
});
const flight= mongoose.model("flight",flightSchema);

const userSchema = new mongoose.Schema({  
    email: String,
    password: String
});

const adminSchema = new mongoose.Schema(
    {
       email:String,
       password:String
    }
);



const user= mongoose.model("user",userSchema);
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
    let action_page=req.body.action;
    console.log("rAndl:",typeofUser,action_page);
    res.render(action_page,{typeOfUser:typeofUser});
});



app.post("/login", async function(req, res) {
    console.log("login email is :", req.body.username);
    try {
        const email = req.body.username;
        const password = req.body.password;
        const typeofUser = req.body.name;

        const allFlights = await flight.find({});

        if (typeofUser === "User") {
            const userFound = await user.findOne({ email: email });
            let exists= await bcrypt.compare(password,userFound.password);
            if (userFound && exists===true) {
                // Redirect to dashboard upon successful login
                res.render("dashboard",{flights:allFlights});
            } else {
                // res.redirect("/Failure");
                res.render("Failure",{typeOfUser:typeofUser});
            }
        } else {
            const adminFound = await admin.findOne({ email: email });
            let exists= await bcrypt.compare(password,userFound.password);
            if (adminFound && exists===true) {
                // Redirect to founder page upon successful login
                res.render("founder",{flights:allFlights});
            } else {
                // res.redirect("/Failure");
                res.render("Failure",{typeOfUser:typeofUser});
            }
        }
    } catch (error) {
        console.error("Login error:", error);
        res.render("Failure",{typeOfUser:typeofUser});
    }
});



app.post("/register", async function(req,res)
{
    let typeofUser = req.body.name;
    let saltRounds=10;
    let pass= await bcrypt.hash(req.body.password,saltRounds);
    console.log("bcrpted pass is ,",pass);
    console.log("post register:",typeofUser);
    if (typeofUser === "User") {
        let fnd = await user.findOne({ email: req.body.username });
        if (fnd) {
            // res.send("User already exists");
            res.render("register", { typeOfUser: typeofUser });
        } else {
            const usert = new user({
                email: req.body.username,
                password: pass
            });
            await usert.save();         
               }
    }else 
    {
        let fnd= await admin.findOne({email:req.body.username});
        if(fnd){
            //res.send("admin already exists");
            res.render("register", { typeOfUser: typeofUser });
        }else{
        const admint=new admin({
        email:req.body.username,
        password:pass});
        await admint.save();}
    }
    
   res.render("login",{typeOfUser:typeofUser});
    
});



app.post("/bookings",async function(req,res){
  let fname=req.body.book;
  let fnd= await flight.findOne({name:fname});
  let currBook=fnd.seatsBooked;
  let newboooks= await flight.updateOne({name:fname},{seatsBooked: currBook+1});
  allFlights=await flight.find({});
  res.render("dashboard",{flights:allFlights});
});

app.post("/traceback",async function(req,res){
    allFlights=await flight.find({});
    res.render("dashboard",{flights:allFlights});
  });


app.post("/query",async function(req,res){
  let q=req.body.Name;
  let attr=req.body.filterBy;
  let val;
   for(let i=0;i<q.length;i++)
   {
    if(q[i]!=='')val=q;
   }

  allFlights=await flight.find({[attr]:val});
  console.log("val-",val,"attName-",[attr],"res-",allFlights);
 
  if(!allFlights){
    allFlights=await flight.find({});
    res.sendFile(__dirname+"/views/notfound.html");}
  else {
    
    res.render("dashboard",{flights:allFlights});}
});

app.post("/sortBy",async function(req,res){
  let filterbY=req.body.filterBy;
  allFlights=await flight.find({});

allFlights.sort((a, b) => {
    console.log(typeof(filterbY),filterbY);
    let fa = ld.toLower(a.filterbY);
    let fb = ld.toLower(b.filterbY);
    if (fa < fb) return -1;
    if (fa > fb) return 1;
    return 0;
});

console.log(filterbY,":- filtered");
allFlights.forEach(flight=>console.log(flight));

res.render("founder",{flights:allFlights});
});

app.post("/addflight",async function(req,res){
    
    let fnd= await flight.findOne({name:req.body.name});
        if(fnd){
           // res.send("flight already exists");
            res.render("Failure",{typeOfUser:"admin"});
        }else{
    const nflight=new flight({
        
        name:req.body.name,
        date:req.body.date,
        flightNumber: req.body.flightNumber, 
        seatsBooked: 60 - parseInt(req.body.seats) 
    });

    await nflight.save();
        }
    allFlights=await flight.find({});
    res.render("founder",{flights:allFlights})
  });


app.get("/Failure",async function(req,res)
{
    res.sendFile(__dirname+"/views/Failure.html")

});

app.listen(PORT,function(){console.log("server started...")});



/*
const session=require("express-session");
const passport= require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


app.use(session({
    secret:"our first secret",
    resave:false,
    saveUninitialized:true
}));

app.use(passport.initialize());
app.use(passport.session());

userSchema.plugin(passportLocalMongoose);
adminSchema.plugin(passportLocalMongoose);

passport.use(user.createStrategy());
passport.use(admin.createStrategy());

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

passport.serializeUser(admin.serializeUser());
passport.deserializeUser(admin.deserializeUser());




 user.register({ email: req.body.username }, req.body.password, async function(err, User) {
                if (err) {
                    console.log(err);
                    res.render("Failure", { typeOfUser: typeofUser });
                } else {
                    allFlights = await flight.find({});
                    passport.authenticate("local")(req, res, function() {
                        res.render("dashboard", { flights: allFlights });
                    });
                }
            });

 admin.register({ email: req.body.username }, req.body.password, async function(err, Admin) {
            if (err) {
                res.render("Failure", { typeOfUser: typeofUser });
            } else {
                allFlights = await flight.find({});
                passport.authenticate("local")(req, res, function() {
                    res.render("founder", { flights: allFlights });
                });
            }
        });

*/