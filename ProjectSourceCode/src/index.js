// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const pgp = require('pg-promise')();
const axios = require('axios');
const {OAuth2Client} = require('google-auth-library');
const fileupload = require('express-fileupload');
const fs = require('fs');
const { EventEmitterAsyncResource } = require('events');
const e = require('express');

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'db', // the database server
  port: process.env.POSTGRES_PORT || 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('DATABASE ERROR:', error.message || error);
  });

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});


const gClient = new OAuth2Client();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json({limit:'10mb'})); // specify the usage of JSON for parsing request body.
app.use(express.urlencoded({ extended: true }));
app.use(fileupload());
app.use(express.static('public'));
// app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/uploads', express.static(path.join(__dirname,'..', 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname,'..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// initialize session object
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '10mb'
  })
);

app.use('/resources', express.static(path.join(__dirname, 'resources')));

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// TODO - Include your API routes here

app.get('/', (req, res) => {
    res.render('pages/home')
});

app.get('/register', (req, res) => {
  res.render('pages/register')
});

/*
POST /register
Expects the following request body:
{
  password: string,  // plain text password
  email: string,
  type: string, // one of {student, tutor}
  name: string,
  degree: string,
  year: string, // one of {freshmen, sophomore, senior, grad}
  bio: string,
  classes: string[], // from {math, history, compsci, engineering, business}
  learning: string // one of {visual, auditory, hands, writing}
}
*/
app.post('/register', async (req, res) => {

  // check if user is registering with Google
  const gUser = req.session.gUser;

  // validate request body

  console.log(gUser);

  let registerInfo = {
    password: gUser ? 'N/A' : req.body.password,
    email: gUser ? gUser.email : req.body.email,
    type: req.body.type,
    name: gUser ? gUser.name : req.body.name,
    degree: req.body.degree,
    year: req.body.year,
    bio: req.body.bio,
    classes: req.body.classes,
    learning: req.body.learning,
  };
  // Handle profile image
    let profileImagePath = '/uploads/default.jpg';
    if (req.files && req.files.profileimagedata) {
      const image = req.files.profileimagedata;
      const fileName = Date.now() + '-' + image.name;
      const savePath = path.join(uploadsDir, fileName);
      await image.mv(savePath);
      // profileImagePath = '/uploads/' + fileName;
      profileImagePath = '/uploads/' + encodeURI(fileName);
    }
  // ensure all arguments are present
  for(let arg in registerInfo) {
    if(!registerInfo[arg]) {
      res.status(400).send(`argument "${arg}" is required`);
      res.render('pages/register', {message: [{ text: `argument "${arg}" is required`, level: 'danger'}]});
      return;
    }
  }

  // validate email
  const emailEx = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  if(!emailEx.test(registerInfo.email)) {
    res.status(400).send('invalid email');
    return;
  }

  // validate type
  if(typeof registerInfo.type !== 'string') {
    res.status(400).send('argument "type" must be a string');
    return;
  }
  switch (registerInfo.type.toLowerCase()) {
    case "student":
    case "tutor":
      break;
    default:
      res.status(400).send('argument "type" must be "student" or "tutor"');
      return;
  }

  // validate name
  if(typeof registerInfo.name !== 'string') {
    res.status(400).send('argument "name" must be a string');
    return;
  }
  if(registerInfo.name.length > 50) {
    res.status(400).send('argument "name" is too long (max 50)');
    return;
  }

  // validate degree
  if(typeof registerInfo.degree !== 'string') {
    res.status(400).send('argument "degree" must be a string');
    return;
  }
  if(registerInfo.degree.length > 50) {
    res.status(400).send('argument "degree" is too long (max 50)');
    return;
  }

  // validate year
  if(typeof registerInfo.year !== 'string') {
    res.status(400).send('argument "year" must be a string');
    return;
  }
  switch (registerInfo.year.toLowerCase()) {
    case "freshman":
    case "sophomore":
    case "senior":
    case "grad":
      break;
    default:
      res.status(400).send('argument "year" must one of {"freshman", "sophomore", "senior", "grad"}');
      return;
  }

  // validate bio
  if(typeof registerInfo.bio !== 'string') {
    res.status(400).send('argument "bio" must be a string');
    return;
  }
  if(registerInfo.bio.length > 200) {
    res.status(400).send('argument "bio" is too long (max 200)');
    return;
  }

  // validate classes by comparing to the DB
  
  // if only one class was selected, wrap it in an array
  if(typeof registerInfo.classes === 'string') {
    registerInfo.classes = [registerInfo.classes];
  }

  const classIdQuery = 'SELECT Id FROM Classes WHERE Name = $1';
  let classIds = [];
  for(let c of registerInfo.classes) {
    if(typeof c !== 'string') {
      res.status(400).send('argument "classes" must be an array of only strings');
      return;
    }
    try {
      const classId = await db.oneOrNone(classIdQuery, c.toLowerCase())
      if(classId === null) {
        res.status(400).send('invalid class name');
        return;
      }
      classIds.push(classId.id);
    } catch (error) {
      res.render('pages/register', {message: [{ text: 'The server ran into an error!', level: 'danger'}]});
      return;
    }
  }
  registerInfo.classes = classIds;

  // validate learning styles by comparing to the DB
  if(typeof registerInfo.learning !== 'string') {
    res.status(400).send('argument "learning" must be a string');
    return;
  }
  const styleIdQuery = 'SELECT Id FROM LearningStyles WHERE Name = $1';
  try {
    const styleId = await db.oneOrNone(styleIdQuery, registerInfo.learning.toLowerCase());
    if(styleId === null) {
      res.status(400).send('invalid learning style');
      return;
    }
    registerInfo.learning = styleId.id;
  } catch (error) {
    res.render('pages/register', {message: [{ text: 'The server ran into an error!', level: 'danger'}]});
    return;
  }

  // ensure that the email doesn't already exists
  try {
    const emailQuery = 'SELECT Id FROM Users WHERE Email = $1';
    const emailResult = await db.manyOrNone(emailQuery, registerInfo.email);

    if (emailResult.length > 0) {
      res.render('pages/register', {message: [{ text: 'An account is already registered with this email', level: 'danger'}]});
      return;
    }
  } catch (error) {
    console.log(`Server encountered error during email check: ${error}`);
    res.render('pages/register', {message: [{ text: 'The server ran into an error!', level: 'danger'}]});
    return;
  }

  // insert the user data into the db
  try {
    // Make this a SQL transaction so that if any part fails, the whole transaction fails
    await db.tx(async t => {
      // hash the password using bcrypt library
      const passwordHash = gUser ? null : await bcrypt.hash(registerInfo.password, 10);
      
      const insertUserQuery = 'INSERT INTO Users (Password, Email, UserType, Name, Degree, Year, Bio, LearningStyle, Profileimage, GoogleId) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';

      await t.none(insertUserQuery, [
        passwordHash,
        registerInfo.email,
        registerInfo.type,
        registerInfo.name,
        registerInfo.degree,
        registerInfo.year,
        registerInfo.bio,
        registerInfo.learning,
        profileImagePath,
        gUser ? gUser.gid : null
      ]);
  
      // get the userId for the user we just created
      const userIdQuery = 'SELECT Id FROM Users WHERE Email = $1';
      const userId = await t.one(userIdQuery, registerInfo.email);
  
      // insert the class to user mappings
      const insertClassesToUsersQuery = 'INSERT INTO ClassesToUsers (ClassId, UserId) VALUES ($1, $2)';
      for(let classId of registerInfo.classes) {
        await t.none(insertClassesToUsersQuery, [classId, userId.id]);
      }
    });

    // Successful register, redirect the user to the login page
    sendEmail(registerInfo.email, "Tudr Account Created!", `Welcome to Tudr ${registerInfo.name}!`);
    res.redirect('/login');
  } catch (error) {
    // handle any errors
    console.log('Server encountered error during register:');
    console.log(error.stack);
    res.render('pages/register', {message: [{ text: 'The server ran into an error!', level: 'danger'}]});
    return;
  }
});

