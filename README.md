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
Copy `.env.example` to `apps/api/.env` and configure:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app
REDIS_URL=redis://localhost:6379/0
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=files
NODE_ENV=development
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