# Project Setup Guide

This guide explains how to set up and run the project locally.

## Prerequisites
- Node.js and npm installed on your system.
- A PostgreSQL database (e.g., Neon.tech or local instance).

## Installation Steps

1. **Clone the repo**
  ```bash
  git clone https://github.com/hemant838/review-and-rating-system.git
  ```

2. **Install dependencies in the root directory**
```bash
npm install
```
3. **Navigate to Server Directory & Install Dependencies**
```bash
cd server
npm install
```

4. **Set Environment Variables in the Root Directory**
   **In the root of the project, create a .env file:**
```bash
VITE_API_URL=http://localhost:3001
```

4. **Set Environment Variables in the Server Directory**
   **navigate to the server directory**
```bash
cd server
```
**Then create a .env file:**
```bash
PORT=3001
DATABASE_URL=your db url
```

**Once everything is set up:**
**In a new terminal tab, go to the root directory and start the project:**
```bash
npm run dev
```

