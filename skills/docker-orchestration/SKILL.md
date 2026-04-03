---
name: Docker & Container Orchestration
description: Build lean Docker images, compose multi-container apps, and orchestrate deployments with Kubernetes. Covers health checks, resource limits, secrets management, and CI/CD pipeline integration.
license: MIT
---

# Docker & Container Orchestration

Master containerization from single Dockerfile to production-grade Kubernetes deployments.

## Core Capabilities

- **Multi-stage builds**: Reduce image size by up to 90% with optimized Dockerfiles
- **Docker Compose**: Orchestrate local development environments with one command
- **Kubernetes deployments**: Deployments, Services, ConfigMaps, Secrets, and HPA
- **Health checks & probes**: Liveness and readiness probes for zero-downtime deployments
- **CI/CD integration**: GitHub Actions, GitLab CI, and Jenkins pipeline templates

## When to Use

Use this skill when you need to:
- Containerize an existing application
- Set up local dev environments with Docker Compose
- Deploy to Kubernetes (GKE, EKS, AKS, or self-hosted)
- Optimize image build times in CI pipelines

## Example: Optimized Multi-Stage Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Runtime stage
FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:3000/health || exit 1
USER node
CMD ["node", "server.js"]
```

## Best Practices

1. **Never run as root** in production containers
2. **Pin base image versions** — never use `:latest`
3. **Use `.dockerignore`** to exclude node_modules, .git, and secrets
4. **One process per container** — sidecars go in separate containers
