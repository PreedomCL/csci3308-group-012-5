DROP TABLE IF EXISTS Classes;
CREATE TABLE Classes (
  Id SERIAL PRIMARY KEY,
  Name VARCHAR(20) NOT NULL
);

DROP TABLE IF EXISTS LearningStyles;
CREATE TABLE LearningStyles (
  Id SERIAL PRIMARY KEY,
  Name VARCHAR(20) NOT NULL
);

DROP TABLE IF EXISTS Users;
CREATE TABLE Users (
  Id SERIAL PRIMARY KEY,
  Password VARCHAR(60) NOT NULL,
  Email VARCHAR(50) NOT NULL,
  UserType VARCHAR(10) NOT NULL,
  Name VARCHAR(50) NOT NULL,
  Degree VARCHAR(50) NOT NULL,
  Year VARCHAR(50) NOT NULL,
  Bio VARCHAR(200) NOT NULL,
  LearningStyle INT NOT NULL REFERENCES LearningStyles(Id)
);

DROP TABLE IF EXISTS ClassesToUsers;
CREATE TABLE ClassesToUsers (
  ClassId INT NOT NULL REFERENCES Classes(Id),
  UserId INT NOT NULL REFERENCES Users(Id)
);