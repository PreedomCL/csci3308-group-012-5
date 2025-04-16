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
  Password VARCHAR(60),
  Email VARCHAR(50) NOT NULL,
  UserType VARCHAR(10) NOT NULL,
  Name VARCHAR(50) NOT NULL,
  Degree VARCHAR(50) NOT NULL,
  Year VARCHAR(50) NOT NULL,
  Bio VARCHAR(200) NOT NULL,
  LearningStyle INT NOT NULL REFERENCES LearningStyles(Id),
  Profileimage TEXT,
  GoogleId VARCHAR(30),
  -- A user either authenticates with a password or with Google
  CONSTRAINT password_xor_googleid CHECK (
    (Password IS NULL AND GoogleId IS NOT NULL) OR
    (Password IS NOT NULL AND GoogleId IS NULL)
  )
);

DROP TABLE IF EXISTS ClassesToUsers;
CREATE TABLE ClassesToUsers (
  ClassId INT NOT NULL REFERENCES Classes(Id),
  UserId INT NOT NULL REFERENCES Users(Id)
);

DROP TABLE IF EXISTS MatchedUsers;
CREATE TABLE MatchedUsers(
  TutorID INT NOT NULL,
  UserID INT NOT NULL,
  Action VARCHAR(10) CHECK (Action IN ('like', 'skip')) NOT NULL
);