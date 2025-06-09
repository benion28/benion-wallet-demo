# ⚡ Bill Vending Backend API

A NestJS + MongoDB backend service for wallet-based electricity bill payments.

## 🔧 Features

- Wallet funding via Paystack
- Balance checking
- Electricity bill payments (mocked)
- Secure JWT authentication (Bearer token)
- Registration/Login with x-api-key
- Async failure handling (mocked events)
- Swagger API documentation

## 🧰 Tech Stack

- **Backend:** NestJS, TypeScript
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + API Key
- **Payment:** Paystack
- **Async:** Event-driven architecture (mocked)

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/yourname/bill-vending-api.git
cd bill-vending-api
npm install


### 2. Run the Application

```bash
npm run server
```
<!-- with docker  -->

```bash
docker-compose up --build
```

### 3. API Documentation

Open [http://localhost:3000/api/docs](http://localhost:3000/api/docs) to view the API documentation.


### 4. Testing

```bash
npm run test
```





