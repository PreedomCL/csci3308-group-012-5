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
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

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
  })
);

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
    learning: req.body.learning
  };

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
  switch (registerInfo.type.toLowerCase()) {
    case "student":
    case "tutor":
      break;
    default:
      res.status(400).send('argument "type" must be "student" or "tutor"');
      return;
  }

  // validate name
  if(registerInfo.name.length > 50) {
    res.status(400).send('argument "name" is too long (max 50)');
    return;
  }

  // validate degree 
  if(registerInfo.degree.length > 50) {
    res.status(400).send('argument "degree" is too long (max 50)');
    return;
  }

  // validate year
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
  if(registerInfo.bio.length > 200) {
    res.status(400).send('argument "bio" is too long (max 200)');
    return;
  }

  // validate classes by comparing to the DB
  const classIdQuery = 'SELECT Id FROM Classes WHERE Name = $1';
  let classIds = [];
  for(let c of registerInfo.classes) {
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

  try {
    // ensure that the email doesn't already exists
    const emailQuery = 'SELECT Id FROM Users WHERE Email = $1';
    const emailResult = await db.manyOrNone(emailQuery, registerInfo.email);

    if (emailResult.length > 1) {
      res.status(400).send('An account is already registered with this email');
      return;
    }
  } catch (error) {
    console.log(`Server encountered error during email check: ${error}`);
    res.status(500).send('the server encountered an error while registering the user');
  }

  // insert the user data into the db
  try {
    // Make this a SQL transaction so that if any part fails, the whole transaction fails
    await db.tx(async t => {
      // hash the password using bcrypt library
      const passwordHash = await bcrypt.hash(req.body.password, 10);
      
      const insertUserQuery = 'INSERT INTO Users (Password, Email, UserType, Name, Degree, Year, Bio, LearningStyle) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
      await t.none(insertUserQuery, [
        passwordHash,
        registerInfo.email,
        registerInfo.type,
        registerInfo.name,
        registerInfo.degree,
        registerInfo.year,
        registerInfo.bio,
        registerInfo.learning
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
    res.status(500).send('the server encountered an error while registering the user');
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
    const username = req.body.username.toLowerCase();
    const user = await db.oneOrNone(userQuery, username);

    // check if user exists
    if(user) {
      // check if password from request matches with password in DB
      const match = await bcrypt.compare(req.body.password, user.password);

      if(match) {
        // login successful
        req.session.user = user;
        req.session.save();
        res.redirect('/profile');
      }
    } else {
      // login failed, bad username or password
      console.log('Login Failed');
      res.render('pages/login', {loginError: true});
    }
  } catch (error) {
    console.log(`Server encountered error during login: ${error}`);
    res.status(500);
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

app.get('/profile', (req, res) => {
  res.render('pages/profile')
});

// function to display user image in registration 
function displaySelectedImage(event, elementId) {
  const selectedImage = document.getElementById(elementId);
  const fileInput = event.target;

  if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();

      reader.onload = function(e) {
          selectedImage.src = e.target.result;
      };

      reader.readAsDataURL(fileInput.files[0]);
  }
}

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');

// Test User

const createTestUsers = async() => {
  try {
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
    
    const emailQuery = 'SELECT * FROM Users WHERE Email = $1';
    
    // Create student test user
    const studentExists = await db.oneOrNone(emailQuery, studentUser.email);
    if(!studentExists) {
      await axios.post('http://localhost:3000/register', studentUser, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Created test student');
    } else {
      console.log('Test student already exists');
    }

    // Create tutor test user
    const tutorExists = await db.oneOrNone(emailQuery, tutorUser.email);
    if(!tutorExists) {
      await axios.post('http://localhost:3000/register', tutorUser, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Created test tutor');
    } else {
      console.log('Test tutor already exists');
    }

  } catch (error) {
    console.log(`Error creating test user: ${error.message}`);
  }
};

createTestUsers();
