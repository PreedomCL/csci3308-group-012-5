Calendar Research

INPUT \- user will input available times that work for most weeks.   
OUTPUT \- the calendar will display available and blocked times using different colors. 

Functionality

- Available times can be filled with tutoring meetings  
  - These meetings can be exported to iCal format  
  - These will update both tutor and tutee calendars and appear different  
  - Request to join a tutor session? \- group option

Calendar Event Table

- EventID (primary key)  
- UserID (foreign key)  
- Title \- Available, tutoring meeting  
- Description  
- Start time (timestamp)  
- End time (timestamp)  
- Availability type \- in person, online, both  
- Shared eventID

Shared eventID

- EventID (FK)  
- UserID (FK)

Interface

- FullCalendar.js

iCal export

- Backend API routes  
  - Get  
    - .ics file  
    - Google calendar link?  
- Dependencies  
  - i-cal generator  
  - moment-timezone  
- Front-end  
  - Export button on each tutor meeting  
  - Request to join meeting  
  - Javascript function for creating event

