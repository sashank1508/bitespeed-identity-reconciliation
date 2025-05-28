# Bitespeed Identity Reconciliation Service

A Node.js/TypeScript service for identifying and linking customer contacts across multiple purchases for FluxKart.com.

## 🚀 Features

- **Identity Linking**: Links contacts based on common email or phone number
- **Primary/Secondary Hierarchy**: Maintains oldest contact as primary
- **Contact Merging**: Automatically merges separate primary contacts when they share information
- **RESTful API**: Simple POST endpoint for identity resolution

## 📋 API Documentation

### Interactive Documentation

Visit the **Swagger UI** for interactive API testing:

- **Local**: <http://localhost:3000/api-docs>
- **Production**: <https://bitespeed-identity-reconciliation-nse3btem5.vercel.app/api-docs>

### Endpoints Overview

#### POST /identify

Identifies and consolidates customer contact information.

**Request Body:**

```json
{
  "email": "optional_email@example.com",
  "phoneNumber": "optional_phone_number"
}
```

**Response:**

```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["primary@email.com", "secondary@email.com"],
    "phoneNumbers": ["123456", "789012"],
    "secondaryContactIds": [2, 3]
  }
}
```

#### GET /health

Health check endpoint.

#### GET /test  

Simple API test endpoint.

## 🛠️ Installation & Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd bitespeed-identity-reconciliation

# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm run dev

# Start production server
npm start
```

## 🗄️ Database Schema

Uses SQLite with the following Contact table structure:

**Local Development**: File-based SQLite database (`contacts.db`)
**Production**: In-memory SQLite database (resets on serverless function cold starts)

```sql
CREATE TABLE Contact (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phoneNumber TEXT,
  email TEXT,
  linkedId INTEGER,
  linkPrecedence TEXT CHECK(linkPrecedence IN ('primary', 'secondary')),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  deletedAt DATETIME,
  FOREIGN KEY (linkedId) REFERENCES Contact(id)
);
```

> **Note**: The production deployment uses an in-memory database optimized for serverless environments. Data persists during active usage but resets after periods of inactivity. This demonstrates the full functionality while being suitable for assignment evaluation.

## 🧪 Testing Examples

### New Customer

```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "lorraine@hillvalley.edu", "phoneNumber": "123456"}'
```

### Existing Customer with New Info

```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "mcfly@hillvalley.edu", "phoneNumber": "123456"}'
```

### Merging Two Primary Contacts

```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "george@hillvalley.edu", "phoneNumber": "717171"}'
```

## 🏗️ Project Structure

```
src/
├── controllers/     # Request handlers
├── database/        # Database connection and queries
├── models/          # Business logic
├── routes/          # API routes
├── types/           # TypeScript type definitions
└── index.ts         # Application entry point
```

## 🌐 Deployment

The service is deployed and accessible at: **<https://bitespeed-identity-reconciliation-nse3btem5.vercel.app>**

### Live API Endpoints

- **Health Check**: `GET https://bitespeed-identity-reconciliation-nse3btem5.vercel.app/health`
- **Identity Service**: `POST https://bitespeed-identity-reconciliation-nse3btem5.vercel.app/identify`
- **Test Endpoint**: `GET https://bitespeed-identity-reconciliation-nse3btem5.vercel.app/test`
- **🎯 API Documentation (Swagger UI)**: `https://bitespeed-identity-reconciliation-nse3btem5.vercel.app/api-docs`

## 📝 License

MIT License

## 👨‍💻 Author

Created for Bitespeed Backend Assignment
