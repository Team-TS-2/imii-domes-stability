# 📋 Summary: Your DynamoDB Tables & AWS Setup

## Your DynamoDB Tables (Already Configured!) ✅

Your CDK stack **already includes 5 DynamoDB tables** ready to store all your data:

### 1. **Sites Table** (`imii-sites`)
```
Partition Key: siteId (String)
Purpose: Store site information
Billing: Pay-per-request (On-Demand)
Backup: Point-in-time recovery enabled
```

### 2. **Beams Table** (`imii-beams`)
```
Partition Key: siteId (String)
Sort Key: beamId (String)
Purpose: Structural monitoring - beam stress and inspection data
Billing: Pay-per-request (On-Demand)
Backup: Point-in-time recovery enabled
```

### 3. **Detections Table** (`imii-detections`)
```
Partition Key: siteId (String)
Sort Key: detectionId (String)
Global Secondary Index: status-index (for querying active/resolved)
Purpose: Foreign material detection records
Billing: Pay-per-request (On-Demand)
Backup: Point-in-time recovery enabled
```

### 4. **Inventory Table** (`imii-inventory`)
```
Partition Key: siteId (String)
Sort Key: barnId (String)
Purpose: Barn inventory levels and tracking
Billing: Pay-per-request (On-Demand)
Backup: Point-in-time recovery enabled
```

### 5. **Time Series Table** (`imii-timeseries`)
```
Partition Key: metricKey (String) - e.g., "NutrienAllan#stress"
Sort Key: timestamp (Number)
Purpose: Historical metrics over time
TTL: Enabled (auto-delete old data)
Billing: Pay-per-request (On-Demand)
Backup: Point-in-time recovery enabled
```

---

## What Information You Need (Once You Have AWS Account)

### Essential Information (4 items):

| # | What | Example | How to Get |
|---|------|---------|------------|
| 1️⃣ | **AWS Account ID** | `123456789012` | Run `aws sts get-caller-identity` |
| 2️⃣ | **AWS Region** | `us-east-1` | Choose based on location (recommendation: `us-east-1`) |
| 3️⃣ | **Access Key ID** | `AKIAIOSFODNN7EXAMPLE` | Create IAM user in AWS Console |
| 4️⃣ | **Secret Access Key** | `wJalrXUt...KEY` | Shown when creating IAM user (save immediately!) |

### Where This Info Is Used:

✅ **You DON'T need to manually provide these to CDK!**  
✅ **CDK automatically reads from your AWS CLI configuration**

You just need to run once:
```bash
aws configure
```

Then CDK handles everything automatically! 🎉

---

## Step-by-Step Setup (Quick Version)

### 1. Create AWS Account
→ Go to https://aws.amazon.com → "Create Account"  
→ Enable MFA for security

### 2. Create IAM User
→ AWS Console → IAM → Users → "Add users"  
→ Enable "Programmatic access"  
→ Attach "AdministratorAccess" policy (for development)  
→ **Save the Access Key ID and Secret Access Key!**

### 3. Install & Configure AWS CLI
```bash
# Install
brew install awscli  # macOS
# or: https://aws.amazon.com/cli/ for other OS

# Configure (one-time setup)
aws configure
# Enter: Access Key ID, Secret Access Key, region (us-east-1), format (json)

# Verify
aws sts get-caller-identity
# Should show your account ID
```

### 4. Deploy Backend
```bash
cd back-end
npm install

# Bootstrap (one-time)
cdk bootstrap

# Deploy all resources (including DynamoDB tables!)
cdk deploy
```

**This creates:**
- ✅ 5 DynamoDB tables
- ✅ 5 Lambda functions  
- ✅ 1 API Gateway
- ✅ 1 S3 bucket
- ✅ IAM roles
- ✅ CloudWatch logs

### 5. Note Your API URL
After `cdk deploy`, you'll see:
```
Outputs:
ImiiDomesBackendStack.ApiUrl = https://abc123.execute-api.us-east-1.amazonaws.com/prod/
```
**Save this URL!**

### 6. Seed Data (Optional)
```bash
curl -X POST https://YOUR-API-URL/prod/api/seed
```

### 7. Configure Frontend
```bash
cd front-end
cp .env.example .env.local

# Edit .env.local - add your API URL
echo "VITE_API_URL=https://YOUR-API-URL/prod/api" > .env.local

pnpm install
pnpm dev
```

Done! 🎉

---

## Important Security Notes

