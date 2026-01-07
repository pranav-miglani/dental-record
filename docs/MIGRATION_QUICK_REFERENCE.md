# 🔄 Migration Quick Reference Card

## When to Migrate

- **Best Time**: Month 10-11 (2 months before free tier expires)
- **Minimum**: Month 11 (1 month before expiration)
- **Frequency**: Every 10-11 months

---

## Quick Commands

### Export from Old Account

```bash
# 1. Configure old account
aws configure --profile old-account

# 2. Export data
export AWS_PROFILE=old-account
./scripts/migrate-export-data.sh

# 3. Backup export
tar -czf migration-export-backup-$(date +%Y%m%d).tar.gz migration-export-*
```

### Import to New Account

```bash
# 1. Create new AWS account (via web)
# 2. Configure new account
aws configure --profile new-account

# 3. Deploy infrastructure
export AWS_PROFILE=new-account
cd infrastructure
terraform init -backend-config="bucket=NEW-BUCKET-NAME" -reconfigure
terraform apply

# 4. Import data
export AWS_PROFILE=new-account
./scripts/migrate-import-data.sh ./migration-export-YYYYMMDD-HHMMSS

# 5. Verify
./scripts/migrate-verify.sh ./migration-export-YYYYMMDD-HHMMSS
```

---

## What Gets Migrated

✅ **DynamoDB Tables** (8):
- users, patients, user-patient-mappings
- procedures, procedure-steps, images
- consent, audit-logs

✅ **S3 Buckets** (2):
- images (all medical images)
- archive (archived records)

❌ **NOT Migrated** (recreated via Terraform):
- Lambda functions
- API Gateway
- CloudFront
- IAM roles

---

## Migration Checklist

### Before Migration
- [ ] Export data from old account
- [ ] Verify export completed
- [ ] Backup export directory
- [ ] Create new AWS account
- [ ] Configure AWS CLI for new account

### During Migration
- [ ] Deploy infrastructure in new account
- [ ] Import DynamoDB tables
- [ ] Import S3 buckets
- [ ] Verify data counts match

### After Migration
- [ ] Update frontend/mobile app with new API URL
- [ ] Test all application features
- [ ] Monitor for 1 week
- [ ] Delete old account (after verification)

---

## Time Estimates

- Export: 30-60 minutes
- New Account Setup: 30 minutes
- Infrastructure Deploy: 30-45 minutes
- Import: 30-60 minutes
- Verification: 15-30 minutes
- **Total**: 2-4 hours

---

## Cost Savings

| Strategy | Monthly Cost | Annual Cost |
|----------|--------------|-------------|
| Stay in same account | $11-25 | $132-300 |
| Migrate every year | **$0** | **$0** |
| **Savings** | **$11-25/month** | **$132-300/year** |

---

## Troubleshooting

### Export Fails
```bash
# Check AWS credentials
aws sts get-caller-identity --profile old-account

# Verify tables exist
aws dynamodb list-tables --profile old-account
```

### Import Fails
```bash
# Check new account credentials
aws sts get-caller-identity --profile new-account

# Verify tables exist (run terraform apply first)
aws dynamodb list-tables --profile new-account
```

### Verification Shows Mismatch
```bash
# Re-import specific table
# Check export file exists
ls migration-export-*/dental-hospital-system-production-users.json

# Re-run import script
./scripts/migrate-import-data.sh ./migration-export-YYYYMMDD-HHMMSS
```

---

## Important Notes

⚠️ **Keep old account for 1 week** after migration for verification

⚠️ **Backup export directory** until migration is verified

⚠️ **Test all features** before deleting old account

⚠️ **Update API URLs** in frontend/mobile app

---

## Full Guide

For detailed instructions, see: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

---

**Last Updated**: 2025-01-08

