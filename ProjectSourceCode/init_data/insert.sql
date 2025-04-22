
INSERT INTO Classes (Name) VALUES
('math'),
('history'),
('compsci'),
('engineering'),
('business');

INSERT INTO LearningStyles (Name) VALUES
('visual'),
('auditory'),
('hands'),
('writing');

INSERT INTO EventDays(DayID,DayName)VALUES
(0,'Sunday'),
(1,'Monday'),
(2,'Tuesday'),
(3,'Wednesday'),
(4,'Thursday'),
(5,'Friday'),
(6,'Saturday');

INSERT INTO EventFormats(FormatName) VALUES
('In-Person'),
('Online'),
('Hybrid');

INSERT INTO EventTypes(TypeName) VALUES
('Available'),
('Pending'),
('Accepted');

INSERT INTO MatchStatus(Status) VALUES
('Recommended'),
('Liked'),
('Skipped'),
('Matched');