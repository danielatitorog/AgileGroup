# YouthInvest
A financial education web application designed for young people (12–18 age group).

YouthInvest teaches young users about investing, financial literacy, scams, and online safety through learning modules.
The project is built using PHP (MVC structure), HTML, CSS, Bootstrap, JavaScript, and SQLite.
## Features
### MVC Architecture
* **Models** handles database logic
* **Views** manage User interface (UI)
* **Controllers** manage routing & logic
### User System
* User registration, login, and authentication
* SQLite data storage
* Session-based user handling
### Survey System
* Analyse user current knowledge and experience
* Helps personalize the learning experience (future expansion)
* Simple, clear question format for young users
* Survey will only show when the user first register with the app
### Learning Hub
* Educational content on investing, saving, financial safety, and more
* Simple explanations designed for ages 12–18
* Easy-to-navigate sections for better learning
### Interactive Quiz System
* Single general quiz combining all modules
* Questions loaded from a JSON file
* Explanation shown after each answer, when user finish the quiz
* Automatic score calculation
* stores the user score in the database
### Dashboard
* Displays user information
* Shows learning progress, friend list and quiz results
## Installation & Setup
* PHP 7+
* SQLite
* Local server (XAMPP, WAMP, MAMP, or PHP's built-in-server)
## User Guide
How user can navigate and use YouthInvest
### Register/Login
* New user needs to create an account first
* Enter Username and password (password should meet the requirements)
* After registration, complete the survey
* If already registered just Login
### Navigating the App
After logging in, user can access:
* Dashboard by clicking the Bell Icon on the top right side of the header
* Logout
* Learning Hub
    - Quiz to test the knowledge
* Contact US
### Logging Out
user can log out using the logout button in the navigation bar. This will end the session and return to the Home/Login screen.
## Future Improvements
* An AI chatbot tutor accompanies users throughout the learning experience, providing explanations, examples, and personalized support.
* YouthInvest provides difficulty-based learning modules, allowing users to progress through structured levels such as Basic, Intermediate, and Advanced.
  User survey responses determine the appropriate starting difficulty, and users may advance to higher tiers once they complete the foundational content.