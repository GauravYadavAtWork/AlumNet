//importing all the necessary modules
import express from "express"
import mongoose from "mongoose";
import bodyParser from "body-parser"
import session from "express-session";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
dotenv.config();


const port = 3000;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


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
    Password: String,
    Email: String,
    Name: String,
    Branch: String,
    PassingYear: Number,
    FirstName: String,
    LastName: String,
    Gender:String,
    Branch:String,
    Mobile:Number,
    X_BOARD:String,
    XII_BOARD:String,
    X_PERCENT:String,
    XII_PERCENT:String,
    COMPANY_1:String,
    COMPANY_2:String,
    COMPANY_3:String,
    COMPANY_4:String,
    COMPANY_5:String,
    PACKAGE_1:String,
    PACKAGE_2:String,
    PACKAGE_3:String,
    PACKAGE_4:String,
    PACKAGE_5:String,
    image: {
        data: Buffer,
        contentType: String,
      }
} ,{ collection: 'aluminidetail1s' });



//making mongoose model
const userDetails = new mongoose.model("aluminidetail1s", aluminiSchema);

// const user = new userDetails({           //some test users added for testing purpose
//     _id: 1002,
//     Name: "testUser2",
//     Branch: "testBranch2",
//     PassingYear: 2023,
//     FirstName: "test3",
//     LastName: "user3",
//     Password: "as",
//     Email:"aaa684617@gmail.com",
//     Mobile:1234567890,
//     Gender:"Male",
//     College:"PSIT",
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
                if (user[0].Email != (req.body.Email)) {
                    res.render("nRegisterPage.ejs", {
                        message: "Incorrect Aadhar"
                    });
                } else {
                    req.session.createPasswordUser = user[0].Email;
                    req.session.createPasswordUser_Id = user[0]._id;
                    console.log("password change/generate attempt " + user[0].Name);
                    res.render("nVerifyEmail.ejs", {
                        message: "",
                        email: req.session.createPasswordUser
                    });
                }
            }
        })
});


//sending verifcation mail to the given user
// Nodemailer configuration (replace with your email provider's SMTP settings)
const transporter = nodemailer.createTransport({
    service: 'Gmail', // e.g., 'Gmail', 'Yahoo', etc.
    auth: {
        user: process.env.EMAILID,
        pass: process.env.PASSWORD,
    },
});

// Store generated random numbers and email addresses for verification
const emailVerificationTokens = new Map();
// Handle email submission and send a verification email with a random number
var verificationtoken;
app.post('/mailVerify', (req, res) => {
    const email = req.body.Email;
    req.session.email = email;

    // Generate a 6-digit random verification token
    const verificationToken = Math.floor(100000 + Math.random() * 900000);
    verificationtoken = verificationToken;

    // Store the random number with the associated email address
    emailVerificationTokens.set(email, verificationToken);

    // Send the verification email
    const mailOptions = {
        from: process.env.EMAILID,
        to: email,
        subject: 'Welcome to AlumNet - Email Verification',
        html: `
            <html>
            <head>
                <style>
                    /* Add your custom styles here */
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f2f2f2;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-collapse: collapse;
                    }
                    .header {
                        padding: 20px 0;
                        text-align: center;
                        background-color: #007BFF;
                        color: #ffffff;
                    }
                    .content {
                        padding: 20px;
                    }
                    .footer {
                        padding: 10px 0;
                        text-align: center;
                        background-color: #007BFF;
                        color: #ffffff;
                    }
                    h1 {
                        font-size: 24px;
                        margin: 0;
                    }
                    h2 {
                        font-size: 18px;
                        margin: 0;
                    }
                    p {
                        font-size: 16px;
                        line-height: 1.5;
                        margin: 20px 0;
                    }
                    a {
                        color: #007BFF;
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <table class="container" role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <!-- Header -->
                    <tr>
                        <td class="header">
                            <h1>AlumNet</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td class="content">
                            <h2>Welcome to AlumNet</h2>
                            <p>Thank you for registering with AlumNet. To complete your registration, please verify your email by entering the code below:</p>
                            <p>Your Verification Code: <strong style="color: #007BFF;">${verificationToken}</strong></p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td class="footer">
                            <p>&copy; ${new Date().getFullYear()} AlumNet. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
    };

    // Send the email with the customized content
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.redirect("/resendMail");
            res.status(500);

        } else {
            console.log('Email sent:', info.response);
            res.render("OTP.ejs", {
                expectedOTP: verificationtoken
            });
        }
    });
});

app.get('/resendMail', (req, res) => {
    const email = req.session.email;
    const customMessage = req.session.customMessage;

    // Generate a 6-digit random verification token
    const verificationToken = Math.floor(100000 + Math.random() * 900000);
    verificationtoken = verificationToken;

    // Store the random number with the associated email address
    emailVerificationTokens.set(email, verificationToken);

    // Send the verification email
    const mailOptions = {
        from: process.env.EMAILID,
        to: email,
        subject: 'Welcome to AlumNet - Email Verification',
        html: `
            <html>
            <head>
                <style>
                    /* Add your custom styles here */
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f2f2f2;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-collapse: collapse;
                    }
                    .header {
                        padding: 20px 0;
                        text-align: center;
                        background-color: #007BFF;
                        color: #ffffff;
                    }
                    .content {
                        padding: 20px;
                    }
                    .footer {
                        padding: 20px 0;
                        text-align: center;
                        background-color: #007BFF;
                        color: #ffffff;
                    }
                    h1 {
                        font-size: 24px;
                        margin: 0;
                    }
                    h2 {
                        font-size: 18px;
                        margin: 0;
                    }
                    p {
                        font-size: 16px;
                        line-height: 1.5;
                        margin: 20px 0;
                    }
                    a {
                        color: #007BFF;
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <table class="container" role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <!-- Header -->
                    <tr>
                        <td class="header">
                            <h1>AlumNet</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td class="content">
                            <h2>Welcome to AlumNet</h2>
                            <p>Thank you for registering with AlumNet. To complete your registration, please verify your email by entering the code below:</p>
                            <p>Your Verification Code: <strong style="color: #007BFF;">${verificationToken}</strong></p>
                            <p>Click the following link to verify your email: <a href="http://localhost:3000/verify/${verificationToken}">Verify Email</a></p>
                            <p>Your Custom Message: <strong style="color: #007BFF;">${customMessage}</strong></p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td class="footer">
                            <p>&copy; ${new Date().getFullYear()} AlumNet. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
    };

    // Send the email with the customized content
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.redirect("/hehe");
        } else {
            console.log('Email sent:', info.response);
            res.render("OTP.ejs", {
                expectedOTP: verificationtoken
            });
        }
    });
});

