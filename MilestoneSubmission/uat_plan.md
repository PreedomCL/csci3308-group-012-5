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
4. The tutor user can choose to accept a match request by pushing a button on the request card

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

2. Navigate to the matches page by pressing the “Matches” button on the nav bar
3. Checkpoint: There is a card on the page for a Tutor with name: John Doe
4. Click the “Match” button on the Tutor card
5. Checkpoint: The match button is greyed out and a confirmation message appears
6. Click the logout button

Part 2: Tutor accepts match

1. Navigate to the login page (<http://localhost:3000/login>) and log in with the following data

    ``` text
    email:      tutor@example.com
    password:   password
    ```

2. Navigate to the matches page by pressing the “Matches” button on the nav bar
3. Checkpoint: There is a card on the page for a Student with the name: Billy Bob
4. Click the “Accept Match” button on the Student card.
5. Checkpoint: The match button is greyed out and a confirmation message appears
6. Navigate to the My Matches page by pressing the “My Matches” button on the nav bar
7. Checkpoint: There is a card with the name: Billy Bob
8. Click the logout button

Part 3: Student can see match

1. Navigate to the login page (<http://localhost:3000/login>) and log in with the following data

    ``` text
    email:      tutor@example.com
    password:   password
    ```

2. Navigate to the My Matches page by pressing the “My Matches” button on the nav bar
3. Checkpoint: There is a card with the name: John Doe
End of Test
