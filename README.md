# Tudr - CSCI 3308 Group 012-5

## Application Description
Tudr is an application that matches students to tutors. Both potential students and tutors will create a profile with select personal and academic information. Students will connect with recommended tutors, and tutors will accept students. Once a student/tutor pair is made, tutoring appointments can be scheduled with a calendar utility.

## Information about the directory structure
- ***Documentation***: Documentation regarding Calendar, Google Authorization development and research, and file input image.
- ***MilestoneSubmission***: Project Presentation PDF, Project Plan file, Release Notes files
- ***ProjectSourceCode*** - All source code:
    - init_data: database setup/creation files
    - src:
        - resources:
            - css: style.css
            - img: images used in application
            - js:
                - glogin.js - register page for new Google logins
                - register.js - register page to adapt to account type
                - script.js - Calendar scipts
        - views:
          - layouts: message partial
          - pages: (all website pages)
            - home.hbs
            - login.hbs
            - logout.hbs
            - matching.hbs
            - profile.hbs
            - register.hbs
          - partials:
            - cal.hbs
            - footer.hbs
            - gsignin.hbs
            - header.hbs
            - match.hbs
            - matchProfile.hbs
            - message.hbs
            - nav.hbs
            - title.hbs
        - index.js: Import Dependencies, Connection to DB, API routes, Start Server, Test Users
    - test:
      - server.spec.js: unit tests
    - .gitignore: ignore /uploads/
    - .gitkeep: Create project structure
    - docker-compose.yaml: functional docker compose file to run app
    - package-lock.json: node_modules
    - package.json: dependencies and scipts
- ***TeamMeetingLogs***: Meeting notes
- ***.gitignore***: Specifies intentionally untracked files to ignore
- ***gen_ai_usage.txt***: Citations of Genenerative AI used in project
- ***README.md***: Read Me - project description and information

## Contributors
- Mason McGaffin
- Curtis Preedom
- Connor Shumate
- Joe Hoertig-Paulus
- Nick Meagher

## Technology Stack
- HTML + Handlebars - UI + Templating
- PostgreSQL - Database
- chai + mocha - Unit testing
- Google Sign in API - User Authentication
- node.js + express - Application Server + Web Framework
- Render - Web Service Host
- Nodemailer - Email Notifications
- Bootstrap - styling
- FullCalendar - Calendar UI

## Prerequisites to run the application
Software that needs to be installed to run the application:
- Docker Desktop - Development Container
- Visual Studio Code - IDE

## How to run the application locally
1. Clone the Github Repository from: [https://github.com/PreedomCL/csci3308-group-012-5]
2. Navigate to the repository on your system/ IDE. 
3. [user@host]$|cd CSCI3308-GROUP-012-5
4. [user@host]$|cd ProjectSourceCode
5. [user@host]$|docker compose down -v
6. [user@host]$|docker compose up --build
7. Navigate to [http://localhost:3000/]

## Testing (how to run the tests)
### User Acceptance Testing
1. Navigate to [https://github.com/PreedomCL/csci3308-group-012-5/blob/lab11/MilestoneSubmission/uat_plan.md]
2. Follow instructions in the uat_plan.md file.
3. Run tests. 

## Deployment
Link to the deployed application: [https://csci3308-group-012-5.onrender.com/]
