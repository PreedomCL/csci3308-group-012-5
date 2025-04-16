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
  UserId INT NOT NULL REFERENCES Users(Id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS EventTypes;
CREATE TABLE EventTypes (
  TypeId SERIAL PRIMARY KEY,
  TypeName VARCHAR(50) NOT NULL
);

DROP TABLE IF EXISTS EventFormats;
CREATE TABLE EventFormats (
  FormatId SERIAL PRIMARY KEY,
  FormatName VARCHAR(50) NOT NULL
);

DROP TABLE IF EXISTS Days;
CREATE TABLE EventDays (
  DayId SERIAL PRIMARY KEY,
  DayName VARCHAR(50) NOT NULL
);


DROP TABLE IF EXISTS Events;
CREATE TABLE Events (
  EventId SERIAL PRIMARY KEY,
  EventName VARCHAR(50) NOT NULL,
  EventType INT NOT NULL REFERENCES EventTypes(TypeId),
  EventDay INT NOT NULL REFERENCES EventDays(DayId),
  EventDescription VARCHAR(200),
  EventStartTime time NOT NULL,
  EventEndTime time NOT NULL,
  EventFormat INT REFERENCES EventFormats(FormatId)
);

DROP TABLE IF EXISTS UsersToEvents;
CREATE TABLE UsersToEvents (
  UserID INT NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
  EventID INT NOT NULL REFERENCES Events(EventId) ON DELETE CASCADE
);



DROP TABLE IF EXISTS MatchedUsers;
CREATE TABLE MatchedUsers(
  TutorID INT NOT NULL,
  UserID INT NOT NULL,
  Action VARCHAR(10) CHECK (Action IN ('like', 'skip')) NOT NULL
);