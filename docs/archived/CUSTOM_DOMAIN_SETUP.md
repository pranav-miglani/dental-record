# 🌐 Custom Domain Setup Guide

## Overview

This guide explains how to set up custom domains for your Dental Hospital System. Custom domains are **completely optional** - the system works perfectly fine with default AWS URLs.

---

## Supported Custom Domains

1. **API Gateway Custom Domain** (e.g., `api.rghs-dental.info`)
   - For your REST API endpoints
   - Requires ACM certificate in `us-east-1` region
   - Requires Route53 hosted zone

2. **CloudFront Custom Domain** (e.g., `cdn.rghs-dental.info`)
   - For image delivery via CDN
   - Requires ACM certificate in `us-east-1` region
   - Requires Route53 hosted zone

---

## Prerequisites

- Domain registered (e.g., `rghs-dental.info`)
- Route53 hosted zone created for your domain
- AWS Certificate Manager (ACM) access

---

## Step-by-Step Setup

### Step 1: Create Route53 Hosted Zone

1. **Go to Route53 Console**: https://console.aws.amazon.com/route53/
2. **Create Hosted Zone**:
   - Click "Create hosted zone"
   - Domain name: `rghs-dental.info` (or your domain)
   - Type: Public hosted zone
   - Click "Create hosted zone"
3. **Save Hosted Zone ID**: Copy the Hosted Zone ID (e.g., `Z1234567890ABC`)

**Note**: Update your domain registrar's nameservers with the Route53 nameservers shown in the hosted zone.

---

### Step 2: Request ACM Certificates

**⚠️ IMPORTANT**: ACM certificates for API Gateway and CloudFront **MUST** be in the `us-east-1` region!

#### For API Gateway:

1. **Go to ACM Console**: https://console.aws.amazon.com/acm/home?region=us-east-1
2. **Request Certificate**:
   - Click "Request a certificate"
   - Choose "Request a public certificate"
   - Domain name: `api.rghs-dental.info` (or your API subdomain)
   - Validation method: DNS validation
   - Click "Request"
3. **Validate Certificate**:
   - Click on the certificate
   - Click "Create record in Route53" (if available)
   - OR manually add CNAME record to Route53
   - Wait for validation (usually 5-30 minutes)
4. **Save Certificate ARN**: Copy the ARN (e.g., `arn:aws:acm:us-east-1:123456789012:certificate/abc123...`)

#### For CloudFront:

1. **Go to ACM Console**: https://console.aws.amazon.com/acm/home?region=us-east-1
2. **Request Certificate**:
   - Click "Request a certificate"
   - Choose "Request a public certificate"
   - Domain name: `cdn.rghs-dental.info` (or your CDN subdomain)
   - Validation method: DNS validation
   - Click "Request"
3. **Validate Certificate**:
   - Click on the certificate
   - Click "Create record in Route53" (if available)
   - OR manually add CNAME record to Route53
   - Wait for validation (usually 5-30 minutes)
4. **Save Certificate ARN**: Copy the ARN

---

### Step 3: Run Interactive Deployment

```bash
npm run deploy
```

When prompted:

1. **API Custom Domain**: Enter `api.rghs-dental.info`
2. **Route53 Hosted Zone ID**: Enter your hosted zone ID
3. **ACM Certificate ARN**: Enter the API Gateway certificate ARN
4. **CloudFront Custom Domain**: Enter `cdn.rghs-dental.info` (optional)
5. **CloudFront Route53 Zone ID**: Enter your hosted zone ID (if using CloudFront domain)
6. **CloudFront ACM Certificate ARN**: Enter the CloudFront certificate ARN (if using CloudFront domain)

The script will:
- Save all configuration to `.env` file
- Deploy infrastructure with custom domain configuration
- Create Route53 records automatically (if hosted zone ID provided)

---

### Step 4: Verify DNS Records

After deployment, verify DNS records were created:

```bash
# Check API Gateway DNS record
dig api.rghs-dental.info

# Check CloudFront DNS record (if configured)
dig cdn.rghs-dental.info
```

**Expected**: Records should point to AWS resources.

---

### Step 5: Test Custom Domains

```bash
# Test API Gateway custom domain
curl https://api.rghs-dental.info/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"mobile_number":"9999999999","password":"YourPassword"}'

# Test CloudFront custom domain (if configured)
curl https://cdn.rghs-dental.info/test-image.jpg
```

---

## Manual Setup (If Not Using Interactive Script)