app.get('/login', (req, res) => {
  res.render('pages/login')
});

/*
POST /login
Expects the following request body:
{
  username: string, // plain text username (case INSENSITIVE)
  password: string  // plain text password
}
*/

async function loginUser(req, user) {
  req.session.user = user;
  await req.session.save();
}

app.post('/login', async (req, res) => {
  const userQuery = 'SELECT * FROM Users WHERE Email = $1';
  
  try {
    const email = req.body.email.toLowerCase();
// changed login route to not have nested if statements and work with tests better
    if(!email){
      console.log("missing email");
      return res.status(400).json({message: 'missing argument: email'});
    }
    const user = await db.oneOrNone(userQuery, email);
    if (!user){
      console.log("User Not Found");
      res.render('pages/login', {message: [{ text: 'Incorrect email or password', level: 'danger'}]});
      return;
    }

    // Google users must use the Sign in with Google button
    if(user.googleid) {
      console.log("User is a Google User");
      res.render('pages/login', {message: [{ text: 'Please Sign In with Google', level: 'warning'}]});
      return;
    }

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match){
      console.log('Invalid Password');
      res.render('pages/login', {message: [{ text: 'Incorrect email or password', level: 'danger'}]});
      return;
    }
    
    await loginUser(req, user);

    if (req.headers.accept && req.headers.accept.includes("text/html")){
      //sendEmail(email, "Tudr Account Login!", `Welcome back to Tudr ${user.name}!`);
      return res.redirect('/profile');
    }
    return res.status(200).json({message: "Login Successfull"});
  } catch (error) {
    console.log('Server encountered error during login:');
    console.log(error.stack);
    res.render('pages/login', {message: [{ text: 'The server ran into an error!', level: 'danger'}]});
    return;
  }
});

