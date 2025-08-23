# AI Career Assistant

A comprehensive AI-powered career assistant that analyzes resumes and job descriptions using RAG (Retrieval-Augmented Generation) technology.

## 🏗️ Project Structure

```
ai-career-assistant/
├── apps/
│   └── api/                    # NestJS API server
├── packages/
│   ├── configs/                # Shared configuration (ESLint, Prettier, TypeScript)
│   ├── providers/              # External service providers (OpenAI, S3, etc.)
│   └── shared/                 # Shared utilities and types
├── infra/
│   ├── prisma/                 # Database schema and migrations
│   ├── scripts/                # Database initialization scripts
│   └── seed.ts                 # Database seeding script
├── docker-compose.yml          # Infrastructure services
└── package.json                # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker and Docker Compose

### Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd ai-career-assistant
   pnpm setup
   ```

   This command will:
   - Install all dependencies
   - Start infrastructure services (PostgreSQL, Redis, MinIO)
   - Generate Prisma client
   - Run database migrations
   - Seed the database with demo data

2. **Start development:**
   ```bash
   pnpm dev
   ```
   This starts the API server at `http://localhost:4000`

## 📋 Available Scripts

### Development

- `pnpm dev` - Start API server with infrastructure
- `pnpm dev:full` - Start all services including Docker containers
- `pnpm build` - Build all packages and applications
- `pnpm test` - Run all tests
- `pnpm test:watch` - Run tests in watch mode

### Code Quality

- `pnpm lint` - Lint all code
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm typecheck` - Run TypeScript type checking

### Database Management

- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Deploy database migrations
- `pnpm db:reset` - Reset database (⚠️ destructive)
- `pnpm db:studio` - Open Prisma Studio
- `pnpm seed` - Seed database with demo data

### Docker Management

- `pnpm docker:infra` - Start infrastructure services only
- `pnpm docker:up` - Start all Docker services
- `pnpm docker:down` - Stop all Docker services
- `pnpm docker:clean` - Clean up Docker resources (⚠️ removes volumes)
- `pnpm docker:logs` - View Docker logs
- `pnpm docker:restart` - Restart Docker services

### Maintenance

- `pnpm clean` - Clean build artifacts
- `pnpm clean:all` - Clean everything including node_modules and Docker
- `pnpm install:all` - Install dependencies for all packages

## 🏢 Services Architecture

### Infrastructure Services (Docker)

1. **PostgreSQL Database** (`db`)
   - Port: `5432`
   - Database: `app`
   - Extensions: pgvector for embeddings
   - Health check: `pg_isready`

2. **Redis Cache** (`redis`)
   - Port: `6379`
   - Used for: Session storage, job queues
   - Health check: `redis-cli ping`

3. **MinIO Object Storage** (`minio`)
   - API Port: `9000`
   - Console Port: `9001`
   - Used for: File storage (resumes, job descriptions)
   - Credentials: `minioadmin/minioadmin`

4. **MailHog Email Testing** (`mailhog`)
   - SMTP Port: `1025`
   - Web UI Port: `8025`
   - Used for: Development email testing (magic links)
   - Access: http://localhost:8025

### Application Services

1. **API Server** (`apps/api`)
   - Framework: NestJS
   - Port: `4000`
   - Features:
     - REST API endpoints
     - File upload handling
     - Background job processing
     - Health checks
     - Swagger documentation

2. **Shared Packages**
   - `@ai-career/shared`: Common utilities and types
   - `@ai-career/providers`: External service integrations
   - `@ai-career/configs`: Shared configurations

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **User**: User accounts and authentication
- **Document**: File storage metadata (resumes, job descriptions)
- **Resume**: Resume data and analysis
- **ResumeVersion**: Version control for resume iterations
- **JobDescription**: Job posting data and requirements
- **Run**: Analysis execution tracking
- **Log**: System and analysis logs

### Vector Embeddings

The database supports vector embeddings using pgvector extension for:

- Resume content similarity search
- Job description matching
- Semantic analysis

## 🔧 Development Workflow

### Adding New Features

1. Create feature branch
2. Develop in `apps/api` or relevant package
3. Add tests
4. Run `pnpm typecheck && pnpm lint && pnpm test`
5. Create pull request

### Database Changes

1. Modify `infra/prisma/schema.prisma`
2. Generate migration: `cd infra && npx prisma migrate dev --name <migration-name>`
3. Update seed data if needed
4. Test migration: `pnpm db:reset && pnpm seed`

### Package Development

1. Work in respective package directory
2. Use workspace dependencies: `"@ai-career/shared": "workspace:*"`
3. Build and test: `pnpm build && pnpm test`

## 🐳 Docker Configuration

The `docker-compose.yml` defines:

- Infrastructure services (always needed)
- API service (optional, can run locally)
- Placeholder for future web and worker services

### Environment Variables

Copy `.env.example` to `apps/api/.env` and configure all required variables:

#### Core Infrastructure

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app

# Redis
REDIS_URL=redis://localhost:6379/0

# Object Storage (MinIO/S3)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=files
S3_REGION=us-east-1

# Application
NODE_ENV=development
PORT=4000
```

#### Authentication & Security

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_ACCESS_TTL=900000      # 15 minutes in milliseconds
JWT_REFRESH_TTL=604800000  # 7 days in milliseconds

