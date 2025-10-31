# InvoiceBox Inc

A simplified web-based invoicing platform connecting Providers and Purchasers.

## Features

- **Authentication**: JWT-based login/register for Providers and Purchasers
- **Invoice Management**: Create, view, and update invoice status
- **Role-based Access**: Providers create invoices, Purchasers mark as paid/defaulted
- **Dashboard**: Summary statistics for each user type
- **Dummy Data**: Pre-loaded sample users and invoices

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, React Router, Axios
- **Backend**: FastAPI, SQLAlchemy, SQLite, JWT Auth
- **Database**: SQLite with User and Invoice tables

## Quick Start

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend runs on http://localhost:8000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Demo Accounts

- **Provider**: username: `provider1`, password: `password`
- **Purchaser**: username: `purchaser1`, password: `password`

## API Endpoints

- `POST /register` - User registration
- `POST /login` - User login
- `GET /invoices` - Get user's invoices
- `POST /invoices` - Create invoice (providers only)
- `PUT /invoices/{id}` - Update invoice status
- `GET /dashboard` - Get dashboard stats
- `GET /users` - Get purchasers (providers only)

## Database Schema

### Users Table
- id, username, email, password_hash, role

### Invoices Table
- id, title, description, amount, currency, provider_id, purchaser_id, status, date_created

## Supported Currencies
- USD, UGX, LYD

## Invoice Statuses
- Pending, Paid, Defaulted