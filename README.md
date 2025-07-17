# 💸 Horizon – Fintech Bank App (Learning Project)

![Horizon App](https://github.com/kritikakoirala/banking_app/blob/main/public/icons/app-image.png?raw=true)

[![Built with](https://img.shields.io/badge/Built%20with-Next.js%20%26%20TypeScript-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/status-Learning_Project-blue?style=flat-square)]()

**Horizon** is a modern **Fintech SaaS demo application** built with **Next.js**, **TypeScript**, and a robust real-time banking integration stack. It connects to multiple bank accounts, tracks transactions, enables secure user-to-user transfers, and provides a clean, responsive UI for managing personal finances.

> ⚠️ This is a **learning project** — not intended for production or commercial use.  
> 💡 Built to explore integrations like **Plaid**, **Dwolla**, and **Appwrite** in a full-stack TypeScript environment.

---

## 🧱 Tech Stack

| Technology       | Purpose                               |
|------------------|----------------------------------------|
| **Next.js**      | React framework for SSR and routing   |
| **TypeScript**   | Strong typing for safer development   |
| **Appwrite**     | Open-source backend & auth            |
| **Plaid**        | Connect & read user bank data         |
| **Dwolla**       | ACH bank transfers between users      |
| **React Hook Form** | Efficient form management         |
| **Zod**          | Form validation and schema enforcement|
| **Tailwind CSS** | Utility-first CSS framework           |
| **Chart.js**     | Visualizing spending with charts      |
| **ShadCN / Radix** | Accessible and reusable UI components|

---

## ✨ Key Features

### 🔐 Authentication
- Secure, SSR-friendly login and signup flow
- Input validations with **Zod**
- Token/session management using **Appwrite**

### 🏦 Bank Connectivity (Plaid)
- Users can link multiple bank accounts
- Bank accounts instantly synced and updated

### 🏠 Home Dashboard
- Overview of total balances across all accounts
- Recent transactions and spending insights via **Chart.js**
- Categorized expense breakdown

### 🧾 My Banks
- Detailed list of connected banks and account data
- Bank logos, balances, and account type display

### 📄 Transaction History
- Paginated and filterable
- View transactions across all banks or filter by individual account

### 🔄 Real-Time Sync
- Any account addition or data update reflects across relevant views instantly

### 💸 Funds Transfer (Dwolla)
- User-to-user transfers using ACH via **Dwolla**
- Requires recipient bank ID, amount, and secure validation

### 📱 Fully Responsive
- Seamless experience across desktop, tablet, and mobile devices

---

## 📁 Codebase Highlights

- Modular & reusable **component architecture**
- Clean separation of concerns for logic, services, and UI
- Realtime API updates with proper error and loading states
