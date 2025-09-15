# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

FarmAssist is a modern full-stack web application designed for farmers, featuring a React frontend with a Node.js/Express backend and MongoDB database. It's a farmer-focused dashboard platform with authentication, data visualization, and agricultural content management.

## Architecture

This is a **monorepo** with two main applications:

### Backend (`/Backend/`)
- **Tech Stack**: Node.js, Express, MongoDB with Mongoose
- **Authentication**: JWT tokens with passport.js and session management
- **API Structure**: RESTful API with modular route handlers
- **Database**: MongoDB Atlas connection with user profiles and agricultural data
- **Key Features**: User authentication, farming data API, chat functionality, news aggregation

### Frontend (`/frontend/`)
- **Tech Stack**: React 19 with React Router DOM, Chart.js for visualizations
- **State Management**: React hooks with localStorage persistence  
- **Styling**: Custom CSS with animations, glassmorphism design, responsive layouts
- **Architecture**: Component-based with protected routes and context-aware navigation

### Key Architectural Patterns
- **Authentication Flow**: JWT tokens stored in localStorage, axios interceptors for API calls
- **Route Protection**: `ProtectedRoute` component wraps authenticated pages
- **Data Persistence**: User state maintained across browser sessions
- **API Proxy**: Frontend proxies to backend via `proxy: "http://localhost:5000"` in package.json

## Development Commands

### Starting the Application
```bash
# Backend server (from project root)
cd Backend
npm start

# Frontend development server (from project root) 
cd frontend
npm start
```

### Backend Development
```bash
cd Backend

# Start with nodemon (auto-reload)
npm run dev

# Run authentication tests
node test-auth.js
```

### Frontend Development  
```bash
cd frontend

# Start development server (port 3001)
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Database Management
```bash
cd Backend

# Seed initial data (if needed)
node seedData.js
```

## Testing

### Backend API Testing
The project includes a comprehensive authentication test suite:
```bash
cd Backend
node test-auth.js
```
This tests:
- Server health check
- User signup flow  
- Login authentication
- Protected route access
- Profile updates

### Frontend Testing
```bash
cd frontend
npm test
```
Uses React Testing Library for component testing.

## Key Components & API Endpoints

### Backend Route Structure
- `/api/auth/*` - Authentication (login, signup, profile management)
- `/api/farming/*` - Agricultural data and farming-related endpoints
- `/api/chat/*` - Chat functionality 
- `/api/news/*` - News aggregation
- `/api/preferences/*` - User preferences management
- `/api/bookmarks/*` - Bookmark management
- `/api/contact/*` - Contact form handling
- `/health` - Server health check

### Frontend Page Structure
- **Public Pages**: Home, About, Contact, CropSearch
- **Protected Pages**: Dashboard, Profile, Chat, Settings
- **Auth Pages**: Login, Signup (redirect to Dashboard when authenticated)
- **Utility**: Debug page for development

### Core Components
- `Navbar` - Responsive navigation with authentication state awareness
- `ProtectedRoute` - Route wrapper that enforces authentication
- `Dashboard` - Main farmer dashboard with charts and agricultural data
- `Profile` - Comprehensive farmer profile management with farming-specific fields

## Development Notes

### Authentication Workflow
- JWT tokens stored as `'token'` in localStorage (not `'authToken'`)
- User data stored as `'user'` in localStorage for persistence
- Axios headers automatically configured with `'auth-token'` header
- Protected routes redirect to `/login` when unauthenticated

### Port Configuration
- Backend: `http://localhost:5000` 
- Frontend: `http://localhost:3001` (proxies API calls to backend)
- CORS configured for multiple localhost origins

### Database Connection
- Uses MongoDB Atlas with connection string in `db.js`
- Mongoose ODM with error handling and reconnection logic
- Session management with express-session

### Testing Authentication
Use the provided test script to verify the complete authentication flow:
```bash
cd Backend && node test-auth.js
```

### Chart.js Integration
Dashboard uses Chart.js with react-chartjs-2 wrapper for:
- Crop Yield Analysis (Bar Chart)
- Land Distribution (Doughnut Chart)  
- Weather Forecast Trends (Line Chart)

### Styling Architecture
- Component-specific CSS files alongside components
- Global styles in `/src/styles/animations.css`
- Custom CSS animations and glassmorphism effects
- Mobile-responsive design with CSS Grid and Flexbox

## Common Development Tasks

### Adding New API Endpoints
1. Create route handler in `/Backend/router/`
2. Register route in `/Backend/index.js`
3. Update frontend API calls in relevant components

### Adding New Protected Pages
1. Create page component in `/frontend/src/pages/`
2. Wrap with `<ProtectedRoute>` in `App.js`
3. Add navigation link to `Navbar.js`

### Running Single Tests
```bash
# Backend - test specific functionality
cd Backend
node test-auth.js

# Frontend - test specific components  
cd frontend  
npm test -- --testNamePattern="ComponentName"
```

### Environment Variables
Backend supports `.env` file for:
- `PORT` - Server port (defaults to 5000)
- `SESSION_SECRET` - Session encryption key  
- `FRONTEND_URL` - Frontend URL for CORS
- `REACT_APP_API_URL` - API base URL for frontend

### Debug Mode
Access `/debug` route for development debugging with user state information.