# Takshashila School of Civil Services - Exam Portal

A comprehensive online examination platform designed for civil services preparation, featuring real-time exam taking, payment integration, advanced analytics, and high-concurrency support.

![Exam Portal](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## 🌟 Overview

This exam portal provides a complete solution for conducting online examinations with support for multiple user roles, real-time exam taking, automated grading, payment processing, and comprehensive analytics. The system is optimized for high concurrency scenarios supporting 1000+ simultaneous users.

## ✨ Key Features

### 🎯 **Core Functionality**
- **Multi-Role System**: Admin and Student roles with granular permissions
- **Exam Management**: Create, update, and manage exams with various question types
- **Real-Time Exam Taking**: Live timer synchronization and auto-submission
- **Question Types**: MCQ, Statement-based, True/False, Multiple Select
- **Automated Grading**: Instant results with detailed performance analytics
- **Bundle System**: Group multiple exams into discounted bundles

### 💳 **Payment & Access Control**
- **Premium Exams**: Paid access to premium content
- **Payment Integration**: Razorpay payment gateway integration
- **Bundle Pricing**: Discounted exam bundles with flexible pricing
- **Access Management**: Time-based access control for purchased content

### 📊 **Analytics & Reporting**
- **Performance Metrics**: Detailed student and exam analytics
- **Rankings System**: Automatic ranking and percentile calculation
- **Result Publications**: PDF generation and publication system
- **Admin Dashboard**: Comprehensive analytics and system monitoring

### ⚡ **Performance & Scalability**
- **High Concurrency**: Optimized for 1000+ simultaneous users
- **Redis Caching**: Multi-layer caching strategy for optimal performance
- **Rate Limiting**: Intelligent rate limiting based on operation type
- **Connection Pooling**: Enhanced MongoDB connection management

## 🛠 Technology Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Lucide React** - Icon library

### **Backend** 
- **Node.js** (v18+) - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - Primary database with Mongoose ODM
- **Redis** - Caching and session management

### **Authentication & Security**
- **Clerk** - Authentication and user management
- **JWT** - Token-based authentication
- **Rate Limiting** - API protection and abuse prevention
- **Input Sanitization** - XSS and injection attack protection

### **Payment & Storage**
- **Razorpay** - Payment gateway integration
- **Firebase Storage** - File storage for publications and assets
- **Multer** - File upload handling

### **Development & Monitoring**
- **ESLint + Prettier** - Code quality and formatting
- **Vercel Analytics** - Performance monitoring
- **Morgan** - HTTP request logging

## 📁 Project Structure

```
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (admin)/               # Admin-only routes
│   │   │   └── dashboard/         # Admin dashboard pages
│   │   ├── (exams)/              # Exam-related routes
│   │   │   ├── exam/[attemptId]/ # Active exam taking
│   │   │   ├── results/          # Exam results
│   │   │   ├── rules/            # Exam rules and instructions
│   │   │   └── thankyou/         # Post-exam completion
│   │   ├── (rest)/               # Public and authenticated routes
│   │   │   ├── profile/          # User profile management
│   │   │   └── tests/            # Exam catalog and bundles
│   │   ├── api/                  # API routes
│   │   ├── onboarding/           # User onboarding flow
│   │   └── sign-in/sign-up/      # Authentication pages
│   ├── components/               # Reusable React components
│   ├── context/                  # React Context providers
│   ├── lib/                      # Utility libraries and configurations
│   ├── services/                 # API service layers
│   ├── utils/                    # Helper functions and constants
│   └── actions/                  # Server actions and data fetching
├── docs/                         # API documentation
└── public/                       # Static assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB (v5.0 or higher)
- Redis (v6.0 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd exam-portal
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Configuration**

Create a `.env.local` file in the root directory:

```env
# App Configuration
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Database
MONGODB_URI=mongodb://localhost:27017/exam-portal
REDIS_URL=redis://localhost:6379

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Payment Gateway (Razorpay)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_SECRET_KEY=your-razorpay-secret-key

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Analytics
VERCEL_ANALYTICS_ID=your-vercel-analytics-id
```

4. **Start the development server**
```bash
npm run dev
# or
yarn dev
```

The application will start on `http://localhost:3000`

### Backend Setup

The backend server should be running separately. Refer to the [API Documentation](./docs/api/README.md) for backend setup instructions.

## 📱 Application Routes

### **Public Routes**
- `/` - Homepage with featured exams and announcements
- `/sign-in` - User authentication
- `/sign-up` - User registration

### **Authenticated Routes**
- `/tests` - Exam catalog and bundle listings
- `/tests/[slug]` - Bundle exam details
- `/profile` - User profile and exam history
- `/onboarding` - New user onboarding flow

### **Exam Flow**
- `/rules?examId=<id>` - Exam rules and instructions
- `/exam/[attemptId]` - Active exam taking interface
- `/results/[attemptId]` - Detailed exam results
- `/thankyou` - Post-exam completion page

### **Admin Routes** (Requires Admin Role)
- `/dashboard` - Admin overview and analytics
- `/dashboard/exams` - Exam management
- `/dashboard/questions` - Question management
- `/dashboard/students` - User management

## 🔧 Development

### **Available Scripts**

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Type checking
npm run type-check   # Run TypeScript compiler check
```

### **Code Quality**

The project uses ESLint and Prettier for code quality:

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### **Testing**

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage
```

## 🌐 Deployment

### **Vercel Deployment** (Recommended)

1. **Connect to Vercel**
```bash
npm i -g vercel
vercel login
vercel
```

2. **Environment Variables**
Configure all environment variables in Vercel dashboard

3. **Deploy**
```bash
vercel --prod
```

### **Manual Deployment**

1. **Build the application**
```bash
npm run build
```

2. **Start production server**
```bash
npm start
```

## 📊 Performance Characteristics

### **Concurrency Support**
- **Simultaneous Users**: 1000+ concurrent exam takers
- **Rate Limits**: Operation-specific (200-500 requests/minute)
- **Connection Pool**: 300 MongoDB connections with monitoring
- **Caching**: Multi-layer Redis caching with TTL optimization

### **Response Times**
- **Exam Operations**: < 200ms (cached)
- **Question Fetching**: < 100ms (cached)
- **Answer Submission**: < 150ms
- **Result Generation**: < 2 seconds (async processing)

## 🔒 Security Features

- **Authentication**: Clerk-based JWT authentication
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Intelligent rate limiting per operation type
- **Input Validation**: Comprehensive request validation and sanitization
- **Payment Security**: Secure payment processing with signature verification
- **Data Protection**: MongoDB sanitization and XSS protection

## 📚 API Documentation

Comprehensive API documentation is available in the `docs/api/` directory:

- **[API Overview](./docs/api/README.md)** - Complete API reference
- **[Authentication & Authorization](./docs/api/authentication-authorization.md)** - Auth implementation
- **[Rate Limiting Strategy](./docs/api/rate-limiting-strategy.md)** - API protection
- **[Caching Architecture](./docs/api/caching-architecture.md)** - Performance optimization

### **Key API Endpoints**
- `GET /api/v1/exams/categorized` - Exam catalog
- `POST /api/v1/exam-attempts/start/:examId` - Start exam
- `POST /api/v1/payment/create` - Process payments
- `GET /api/v1/dashboard/stats` - Admin analytics

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Commit your changes**
```bash
git commit -m 'Add some amazing feature'
```

4. **Push to the branch**
```bash
git push origin feature/amazing-feature
```

5. **Open a Pull Request**

### **Development Guidelines**

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Maintain consistent code formatting with Prettier
- Document API changes in the appropriate documentation files
- Ensure all tests pass before submitting PR

## 🐛 Troubleshooting

### **Common Issues**

1. **Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

2. **Database Connection Issues**
```bash
# Check MongoDB connection
mongosh "your-mongodb-uri"
```

3. **Authentication Issues**
- Verify Clerk environment variables
- Check API endpoint configuration
- Ensure proper role assignment

### **Health Check**

The application provides health check endpoints:
- Frontend: `http://localhost:3000/api/health`
- Backend: `http://localhost:5000/health`

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Refer to the API documentation for implementation details

---

**Built with ❤️ for civil services aspirants**