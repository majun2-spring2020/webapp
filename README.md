This assignment Start implementing APIs for the web application. See Cloud Native Web Application Requirements for technical requirements.

Features of the web application will be split among various applications. For this assignment, we will focus on the backend API (no UI) service. Additional features of the web application will be implemented in future assignments. We will also build the infrastructure on cloud to host the application.

This assignment will focus on user management aspect of the application. You will implement RESTful APIs based on user stories you will find below.

RESTful API Endpoints To Be Implemented¶
API specifications

User Stories¶
All API request/response payloads should be in JSON.
No UI should be implemented for the application.
As a user, I expect all APIs call to return with proper HTTP status code.
As a user, I expect the code quality of the application is maintained to highest standards using unit and/or integration tests.
Your web application must only support Token-Based authentication and not Session Authentication.
As a user, I must provide basic authentication token when making a API call to protected endpoint.
Create a new user
As a user, I want to create an account by providing following information.
Email Address
Password
First Name
Last Name
account_created field for the user should be set to current time when user creation is successful.
User should not be able to set values for account_created and account_updated. Any value provided for these fields must be ignored.
Password field should never be returned in the response payload.
As a user, I expect to use my email address as my username.
As a user, I expect application to enforce strong password as recommended by NIST.
Application must return 400 Bad Reqest HTTP response code when a user account with the email address already exists.
As a user, I expect my password to be stored securely using BCrypt password hashing scheme with salt.
Update user information
As a user, I want to update my account information. I should only be allowed to update following fields.
First Name
Last Name
Password
Attempt to update any other field should return 400 Bad Request HTTP response code.
account_updated field for the user should be updated when user update is successful.
A user can only update their own account information.
Get user information
As a user, I want to get my account information. Response payload should return all fields for the user except for password.
Documentation¶
https://stackoverflow.com/questions/19332821/http-basic-authentication-over-ssl-for-rest-api
https://en.wikipedia.org/wiki/Basic_access_authentication
RESTful API Authentication Basics
https://security.stackexchange.com/questions/81756/session-authentication-vs-token-authentication
https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
Submission¶
Grading Guidelines¶
Warning

Following guidelines are for information only. They are subject to change at the discretion of the instructor and TA.

Web Application (100%)¶
Students to demo the web application from their laptop.
Verify passwords are encrypted with BCrypt hashing and salt in the database.
Verify that authentication is done via basic auth (token based) and not session based.
APIs can be demoed using any Postman or Restlet or some other REST client but not via browser.
Check for UI. Application cannot have UI.
Check the response payload to make sure it meets the assignment objective. Password field should not be part of the response payload.
Test for duplicate account in application. Application should NOT allow multiple accounts with same email address.
Test updating fields such as account_created and account_updated. User should never be able to set values for them. These fields are on set by the application.
Verify non-email username cannot be used for account creation.
Verify that weak passwords cannot be used to create accounts.
Check for password length of 8 or shorter which should be rejected.
Check for simple all char passwords.
Check for complex passwords.
Create multiple accounts and see if User A can get/update information for User B.