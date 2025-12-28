# TailMate - Pet Adoption Platform

A full-stack React application for pet adoption with Express.js backend and MongoDB database.

## Features

### User Features
- User registration and login
- Browse available pets with filtering
- Add pets to favorites
- Adopt pets
- View user profile with adopted pets count
- User details and address management

### Admin Features
- Admin login with default credentials
- Add new pets to the platform
- View and manage all pets
- Delete pets from the system
- Admin dashboard with statistics

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- Context API for state management
- CSS3 with modern styling

### Backend
- Express.js server
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
- CORS enabled

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB installed and running locally
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tailmate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start MongoDB**
   Make sure MongoDB is running on your local machine:
   ```bash
   mongod
   ```

4. **Start the backend server**
   ```bash
   npm run server
   ```
   The server will start on http://localhost:5000

5. **Start the React development server**
   ```bash
   npm start
   ```
   The app will open on http://localhost:3000

### Default Admin Credentials
- **Email:** admin@tailmate.com
- **Password:** admin123

## API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/user-login` - User login
- `POST /api/admin-login` - Admin login

### Pets
- `GET /api/pets` - Get all available pets
- `POST /api/pets` - Add new pet (Admin only)
- `DELETE /api/pets/:id` - Delete pet (Admin only)
- `POST /api/pets/:id/adopt` - Adopt a pet

### Adopt/Buy Requests
- `POST /api/pets/:id/request` - Create an adopt/buy request for a specific pet (Authenticated users)
   - Body JSON: `{ type: 'adoption' | 'purchase', name, email, phone, address?, message? }`
   - Does not immediately change pet status; owners/admins can review requests later

### User Profile
- `GET /api/user/profile` - Get user profile with adopted pets

## Project Structure

```
tailmate/
├── server/
│   └── index.js          # Express server with all routes
├── src/
│   ├── components/       # React components
│   │   ├── AuthContext.js
│   │   ├── UserProfile.js
│   │   ├── Login.css
│   │   └── ...
│   ├── admin/           # Admin components
│   │   ├── AdminHome.js
│   │   ├── AddPet.js
│   │   ├── ViewPets.js
│   │   └── ...
│   └── App.js           # Main App component
├── package.json
└── README.md
```

## Features Overview

### User Authentication
- Secure user registration and login
- JWT token-based authentication
- Password hashing with bcryptjs
- Protected routes for authenticated users

### Pet Management
- CRUD operations for pets (Admin only)
- Pet adoption functionality
- Pet status tracking (available/adopted)
- Image URL support for pet photos
 - New: separate Adopt/Buy request page, accessible from pet cards and the pet details page

### User Profile
- Display user information
- Show adopted pets count
- View adopted pets list
- Contact information management

### Admin Dashboard
- Modern admin interface
- Pet management tools
- Statistics overview
- Quick action buttons

### Responsive Design
- Mobile-friendly interface
- Modern UI/UX design
- Smooth animations and transitions
- Consistent styling across components

## Development

### Running in Development Mode
```bash
npm run dev
```
This will start both the backend server and React development server concurrently.

### Building for Production
```bash
npm run build
```

## Environment Variables

Create a `.env` file in the root directory:
```
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=mongodb://localhost:27017/tailmate
PORT=5000
```

## Adopt/Buy Request Page Usage

- On the Pets list and Pet Details pages, clicking "Adopt Me!" (for adoption listings) or "Buy Now!" (for sale listings) navigates you to a dedicated request page.
- Fill in your contact information and an optional message, then submit.
- You must be logged in as a regular user; otherwise, you'll be redirected to the user login page.


## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
