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
  username: string, // plain text username (case INSENSITIVE)
  password: string,  // plain text password
}
*/
app.post('/register', async (req, res) => {
  // hash the password using bcrypt library
  const insertQuery = 'INSERT INTO Users (Username, Password) VALUES ($1, $2)';
  
  const passwordHash = await bcrypt.hash(req.body.password, 10);
  const username = req.body.username.toLowerCase();
  try {
    await db.none(insertQuery, [username, passwordHash]);
    res.redirect('/login');
  } catch (error) {
    console.log(`Server encountered error during register: ${error}`);
    res.status(500);
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
  const userQuery = 'SELECT * FROM Users WHERE Username = $1';
  
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

/**
 * Logout API
 */
app.get('/logout', (req, res) => {
  req.session.destroy(function(err) {
    res.render('pages/logout');
  });
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