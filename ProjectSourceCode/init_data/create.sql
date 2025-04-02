DROP TABLE IF EXISTS Users;
CREATE TYPE AccountType AS ENUM ('Student', 'Tutor');
CREATE TABLE Users (
  Username VARCHAR(50) PRIMARY KEY,
  Password VARCHAR(60) NOT NULL,
  UserType AccountType NOT NULL
);