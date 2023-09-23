//importing all the necessary modules
import express from "express"
import mongoose from "mongoose";
import bodyParser from "body-parser"
import session from "express-session";


const port = 3000;
const app = express();

// creating roll no. variable for creating profile

let rollNo;

//middlewares
app.use(bodyParser.urlencoded({ extended: true }));  //including bodyparser
app.use(express.static("public"));   //including static files
app.use(
    session({
        secret: 'your_secret_key', // Change this to a strong, unique secret key
        resave: false,
        saveUninitialized: false,
    })
);
app.set("view engine", "ejs");

//connecting to the database
mongoose.connect("mongodb+srv://alumnetpsit:lChuqrU4FUCmSRuT@cluster0.xzif614.mongodb.net/AluminiDB", { useNewUrlParser: true });


//making a schema
const aluminiSchema = new mongoose.Schema({
    _id: Number,
    Aadhaar: Number,
    Password: String,
    Name: String,
    Branch: String,
    PassingYear: Number,
    FirstName: String,
    LastName: String
});


//making mongoose model
const userDetails = new mongoose.model("aluminidetail", aluminiSchema);

// const user = new userDetails({           //some test users added for testing purpose
//     _id: 1003,
//     Aadhaar: 5003,
//     Name: "testUser3",
//     Branch: "testBranch3",
//     PassingYear: 2026,
//     FirstName: "test3",
//     LastName: "user3",
//     Password: "as"
// });
// user.save();

//handling get request of homepage
app.get("/", (req, res) => {
    res.render("index.ejs");
});

//handling get request of getStartedPage
app.get("/getStarted", (req, res) => {
    res.render("getStartedPage.ejs");
});

//handling get Request of Login Page
app.get("/login", (req, res) => {
    res.render("nLoginPage.ejs", {
        message: ""
    });
});

//handling post requests for login
app.post("/login", (req, res) => {
    rollNo = req.body.rollNo;
    userDetails.find({ _id: parseInt((req.body.rollNo).trim()) })
        .then(user => {
            if (user.length === 0) {
                res.render("nLoginPage.ejs", {
                    message: "UnIdentified User"
                });
            } else {
                if (user[0].Password !== (req.body.password)) {
                    res.render("nLoginPage.ejs", {
                        message: "Invalid Password"
                    });
                } else {
                    req.session.isAuthorised = true;
                    req.session.userId = user[0]._id;
                    console.log(req.body.rollNo + " user logged in.");
                    res.redirect("/account");
                }
            }
        })
});

//handling fgtpage get requests
app.get("/fgtPassword", (req, res) => {
    res.render("nForgetPassword.ejs", {
        message: ""
    });
});

//handling get request for register Page
app.get("/register", (req, res) => {
    res.render("nRegisterPage.ejs", {
        message: ""
    });
});
//handling register post requests
app.post("/register", (req, res) => {
    userDetails.find({ _id: parseInt(req.body.rollNo) })
        .then(user => {
            if (user.length === 0) {
                res.render("nRegisterPage.ejs", {
                    message: "UnAuthorized User"
                });
            } else {
                if (user[0].Aadhaar != (req.body.Aadhaar)) {
                    res.render("nRegisterPage.ejs", {
                        message: "Incorrect Aadhar"
                    });
                } else {
                    req.session.createPasswordUser = user[0]._id;
                    console.log("password change/generate attempt " + user[0].Name);
                    res.render("nSetPassword.ejs", {
                        message: ""
                    });
                }
            }
        })
});
//handling forget password post requests
app.post("/fgtPassword", (req, res) => {
    userDetails.find({ _id: parseInt(req.body.rollNo) })
        .then(user => {
            if (user.length === 0) {
                res.render("nForgetPassword.ejs", {
                    message: "UnAuthorized User"
                });
            } else {
                if (user[0].Aadhaar != (req.body.Aadhaar)) {
                    res.render("nForgetPassword.ejs", {
                        message: "Incorrect Aadhar"
                    });
                } else {
                    req.session.createPasswordUser = user[0]._id;
                    console.log("password change/generate attempt " + user[0].Name);
                    res.render("nSetPassword.ejs", {
                        message: ""
                    });
                }
            }
        })
});

//handling post requests for generating new passwords
app.post("/generatePassword", (req, res) => {
    if (req.body.newPassword == req.body.confirmNewPassword) {
        userDetails.updateOne({ _id: req.session.createPasswordUser }, { Password: req.body.newPassword })
            .then(res => {
                console.log("New password generated by user " + req.session.createPasswordUser);
            })
            .catch(err => {
                console.log(err);
                console.log("password generation failed")
            })
        res.redirect("/login");
    } else {
        res.render("nSetPassword.ejs", {
            message: "Please enter password verification correctly"
        })
    }
});


//handling get request for main account page, 
app.get("/account", (req, res) => {
    if (req.session.isAuthorised) {        //checking authorisation of the user
        res.render("main.ejs", {
            id: req.session.userId
        });
    } else {
        res.redirect("/login");
    }
});

// handeling client profile page
app.get("/account/profile", (req,res)=>{
    userDetails.find({_id:rollNo})
    .then(details=>{
        console.log(details[0].Name)
        res.render("profile.ejs",{
        array : details
        });
    })
    .catch(err=>{
        console.log(err);
    })
});

//listening on conventional port
app.listen(port, () => {
    console.log(`Server Started On Port ${port}`);
});

