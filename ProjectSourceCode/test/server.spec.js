// ********************** Initialize server **********************************

const server = require("../src/index"); //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

const chai = require("chai"); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;
const bcrypt = require('bcryptjs');

// Import the database connection from index.js
const pgp = require('pg-promise')();
const dbConfig = {
  host: 'db',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};
const db = pgp(dbConfig);

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe("Server!", () => {
  // Sample test case given to test / endpoint.
  it("Returns the default welcome message", (done) => {
    chai
      .request(server)
      .get("/welcome")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals("success");
        assert.strictEqual(res.body.message, "Welcome!");
        done();
      });
  });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

describe("/register route", () => {
  beforeEach(async () => {
    // Clear users table before each test
    await db.query("TRUNCATE TABLE Users CASCADE");
  });

  after(async () => {
    // Clear users table after all tests
    await db.query("TRUNCATE TABLE Users CASCADE");
  });

  it("returns positive result", (done) => {
    chai
      .request(server)
      .post("/register")
      .send({ email: "user", password: "password" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("returns negative result : invalid username", (done) => {
    chai
      .request(server)
      .post("/register")
      .send({ email: 10, password: "password" })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
});

describe("/login route", () => {
  beforeEach(async () => {
    await db.query("TRUNCATE TABLE Users CASCADE");
    const hash = await bcrypt.hash("password", 10);
    await db.query(`INSERT INTO Users (Username, Password) VALUES ($1, $2)`, ['user', hash]);
  });

  after(async () => {
    // Clear users table after all tests
    await db.query("TRUNCATE TABLE Users CASCADE");
  });

  it("returns positive result", (done) => {
    chai
      .request(server)
      .post("/login")
      .send({ username: "user", password: "password" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect 
        done();
      });
  });
  it("returns negative result : invalid username", (done) => {
    chai
      .request(server)
      .post("/login")
      .send({ username: "invalid_user", password: "password" })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
});

// ********************************************************************************
