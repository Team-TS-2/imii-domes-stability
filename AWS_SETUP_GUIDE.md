# 🚀 Complete AWS Setup Guide for IMII Domes

This guide walks you through setting up your AWS account from scratch and deploying the IMII Domes backend infrastructure.

**Perfect for first-time AWS users!** ✨

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create AWS Account](#step-1-create-aws-account)
3. [Secure Your Root Account](#step-2-secure-your-root-account)
4. [Create IAM User](#step-3-create-iam-user)
5. [Install AWS CLI](#step-4-install-aws-cli)
6. [Configure AWS CLI](#step-5-configure-aws-cli)
7. [Install AWS CDK](#step-6-install-aws-cdk)
8. [Choose Your Region](#step-7-choose-your-aws-region)
9. [Bootstrap CDK](#step-8-bootstrap-cdk)
10. [Deploy Backend](#step-9-deploy-backend)
11. [Configure Frontend](#step-10-configure-frontend)
12. [Verify Deployment](#step-11-verify-deployment)
13. [Cost Management](#cost-management)
14. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, make sure you have:

- ✅ A valid email address (for AWS account)
- ✅ A valid credit/debit card (AWS requires it, even for Free Tier)
- ✅ A phone number (for verification)
- ✅ Node.js 20.x or later installed ([Download](https://nodejs.org/))
- ✅ Git installed ([Download](https://git-scm.com/))
- ✅ A code editor (VS Code recommended)
- ✅ Basic terminal/command line knowledge

**Time Required**: ~2 hours (including verification wait times)

---

## Step 1: Create AWS Account

### 1.1 Go to AWS Signup
1. Visit https://aws.amazon.com
2. Click **"Create an AWS Account"** (top right)

### 1.2 Enter Account Details
```
Root user email address: your-email@example.com
AWS account name: IMII-Domes (or your company name)
```

### 1.3 Verify Email
- Check your email for verification code
- Enter the 6-digit code

### 1.4 Create Root Password
```
Password requirements:
- At least 8 characters
- Mix of uppercase and lowercase
- At least one number
- At least one special character

Example: MyAwsPass2026!
```

**⚠️ IMPORTANT**: Save this password in a password manager!

### 1.5 Enter Contact Information
```
Account Type: Personal or Business
(Choose Personal if it's for development/testing)

Full Name: Your Name
Phone Number: +1-234-567-8900
Country/Region: Your country
Address: Your address
City: Your city
State/Province: Your state
Postal Code: 12345
```

### 1.6 Payment Information
- Enter credit/debit card details
- AWS will charge $1 for verification (refunded immediately)
- **Note**: You won't be charged unless you exceed Free Tier limits

### 1.7 Identity Verification
- Choose verification method: **Text message (SMS)** or **Voice call**
- Enter the 4-digit verification code

### 1.8 Select Support Plan
- Choose **Basic support - Free** (sufficient for development)
- Click **Complete sign up**

### 1.9 Wait for Account Activation
- Usually takes 5-10 minutes
- You'll receive an email when ready
- Meanwhile, continue reading this guide!

---

## Step 2: Secure Your Root Account

**🔒 Critical Security Step - Don't Skip!**

### 2.1 Enable MFA (Multi-Factor Authentication)

1. Sign in to AWS Console: https://console.aws.amazon.com
2. Click your account name (top right) → **Security credentials**
3. Scroll to **Multi-factor authentication (MFA)**
4. Click **Assign MFA device**

**Choose an MFA method:**

#### Option A: Virtual MFA (Recommended)
```
Apps: Google Authenticator, Authy, Microsoft Authenticator
```

**Steps:**
1. Select **Virtual MFA device** → Continue
2. Click **Show QR code**
3. Scan with your authenticator app
4. Enter two consecutive MFA codes
5. Click **Assign MFA**

#### Option B: Hardware MFA Device
- Use a physical device like YubiKey
- Follow on-screen instructions

### 2.2 Save Your Account ID
```
Your AWS Account ID is a 12-digit number
Example: 123456789012

Find it: Click your account name (top right) → Copy Account ID
```

**📝 Save this - you'll need it later!**

---

## Step 3: Create IAM User

**⚠️ Never use root account for daily work!**

### 3.1 Navigate to IAM
1. AWS Console → Search for **"IAM"**
2. Click **IAM** (Identity and Access Management)

### 3.2 Create User
1. Click **Users** (left sidebar)
2. Click **Add users** (top right)

### 3.3 User Details
```
User name: imii-developer
(or your preferred name)
```

### 3.4 Set Permissions
1. Click **Attach policies directly**
2. Search for and select: **AdministratorAccess**
   
   ⚠️ **Note**: This gives full access. For production:
   - Create custom policies with minimal permissions
   - Follow principle of least privilege

3. Click **Next**

### 3.5 Review and Create
1. Review the settings
2. Click **Create user**

### 3.6 Create Access Keys
1. Click on your newly created user
2. Click **Security credentials** tab
3. Scroll to **Access keys**
4. Click **Create access key**

### 3.7 Choose Use Case
- Select **Command Line Interface (CLI)**
- Check the confirmation box
- Click **Next**

### 3.8 Description (Optional)
```
Description tag: IMII Domes Development
```
Click **Create access key**

### 3.9 Save Your Credentials

**🚨 CRITICAL - SAVE IMMEDIATELY!**

```
Access key ID: AKIAIOSFODNN7EXAMPLE
Secret access key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

**Options to save:**
1. Click **Download .csv file** (recommended)
2. Copy to password manager
3. Save to secure location

**⚠️ You can NEVER see the secret key again after this screen!**

Click **Done** when saved.

---

## Step 4: Install AWS CLI

### macOS

#### Using Homebrew (Recommended):
```bash
brew install awscli
```

#### Using Official Installer:
```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

### Windows

1. Download: https://awscli.amazonaws.com/AWSCLIV2.msi
2. Run the installer
3. Follow installation wizard

### Linux

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Verify Installation

```bash
aws --version
```

**Expected output:**
```
aws-cli/2.x.x Python/3.x.x Darwin/23.x.x botocore/2.x.x
```

---

## Step 5: Configure AWS CLI

### 5.1 Run AWS Configure

```bash
aws configure
```

### 5.2 Enter Your Credentials

**You'll be prompted for 4 items:**

```bash
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
# Enter the Access Key ID from Step 3.9

AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
# Enter the Secret Access Key from Step 3.9

Default region name [None]: us-east-1
# Choose your region (see Step 7 for recommendations)

Default output format [None]: json
# Choose: json (recommended), yaml, text, or table
```

### 5.3 Verify Configuration

```bash
aws sts get-caller-identity
```

**Expected output:**
```json
{
    "UserId": "AIDAIOSFODNN7EXAMPLE",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/imii-developer"
}
```

✅ **Success!** Your AWS CLI is configured.

### 5.4 Where Are Credentials Stored?

**macOS/Linux:**
```bash
~/.aws/credentials  # Your access keys
~/.aws/config       # Your configuration
```

**Windows:**
```
C:\Users\USERNAME\.aws\credentials
C:\Users\USERNAME\.aws\config
```

**🔒 Security Note:**
- These files are on your local machine only
- Never commit them to Git (already in .gitignore)
- Never share these files

---

## Step 6: Install AWS CDK

### 6.1 Install CDK CLI Globally

```bash
npm install -g aws-cdk
```

### 6.2 Verify Installation

```bash
cdk --version
```

**Expected output:**
```
2.x.x (build xxxxxx)
```

### 6.3 CDK Concepts (Quick Primer)

- **App**: Your CDK application (defined in `bin/`)
- **Stack**: A collection of AWS resources (defined in `lib/`)
- **Construct**: A cloud component (Lambda, DynamoDB, etc.)
- **Synthesis**: Converting CDK code to CloudFormation template
- **Deploy**: Creating/updating resources in AWS

---

## Step 7: Choose Your AWS Region

### What is a Region?

AWS has data centers worldwide. You choose where your resources live.

### Recommended Regions

| Region Code | Location | Benefits |
|------------|----------|----------|
| `us-east-1` | N. Virginia | ✅ Lowest cost<br>✅ Most services<br>✅ Default for many AWS features |
| `us-west-2` | Oregon | ✅ Low cost<br>✅ Good for West Coast USA |
| `ca-central-1` | Canada | ✅ Canadian data residency |
| `eu-west-1` | Ireland | ✅ Good for Europe<br>✅ GDPR compliance |
| `ap-southeast-2` | Sydney | ✅ Good for Australia/Asia Pacific |

### How to Choose?

**Factors to consider:**
1. **Proximity**: Choose closest to your users (lower latency)
2. **Cost**: `us-east-1` is usually cheapest
3. **Compliance**: Data residency requirements
4. **Services**: Some services only in certain regions

**Recommendation for Development:** `us-east-1`

### Set Your Region

If you want to change from what you set in Step 5:

```bash
aws configure set region us-east-1
```

---

## Step 8: Bootstrap CDK

### What is Bootstrapping?

CDK needs an S3 bucket and other resources to deploy. Bootstrapping creates them.

**You only do this ONCE per account/region.**

### 8.1 Navigate to Backend Folder

```bash
cd /path/to/imii-domes-stability/back-end
```

### 8.2 Install Dependencies

```bash
npm install
```

### 8.3 Install Lambda Layer Dependencies

```bash
cd lambda/layers/common/nodejs
npm install
cd ../../../..
```

### 8.4 Bootstrap CDK

```bash
cdk bootstrap
```

**What happens:**
```
✨ Synthesis time: 2.5s
⏳ Bootstrapping environment aws://123456789012/us-east-1...
✅ Environment aws://123456789012/us-east-1 bootstrapped
```

**Resources created:**
- S3 bucket: `cdk-hnb659fds-assets-123456789012-us-east-1`
- IAM roles for CloudFormation
- ECR repository (for Docker images)

### 8.5 Verify Bootstrap

```bash
aws s3 ls | grep cdk
```

You should see the CDK bootstrap bucket.

---

## Step 9: Deploy Backend

### 9.1 Review What Will Be Created

```bash
cdk diff
```

**This shows you:**
- 5 DynamoDB tables
- 5 Lambda functions
- 1 API Gateway
- 1 S3 bucket
- IAM roles and policies
- CloudWatch log groups

### 9.2 Deploy!

```bash
cdk deploy
```

**You'll see:**
```
This deployment will make potentially sensitive changes according to your current security approval level.
Do you wish to deploy these changes (y/n)? 
```

**Type:** `y` and press Enter

### 9.3 Deployment Progress

```
ImiiDomesBackendStack: deploying...
[0%] start: Publishing 123abc...
[25%] success: Published 123abc...
[50%] start: Publishing 456def...
[75%] success: Published 456def...
[100%] success: Published 789ghi...

ImiiDomesBackendStack: creating CloudFormation changeset...

 ✅  ImiiDomesBackendStack

✨  Deployment time: 180.5s

Outputs:
ImiiDomesBackendStack.ApiUrl = https://abc123def.execute-api.us-east-1.amazonaws.com/prod/
ImiiDomesBackendStack.DetectionBucketName = imiidomesbackendstack-detectionbucket-XYZ123

Stack ARN:
arn:aws:cloudformation:us-east-1:123456789012:stack/ImiiDomesBackendStack/abc-123-def
```

**⏱️ Time:** 3-5 minutes

### 9.4 Save Your API URL

**🔥 CRITICAL - SAVE THIS URL!**

```
https://abc123def.execute-api.us-east-1.amazonaws.com/prod/
```

Copy and save it - you'll need it in Step 10.

### 9.5 What Was Created?

**DynamoDB Tables:**
- `imii-sites` - Site information
- `imii-beams` - Structural monitoring data
- `imii-detections` - Foreign material detections
- `imii-inventory` - Barn inventory levels
- `imii-timeseries` - Historical metrics

**Lambda Functions:**
- `ImiiDomesBackendStack-DashboardFunction-XXX`
- `ImiiDomesBackendStack-StructuralFunction-XXX`
- `ImiiDomesBackendStack-DetectionFunction-XXX`
- `ImiiDomesBackendStack-InventoryFunction-XXX`
- `ImiiDomesBackendStack-SeederFunction-XXX`

**API Gateway:**
- REST API with `/prod/api/*` endpoints
- CORS enabled for all origins

**S3 Bucket:**
- Detection images storage
- Lifecycle policy (90-day deletion)

---

## Step 10: Configure Frontend

### 10.1 Navigate to Frontend Folder

```bash
cd ../front-end
```

### 10.2 Create Environment File

```bash
# Create .env.local file
touch .env.local
```

### 10.3 Add API URL

Open `.env.local` in your editor and add:

```env
VITE_API_URL=https://abc123def.execute-api.us-east-1.amazonaws.com/prod/api
VITE_AWS_REGION=us-east-1
```

**⚠️ Replace with YOUR API URL from Step 9.4!**

**Remove the trailing `/` from the base URL if present, but keep `/api` at the end!**

### 10.4 Install Frontend Dependencies

```bash
pnpm install
```

**Don't have pnpm?**
```bash
npm install -g pnpm
```

### 10.5 Seed Initial Data (Optional but Recommended)

Before starting the frontend, let's add some test data:

```bash
# Using your API URL
curl -X POST https://YOUR-API-URL/prod/api/seed
```

**Expected response:**
```json
{
  "message": "Database seeded successfully",
  "sites": 2,
  "beams": 12,
  "detections": 15,
  "inventory": 8
}
```

### 10.6 Start Development Server

```bash
pnpm dev
```

**Output:**
```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
➜  press h + enter to show help
```

### 10.7 Open in Browser

Visit: http://localhost:5173/

You should see the IMII Domes dashboard! 🎉

---

## Step 11: Verify Deployment

### 11.1 Check DynamoDB Tables

```bash
aws dynamodb list-tables
```

**Expected output:**
```json
{
    "TableNames": [
        "imii-beams",
        "imii-detections",
        "imii-inventory",
        "imii-sites",
        "imii-timeseries"
    ]
}
```

### 11.2 Check Lambda Functions

```bash
aws lambda list-functions --query 'Functions[?contains(FunctionName, `Imii`)].FunctionName'
```

### 11.3 Check API Gateway

```bash
curl https://YOUR-API-URL/prod/api/dashboard/sites
```

**Expected:** JSON response with site data

### 11.4 Check S3 Bucket

```bash
aws s3 ls | grep detection
```

### 11.5 Test in AWS Console

1. Go to https://console.aws.amazon.com
2. Search for **DynamoDB** → Click **Tables**
3. You should see all 5 tables
4. Click `imii-sites` → **Explore table items**
5. You should see 2 sites (if you ran the seeder)

---

## Cost Management

### Free Tier Limits (First 12 Months)

**DynamoDB:**
- 25 GB storage: **FREE**
- 25 read/write units: **FREE**

**Lambda:**
- 1 million requests/month: **FREE**
- 400,000 GB-seconds compute: **FREE**

**API Gateway:**
- 1 million REST API calls/month: **FREE** (first 12 months)

**S3:**
- 5 GB storage: **FREE**
- 20,000 GET requests: **FREE**
- 2,000 PUT requests: **FREE**

### Estimated Costs (After Free Tier)

**Light Usage** (personal/testing):
```
DynamoDB: $1-3/month (on-demand pricing)
Lambda: $0-2/month (minimal traffic)
API Gateway: $3-4/month
S3: $0.50/month (few images)
---------------------------------
Total: ~$5-10/month
```

**Moderate Usage** (small production):
```
DynamoDB: $5-10/month
Lambda: $2-5/month
API Gateway: $10-15/month
S3: $2-5/month
---------------------------------
Total: ~$20-35/month
```

### Set Up Billing Alerts

**Critical for cost control!**

1. Go to AWS Console → **Billing Dashboard**
2. Click **Budgets** (left sidebar)
3. Click **Create budget**
4. Choose **Cost budget**
5. Set monthly budget: **$50** (or your limit)
6. Enter your email for alerts
7. Set alert thresholds:
   - 50% ($25) - Warning
   - 80% ($40) - Action needed
   - 100% ($50) - Critical

### Monitor Costs

**Daily checks:**
```bash
# Check current month's costs
aws ce get-cost-and-usage \
  --time-period Start=2026-08-01,End=2026-08-31 \
  --granularity MONTHLY \
  --metrics UnblendedCost
```

**AWS Console:**
- Billing Dashboard → **Cost Explorer**
- View by service to identify expensive resources

### Cost Optimization Tips

1. **Delete unused resources:**
   ```bash
   cdk destroy  # When done testing
   ```

2. **Use Reserved Instances** (for production)
   - Save up to 75% on Lambda costs

3. **Enable S3 lifecycle policies** (already configured)
   - Auto-delete old detection images

4. **Monitor CloudWatch logs**
   - Set log retention to 7-14 days
   - Logs cost $0.50/GB

5. **Use DynamoDB on-demand** (already configured)
   - Only pay for what you use

---

## Troubleshooting

### Issue: "Unable to resolve AWS account to use"

**Error:**
```
Unable to resolve AWS account to use. It must be either configured when you define your CDK Stack, or through the environment
```

**Solution:**
```bash
# Check if AWS CLI is configured
aws sts get-caller-identity

# If it fails, reconfigure
aws configure
```

---

### Issue: "Bootstrap stack version X is required"

**Error:**
```
This CDK CLI is not compatible with the CDK library used by your application.
Bootstrap stack version 'X' is required...
```

**Solution:**
```bash
# Update CDK CLI
npm install -g aws-cdk@latest

# Re-bootstrap
cdk bootstrap
```

---

### Issue: "Access Denied" during deployment

**Error:**
```
User: arn:aws:iam::123456789012:user/imii-developer is not authorized to perform: cloudformation:CreateStack
```

**Solution:**
1. Go to IAM in AWS Console
2. Click your user → **Permissions**
3. Ensure **AdministratorAccess** is attached
4. Wait 30 seconds for propagation

---

### Issue: "Resource already exists"

**Error:**
```
ImiiDomesBackendStack already exists
```

**Solution:**
```bash
# Check CloudFormation
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE

# Delete if needed
cdk destroy

# Redeploy
cdk deploy
```

---

### Issue: API returns CORS errors

**Error in browser:**
```
Access to fetch has been blocked by CORS policy
```

**Solution:**
1. Check API URL in `.env.local` is correct
2. Verify CORS is enabled in CDK stack (already done)
3. Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

---

### Issue: "Cannot find module 'aws-sdk'"

**Error:**
```
Error: Cannot find module 'aws-sdk' in Lambda
```

**Solution:**
```bash
# Install Lambda layer dependencies
cd back-end/lambda/layers/common/nodejs
npm install
cd ../../../../

# Redeploy
cdk deploy
```

---

### Issue: DynamoDB "Resource Not Found"

**Error in logs:**
```
ResourceNotFoundException: Requested resource not found: Table: imii-sites not found
```

**Solution:**
```bash
# Verify tables exist
aws dynamodb list-tables

# If missing, redeploy
cd back-end
cdk deploy
```

---

### Issue: High AWS costs

**Unexpected bill:**

**Immediate actions:**
1. Check AWS Cost Explorer to identify the service
2. Stop/delete unused resources:
   ```bash
   # Delete backend
   cd back-end
   cdk destroy
   ```

3. Check for:
   - Orphaned EC2 instances
   - Large S3 buckets
   - High Lambda invocation count
   - DynamoDB provisioned capacity (should be on-demand)

4. Contact AWS Support (Basic plan is free)

---

### Issue: "pnpm: command not found"

**Error:**
```bash
zsh: command not found: pnpm
```

**Solution:**
```bash
npm install -g pnpm
```

---

### Getting More Help

**Official Documentation:**
- AWS CDK: https://docs.aws.amazon.com/cdk/
- AWS DynamoDB: https://docs.aws.amazon.com/dynamodb/
- AWS Lambda: https://docs.aws.amazon.com/lambda/

**AWS Support:**
- Basic Support (Free): Submit case via AWS Console
- Developer Support ($29/month): 12-hour response time

**Project Documentation:**
- [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)
- [DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)
- [QUICK_START.md](./QUICK_START.md)

---

## Security Best Practices

### 1. Credentials

✅ **DO:**
- Store credentials in `~/.aws/`
- Use IAM users (not root account)
- Enable MFA
- Rotate access keys every 90 days
- Use a password manager

❌ **DON'T:**
- Commit credentials to Git
- Share access keys via email/Slack
- Use root account for daily work
- Hardcode credentials in code

### 2. IAM Policies

✅ **DO:**
- Follow principle of least privilege
- Create custom policies for production
- Use IAM roles for services (not access keys)
- Enable CloudTrail for audit logs

❌ **DON'T:**
- Give AdministratorAccess in production
- Share IAM users between people
- Ignore AWS security alerts

### 3. Network Security

✅ **DO:**
- Use HTTPS for all API calls (already configured)
- Restrict CORS to your domain in production
- Enable VPC for sensitive applications

**Update CORS for production:**
Edit `back-end/lib/imii-domes-backend-stack.ts`:
```typescript
allowOrigins: ['https://your-domain.com']
```

### 4. Data Protection

✅ **DO:**
- Enable point-in-time recovery (already enabled)
- Enable encryption at rest (enabled by default)
- Set S3 lifecycle policies (already configured)
- Regular backups

### 5. Monitoring

✅ **DO:**
- Enable CloudWatch alarms
- Set up billing alerts
- Review CloudTrail logs
- Monitor Lambda errors

---

## Next Steps

### For Development
1. ✅ Explore the dashboard at http://localhost:5173/
2. ✅ Review API endpoints in [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)
3. ✅ Test each feature (Dashboard, Structural, Detection, Inventory)
4. ✅ Modify frontend components as needed

### For Production
1. 🔐 Restrict IAM permissions (custom policies)
2. 🌐 Set up custom domain (Route 53 + API Gateway)
3. 🔒 Update CORS to your domain only
4. 📊 Add CloudWatch dashboards
5. 🚨 Set up error alerting (SNS + Email)
6. 💾 Configure automated backups
7. 🔄 Set up CI/CD pipeline (GitHub Actions)
8. 🎯 Add authentication (AWS Cognito)

### Learning Resources
- **AWS Free Tier**: https://aws.amazon.com/free/
- **AWS CDK Workshop**: https://cdkworkshop.com/
- **DynamoDB Guide**: https://www.dynamodbguide.com/
- **Serverless Patterns**: https://serverlessland.com/patterns

---

## Congratulations! 🎉

You've successfully:
- ✅ Created an AWS account
- ✅ Secured your account with MFA
- ✅ Created an IAM user
- ✅ Installed and configured AWS CLI
- ✅ Installed AWS CDK
- ✅ Deployed a full-stack serverless application
- ✅ Created 5 DynamoDB tables
- ✅ Set up 5 Lambda functions
- ✅ Configured API Gateway
- ✅ Connected your React frontend

**Your IMII Domes monitoring system is now live on AWS!** 🚀

---

## Quick Reference Commands

```bash
# AWS CLI
aws configure                          # Setup credentials
aws sts get-caller-identity           # Show account info
aws dynamodb list-tables              # List tables
aws lambda list-functions             # List functions
aws s3 ls                             # List S3 buckets

# CDK Commands
cdk bootstrap                         # One-time setup
cdk synth                            # Generate CloudFormation
cdk diff                             # Preview changes
cdk deploy                           # Deploy stack
cdk destroy                          # Delete everything
cdk docs                             # Open documentation

# DynamoDB Commands
aws dynamodb scan --table-name imii-sites
aws dynamodb describe-table --table-name imii-sites
aws dynamodb put-item --table-name imii-sites --item '{"siteId":{"S":"test"}}'

# Lambda Commands
aws lambda invoke --function-name FUNCTION_NAME output.json
aws lambda get-function --function-name FUNCTION_NAME

# CloudWatch Logs
aws logs tail /aws/lambda/FUNCTION_NAME --follow
aws logs describe-log-groups

# Cost Monitoring
aws ce get-cost-and-usage --time-period Start=2026-08-01,End=2026-08-31 --granularity MONTHLY --metrics UnblendedCost

# Frontend
cd front-end
pnpm install                         # Install dependencies
pnpm dev                             # Start dev server
pnpm build                           # Build for production
pnpm preview                         # Preview production build

# Backend
cd back-end
npm install                          # Install dependencies
cdk deploy                           # Deploy changes
npm run test                         # Run tests (if configured)
```

---

**Need Help?** Review the troubleshooting section or check the other documentation files!

**Found this guide helpful?** Share it with your team! 🙌