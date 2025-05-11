# CineBookings - Frontend

This is the React frontend for the CineBookings movie ticket booking application.

## Features

*   User registration and login
*   Browse movies by location
*   View movie showtimes and select dates
*   Seat selection
*   Dummy payment processing
*   View booked tickets

## Technologies Used

*   React
*   JavaScript (ES6+)
*   CSS (with Apple Music theme)
*   `apiService.js` for backend communication (partially mock, partially real for auth)

## Prerequisites

*   Node.js (v16 or later recommended)
*   npm (or yarn/pnpm)

## Getting Started

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_FRONTEND_REPOSITORY_NAME.git
    cd YOUR_FRONTEND_REPOSITORY_NAME
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    (or `yarn install` or `pnpm install`)

3.  **Configure Backend API URL (if needed):**
    The frontend currently connects to the backend auth API at `http://localhost:8089/api`. If your backend runs elsewhere, update the `API_BASE_URL` in `src/apiService.js`.

4.  **Run the development server:**
    ```bash
    npm start
    ```
    (or `npm run dev` if using Vite, or `yarn start`)

5.  Open your browser and navigate to `http://localhost:3000` (or the port your development server uses, often 5173 for Vite).

## Available Scripts

In the project directory, you can run:

### `npm start` or `npm run dev`
Runs the app in development mode.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` (or `dist`) folder.