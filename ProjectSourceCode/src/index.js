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
const fileupload = require('express-fileupload');
const fs = require('fs');

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
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

  // validate request body

  let registerInfo = {
    password: req.body.password,
    email: req.body.email,
    type: req.body.type,
    name: req.body.name,
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
      res.status(500).send('the server ran into an error while getting class ids');
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
    res.status(500).send('the server ran into an error while getting learning style id');
    return;
  }

  // ensure that the email doesn't already exists
  try {
    const emailQuery = 'SELECT Id FROM Users WHERE Email = $1';
    const emailResult = await db.manyOrNone(emailQuery, registerInfo.email);

    if (emailResult.length > 0) {
      res.status(400).send('An account is already registered with this email');
      return;
    }
  } catch (error) {
    console.log(`Server encountered error during email check: ${error}`);
    res.status(500).send('the server encountered an error while registering the email for the user');
  }

  // insert the user data into the db
  try {
    // Make this a SQL transaction so that if any part fails, the whole transaction fails
    await db.tx(async t => {
      // hash the password using bcrypt library
      const passwordHash = await bcrypt.hash(req.body.password, 10);
      const insertUserQuery = 'INSERT INTO Users (Password, Email, UserType, Name, Degree, Year, Bio, LearningStyle, Profileimage) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
      await t.none(insertUserQuery, [
        passwordHash,
        registerInfo.email,
        registerInfo.type,
        registerInfo.name,
        registerInfo.degree,
        registerInfo.year,
        registerInfo.bio,
        registerInfo.learning,
        profileImagePath
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
    res.redirect('/login');
  } catch (error) {
    // handle any errors
    console.log(`Server encountered error during register: ${error}`);
    res.status(500).send('the server encountered an error while registering the password for the user');
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
app.post('/login', async (req, res) => {
  const userQuery = 'SELECT * FROM Users WHERE Email = $1';
  
  try {
    const email = req.body.username.toLowerCase();
// changed login route to not have nested if statements and work with tests better
    if(!email){
      console.log("missing email");
      return res.status(400).json({message: "Invalid Credentials"});
    }
    const user = await db.oneOrNone(userQuery, email);
    if (!user){
      console.log("User Not Found");
      return res.status(400).json({message: "Invalid Credentials"});
    }
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match){
      console.log('Invalid Password');
      return res.status(400).json({message: "Invalid Credentials"});
    }
    req.session.user = user;
    await req.session.save();
    if (req.headers.accept && req.headers.accept.includes("text/html")){
      return res.redirect('/profile');
    }
    return res.status(200).json({message: "Login Successfull"});
  } catch (error) {
    console.log(`Server encountered error during login: ${error}`);
    return res.status(500).json({message: "Server Error"});
  }
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

app.get('/matches', (req, res) => {
  res.render('pages/myMatches')
});

app.get('/profile', async(req, res) => {
  const useremail = req.session.user.email;
  console.log(req.session.user.email);
  if(!useremail)
  {
    return res.status(400).send("invalid email");
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
      userID: result.userid, name: result.username, bio: result.bio, learningstyle: result.learningstyle, classes: result.classnames, profileimage: result.profileimage
    })
  }
  catch(error){
    console.error("error loading profile:", error)
  }
});

app.get('/calendar/events', async(req, res) => {
  console.log("Gathering user event information");
  const eventIDQuery = `SELECT EventId FROM UsersToEvents WHERE UserId = $1`;
  let eventsInfo = [];
  const eventInfoQuery = `SELECT e.EventId as id, e.EventName as title, e.EventDays as daysOfWeek, e.EventDescription as description, et.TypeName as type,
                          e.EventStartTime as startTime, e.EventEndTime as end, ef.FormatName as format 
                          FROM Events e 
                          JOIN EventFormats ef ON e.EventFormat = ef.FormatID
                          JOIN EventTypes et ON e.EventType = et.TypeID
                          WHERE e.EventId = $1`;
  try{
    const eventIds = await db.manyOrNone(eventIDQuery, req.query.userID);
    for(let e of eventIds){
      const event = await db.oneOrNone(eventInfoQuery, e.eventid)
      if(!event){
        console.log(`Event not found for ID: ${e.eventid}`);
        continue;
      }
      else{
        eventsInfo.push(event);
      }
      return res.json(eventsInfo);
    }
  } catch(error){
    console.log("Error accessing user events calendar: ", error);
    return res.status(500).json({message: "Server Error"});
  }
});

app.post('/calendar/updateAvailability', async (req, res) => {
  const query = `INSERT INTO EVENTS (EventName, EventType, EventDays, EventStartTime, EventEndTime)
                  VALUES ('Available', 1, $1, $2, $3)
                  RETURNING EventId`;
  let userID = req.body.userid;
  let eventName = req.body.name;
  let eventType = req.body.type;
  let eventDays = req.body.days;
  let eventStartTime = req.body.startTime;
  let eventEndTime = req.body.endTime;

  //insert checks
  let eventFormat = null;
  if(req.body.format){
    eventFormat=req.body.format;
  }
    

  const queryParams = {eventName, eventType, eventDays, eventStartTime, eventEndTime}
  try{
    const eventID = await db.one(query, queryParams);
    const query1 = `INSERT INTO UsersToEvents (UserID, EventID)
                    VALUES ($1, $2)`;
    const query1Params = {userID, eventID};
    const result = await db.none(query1, query1Params);
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


createTestUser(studentUser);
createTestUser(tutorUser);