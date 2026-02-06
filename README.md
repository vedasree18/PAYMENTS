# 🎨 NovaPay - Digital Wallet Application

A modern, feature-rich digital wallet application built with React, TypeScript, and Firebase. NovaPay provides a seamless UPI payment experience with real-time transaction updates and secure authentication.

![NovaPay](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue)
![Firebase](https://img.shields.io/badge/Firebase-12.9.0-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38bdf8)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646cff)

## ✨ Features

### 🔐 Authentication
- **Email/Password Authentication** via Firebase
- **Secure Login & Signup** with validation
- **Role-based Access** (Admin & User roles)
- **Session Management** with auto-logout

### 💰 Wallet Management
- **Real-time Balance Updates** using Firestore listeners
- **Admin Account** starts with ₹100,000
- **User Accounts** start with ₹0 balance
- **Transaction History** with status tracking

### 💸 Payment Features
- **Send Money** via UPI ID
- **QR Code Scanning** for quick payments
- **Payment Confirmation** with PIN verification
- **Transaction Status** (Success/Failed)
- **Quick Send** to recent contacts

### 🎨 User Interface
- **Modern Design** with Tailwind CSS
- **Responsive Layout** (Mobile & Desktop)
- **Dark Mode Support** (optional)
- **Smooth Animations** and transitions
- **Loading States** and error handling

### 🔒 Security
- **App Lock** with PIN protection
- **Biometric Authentication** support (optional)
- **Secure Firebase Rules** for data protection
- **Environment Variables** for sensitive data

## 🚀 Tech Stack

- **Frontend:** React 18.3.1 + TypeScript
- **Build Tool:** Vite 6.2.0
- **Styling:** Tailwind CSS 3.4.1
- **Backend:** Firebase (Auth + Firestore)
- **Icons:** Lucide React
- **QR Code:** react-qr-code, jsqr

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Clone Repository
```bash
git clone https://github.com/vedasree18/PAYMENTS.git
cd PAYMENTS
