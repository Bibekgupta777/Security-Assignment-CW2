# Let's Go: Online Bus Ticket Booking System (Web API)

## Overview
"Let's Go" is an online bus ticket booking system built using the MERN (MongoDB, Express.js, React.js, Node.js) stack. It allows users to search for bus routes, select seats, make payments, and view their booking history, while admins can manage buses, schedules, and user information.

## Features
### User Features
- **Search Bus Routes**: Search for buses based on source, destination, and date.
- **View Bus List**: See available buses with details like bus number, route, departure/arrival times, fare, and available seats.
- **Seat Selection**: Select and reserve seats for a specific schedule.
- **Booking History**: View past bookings and cancel reservations.

### Admin Features
- **Bus Management**: CRUD operations for buses.
- **Schedule Management**: Create, update, delete, and view bus schedules linked to routes and buses.
- **User Management**: Manage user accounts, including listing and deleting users.

## API Endpoints
### Authentication
- `POST /api/v1/users/signUp` — Register a new user (with email confirmation via nodemailer)
- `POST /api/v1/users/signIn` — Log in a user
- `GET /api/v1/users/logoutCurrentUser` — Log out the current user

### Bus Routes
- `POST /api/route/create` — Create a new route
- `GET /api/route/all` — Get all routes
- `GET /api/route/:id` — Get a specific route
- `PUT /api/route/:id` — Update a route
- `DELETE /api/route/:id` — Delete a route

### Bus Schedules
- `POST /api/schedule/create` — Create a new schedule
- `GET /api/schedule/search` — Search schedules by source, destination, and date
- `PUT /api/schedule/:id` — Update a schedule
- `DELETE /api/schedule/:id` — Delete a schedule

### Booking
- `POST /api/booking/create` — Create a new booking
- `GET /api/booking/history` — Get user booking history
- `DELETE /api/booking/:id` — Cancel a booking

### Admin
- `GET /api/v1/users/getAllUsers` — List all users (admin only)
- `DELETE /api/v1/users/:id` — Delete a user (admin only)
- `POST /api/v1/users/createUser` — Create a new user (admin only)

## Technologies Used
- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer (for uploading user avatars)
- **Environment Variables**: dotenv
- **API Requests**: Axios

