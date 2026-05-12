# Maintenance Tracker

A web app to log and track maintenance records for your vehicles. Built with React + Vite + TailwindCSS, backed by **Firebase Authentication** and **Firebase Realtime Database**. All data syncs live across devices.

## Features

- Email/password **signup, login, logout** with friendly error messages.
- **Garage**: add, search, and remove vehicles. Each vehicle stores:
  - Year, Make, Model, Trim, Color
  - VIN, License Plate
  - Tire Size
  - Drivetrain (FWD / RWD / AWD / 4WD)
  - In-service date
  - Current mileage
  - Free-form notes
- **Vehicle Details**: edit vehicle info, view stats (record count, total spent, last service, last mileage), and manage maintenance records.
- **Maintenance Records**: add, edit, and delete records with date, mileage, service type, description, cost, shop, and notes. New record mileage automatically bumps the vehicle's current mileage when it's higher.
- **Realtime sync** — changes appear instantly across tabs and devices using Firebase Realtime Database listeners.
- Sensible **Realtime Database security rules** included (`database.rules.json`) so each user can only access their own data.

## Tech Stack

- React 18 + Vite
- React Router v6
- TailwindCSS
- lucide-react icons
- Firebase v10 (Auth + Realtime Database)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. In **Build → Authentication → Sign-in method**, enable **Email/Password**.
3. In **Build → Realtime Database**, create a database (start in **locked mode**; we'll provide rules next).
4. In **Build → Realtime Database → Rules**, paste the contents of `database.rules.json` and publish.
5. In **Project settings → General → Your apps**, register a **Web app** and copy the config values.

### 3. Configure environment variables

Copy `.env.example` to `.env.local` at the project root and fill in your Firebase config:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=https://<project>-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> **Important:** `VITE_FIREBASE_DATABASE_URL` is required for Realtime Database. You can find it in the Realtime Database tab.

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:5173, sign up, and start adding vehicles.

### 5. Production build

```bash
npm run build
npm run preview
```

## Data Model

Realtime Database structure (per authenticated user):

```
users/
  <uid>/
    vehicles/
      <vehicleId>/
        year, make, model, trim, color,
        vin, licensePlate, tireSize, drivetrain,
        inServiceDate, currentMileage, notes,
        createdAt, updatedAt
    maintenance/
      <vehicleId>/
        <recordId>/
          date, mileage, serviceType, description,
          cost, shop, notes, createdAt, updatedAt
```

## Security

The included `database.rules.json` ensures:

- Only authenticated users may read/write.
- Each user can only access nodes under their own `users/<uid>` path.
- Required fields are validated server-side (e.g., `make`/`model` on vehicles, `date`/`serviceType` on records).

Make sure to publish these rules in the Firebase console before going to production.

## Project Structure

```
src/
  components/   Reusable UI: Navbar, Modal, ProtectedRoute, forms, cards
  contexts/     AuthContext (Firebase Auth wrapper)
  pages/        Login, Signup, Garage, VehicleDetails
  firebase.js   Firebase app/auth/db initialization
  App.jsx       Routing
  main.jsx      App bootstrap
```