app.get("/verified/newPassword", (req, res) => {
    const email = Array.from(emailVerificationTokens.keys()).find(
        (key) => emailVerificationTokens.get(key) === parseInt(verificationtoken)
    );
    if (email) {
        // Remove the email and token from the map to prevent reuse
        emailVerificationTokens.delete(email);
        res.render("nSetPassword.ejs", {
            message: ""
        });
    } else {
        res.send('Invalid verification token or token expired. Email not verified.');
    }
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
                if (user[0].Email != (req.body.Email)) {
                    res.render("nForgetPassword.ejs", {
                        message: "Incorrect Aadhar"
                    });
                } else {
                    req.session.createPasswordUser_Id = user[0]._id;
                    req.session.createPasswordUser = user[0].Email;
                    console.log("password change/generate attempt " + user[0].Name);
                    res.render("nVerifyEmail.ejs", {
                        message: "",
                        email: req.session.createPasswordUser
                    });
                }
            }
        })
});

//handling post requests for generating new passwords
app.post("/generatePassword", (req, res) => {
    if (req.body.newPassword == req.body.confirmNewPassword) {
        userDetails.updateOne({ _id: req.session.createPasswordUser_Id }, { Password: req.body.newPassword })
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
app.get('/account/profile', (req, res) => {
    if(req.session.isAuthorised){
        userDetails.findOne({ _id: req.session.userId })
            .then((aluminiData) => {
                // console.log(aluminiData.Name);
                if (aluminiData && aluminiData.image && aluminiData.image.data) {
                    res.render('profile.ejs', { aluminiData });
                } else {
                    res.render('profile.ejs', { aluminiData });
                }
            })
            .catch((error) => {
                // Log the error to the console
                console.error(error);
    
                // Send a 500 Internal Server Error response with an error message
                res.status(500).send('Internal Server Error: Unable to retrieve user data');
            });

    }else{
        res.redirect("/login");
    }
});

app.use('/images', express.static(path.join(__dirname, 'images')));

// handeling client profile page
app.get("/uploadimg", (req, res) => {
    if (req.session.isAuthorised) {
        userDetails.find({ _id: req.session.userId })
            .then(details => {
                // console.log(details[0].Name)
                res.render("uploadProfilepic.ejs", {
                    
                });
            })
            .catch(err => {
                console.log(err);
            })
    } else {
        res.redirect("/login");
    }
});


// const iupload = multer({ dest: 'uploads/' });
const iupload = multer({ dest: 'uploads/' });
app.post('/submit', iupload.single('image'), async (req, res) => {
    const userId = req.session.userId;

    try {
        const existingData = await userDetails.findOne({ _id: userId });

        if (existingData) {
            // Document with the same _id (userId) already exists, update it
            existingData.image.data = fs.readFileSync(req.file.path);
            existingData.image.contentType = req.file.mimetype;
            await existingData.save();
            console.log("profile image saved to the database by "+userId);
            // Delete the image file from the "uploads" folder
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        } else {
            // Create a new document
            const newData = new userDetails({
                _id: userId,
                image: {
                    data: fs.readFileSync(req.file.path),
                    contentType: req.file.mimetype,
                },
            });
            await newData.save();
        }

        res.redirect("/account/profile");
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




// handeling user Contact Info route
app.get("/userContact", (req, res) => {
    if (req.session.isAuthorised) {
        userDetails.find({ _id: req.session.userId })
            .then(details => {
                // console.log(details[0].Name)
                // console.log(details);
                // console.log(details[0].Gender);
                res.render("userContactInfo.ejs", {
                    array: details
                });
            })
            .catch(err => {
                console.log(err);
            })
    } else {
        res.redirect("/login");
    }
});
// handeling user Contact post Info route
app.post("/userContact", (req, res) => {
    if (req.session.isAuthorised) {
        userDetails.updateOne({ _id: req.session.userId }, {Mobile:req.body.Mobile, Email: req.body.Email})
            .then(()=> {
                res.redirect("/userContact");
            })
            .catch(err => {
                console.log(err);
            })
    } else {
        res.redirect("/login");
    }
});

//handling upload job get requets
app.get("/uploadJob",(req,res)=>{
    if(req.session.isAuthorised){
        res.render("postjob.ejs");
    }else{
        res.redirect("/login");
    }
});


//handling jobDetails get requests
app.get("/jobDetails",(req,res)=>{
    if(req.session.isAuthorised){
        userDetails.find({ _id: req.session.userId })
            .then(details => {
                // console.log(details[0].Name)
                // console.log(details);
                // console.log(details[0].Gender);
                res.render("jobDetails.ejs", {
                    array: details
                });
            })
            .catch(err => {
                console.log(err);
            })
    }else{
        res.redirect("/login");
    }
});
//handling job details update request
app.post("/jobDetails", (req, res) => {
    if (req.session.isAuthorised) {
        userDetails.updateOne({ _id: req.session.userId },
             {COMPANY_1:req.body.COMPANY_1,
                COMPANY_2:req.body.COMPANY_2,
                COMPANY_3:req.body.COMPANY_3,
                COMPANY_4:req.body.COMPANY_4,
                COMPANY_5:req.body.COMPANY_5, 
                PACKAGE_1:req.body.PACKAGE_1,
                PACKAGE_2:req.body.PACKAGE_2,
                PACKAGE_3:req.body.PACKAGE_3,
                PACKAGE_4:req.body.PACKAGE_4,
                PACKAGE_5:req.body.PACKAGE_5
            })
            .then(()=> {
                res.redirect("/jobDetails");
            })
            .catch(err => {
                console.log(err);
            })
    } else {
        res.redirect("/login");
    }
});

// handeling notice board request

const storage = multer.memoryStorage();
const upload = multer({ storage });

const Document = mongoose.model('Document', {
    name: String,
    data: Buffer,
});

app.get("/noticeBoard", (req,res)=> {
    if(req.session.isAuthorised){
        Document.find()
        .then((documents) => {
            res.render('noticeBoard.ejs', { documents });
        })
        .catch((error) => {
            console.error('Error fetching documents:', error);
            res.status(500).send('Error fetching documents.');
        });
    }
    else{
        res.redirect("/login");
    }
});

app.get('/download/:id', (req, res) => {
    const documentId = req.params.id;

    Document.findById(documentId)
        .then((document) => {
            if (!document) {
                return res.status(404).send('Document not found.');
            }

            res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);
            res.setHeader('Content-Type', 'application/octet-stream');
            res.send(document.data);
        })
        .catch((error) => {
            console.error('Error fetching document:', error);
            res.status(500).send('Error fetching document.');
        });
});

//handling the gallery page
app.get("/gallery", (req, res) => {
    if(req.session.isAuthorised){
        res.render("gallery");
    } else {
        res.redirect("/login");
    }
});




app.get("/logout", (req, res) => {
    // Destroy the session and redirect to the login page
    req.session.isAuthorised=false;
    req.session.destroy(err => {
        if (err) {
            console.error(err);
        }
        res.redirect("/login");
    });
});



//listening on conventional port
app.listen(port, () => {
    console.log(`Server Started On Port ${port}`);
});

