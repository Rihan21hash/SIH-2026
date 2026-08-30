# AeroWatch — Deployment Guide

## 1. Docker Compose Deployment (Local / Staging)

Launch the complete containerized stack (PostGIS, Redis, Backend, Frontend):

```bash
cd aerowatch
docker compose up --build -d
```

Check status:
```bash
docker compose ps
docker compose logs -f backend
```

---

## 2. Production AWS Cloud Deployment Architecture

- **Frontend**: AWS Amplify or Amazon CloudFront + S3 static hosting / ECS Fargate.
- **Backend API**: AWS ECS Fargate container tasks behind an Application Load Balancer (ALB).
- **Database**: Amazon RDS for PostgreSQL with PostGIS extension enabled.
- **Cache**: Amazon ElastiCache for Redis.
- **Data Ingestion**: Scheduled AWS Lambda / AWS Step Functions pulling NOAA GFS & ECMWF forecast grids into Amazon S3.