# NextAuth (for web app)
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (for magic links)
# Development: Uses MailHog for email testing
EMAIL_SERVER_HOST=mailhog
EMAIL_SERVER_PORT=1025
EMAIL_FROM=noreply@local.test
# Production: Use real SMTP server
# EMAIL_SERVER_HOST=smtp.gmail.com
# EMAIL_SERVER_PORT=587
# EMAIL_SERVER_USER=your-email@gmail.com
# EMAIL_SERVER_PASSWORD=your-app-password
# EMAIL_FROM=noreply@yourapp.com
```

#### Rate Limiting & Security

```env
# Rate Limiting
RATE_LIMIT_WINDOW=900000   # 15 minutes in milliseconds
RATE_LIMIT_MAX=100         # Max requests per window

# Application URLs
WEB_BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:4000
```

#### External Services

```env
# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Other AI Providers (optional)
ANTHROPIC_API_KEY=your-anthropic-api-key
COHERE_API_KEY=your-cohere-api-key
```

#### Production Overrides

```env
# Production Database (use connection pooling)
DATABASE_URL=postgresql://user:pass@prod-host:5432/db?connection_limit=20

# Production Redis (use Redis Cloud or similar)
REDIS_URL=redis://user:pass@prod-redis:6379/0

# Production S3 (use AWS S3)
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your-aws-access-key
S3_SECRET_KEY=your-aws-secret-key
S3_BUCKET=your-production-bucket
S3_REGION=us-west-2
```

## 🚨 Troubleshooting

### Common Issues

1. **Docker services not starting:**

   ```bash
   pnpm docker:clean
   pnpm docker:infra
   ```

2. **Database connection issues:**

   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

3. **TypeScript errors:**

   ```bash
   pnpm clean
   pnpm install:all
   pnpm typecheck
   ```

4. **Port conflicts:**
   - PostgreSQL: 5432
   - Redis: 6379
   - MinIO: 9000, 9001
   - API: 4000

### Logs and Debugging

- View Docker logs: `pnpm docker:logs`
- API logs: Check terminal output when running `pnpm dev`
- Database queries: Use `pnpm db:studio`

## 📝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Use conventional commits
5. Ensure all checks pass: `pnpm typecheck && pnpm lint && pnpm test`

## 📄 License

This project is private and proprietary.

## 🔒 Authentication Setup

### API Authentication

- The API uses JWT for authentication.
- Endpoints: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`.
- Configure JWT_SECRET in .env.

### Web Authentication

- Uses NextAuth with Credentials and Google providers.
- Configure NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET in .env.

### Running with Auth

1. Copy .env.example to .env and fill in secrets.
2. Start the app with `pnpm dev`.
3. Access login at `/login`.

## 🛡️ Security Features & Checklist

### Implemented Security Features

#### Authentication & Authorization

- [x] **JWT Authentication**: Short-lived access tokens (15 min) with refresh token rotation
- [x] **Role-Based Access Control**: User roles (USER, ADMIN) with proper authorization
- [x] **Ownership Validation**: Services verify resource ownership before operations
- [x] **Session Management**: Secure refresh token handling with database storage

#### API Security

- [x] **Rate Limiting**: Configurable limits per endpoint (20 req/15min for auth)
- [x] **Request Validation**: Zod schemas for all input validation
- [x] **CORS Configuration**: Restricted origins for production
- [x] **Security Headers**: Helmet.js for standard security headers
- [x] **Request Size Limits**: File upload and JSON payload limits

#### File Upload Security

- [x] **Signed URLs**: Pre-signed URLs for secure S3 uploads
- [x] **File Validation**: MIME type and size validation
- [x] **Virus Scanning**: Worker-based antivirus scanning (stubbed)
- [x] **Upload Lifecycle**: Init → Upload → Finalize workflow

#### Monitoring & Auditing

- [x] **Audit Logging**: All mutations logged with user context
- [x] **Error Handling**: Standardized error taxonomy
- [x] **Health Checks**: API and database health endpoints

### Security Configuration

#### Environment Security

```bash
# Generate secure secrets (minimum 32 characters)
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For NEXTAUTH_SECRET
```

#### Production Security Checklist

- [ ] **Environment Variables**: All secrets in secure environment (not .env files)
- [ ] **Database Security**: Connection pooling, SSL enabled, restricted access
- [ ] **Redis Security**: Password authentication, SSL/TLS enabled
- [ ] **S3 Security**: IAM roles, bucket policies, encryption at rest
- [ ] **API Security**: HTTPS only, security headers, rate limiting tuned
- [ ] **Monitoring**: Error tracking, performance monitoring, security alerts

#### Optional Enhancements

- [ ] **Google OAuth**: Complete OAuth integration (currently stubbed)
- [ ] **Email Magic Links**: Passwordless authentication
- [ ] **2FA**: Two-factor authentication
- [ ] **API Keys**: Service-to-service authentication
- [ ] **Webhook Security**: HMAC signature verification

### Security Best Practices

1. **Never commit secrets** to version control
2. **Use environment-specific configurations** for different deployments
3. **Regularly rotate secrets** and API keys
4. **Monitor audit logs** for suspicious activity
5. **Keep dependencies updated** with security patches
6. **Use HTTPS** in production environments
7. **Implement proper error handling** to avoid information leakage
8. **Validate all inputs** at API boundaries
9. **Use principle of least privilege** for database and service access
10. **Regular security audits** and penetration testing
