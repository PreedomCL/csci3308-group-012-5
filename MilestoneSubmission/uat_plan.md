# User Acceptance Tests

## User Acceptance Testers

Unless otherwise specified:

- The user acceptance testers will be students with limited knowledge of the project.
- The testers will be familiar with using web applications and interfacing with computers in general.
- The testers may or may not have technical experience regarding web application/web development.

## Student Tutor matching

### User Acceptance Criteria

1. An authenticated student user can see tutor matching cards by navigating to the profile page
2. The student user can choose to send a match request to a tutor via the card
3. An authenticated tutor user can see requested matches by navigating to the profile page
4. The tutor user can choose to accept a match request via the card by pushing a button on the request card modal

### Test Preconditions

1. Student account with following data:

    ``` json
    password: 'password',
    email: 'student@example.com',
    type: 'student',
    name: 'Billy Bob',
    degree: 'Computer Science',
    year: 'freshman',
    bio: 'I am a test student',
    classes: ['compsci', 'math'],
    learning: 'visual'
    ```

2. Tutor account with following data:

    ``` json
    password: 'password',
    email: 'tutor@example.com',
    type: 'tutor',
    name: 'John Doe',
    degree: 'Computer Science',
    year: 'senior',
    bio: 'I am a test tutor',
    classes: ['compsci', 'math'],
    learning: 'visual’
    ```

3. Application running on <https://localhost:3000>

### Test Sequence

Part 1: Student requests match