### 1. Update .env File

```bash
API_CUSTOM_DOMAIN=api.rghs-dental.info
ROUTE53_HOSTED_ZONE_ID=Z1234567890ABC
ACM_CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/abc123...

CLOUDFRONT_CUSTOM_DOMAIN=cdn.rghs-dental.info
CLOUDFRONT_ROUTE53_ZONE_ID=Z1234567890ABC
CLOUDFRONT_ACM_CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/xyz789...
```

### 2. Update terraform.tfvars

```hcl
api_custom_domain = "api.rghs-dental.info"
api_acm_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/abc123..."
api_route53_hosted_zone_id = "Z1234567890ABC"

cloudfront_custom_domain = "cdn.rghs-dental.info"
cloudfront_acm_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/xyz789..."
cloudfront_route53_hosted_zone_id = "Z1234567890ABC"
```

### 3. Deploy

```bash
cd infrastructure
terraform apply
```

---

## Troubleshooting

### Problem: Certificate Validation Failed

**Solution**:
- Check DNS records in Route53
- Ensure CNAME records match ACM requirements exactly
- Wait 30 minutes for DNS propagation
- Re-request certificate if needed

---

### Problem: Custom Domain Not Working

**Solution**:
1. Check Route53 records exist:
   ```bash
   aws route53 list-resource-record-sets --hosted-zone-id YOUR_ZONE_ID
   ```

2. Check API Gateway domain name:
   ```bash
   aws apigateway get-domain-name --domain-name api.rghs-dental.info
   ```

3. Verify certificate is validated:
   ```bash
   aws acm describe-certificate --certificate-arn YOUR_CERT_ARN --region us-east-1
   ```

---

### Problem: DNS Not Propagating

**Solution**:
- DNS propagation can take up to 48 hours
- Check nameservers are correctly set at domain registrar
- Use `dig` or `nslookup` to check DNS records
- Wait and retry

---

### Problem: Certificate Not in us-east-1

**Solution**:
- **API Gateway and CloudFront require certificates in us-east-1**
- Delete certificate in wrong region
- Create new certificate in us-east-1
- Update terraform.tfvars with new ARN

---

## Cost Considerations

### Route53 Costs:
- Hosted Zone: $0.50/month per zone
- DNS Queries: $0.40 per million queries (first 1B queries free)

### ACM Costs:
- **FREE** - No cost for SSL/TLS certificates

### Total Additional Cost:
- **~$0.50/month** (just the hosted zone)

---

## Best Practices

1. **Use Subdomains**: 
   - `api.rghs-dental.info` for API
   - `cdn.rghs-dental.info` for CloudFront
   - Keeps things organized

2. **Certificate Validation**:
   - Use DNS validation (easier than email)
   - Automate with Route53 integration if possible

3. **DNS Propagation**:
   - Plan for 24-48 hours for full propagation
   - Test with `dig` command before going live

4. **Backup Plan**:
   - Keep default AWS URLs working
   - Custom domain is optional enhancement

---

## Example Configuration

For `rghs-dental.info` domain:

```bash
# .env file
API_CUSTOM_DOMAIN=api.rghs-dental.info
ROUTE53_HOSTED_ZONE_ID=Z1234567890ABC
ACM_CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/abc123...

CLOUDFRONT_CUSTOM_DOMAIN=cdn.rghs-dental.info
CLOUDFRONT_ROUTE53_ZONE_ID=Z1234567890ABC
CLOUDFRONT_ACM_CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/xyz789...
```

---

## After Deployment

### Update Frontend/Mobile App

Update API base URL in your applications:

```typescript
// frontend/.env or mobile/src/constants/config.ts
API_BASE_URL=https://api.rghs-dental.info
```

### Update Image URLs

If using CloudFront custom domain:

```typescript
// Update image URLs to use custom domain
IMAGE_BASE_URL=https://cdn.rghs-dental.info
```

---

## Security Notes

- ✅ Certificates are managed by AWS ACM (automatic renewal)
- ✅ HTTPS is enforced (TLS 1.2+)
- ✅ No domain hardcoded in code
- ✅ All configuration in `.env` (not committed to git)

---

## Support

If you encounter issues:
1. Check ACM certificate status
2. Verify Route53 records
3. Check API Gateway domain name configuration
4. Review CloudWatch logs
5. Test with default AWS URLs first

---

**Last Updated**: 2025-01-08  
**Version**: 1.0

