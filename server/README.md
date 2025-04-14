# Kamao Panel Nexus API Server

This is the backend API server for the Kamao Panel Nexus application. It provides API endpoints for user authentication, product management, order management, and reseller plan upgrade requests.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- Supabase (PostgreSQL + Auth + Storage)

## Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later)
- Supabase account and project

## Environment Setup

1. Create a `.env` file in the root of the server directory with the following variables:

```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
CLIENT_URL=http://localhost:5173
```

Replace the placeholder values with your actual Supabase project URL and API key.

## Supabase Setup

Create the following tables in your Supabase project:

1. **users**
   - id (uuid)
   - name (text)
   - email (text, unique)
   - password (text)
   - role (text) - 'admin' or 'reseller'
   - plan (text) - 'free', 'basic', 'vip', or null
   - created_at (timestamp)

2. **products**
   - id (uuid)
   - name (text)
   - price (numeric)
   - description (text)
   - category (text)
   - access_plan (text) - 'free', 'basic', 'vip', or 'all'
   - image (text)
   - stock (integer)
   - created_at (timestamp)

3. **orders**
   - id (uuid)
   - items (jsonb)
   - reseller_id (uuid, references users.id)
   - reseller_name (text)
   - reseller_email (text)
   - status (text) - 'pending', 'processing', 'completed', or 'cancelled'
   - total (numeric)
   - message (text, nullable)
   - reply (text, nullable)
   - shipping (jsonb, nullable)
   - revenue (numeric, nullable)
   - created_at (timestamp)

4. **plan_upgrade_requests**
   - id (uuid)
   - reseller_id (uuid, references users.id)
   - reseller_name (text)
   - reseller_email (text)
   - current_plan (text) - 'free', 'basic', or 'vip'
   - requested_plan (text) - 'free', 'basic', or 'vip'
   - status (text) - 'pending', 'approved', or 'rejected'
   - created_at (timestamp)

## Installation

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:

```bash
npm install
```

## Development

Start the development server with live reloading:

```bash
npm run dev
```

## Production Build

Build the TypeScript code to JavaScript:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/resellers` - Get all resellers (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/plan` - Update user plan (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/categories` - Get all product categories
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/reseller/:resellerId` - Get orders by reseller ID
- `POST /api/orders` - Create new order (reseller only)
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `PUT /api/orders/:id/reply` - Add reply to order (admin only)

### Plan Upgrade Requests
- `GET /api/plan-requests` - Get all plan upgrade requests (admin only)
- `GET /api/plan-requests/reseller/:resellerId` - Get plan requests by reseller ID
- `POST /api/plan-requests` - Create new plan upgrade request (reseller only)
- `PUT /api/plan-requests/:id/approve` - Approve plan upgrade request (admin only)
- `PUT /api/plan-requests/:id/reject` - Reject plan upgrade request (admin only) 