### ✅ Already Secured:
- `.gitignore` properly configured for both front-end and back-end
- `.env` files are ignored (won't be committed)
- AWS credentials stored locally only (in `~/.aws/`)
- No hardcoded credentials anywhere

### ⚠️ Keep These Secret:
- AWS Access Key ID
- AWS Secret Access Key
- `.env.local` file
- API Gateway URL (for now)

### 🔒 Recommended:
- Enable MFA on both root account and IAM user
- Use a password manager for credentials
- Set up billing alerts
- Rotate access keys every 90 days

---

## Cost Breakdown

### Free Tier (12 months):
- **DynamoDB**: 25 GB storage FREE
- **Lambda**: 1M requests/month FREE
- **API Gateway**: 1M calls/month FREE (first 12 months)
- **S3**: 5 GB storage FREE

### After Free Tier (estimated):
- Light usage: **$0-10/month**
- Moderate usage: **$10-25/month**
- Heavy usage: **$25-50/month**

### Set up alerts at:
- $10 (warning)
- $50 (action needed)
- $100 (budget limit)

---

## Documentation Files Created

I've created 3 comprehensive guides for you:

### 1. **DEPLOYMENT_QUICK_REFERENCE.md** ⚡
→ Quick reference for "what do I need?"  
→ Start here for fast answers

### 2. **AWS_SETUP_GUIDE.md** 📚
→ Complete step-by-step AWS account setup  
→ Detailed instructions for first-time users  
→ Troubleshooting and best practices

### 3. **API_INTEGRATION_GUIDE.md** 🔌
→ All API endpoints documented  
→ Frontend integration details  
→ Testing and deployment

---

## Verification Checklist

After deployment, verify everything works:

```bash
# 1. Check DynamoDB tables exist
aws dynamodb list-tables

# Expected output:
# {
#     "TableNames": [
#         "imii-beams",
#         "imii-detections",
#         "imii-inventory",
#         "imii-sites",
#         "imii-timeseries"
#     ]
# }

# 2. Check API responds
curl https://YOUR-API-URL/prod/api/dashboard/sites

# 3. Check specific table
aws dynamodb scan --table-name imii-sites --max-items 1

# 4. Check Lambda functions
aws lambda list-functions --query 'Functions[?contains(FunctionName, `imii`)].FunctionName'
```

---

## Common First-Time Questions

### Q: Do I need to create the DynamoDB tables manually?
**A**: No! `cdk deploy` creates them automatically. Just deploy and they'll appear.

### Q: Where should I store my AWS credentials?
**A**: In `~/.aws/credentials` (done automatically by `aws configure`). Never in code or git!

### Q: What if I want to add more tables later?
**A**: Edit `back-end/lib/imii-domes-backend-stack.ts`, add your table definition, then run `cdk deploy`.

### Q: Can I see my resources in AWS Console?
**A**: Yes! After deployment, log into AWS Console and check:
- DynamoDB → Tables
- Lambda → Functions  
- API Gateway → APIs
- S3 → Buckets

### Q: What if something goes wrong?
**A**: Check CloudWatch Logs in AWS Console, or run:
```bash
cdk destroy  # Remove everything
cdk deploy   # Try again
```

### Q: How do I delete everything when done?
**A**: 
```bash
cd back-end
cdk destroy
```
This removes all resources and stops billing.

---

## Next Steps

### Right Now (Before AWS Account):
1. ✅ Review the setup guides
2. ✅ Understand what information you'll need
3. ✅ Decide on your AWS region

### After Creating AWS Account:
1. Run `aws configure` with your credentials
2. Run `cd back-end && cdk bootstrap`
3. Run `cdk deploy`
4. Save your API URL
5. Configure frontend with API URL
6. Test locally with `pnpm dev`

### Future Enhancements:
- Add authentication (AWS Cognito)
- Set up custom domain
- Add CloudFront CDN
- Implement CI/CD pipeline
- Add more monitoring/alerts

---

## Quick Command Reference

```bash
# AWS CLI basics
aws configure                          # Setup credentials
aws sts get-caller-identity           # Show account info
aws dynamodb list-tables              # List DynamoDB tables

# CDK commands
cdk bootstrap                         # One-time setup
cdk diff                             # Preview changes
cdk deploy                           # Deploy stack
cdk destroy                          # Delete everything

# DynamoDB commands
aws dynamodb scan --table-name TABLE_NAME
aws dynamodb describe-table --table-name TABLE_NAME

# Lambda commands  
aws lambda list-functions
aws lambda invoke --function-name FUNCTION_NAME out.json

# Logs
aws logs tail /aws/lambda/FUNCTION_NAME --follow
```

---

## Support Resources

- **AWS Setup Guide**: `AWS_SETUP_GUIDE.md` (detailed walkthrough)
- **API Documentation**: `API_INTEGRATION_GUIDE.md` (endpoints & usage)
- **Quick Reference**: `DEPLOYMENT_QUICK_REFERENCE.md` (fast lookup)
- **AWS Free Tier**: https://aws.amazon.com/free/
- **CDK Docs**: https://docs.aws.amazon.com/cdk/
- **DynamoDB Docs**: https://docs.aws.amazon.com/dynamodb/

---

**You're all set! 🚀**

Your DynamoDB tables are already configured in the CDK stack.  
Once you create an AWS account and run `cdk deploy`, everything will be created automatically!
