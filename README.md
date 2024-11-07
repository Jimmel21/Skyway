# Skyway

# SkyWay Airlines Booking System

A flight booking application built with Angular 18.2.9 (frontend) and Flask (backend).

## Prerequisites

- Node.js (v18+)
- Python (v3.8+)
- Angular CLI v18.2.9: `npm install -g @angular/cli@18.2.9`

## Quick Start

### Backend Setup

1. Navigate to backend directory and create virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

2. Install dependencies and initialize database:
```bash
pip install -r requirements.txt
python manage_db.py init
```

3. Start the Flask server:
```bash
python run.py
```
Server runs at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory and install dependencies:
```bash
cd frontend
npm install
```

2. Install required UI component packages:
```bash
npm install @radix-ui/react-alert-dialog @radix-ui/react-slot class-variance-authority clsx lucide-react tailwindcss-animate
```

3. Start the Angular development server:
```bash
ng serve
```
Application runs at `http://localhost:4200`

## Basic Usage

1. Open your browser and go to `http://localhost:4200`
2. Search for flights by entering origin, destination, and dates
3. Select flights and enter passenger information
4. Complete the booking process
5. View booking confirmation and download e-ticket

## Project Structure
```
skyway/
├── frontend/    # Angular application
└── backend/     # Flask application
```

## Troubleshooting

If you encounter database issues:
```bash
python manage_db.py reset
```

For frontend dependency issues:
```bash
npm install --force
```
