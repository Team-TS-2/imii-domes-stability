# Quick Reference: Information Needed for AWS Deployment

## TL;DR - What You Need

When you're ready to deploy, you'll need these 4 pieces of information:

### 1. AWS Account ID
- **What it looks like**: `123456789012` (12 digits)
- **Where to get it**: Run `aws sts get-caller-identity` after setting up AWS CLI
- **Why you need it**: CDK needs to know which AWS account to deploy resources to

### 2. AWS Region
- **What it looks like**: `us-east-1` or `ca-central-1`
- **Where to get it**: You choose this based on where your users are located
- **Why you need it**: Determines where your infrastructure will be physically located
- **Recommended**: `us-east-1` (US East - Virginia) for lowest cost and best service availability

### 3. AWS Access Key ID
- **What it looks like**: `AKIAIOSFODNN7EXAMPLE` (starts with AKIA)
- **Where to get it**: Created when you set up an IAM user in AWS Console
- **Why you need it**: Allows the AWS CLI and CDK to authenticate with AWS
- **⚠️ Keep this secret!**

### 4. AWS Secret Access Key
- **What it looks like**: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` (long random string)
- **Where to get it**: Shown once when you create an IAM user
- **Why you need it**: Works with Access Key ID to authenticate
- **⚠️ Keep this even more secret! Store in password manager!**

---

## Where This Information Goes

### For CDK Deployment
These are configured automatically when you run:
```bash
aws configure
```

The AWS CLI stores them in:
- **macOS/Linux**: `~/.aws/credentials` and `~/.aws/config`
- **Windows**: `%USERPROFILE%\.aws\credentials` and `%USERPROFILE%\.aws\config`

### For Your Project
No need to hardcode anything! CDK automatically uses:
- Your configured AWS credentials from `~/.aws/credentials`
- Your configured region from `~/.aws/config`
- Your account ID is detected automatically

---

## Deployment Command (Once Setup)

After you have everything configured:

```bash
# 1. Bootstrap CDK (one-time only)
cd back-end
cdk bootstrap

# 2. Deploy your stack
cdk deploy

# 3. Get your API URL from the output
# Example output:
# ImiiDomesBackendStack.ApiUrl = https://abc123.execute-api.us-east-1.amazonaws.com/prod/
```

---

## Complete Setup Flow

### Before You Have an AWS Account
1. Read: `AWS_SETUP_GUIDE.md` (comprehensive guide)
2. Create AWS account at https://aws.amazon.com
3. Create IAM user
4. Download credentials (Access Key ID + Secret Access Key)
5. Note your Account ID
6. Choose your Region

### Configure Your Machine
```bash
# Install AWS CLI
brew install awscli  # macOS
# or download from https://aws.amazon.com/cli/

# Configure credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region, output format (json)

# Verify it works
aws sts get-caller-identity
# Should show your Account ID
```

### Deploy IMII Domes
```bash
# Install dependencies
cd back-end
npm install

# Bootstrap CDK (one-time)
cdk bootstrap

# See what will be created
cdk diff

# Deploy everything
cdk deploy

# Seed initial data
curl -X POST https://YOUR-API-URL/prod/api/seed
```

### Configure Frontend
```bash
cd front-end
cp .env.example .env.local

# Edit .env.local - add your API URL from cdk deploy output
# VITE_API_URL=https://YOUR-API-URL/prod/api

pnpm install
pnpm dev
```

---

## Resources Already in Your CDK Stack

When you run `cdk deploy`, these will be automatically created:

### DynamoDB Tables (5)
1. **imii-sites** - Store site information
2. **imii-beams** - Structural monitoring data
3. **imii-detections** - Foreign material detections
4. **imii-inventory** - Barn inventory levels
5. **imii-timeseries** - Historical metrics over time

### Lambda Functions (5)
1. **DashboardFunction** - Site overview and statistics
2. **StructuralFunction** - Beam stress monitoring
3. **DetectionFunction** - Foreign material alerts
4. **InventoryFunction** - Barn inventory tracking
5. **SeederFunction** - Populate initial test data

### Other Resources
- **API Gateway** - REST API for all endpoints
- **S3 Bucket** - Store detection images
- **IAM Roles** - Permissions for Lambda functions
- **CloudWatch Logs** - Monitoring and debugging

### Total Resources Created: ~30 AWS resources

---

## Cost Summary

### First 12 Months (Free Tier)
**Estimated Cost**: $0 - $5/month for moderate usage

### After Free Tier
**Estimated Cost**: $6 - $25/month depending on usage

### What Affects Cost
- Number of API calls (more calls = higher cost)
- DynamoDB read/write operations
- Lambda function execution time
- S3 storage for images
- Data transfer out of AWS

### Cost Control
- Set up billing alerts (recommended: $10, $50, $100)
- Delete test resources when not in use
- Use `cdk destroy` to remove everything

---

## Common Questions

### Q: Do I need to put my account ID in code?
**A**: No! CDK automatically detects it from your AWS CLI configuration.

### Q: What if I want to use multiple AWS accounts?
**A**: Use AWS CLI profiles:
```bash
# Configure additional profile
aws configure --profile production

# Deploy to specific account
cdk deploy --profile production
```

### Q: What if I choose the wrong region?
**A**: You can change it:
```bash
# Change region
aws configure set region us-west-2

# Redeploy
cdk destroy  # Remove old resources
cdk deploy   # Create in new region
```

### Q: Can I deploy to multiple regions?
**A**: Yes, but you'll need to:
1. Deploy separate CDK stacks for each region
2. Update your frontend to use the appropriate API URL for each region
3. Consider using Route53 for geo-routing

### Q: How do I delete everything?
**A**: Run `cdk destroy` - it will remove all resources created by CDK

### Q: What about my credentials in code?
**A**: Never commit credentials to git! They're stored in `~/.aws/credentials` which should never be committed.

---

## Security Checklist

- [ ] Using IAM user (not root account) ✅
- [ ] MFA enabled on root account ✅
- [ ] MFA enabled on IAM user ✅
- [ ] Access keys stored securely (password manager) ✅
- [ ] Billing alerts configured ✅
- [ ] `.env` and `.env.local` in `.gitignore` ✅
- [ ] No credentials hardcoded in code ✅

---

## Need Help?

1. **Full guide**: See `AWS_SETUP_GUIDE.md` for detailed step-by-step instructions
2. **API documentation**: See `API_INTEGRATION_GUIDE.md` for endpoint details
3. **AWS Documentation**: https://docs.aws.amazon.com/cdk/
4. **AWS Support**: https://console.aws.amazon.com/support/

---

## Ready to Deploy?

✅ Have AWS account  
✅ Have Account ID  
✅ Have Region chosen  
✅ Have Access credentials  
✅ AWS CLI configured  

**Next step**: `cd back-end && cdk deploy` 🚀
