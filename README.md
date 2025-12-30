# 🥗 NutriScan

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native"/>
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
</p>

Aplikasi mobile untuk tracking nutrisi dan kalori makanan. Dilengkapi dengan fitur BMI calculator, food logging, dan analytics untuk membantu pengguna mencapai target kesehatan mereka.

---

## ✨ Fitur Utama

- 🔐 **Autentikasi** - Register & Login dengan JWT
- 👤 **Profil Pengguna** - Kelola data pribadi dan avatar
- 📊 **BMI Calculator** - Hitung dan pantau Body Mass Index
- 🍽️ **Food Logging** - Catat makanan yang dikonsumsi
- 📈 **Analytics** - Visualisasi data nutrisi (7, 30, 90 hari)
- 📚 **Food Catalog** - Database makanan dengan info kalori

---

## 🏗️ Arsitektur Proyek

```
NutriScan/
├── apps/
│   ├── nutriscan-app/     # React Native (Expo) Frontend
│   │   ├── app/           # Expo Router screens
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React Context (Auth, etc)
│   │   ├── hooks/         # Custom React hooks
│   │   └── api/           # API service layer
│   │
│   └── nutriscan-api/     # Express.js Backend
│       ├── src/
│       │   ├── controllers/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── middleware/
│       │   └── utils/
│       └── prisma/        # Database schema
│
└── .gitignore
```

---

## 🚀 Instalasi & Setup

### Prerequisites

- Node.js 18+
- npm atau yarn
- Expo CLI (`npm install -g expo-cli`)
- Database (PostgreSQL/MySQL/SQLite)

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/NutriScan.git
cd NutriScan
```

### 2. Setup Backend (API)

```bash
cd apps/nutriscan-api

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi database Anda

# Generate Prisma client
npm run prisma:generate

# Push schema ke database
npm run prisma:push

# (Optional) Seed data
npm run seed

# Jalankan server
npm run dev
```

### 3. Setup Frontend (Mobile App)

```bash
cd apps/nutriscan-app

# Install dependencies
npm install

# Jalankan Expo
npm start
```

---

## ⚙️ Environment Variables

Buat file `.env` di `apps/nutriscan-api/`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nutriscan"

# JWT
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development
```

---

## 📱 Tech Stack

### Frontend (Mobile App)
| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81 | Mobile framework |
| Expo | 54 | Development platform |
| Expo Router | 6 | Navigation |
| Reanimated | 4 | Animations |
| Axios | 1.13 | HTTP client |
| Lucide Icons | 0.562 | Icon library |

### Backend (API)
| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 5 | Web framework |
| Prisma | 5.10 | ORM |
| JWT | 9 | Authentication |
| Bcrypt | 3 | Password hashing |
| Zod | 3.22 | Validation |
| Helmet | 8 | Security |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user baru |
| POST | `/api/auth/login` | Login user |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get profil user |
| PUT | `/api/user/profile` | Update profil |

### Food
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/food` | Get semua makanan |
| POST | `/api/food` | Tambah makanan baru |
| POST | `/api/food/log` | Log konsumsi makanan |
| GET | `/api/food/logs` | Get riwayat konsumsi |

---

## 🧪 Testing

```bash
# Backend tests
cd apps/nutriscan-api
npm test

# Mobile app
cd apps/nutriscan-app
npm test
```

---

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

---

## 👥 Contributors

- Frontend Developer - [Muhammad Naufal Tiftazani]
- Backend Developer - [Zulfahmi & Ikhlassul Amal]
- Database Administrator - [Fasya Habibburahman]
- Quality Assurance - [Alpatehul Rahman]

---
