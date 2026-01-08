# 🎵 HarmonyHub Backend

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

**A robust, scalable, and feature-rich backend for collaborative music production and audio processing**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## 📖 Overview

HarmonyHub Backend is a professional-grade backend service designed to power collaborative music production platforms. It provides comprehensive audio processing capabilities, real-time collaboration features, AI-powered music analysis, and secure project management—all built with modern web technologies and industry best practices.

## ✨ Features

### 🎚️ Audio Processing
- **Advanced Audio Analysis**: Leveraging TensorFlow.js for AI-powered audio analysis and music intelligence
- **Real-time Audio Effects**: Apply effects and transformations to audio streams
- **Format Conversion**: Support for multiple audio formats and codecs via FFmpeg
- **Waveform Generation**: Generate visual representations of audio data

### 🤝 Real-time Collaboration
- **WebSocket Support**: Real-time communication via Socket.io for live collaboration
- **Project Sharing**: Secure project sharing and access control
- **Collaborative Editing**: Multiple users can work on the same project simultaneously
- **Activity Tracking**: Monitor and track collaboration activities

### 🔐 Security & Authentication
- **JWT Authentication**: Secure token-based authentication
- **bcrypt Password Hashing**: Industry-standard password encryption
- **Rate Limiting**: Protection against brute-force and DDoS attacks
- **Helmet.js Security**: Enhanced security headers and best practices
- **Input Validation**: Comprehensive input validation using Zod schemas

### 🗄️ Data Management
- **MongoDB Integration**: Flexible document-based data storage with Mongoose ODM
- **Redis Caching**: High-performance caching and session management
- **AWS S3 Storage**: Scalable cloud storage for audio files
- **Database Migrations**: Version-controlled schema management

### 🌐 API Design
- **GraphQL API**: Flexible, efficient data querying with Apollo Server
- **RESTful Endpoints**: Traditional REST API support
- **Type-Safe Schemas**: Full TypeScript support for type safety
- **Input Validation**: Zod-based runtime type checking

### 📊 Monitoring & Logging
- **Winston Logging**: Comprehensive logging with daily log rotation
- **Request Logging**: HTTP request/response tracking
- **Error Tracking**: Detailed error logging with stack traces
- **Performance Monitoring**: Track application performance metrics

### 🌍 Internationalization
- **i18next Integration**: Multi-language support
- **Configurable Locales**: Easy addition of new languages
- **Locale-aware Formatting**: Date, time, and number formatting per locale

## 🛠️ Tech Stack

### Core Technologies
- **Runtime**: Node.js (v18+)
- **Language**: TypeScript (v5.5+)
- **Framework**: Express.js
- **API**: GraphQL (Apollo Server), REST

### Database & Caching
- **Database**: MongoDB (Mongoose ODM)
- **Cache**: Redis, Node-Cache
- **Storage**: AWS S3

### AI & Audio Processing
- **Machine Learning**: TensorFlow.js
- **Audio Processing**: FFmpeg, Tone.js
- **Audio Analysis**: Custom audio utilities

### Real-time & Communication
- **WebSockets**: Socket.io, ws
- **Real-time Updates**: Event-driven architecture

### Security
- **Authentication**: JWT, bcrypt
- **Security Headers**: Helmet.js
- **Rate Limiting**: express-rate-limit
- **Validation**: Zod, validator
- **Sanitization**: DOMPurify

### Development Tools
- **Testing**: Jest
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript compiler
- **Dev Server**: Nodemon

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **MongoDB** (v5.0 or higher)
- **Redis** (v6.0 or higher)
- **FFmpeg** (for audio processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/blairmichaelg/harmony-hub-backend.git
   cd harmony-hub-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Copy the example environment file and configure your settings:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Server Configuration
   SERVER_HOST=localhost
   SERVER_PORT=3000
   SERVER_PROTOCOL=http
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/harmonyhub
   
   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   # Authentication
   JWT_SECRET=your_secure_jwt_secret_here
   
   # AWS S3 (Optional)
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   
   # Logging
   LOG_LEVEL=info
   LOG_FILE=logs/app-%DATE%.log
   LOG_CONSOLE=true
   ```

4. **Start MongoDB and Redis**
   
   Make sure MongoDB and Redis are running:
   ```bash
   # MongoDB
   mongod
   
   # Redis
   redis-server
   ```

5. **Run the application**
   
   Development mode with auto-reload:
   ```bash
   npm start
   ```
   
   Production build:
   ```bash
   npm run build
   node dist/src/app.js
   ```

### 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### 🔍 Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

## 📚 API Documentation

### GraphQL Endpoint

The GraphQL API is available at:
```
http://localhost:3000/graphql
```

Visit the GraphQL Playground in your browser for interactive API exploration and documentation.

### Example Queries

```graphql
# Query example
query {
  hello
}
```

For complete API documentation, please refer to the GraphQL schema in `src/graphql/schema.ts`.

## 📂 Project Structure

```
harmony-hub-backend/
├── src/
│   ├── aiServices/           # AI and machine learning services
│   ├── audioProcessing/      # Audio processing utilities
│   ├── collaborationEngine/  # Real-time collaboration logic
│   ├── config/              # Configuration management
│   ├── constants/           # Application constants
│   ├── controllers/         # Request handlers
│   ├── docs/                # Additional documentation
│   ├── environments/        # Environment-specific configs
│   ├── graphql/             # GraphQL schema and resolvers
│   ├── interfaces/          # TypeScript interfaces
│   ├── lib/                 # Shared libraries
│   ├── middleware/          # Express middleware
│   ├── models/              # Database models (Mongoose)
│   ├── projectManagement/   # Project management logic
│   ├── routes/              # API routes
│   ├── scripts/             # Utility scripts
│   ├── services/            # Business logic layer
│   ├── tests/               # Test files
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── validators/          # Input validation schemas
│   └── app.ts               # Application entry point
├── .github/                 # GitHub configuration
│   └── ISSUE_TEMPLATE/      # Issue templates
├── .env.example             # Example environment variables
├── .gitignore              # Git ignore rules
├── .prettierrc             # Prettier configuration
├── eslint.config.mjs       # ESLint configuration
├── jest.config.js          # Jest configuration
├── nodemon.json            # Nodemon configuration
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
├── CODE_OF_CONDUCT.md      # Code of conduct
├── CONTRIBUTING.md         # Contribution guidelines
├── LICENSE                 # License information
└── README.md               # This file
```

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:
- Follows the existing code style
- Includes appropriate tests
- Has clear commit messages
- Updates documentation as needed

## 📜 Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Powered by the open-source community
- Special thanks to all contributors

## 📞 Support

If you have questions or need help:

- 📧 Open an issue on GitHub
- 💬 Join our community discussions
- 📖 Check the documentation

---

<div align="center">

**[⬆ Back to Top](#-harmonyhub-backend)**

Made with 💙 by the HarmonyHub Team

</div>
