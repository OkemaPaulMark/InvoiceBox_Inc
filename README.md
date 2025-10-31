# InvoiceBox Inc

A modern web-based invoicing platform connecting Providers and Purchasers with comprehensive analytics and dashboard features.

## Features

- **User Authentication**: JWT-based registration and login system
- **Role-Based Access**: Separate interfaces for Providers and Purchasers
- **Invoice Management**: Create, view, and track invoice status
- **Payment Workflow**: Pending → Payment Submitted → Paid/Defaulted
- **Interactive Dashboard**: Real-time statistics and analytics charts
- **Multi-Currency Support**: USD, UGX, and LYD currencies
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

**Frontend:**
- React 19 + Vite
- Tailwind CSS for styling
- Chart.js for analytics visualization
- React Router for navigation
- Axios for API communication

**Backend:**
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite database
- JWT authentication
- Faker for dummy data generation

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- npm or yarn

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the server:
```bash
uvicorn main:app --reload
```

Backend runs on: `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 👥 User Roles

### Provider
- Create and manage invoices
- View invoice analytics
- Track payment status
- Access comprehensive dashboard

### Purchaser
- View assigned invoices
- Submit payment confirmations
- Update invoice status
- Monitor payment history

## API Endpoints

- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /invoices` - Retrieve user invoices
- `POST /invoices` - Create new invoice (providers only)
- `PUT /invoices/{id}` - Update invoice status
- `GET /dashboard` - Dashboard statistics
- `GET /analytics` - Analytics data
- `GET /users` - Get purchasers (providers only)

## Database Schema

### Users Table
- id, username, email, password_hash, role

### Invoices Table
- id, invoice_number, title, description, amount, currency
- provider_id, purchaser_id, status, payment_reference
- payment_date, date_created

## Invoice Status Flow

1. **Pending** - Initial invoice state
2. **Payment Submitted** - Purchaser submits payment
3. **Paid** - Provider confirms payment
4. **Defaulted** - Payment failed or overdue

## Development

### Build Frontend
```bash
cd frontend
npm run build
```

### Run Tests
```bash
cd frontend
npm run lint
```

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**InvoiceBox Inc** - Simplifying invoice management for modern businesses.