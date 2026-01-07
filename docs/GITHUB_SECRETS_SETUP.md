# 🔐 GitHub Secrets Setup Guide

## Overview

This guide explains how to store all deployment variables in GitHub repository secrets for secure CI/CD deployments.

---

## Why Use GitHub Secrets?

✅ **Security**: Secrets are encrypted and never exposed in logs  
✅ **CI/CD Ready**: Automatic deployments from GitHub Actions  
✅ **Team Collaboration**: Shared secrets for team members  
✅ **No Local Files**: No need to commit sensitive data  

---

## Required Secrets

### Core Configuration

| Secret Name | Description | Example | Required |
|------------|-------------|---------|----------|
| `AWS_ACCESS_KEY_ID` | AWS access key ID | `AKIAIOSFODNN7EXAMPLE` | ✅ Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | ✅ Yes |
| `AWS_REGION` | AWS region | `us-east-1` | ⚠️ Optional (defaults to us-east-1) |
| `PROJECT_NAME` | Project name | `dental-hospital-system` | ⚠️ Optional (defaults to dental-hospital-system) |
| `JWT_SECRET` | JWT secret for token encryption | `your-secret-key-here` | ✅ Yes |
| `ADMIN_PASSWORD` | Initial admin user password | `YourSecurePassword123!` | ⚠️ Optional (defaults to Admin123!) |
| `TERRAFORM_STATE_BUCKET` | S3 bucket for Terraform state | `dental-hospital-terraform-state-123456` | ⚠️ Optional (will be created) |

### Custom Domain (Optional)

| Secret Name | Description | Example | Required |
|------------|-------------|---------|----------|
| `API_CUSTOM_DOMAIN` | API Gateway custom domain | `api.rghs-dental.info` | ❌ No |
| `ROUTE53_HOSTED_ZONE_ID` | Route53 hosted zone ID | `Z1234567890ABC` | ❌ No |
| `ACM_CERTIFICATE_ARN` | ACM certificate ARN for API | `arn:aws:acm:us-east-1:123456789012:certificate/abc123` | ❌ No |
| `CLOUDFRONT_CUSTOM_DOMAIN` | CloudFront custom domain | `cdn.rghs-dental.info` | ❌ No |
| `CLOUDFRONT_ROUTE53_ZONE_ID` | Route53 hosted zone ID for CloudFront | `Z1234567890ABC` | ❌ No |
| `CLOUDFRONT_ACM_CERTIFICATE_ARN` | ACM certificate ARN for CloudFront | `arn:aws:acm:us-east-1:123456789012:certificate/xyz789` | ❌ No |

---

## Step-by-Step Setup

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)

---

### Step 2: Add Required Secrets

Click **New repository secret** for each secret:

#### 1. AWS Credentials

**Name**: `AWS_ACCESS_KEY_ID`  
**Value**: Your AWS access key ID  
**How to get**: AWS Console → IAM → Users → Your User → Security Credentials → Create Access Key

**Name**: `AWS_SECRET_ACCESS_KEY`  
**Value**: Your AWS secret access key  
**⚠️ Important**: Copy this immediately - you won't see it again!

---

#### 2. Core Configuration

**Name**: `AWS_REGION`  
**Value**: `us-east-1` (or your preferred region)

**Name**: `PROJECT_NAME`  
**Value**: `dental-hospital-system`

**Name**: `JWT_SECRET`  
**Value**: Generate a secure secret:
```bash
openssl rand -base64 32
```

**Name**: `ADMIN_PASSWORD`  
**Value**: Choose a strong password (e.g., `YourSecurePassword123!`)

**Name**: `TERRAFORM_STATE_BUCKET`  
**Value**: `dental-hospital-terraform-state-$(date +%s)`  
**Note**: Or leave empty - script will create it automatically

---

#### 3. Custom Domain (Optional)

If using custom domains:

**Name**: `API_CUSTOM_DOMAIN`  
**Value**: `api.rghs-dental.info`

**Name**: `ROUTE53_HOSTED_ZONE_ID`  
**Value**: `Z1234567890ABC` (from Route53 console)

**Name**: `ACM_CERTIFICATE_ARN`  
**Value**: `arn:aws:acm:us-east-1:123456789012:certificate/abc123...`

