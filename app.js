if(process.env.NODE_ENV!="production"){
    require('dotenv').config();
}


// console.log(process.env.SECRET);

const express=require("express");
const app=express();

const mongoose=require("mongoose");
// const mongo_db="mongodb://127.0.0.1:27017/wanderlust";

const dbUrl=process.env.ATLASDB_URL;

const path=require("path");

app.use(express.urlencoded({extended:true}));

const ejsMate=require("ejs-mate");
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js"); 
const Review=require("./models/review.js");
const listingRouter=require("./routes/listing.js");

const session=require("express-session");
const reviewRouter=require("./routes/review.js");
const cookieParser=require("cookie-parser");

const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const flash=require("connect-flash");
const userRouter=require("./routes/user.js");

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expire:Date.now()+7*24*60*6060*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};

app.use(session(sessionOptions));
app.use(flash());


app.get("/",(req,res)=>{
    res.send("connection is successed");
});



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.successMsg=req.flash("success");
    res.locals.errorMsg=req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     });

//    let registeredUser=await User.register(fakeUser,"helloworld");
//    res.send(registeredUser);
// });


app.use(cookieParser("secretcode"));
app.get("/getsignedcookie",(req,res)=>{
    res.cookie("made-in","india",{signed:true});
    res.send("signed cookie sent");
});


app.get("/verify",(req,res)=>{
    console.log(req.signedCookies);
    res.send("verified");
});




main()
.then(()=>{
    console.log("database connected");
})
.catch((err)=>{
    console.log(err);
});

async function  main(){
    await mongoose.connect(dbUrl);
}

mongoose.connect(process.env.ATLASDB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB connected");
})
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
});


// app.get("/testListing",async (req,res)=>{
//     let sampleListing=new Listing({
//         title:"My New Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute,Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     // console.log(sampleListing.title);
//     console.log("sample was saved");
//     res.send("successful testing");
// });

// Error Handling

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.all(/.*/,(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong"}=err;
    // res.status(statusCode).send(message);
    // res.send("something went wrong!");
    // res.render("error.ejs",{err});
    res.status(statusCode).render("error.ejs",{message});
});



// listen
app.listen(8080,()=>{
    console.log("server is running on port 8080");
});