1. Navigate to the login page (<http://localhost:3000/login>) and log in with the following data

    ``` text
    email:      student@example.com
    password:   password
    ```

2. Navigate to the profile page, under "Potential Tutors", click "View Profile" on the John Doe Profile card
4. Checkpoint: There is a card on the page for a Tutor with name "John Doe"
5. Click the “Like” button on the Tutor Profile modal
6. Checkpoint: A confirmation message appears
7. Click the logout button

Part 2: Tutor accepts match

1. Navigate to the login page (<http://localhost:3000/login>) and log in with the following data

    ``` text
    email:      tutor@example.com
    password:   password
    ```

2. Navigate to the profile page
3. Checkpoint: There is a card on the page under "Requests" for a Student with the name Billy Bob
4. Click the “View Profile” button on the Student card
5. Checkpoint: There is a profile card modal with the name "Billy Bob"
6. Click the "Match!" button 
7. Checkpoint: There is a card under "Matches" with the name "Billy Bob"
8. Click the logout button

Part 3: Student can see match

1. Navigate to the login page (<http://localhost:3000/login>) and log in with the following data

    ``` text
    email:      student@example.com
    password:   password
    ```

2. Navigate to the Profile page 
3. Checkpoint: There is a card under "Matched Tutors" with the name: John Doe

End of Test

## Register and Login

### User Acceptance Criteria

1. A user cannot submit a registration form without completing all of the mandatory fields. Mandatory fields include:
   - Student or Tutor (Selection)
   - Full Name
   - Email Address
   - Password
   - Degree
   - Year of Schooling
   - Bio
   - Classes Needing Tutoring For
   - Learning Style

Information from the form is stored in the Users table in the database

1. A user cannot submit a login form without entering all of the mandatory fields. Mandatory fields include:

- Email Address
- Password

### Test Preconditions

1. Application running on <https://localhost:3000>

### Test Sequence

1. Navigate to the <http://localhost:3000/register>
2. Create account in register page with all required fields
   - Student or Tutor (Selection): Student
   - Full Name : User
   - Email Address : <user@colorado.edu>
   - Password: password
   - Degree: Computer Science
   - Year of Schooling: Freshman
   - Bio: Bio
   - Classes Needing Tutoring For: Computer Science (CSCI)
   - Learning Style: Visual
3. Click “Create Account”
4. Checkpoint: Once submitted, redirected to Login Page
5. Once redirected to Login Page: Enter email address and password
   - email address: <user@colorado.edu>
   - password: password
6. Click “Log In”
7. Checkpoint: Once submitted, redirected to Profile Page
8. Checkpoint: Once redirected to Profile Page, check if required fields match:
   - My Name: User
   - Classes Needing Tutoring For: CSCI
   - Learning Style: Visual
   - Bio: Bio

End of Test

## View and Download Calendar

### User Acceptance Criteria

1. An authenticated student user can see calendar by navigating to the profile page
2. An authenticated tutor user can see calendar by navigating to the profile page
3. The tutor user can create an availability calendar event
4. The student user can request a meeting by clicking on matched tutor card, clicking on tutor calendar availability block, and create a meeting request
5. The student user can choose to download calendar event by clicking on the requested meeting event block and clicking download
6. The tutor user can accept the request meeting by clicking on the requested meeting event block and clicking accept
7. The tutor user can download calendar event by clicking on the accepted meeting event block and clicking download

### Test Preconditions

1. Student account with following data:

    ``` json
    password: 'password',
    email: 'student@example.com',
    type: 'student',
    name: 'Billy Bob',
    degree: 'Computer Science',
    year: 'freshman',
    bio: 'I am a test student',
    classes: ['compsci', 'math'],
    learning: 'visual'
    ```

2. Tutor account with following data:

    ``` json
    password: 'password',
    email: 'tutor@example.com',
    type: 'tutor',
    name: 'John Doe',
    degree: 'Computer Science',
    year: 'senior',
    bio: 'I am a test tutor',
    classes: ['compsci', 'math'],
    learning: 'visual’
    ```

3. Application running on <https://localhost:3000>

### Test Sequence

Part 1: Student can see calendar:

1. Navigate to the login page (<http://localhost:3000/login>) and log in with the following data

    ``` text
    email:      student@example.com
    password:   password
    ```

2. Checkpoint: Redirected to Profile page once clicked on “Log In” 
3. Checkpoint: User can see see profile page with the calendar displayed

Part 2: Tutor can see calendar and create calendar event:
1. Navigate to the login page (<http://localhost:3000/login>) and log in with the following data

    ``` text
    email:      tutor@example.com
    password:   password
    ```

2. Checkpoint: Redirected to Profile page once clicked on “Log In” 
3. Checkpoint: User can see see profile page with the calendar displayed
4. Click "Update Availability"
5. Checkpoint: "Update Your Weekly Availability" modal is displayed
6. Click "Add time slot" under Monday
7. Checkpoint: Monday "Start Time" and "End Time" dropdowns are displayed
8. Add 8:00AM to "Start Time" and 11:00AM "End Time"
9. Click "Update"
10. Checkpoint: Time slot is displayed on calendar
11. Log Out

Part 3: Student can request a meeting and download calendar event:

1. Navigate to the login page (<http://localhost:3000/login>) and log in with the following data

    ``` text
    email:      student@example.com
    password:   password
    ```

2. Checkpoint: User can see "John Doe" under "Matched Tutors"
3. Click "View Profile" in the John Doe card
4. Checkpoint: User can see the updated calendar with the 8-11AM availability block in John Doe's profile modal.
5. Click on the 8-11 AM block.
6. Checkpoint: User can see the pop-up "Request Session with John Doe"
7. Insert the following fiels:
   - Format: "In-person"
   - Start Time: 8:30 AM
   - End Time: 9:30 AM
   - Description: "Important Meeting"
8. Click "Request Session"
9. Checkpoint: User can see requested session in user calendar.
10. Click on yellow calendar block.
11. Checkpoint: User can see Event Information
12. Click "Download"
13. Checkpoint: ics file is downloaded to local machine.
14. Open download file.
15. Checkpoint: Downloaded file loads onto local calendar application and has the appropriate meeting times of "8:30 AM" to "9:30 AM" and is named "Proposed Tutoring Session - Billy Bob & John Doe"
16. Delete the event from local machine calendar

Part 4: Tutor can see calendar, accept tutoring session, and download calendar event:

1. Navigate to the login page (<http://localhost:3000/login>) and log in with the following data

    ``` text
    email:      tutor@example.com
    password:   password
    ```

2. Checkpoint: Redirected to Profile page once clicked on “Log In” 
3. Checkpoint: User can see see profile page with the calendar displayed, green availability block set up earlier in test and yellow requested meeting block
4. Click on the yellow block
5. Checkpoint: Meeting information modal is displayed with the fiels:
    - Day: Monday, April 28
    - Time: 08:30 AM - 09:30 AM
    - Format: In-Person
    - Type: Pending
    - Description: Important Meeting
6. Click "Accept" at the bottom of the modal.
7. Checkpoint: What was a yellow block is now blue
8. Click on the blue block
9. Checkpoint: Meeting information modal is displayed with the fiels:
    - Day: Monday, April 28
    - Time: 08:30 AM - 09:30 AM
    - Format: In-Person
    - Type: Accepted
    - Description: Important Meeting
10. Click "Download"
11. Checkpoint: ics file is downloaded to local machine.
12. Open download file
13.  Checkpoint: Downloaded file loads onto local calendar application and has the appropriate meeting times of "8:30 AM" to "9:30 AM" and is named "Accepted Tutoring Session - John Doe & Billy Bob"
14. User deletes the event from their local machine calendar

End of Test
