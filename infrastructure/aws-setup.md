# AWS Infrastructure Setup (EC2 + ALB)

Step-by-step notes to deploy the backend on EC2 behind an Application Load Balancer and use RDS for PostgreSQL.

## Prerequisites
- AWS account + IAM user with admin or relevant permissions
- AWS CLI configured (optional but recommended)
- SSH key pair for EC2

## 1) Networking & Security
- Create a VPC (or reuse default) with public subnets in at least 2 AZs.
- Security groups:
  - `alb-sg`: inbound 80/443 from 0.0.0.0/0.
  - `ec2-app-sg`: inbound from `alb-sg` on app port (3000) and SSH 22 from your IP.
  - `rds-sg`: inbound 5432 from `ec2-app-sg` only.

## 2) RDS PostgreSQL
- RDS > Create database > PostgreSQL, small instance (e.g., `db.t3.micro` for dev).
- Storage: gp3/gp2 20GB; enable backups.
- Network: place in same VPC; attach `rds-sg`.
- Note the endpoint; disable public access for non-dev.

## 3) EC2 App Instance
- Launch Amazon Linux 2023 (or Ubuntu LTS) in two public subnets (one per AZ) if using an ASG, else single instance for dev.
- Attach `ec2-app-sg`.
- User data (Amazon Linux) to install runtime:
  ```bash
  #!/bin/bash
  yum update -y
  curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
  yum install -y nodejs git
  npm install -g pm2
  ```
- Attach an IAM instance profile if you need S3/CloudWatch access.

## 4) Application Load Balancer
- EC2 > Load Balancers > Create ALB.
- Scheme: internet-facing; listeners: 80 (and 443 with ACM cert later).
- Target group: HTTP, port 3000, target type = instance.
- Register your EC2 instances; set health check path `/health`.
- Security groups: ALB uses `alb-sg`; targets use `ec2-app-sg`.

## 5) Deploy Backend App
On each EC2 target:
```bash
git clone https://github.com/<your-org>/<repo>.git
cd backend
npm install --production
```
Create `.env`:
```env
NODE_ENV=production
PORT=3000
DB_HOST=<RDS_ENDPOINT>
DB_PORT=5432
DB_NAME=blood_bank_db
DB_USER=<db_user>
DB_PASSWORD=<db_password>
JWT_SECRET=<strong_secret>
JWT_REFRESH_SECRET=<strong_secret>
FRONTEND_URL=<https://your-frontend-domain>
```
Run DB migrations (from repo root):
```bash
cd database && psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f migrations/001_initial_schema.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f migrations/002_add_donor_priority.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f seeds/sample_data.sql  # optional
```
Start app with PM2:
```bash
cd ../backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # follow printed instructions
```

## 6) Frontend (optional S3/CloudFront)
- Build: `cd frontend && npm install && npm run build`.
- S3: create bucket, upload `dist/`.
- CloudFront: origin = S3 bucket; default root object `index.html`.
- Set custom domain + SSL via ACM + Route53.

## 7) Hardening & Ops
- Enable HTTPS on ALB (listener 443) with ACM cert.
- Use Secrets Manager/SSM Parameter Store for DB creds/JWT secrets.
- Enable CloudWatch Logs/Alarms (CPU, latency, 5xx, health checks).
- Turn on automatic backups + snapshots for RDS; set maintenance window.
- Consider an Auto Scaling Group for EC2 with min=1/desired=1 for HA later.