function decodeJwtResponse(token) {
  let base64Url = token.split('.')[1];
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

app.post('/glogin', async (req, res) => {

  if(!req.body.credential) {
    res.status(400).send('No credential in request');
    return;
  }

  // Decode the credential
  const payload = decodeJwtResponse(req.body.credential);
  const userData = {
    'gid': payload.sub,
    'email': payload.email,
    'name': payload.name
  };

  // Validate the data
  for(let param in userData) {
    if(!userData[param]) {
      res.status(400).send('Malformed JWT credential');
      return;
    }
  }

  const gIdQuery = 'SELECT * FROM Users WHERE GoogleId = $1';
  try {
    let user = await db.oneOrNone(gIdQuery, [userData.gid]);
    if(user) {
      await loginUser(req, user);
      //sendEmail(user.email, "Tudr Account Created!", "Welcome to Tudr!");
      res.send(JSON.stringify({redirect: '/profile'}));
      return;
    }
    
    // Save the google account data to be passed to the register page
    req.session.gUser = userData;
    req.session.save();

    res.send(JSON.stringify({redirect: '/gregister'}));
    return;
  } catch (error) {
    res.status(500).send('The server ran into an error while fetching Google User');
  }
});

app.get('/gregister', (req, res) => {
  
  // redirect to normal register if there is no gUser object
  if(!req.session.gUser) {
    res.redirect('/register');
    return;
  }

  let gUser = req.session.gUser;
  res.render('pages/register', {email: gUser.email, name: gUser.name});

});

// Authentication middleware
app.use((req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
});

// All routes that require login below

app.get('/profile', async(req, res) => {
  const useremail = req.session.user.email;
  console.log(req.session.user.email);
  const userID = req.session.user.id;
  const userData = await db.one(
    `SELECT LearningStyle, UserType, Degree
    FROM users
    WHERE Id = $1`,
    [userID]
  );

  const potentials = await db.any(
    `SELECT Id, Name, Degree, Year, Bio, LearningStyle 
    FROM users 
    WHERE LearningStyle = $1
      AND UserType != $2
      AND Degree = $3
      AND Id IN (
        SELECT TutorID FROM MatchedUsers WHERE UserID = $4
      )`,
    [userData.learningstyle, userData.usertype, userData.degree, userID]
  );

  // start with initial index
  const index = parseInt(req.params.index) || 0;
  const match = potentials[index];

  const allMatches = await db.any(
    `SELECT u.Id, u.Name, u.Degree, u.Year, u.Bio, u.LearningStyle, u.Profileimage
     FROM users u
     INNER JOIN MatchedUsers m ON u.Id = m.TutorID
     WHERE m.UserID = $1 AND m.Action = 'like'`,
    [userID]
  );
  const potentialmatches = await db.any(
    `SELECT u.Id, u.Name, u.Degree, u.Year, u.Bio, u.LearningStyle, u.Profileimage
     FROM users u
     WHERE u.Id != $1
       AND u.UserType != $2
       AND u.Degree = $3
       AND u.LearningStyle = $4
       AND u.Id NOT IN (
         SELECT TutorID FROM MatchedUsers WHERE UserID = $1
       ) LIMIT 3`,
    [userID, userData.usertype, userData.degree, userData.learningstyle]
  );  

  if(!useremail)
  {
    console.log('A user session has been corrupted: ');
    console.log(user);
    res.redirect('/login');
    return;
  }
  const query = `
  SELECT u.Id as userid, u.Name AS username, u.Bio, ls.Name as LearningStyle, array_agg(c.Name) AS classnames 
  FROM Users u 
    JOIN LearningStyles ls ON u.LearningStyle = ls.Id
    LEFT JOIN ClassesToUsers ctu ON ctu.UserId = u.Id
    LEFT JOIN Classes c ON c.Id = ctu.ClassId
    WHERE u.email = $1
      GROUP BY u.id, u.Name, u.Bio, ls.Name
  `;
  try{
    const result = await db.one(query, [useremail])
    console.log(result);
    res.render('pages/profile', {
      //i think this is where im having trouble reading in
      userID: result.userid, name: result.username, bio: result.bio, learningstyle: result.learningstyle, classes: result.classnames, profileimage: result.profileimage, allMatches: allMatches, potentialmatches: potentialmatches
    })
  }
  catch(error){
    console.error("error loading profile:", error)
    res.render('pages/profile', {message: [{ text: 'The server ran into an error!', level: 'danger'}]});
    return;
  }
});

app.get('/calendar/reset', async(req, res) => {
  const query = `SELECT EventID FROM UsersToEvents WHERE UserId = $1`;
  const query2 = `DELETE FROM Events WHERE EventId = $1`;
  console.log("Deleting");
  try{
    const eventIds = await db.manyOrNone(query, req.query.userID);
    for(let e of eventIds){
      console.log(e);
      await db.none(query2, e.eventid);
    }
    console.log("Done Deleting");
    return res.status(200).send("Done Deleting");
  } catch (error){
    console.log("ERROR: ", error);
  }
})

app.get('/calendar/events', async(req, res) => {
  console.log("Gathering user event information");
  const eventIDQuery = `SELECT EventId FROM UsersToEvents WHERE UserId = $1`;
  let eventsInfo = [];
  const eventInfoQuery = `SELECT e.EventId as id, e.EventName as title, e.EventDay as day, e.EventDescription as description, et.TypeName as type,
                          e.EventStartTime as start, e.EventEndTime as end, ef.FormatName as format 
                          FROM Events e 
                          JOIN EventFormats ef ON e.EventFormat = ef.FormatID
                          JOIN EventTypes et ON e.EventType = et.TypeID
                          WHERE e.EventId = $1`;
  try{
    const eventIds = await db.manyOrNone(eventIDQuery, req.query.userID);
    console.log(eventIds);
    for(let e of eventIds){
      const event = await db.oneOrNone(eventInfoQuery, e.eventid)
      if(!event){
        console.log(`Event not found for ID: ${e.eventid}`);
        continue;
      }
      else{
        let formatted_event = {
          title: event.title,
          daysOfWeek: [event.day],
          description: event.description,
          startTime: event.start,
          endTime: event.end,
          type: event.type,
          id: event.id,
          format: event.format
        }
        eventsInfo.push(formatted_event);
      }
    }
    console.log('GET', eventsInfo);
    return res.json(eventsInfo);
  } catch(error){
    console.log("Error accessing user events calendar: ", error);
    return res.status(500).json({message: "Server Error"});
  }
});

app.post('/calendar/updateAvailability', async (req, res) => {
  console.log("post method");
  const query = `INSERT INTO EVENTS (EventName, EventType, EventDay, EventStartTime, EventEndTime, EventFormat)
                  VALUES ($1, $2, $3, $4, $5, $6)
                  RETURNING EventId`;
  let userID = req.body.userid;
  console.log(userID);
  let eventName = req.body.name;
  let eventType = req.body.type;
  let eventDay = req.body.day;
  let eventStartTime = req.body.startTime;
  let eventEndTime = req.body.endTime;

  //insert checks
  let eventFormat = null;
  if(req.body.format){
    eventFormat=req.body.format;
  }
  else{
    eventFormat=3;
  }
  try{
    const result = await db.one(query, [eventName, eventType, eventDay, eventStartTime, eventEndTime, eventFormat]);
    console.log(result);
    const query1 = `INSERT INTO UsersToEvents (UserID, EventID)
                    VALUES ($1, $2)
                    RETURNING UserID, EventID`;
    const result1 = await db.manyOrNone(query1, [userID, result.eventid]);
    console.log("result: ", result1);
    res.send(200);
    return;
  } catch(error){
    console.error('Error: ', error);
  }
});

/**
 * Logout API
 */
app.get('/logout', (req, res) => {
  req.session.destroy(function(err) {
    res.render('pages/logout');
  });
});


app.get('/matching', (req, res) => {
  res.redirect('/matching/0');
});

app.get('/matching/:index?', async (req, res) => {
  try{
    //get the user id
    const userID=req.session.user.id;

    //check if user id exists
    if(!userID){
      return res.redirect ('/login');
    }

    //get user data based on user id
    const userData = await db.one(
      `SELECT LearningStyle, UserType, Degree
      FROM users
      Where Id =$1`,
      [userID]
    );

    console.log(userData);
    //find potential tutor matches based on Learning Style, the opposte User Type, and Degree
    //Could change to classes via "classes" table when fully implemented
    const potentials = await db.any(
      `SELECT Id, Name, Degree, Year, Bio, LearningStyle 
      FROM users 
      WHERE LearningStyle =$1
      AND UserType!=$2
      AND Degree=$3
      AND Id NOT IN (
        SELECT TutorID FROM MatchedUsers WHERE UserID = $4
      )`,
    [userData.learningstyle, userData.usertype, userData.degree, userID]
    );

    

    //start with initial index
    const index = parseInt(req.params.index) || 0;
    const match = potentials[index];

    /*const styleMap = {
      1: 'Visual',
      2: 'Auditory',
      3: 'Hands-on',
      4: 'Writing'
    };
    
      match.learningstyle = styleMap[match.learningstyle] || 'Unknown';*/
    console.log(potentials);
    //check if match exists
    //if no matches, send to login redirect page
    if (!match) {
      return res.render('pages/matching', {
        noMatches: true
      });
    }
    console.log(potentials);
    //if matches, start rendering by index
    res.render('pages/matching', {
      match,
      nextIndex: index + 1
    });
  } catch (err){ //in case of database error
    console.error('DB error:', err);
    res.render('pages/matching', {message: [{ text: 'The server ran into an error!', level: 'danger'}]});
    return;
  }
});

//When like button clicked, add to matched users
app.post('/like', async (req, res) => {
  try {
    const userID = req.session.user.id;
    const tutorID = req.body.tutorID;
    const nextIndex = req.body.nextIndex;

    if (!userID || !tutorID) {
      console.error('Missing userID or tutorID');
      return res.status(400).send('Missing data');
    }

    // Check if the match already exists
    const existingMatch = await db.query(
      'SELECT * FROM MatchedUsers WHERE TutorID = $1 AND UserID = $2',
      [tutorID, userID]
    );

    if (existingMatch.length > 0) {
      console.log(`Match already exists: UserID ${userID} and TutorID ${tutorID}`);
    } else {
      // Insert new match
      await db.query(
        'INSERT INTO MatchedUsers (TutorID, UserID, Action) VALUES ($1, $2, $3)',
        [tutorID, userID, 'like']
      );
      console.log(`New match stored: UserID ${userID} liked TutorID ${tutorID}`);
    }

    // Log current matches
    const allMatches = await db.query('SELECT * FROM MatchedUsers');
    console.log('Current MatchedUsers:', allMatches);

    //tutor email
    const tutorData = await db.one(
      `SELECT Name, Email
      FROM users
      Where Id =$1`,
      [tutorID]
    );
    console.log(tutorData);
    //to student confirming request
    sendEmail(req.session.user.email, "New Tutor Added!", `New tutor match with ${tutorData.name} has been added to Tudr profile!` );
    //to tutor informing of request
    sendEmail(tutorData.email, "New Student Added!", `New student match with ${req.session.user.name} has been added to Tudr profile!` );

    // Redirect to next match
    res.redirect(`/matching/${nextIndex}`);
  } catch (err) {
    console.error('Error handling match:', err);
    res.status(500).send('Server error');
  }
});

app.post('/skip', async (req, res) => {
  try {
    console.log("Session:", req.session);
    const userID = req.session.user.id;

    const { matchID, nextIndex } = req.body;
    console.log("matchID:", matchID, "nextIndex:", nextIndex);

    if (!matchID) {
      return res.status(400).send('Missing match ID');
    }

    await db.query(
      `INSERT INTO MatchedUsers (TutorID, UserID, Action)
       VALUES ($1, $2, 'skip')`,
      [matchID, userID]
    );

    console.log(`User ${userID} skipped match ${matchID}`);
    res.redirect(`/matching/${nextIndex}`);
  } catch (err) {
    console.error('Skip error:', err);
    res.status(500).send('Server error');
  }
});

// *****************************************************
// <!-- Email notifications code -->
// *****************************************************
function sendEmail(toEmail, subject, message){
  const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for port 465, false for port 587
    auth: {
      user: 'tudr.alerts@gmail.com',
      pass: 'lmjt mrum ichb frvn',
    },
  });

  //email check for fake emails
  console.log("to", toEmail);
  console.log("sub", subject);
  console.log("body", message);

  const mailOptions = {
    from: '"Tudr.com" <tudr.alerts@gmail.com>',
    to: toEmail,
    subject: subject,
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending email:', error);
    }
    console.log('Email sent:', info.response);
  });
}




// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');

// Test Users

const createTestUser = async(userData) => {
  const emailQuery = 'SELECT * FROM Users WHERE Email = $1';
    
  // Create student test user
  const userExists = await db.oneOrNone(emailQuery, userData.email);
  if(!userExists) {
    await axios.post('http://localhost:3000/register', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(`Created test user: ${userData.email}`);
  } else {
    console.log(`User already exists: ${userData.email}`);
  }
};

const studentUser = {
  password: 'password',
  email: 'student@example.com',
  type: 'student',
  name: 'Billy Bob',
  degree: 'Computer Science',
  year: 'freshman',
  bio: 'I am a test student',
  classes: ['compsci', 'math'],
  learning: 'visual'
};

const tutorUser = {
  password: 'password',
  email: 'tutor@example.com',
  type: 'tutor',
  name: 'John Doe',
  degree: 'Computer Science',
  year: 'senior',
  bio: 'I am a test tutor',
  classes: ['compsci', 'math'],
  learning: 'visual'
};


const jonas = {
  password: 'pass',
  email: 'me@mail.com',
  type: 'tutor',
  name: 'Jonas',
  degree: 'Computer Science',
  year: 'sophomore',
  bio: 'I am German',
  classes: ['business', 'math'],
  learning: 'hands'
};

const connor = {
  password: 'pass',
  email: 'mail@mail.com',
  type: 'student',
  name: 'Connor',
  degree: 'Computer Science',
  year: 'senior',
  bio: 'I am old',
  classes: ['compsci', 'engineering'],
  learning: 'hands'
};

const lukas = {
  password: 'pass',
  email: 'me@me.com',
  type: 'tutor',
  name: 'Lukas',
  degree: 'Computer Science',
  year: 'sophomore',
  bio: 'I am cop',
  classes: ['math', 'history'],
  learning: 'hands'
};

const bjorn = {
  password: 'pass',
  email: 'mail@me.com',
  type: 'tutor',
  name: 'Bjorn',
  degree: 'Computer Science',
  year: 'grad',
  bio: 'I am Norwegian',
  classes: ['math', 'business'],
  learning: 'hands'
};

const kate = {
  password: 'pass',
  email: 'mailme@mail.com',
  type: 'tutor',
  name: 'Kate',
  degree: 'Computer Science',
  year: 'freshman',
  bio: 'I am freshman',
  classes: ['math', 'engineering'],
  learning: 'hands'
};

const molly = {
  password: 'pass',
  email: 'mailme@me.com',
  type: 'tutor',
  name: 'Molly',
  degree: 'Computer Science',
  year: 'Senior',
  bio: 'I am hurt',
  classes: ['compsci', 'engineering'],
  learning: 'hands'
};

createTestUser(studentUser);
createTestUser(tutorUser);
createTestUser(jonas);
createTestUser(connor);
createTestUser(lukas);
createTestUser(bjorn);
createTestUser(kate);
createTestUser(molly);