**Name**: `CLOUDFRONT_CUSTOM_DOMAIN`  
**Value**: `cdn.rghs-dental.info`

**Name**: `CLOUDFRONT_ROUTE53_ZONE_ID`  
**Value**: `Z1234567890ABC`

**Name**: `CLOUDFRONT_ACM_CERTIFICATE_ARN`  
**Value**: `arn:aws:acm:us-east-1:123456789012:certificate/xyz789...`

---

### Step 3: Verify Secrets

After adding all secrets, you should see them listed:

```
✅ AWS_ACCESS_KEY_ID
✅ AWS_SECRET_ACCESS_KEY
✅ AWS_REGION
✅ PROJECT_NAME
✅ JWT_SECRET
✅ ADMIN_PASSWORD
✅ TERRAFORM_STATE_BUCKET
✅ API_CUSTOM_DOMAIN (optional)
✅ ROUTE53_HOSTED_ZONE_ID (optional)
✅ ACM_CERTIFICATE_ARN (optional)
✅ CLOUDFRONT_CUSTOM_DOMAIN (optional)
✅ CLOUDFRONT_ROUTE53_ZONE_ID (optional)
✅ CLOUDFRONT_ACM_CERTIFICATE_ARN (optional)
```

---

## How It Works

### Local Development

When running locally, the script uses `.env` file:

```bash
npm run deploy
# Uses .env file
```

### CI/CD (GitHub Actions)

When running in GitHub Actions, the workflow:
1. Loads secrets from GitHub Secrets
2. Exports them as environment variables
3. Creates `.env` file for script compatibility
4. Runs deployment script

---

## Quick Setup Script

Create a script to help set up secrets (run locally):

```bash
#!/bin/bash
# scripts/setup-github-secrets.sh

echo "GitHub Secrets Setup Helper"
echo "============================"
echo ""
echo "Required Secrets:"
echo ""
echo "1. AWS_ACCESS_KEY_ID"
echo "   Get from: AWS Console → IAM → Users → Security Credentials"
echo ""
echo "2. AWS_SECRET_ACCESS_KEY"
echo "   Get from: AWS Console → IAM → Users → Security Credentials"
echo ""
echo "3. JWT_SECRET"
echo "   Generate with: openssl rand -base64 32"
echo "   Generated: $(openssl rand -base64 32)"
echo ""
echo "4. ADMIN_PASSWORD"
echo "   Choose a strong password"
echo ""
echo "5. TERRAFORM_STATE_BUCKET (optional)"
echo "   Leave empty to auto-create"
echo ""
echo "Optional Secrets (Custom Domain):"
echo ""
echo "6. API_CUSTOM_DOMAIN (e.g., api.rghs-dental.info)"
echo "7. ROUTE53_HOSTED_ZONE_ID (from Route53)"
echo "8. ACM_CERTIFICATE_ARN (from ACM)"
echo "9. CLOUDFRONT_CUSTOM_DOMAIN (e.g., cdn.rghs-dental.info)"
echo "10. CLOUDFRONT_ROUTE53_ZONE_ID (from Route53)"
echo "11. CLOUDFRONT_ACM_CERTIFICATE_ARN (from ACM)"
echo ""
echo "Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions"
echo "Click 'New repository secret' for each one"
```

---

## Testing Secrets

### Test Local Deployment

```bash
# Create .env file with your values
cat > .env << EOF
AWS_REGION=us-east-1
PROJECT_NAME=dental-hospital-system
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_PASSWORD=YourPassword123!
TERRAFORM_STATE_BUCKET=
EOF

# Run deployment
npm run deploy
```

### Test CI/CD Deployment

1. **Push to main branch** (triggers automatic deployment)
2. **OR** Go to Actions → Deploy to AWS → Run workflow

---

## Security Best Practices

### ✅ DO:

- ✅ Use strong, unique passwords
- ✅ Rotate secrets regularly
- ✅ Use IAM users with minimal permissions
- ✅ Enable MFA on AWS account
- ✅ Review GitHub Actions logs regularly
- ✅ Use separate secrets for different environments

### ❌ DON'T:

- ❌ Commit secrets to git
- ❌ Share secrets in chat/email
- ❌ Use same secrets for multiple environments
- ❌ Use admin AWS credentials
- ❌ Store secrets in code comments

---

## Troubleshooting

### Problem: "AWS credentials not configured"

**Solution**:
- Check `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets exist
- Verify credentials are correct
- Test with `aws configure` locally

---

### Problem: "Secret not found"

**Solution**:
- Check secret name matches exactly (case-sensitive)
- Verify secret exists in repository settings
- Check you have access to repository secrets

---

### Problem: "JWT_SECRET not set"

**Solution**:
- Add `JWT_SECRET` secret to GitHub
- Or generate locally: `openssl rand -base64 32`
- Add to `.env` file for local development

---

### Problem: Deployment fails in GitHub Actions

**Solution**:
1. Check Actions logs for specific error
2. Verify all required secrets are set
3. Check AWS credentials have correct permissions
4. Verify Terraform state bucket exists (or leave empty to auto-create)

---

## Updating Secrets

### Update Existing Secret

1. Go to Settings → Secrets and variables → Actions
2. Click on the secret name
3. Click **Update** button
4. Enter new value
5. Click **Update secret**

### Delete Secret

1. Go to Settings → Secrets and variables → Actions
2. Click on the secret name
3. Click **Delete** button
4. Confirm deletion

---

## Environment-Specific Secrets

For multiple environments (staging, production), you can:

### Option 1: Use Environment Secrets (Recommended)

1. Go to Settings → Environments
2. Create environments: `staging`, `production`
3. Add secrets to each environment
4. Update workflow to use environment:

```yaml
jobs:
  deploy:
    environment: ${{ github.event.inputs.environment }}
    # Secrets are automatically loaded from environment
```

### Option 2: Prefix Secrets

Use prefixes:
- `STAGING_AWS_ACCESS_KEY_ID`
- `PROD_AWS_ACCESS_KEY_ID`

Then select in workflow based on environment.

---

## Migration from .env to GitHub Secrets

If you already have a `.env` file:

1. **Read your .env file**:
   ```bash
   cat .env
   ```

2. **Add each variable to GitHub Secrets**:
   - Go to repository settings
   - Add each variable as a secret

3. **Keep .env for local development** (optional):
   - Add `.env` to `.gitignore` (already done)
   - Use `.env` locally
   - Use GitHub Secrets in CI/CD

4. **Test**:
   - Local: `npm run deploy` (uses .env)
   - CI/CD: Push to main (uses GitHub Secrets)

---

## Example: Complete Setup

```bash
# 1. Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET: $JWT_SECRET"

# 2. Create AWS IAM user with minimal permissions
# (Do this in AWS Console)

# 3. Add secrets to GitHub:
# - AWS_ACCESS_KEY_ID: AKIA...
# - AWS_SECRET_ACCESS_KEY: wJalr...
# - AWS_REGION: us-east-1
# - PROJECT_NAME: dental-hospital-system
# - JWT_SECRET: (generated above)
# - ADMIN_PASSWORD: YourSecurePassword123!
# - TERRAFORM_STATE_BUCKET: (leave empty)

# 4. Deploy via GitHub Actions
# Go to Actions → Deploy to AWS → Run workflow
```

---

## Quick Reference

### Minimum Required Secrets

```bash
AWS_ACCESS_KEY_ID          # Required
AWS_SECRET_ACCESS_KEY      # Required
JWT_SECRET                 # Required
```

### Recommended Secrets

```bash
AWS_REGION                 # Recommended (defaults to us-east-1)
PROJECT_NAME               # Recommended (defaults to dental-hospital-system)
ADMIN_PASSWORD             # Recommended (defaults to Admin123!)
TERRAFORM_STATE_BUCKET     # Optional (auto-created if empty)
```

### Optional Secrets (Custom Domain)

```bash
API_CUSTOM_DOMAIN
ROUTE53_HOSTED_ZONE_ID
ACM_CERTIFICATE_ARN
CLOUDFRONT_CUSTOM_DOMAIN
CLOUDFRONT_ROUTE53_ZONE_ID
CLOUDFRONT_ACM_CERTIFICATE_ARN
```

---

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. Verify secrets are set correctly
3. Test AWS credentials locally
4. Review deployment script logs

---

**Last Updated**: 2025-01-08  
**Version**: 1.0

