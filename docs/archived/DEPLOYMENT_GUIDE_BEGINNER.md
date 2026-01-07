# 🚀 Complete Beginner's Deployment Guide
## Dental Hospital Records System - Step-by-Step Instructions

> **👋 Welcome!** This guide is written for complete beginners. Every single step is explained in detail, including what each command does and why you're running it.

---

## 📋 Table of Contents

1. [What You'll Need](#what-youll-need)
2. [Understanding the Basics](#understanding-the-basics)
3. [Step 1: Install Required Software](#step-1-install-required-software)
4. [Step 2: Set Up AWS Account](#step-2-set-up-aws-account)
5. [Step 3: Configure Your Computer](#step-3-configure-your-computer)
6. [Step 4: Prepare the Project](#step-4-prepare-the-project)
7. [Step 5: Deploy Infrastructure](#step-5-deploy-infrastructure)
8. [Step 6: Deploy Application Code](#step-6-deploy-application-code)
9. [Step 7: Test Everything](#step-7-test-everything)
10. [Step 8: Create First User](#step-8-create-first-user)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Common Questions](#common-questions)

---

## What You'll Need

### Required Knowledge
- **None!** This guide assumes you're starting from zero.
- Basic computer skills (opening terminal, typing commands)
- Ability to follow instructions step-by-step

### Required Time
- **Total Time**: 2-4 hours (depending on your internet speed)
- **Breakdown**:
  - Software installation: 30-60 minutes
  - AWS setup: 30 minutes
  - Project setup: 15 minutes
  - Infrastructure deployment: 30-45 minutes
  - Application deployment: 30-45 minutes
  - Testing: 15-30 minutes

### Required Items
- Computer (Mac, Windows, or Linux)
- Internet connection
- Credit card (for AWS account - you'll get free tier credits)
- Email address
- Phone number (for AWS verification)

---

## Understanding the Basics

### What is AWS?
**AWS (Amazon Web Services)** is a cloud platform where we'll host our application. Think of it like renting a computer in the cloud instead of buying one.

### What is Terraform?
**Terraform** is a tool that creates AWS resources (databases, servers, etc.) automatically. Instead of clicking buttons in AWS website, we write code that creates everything.

### What is Lambda?
**Lambda** is AWS's way of running code without managing servers. You upload your code, and AWS runs it when needed.

### What is DynamoDB?
**DynamoDB** is AWS's database service. It stores all our data (users, patients, procedures, etc.).

### What is S3?
**S3** is AWS's file storage. We use it to store images (X-rays, photos, etc.).

### What is API Gateway?
**API Gateway** is the front door to our application. When someone makes a request, API Gateway receives it and sends it to the right Lambda function.

---

## Step 1: Install Required Software

### 1.1 Install Node.js

**What it is**: Node.js lets us run JavaScript code on our computer.

**How to install**:

#### On Mac:
```bash
# Open Terminal (press Cmd+Space, type "Terminal", press Enter)

# Install Homebrew first (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@20

# Verify installation
node --version
# Should show: v20.x.x

npm --version
# Should show: 10.x.x
```

**What to expect**:
- Installation takes 5-10 minutes
- You'll see lots of text scrolling
- At the end, you should see version numbers

**If it fails**:
- Check your internet connection
- Make sure you have admin rights (password may be asked)
- Try again after a few minutes

#### On Windows:
1. Go to https://nodejs.org/
2. Download "LTS" version (should be v20.x.x)
3. Run the installer
4. Click "Next" through all steps
5. Open Command Prompt (press Windows key, type "cmd", press Enter)
6. Type: `node --version` (should show v20.x.x)

#### On Linux:
```bash
# Update package list
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

---

### 1.2 Install AWS CLI

**What it is**: AWS CLI lets us control AWS from the command line.

**How to install**:

#### On Mac:
```bash
# Install using Homebrew
brew install awscli

# Verify
aws --version
# Should show: aws-cli/2.x.x
```

#### On Windows:
1. Download AWS CLI from: https://awscli.amazonaws.com/AWSCLIV2.msi
2. Run the installer
3. Click "Next" through all steps
4. Open Command Prompt
5. Type: `aws --version`

#### On Linux:
```bash
# Download installer
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"

# Unzip
unzip awscliv2.zip

# Install
sudo ./aws/install

# Verify
aws --version
```

**What to expect**:
- Installation takes 2-5 minutes
- You'll see "aws-cli/2.x.x" when done

---

### 1.3 Install Terraform

**What it is**: Terraform creates AWS resources automatically.

**How to install**:

#### On Mac:
```bash
# Install using Homebrew
brew install terraform

# Verify
terraform version
# Should show: Terraform v1.5.x or higher
```

#### On Windows:
1. Go to https://www.terraform.io/downloads
2. Download Windows 64-bit version
3. Unzip the file
4. Move `terraform.exe` to a folder in your PATH (e.g., `C:\Windows\System32`)
5. Open Command Prompt
6. Type: `terraform version`

#### On Linux:
```bash
# Download
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip

# Unzip
unzip terraform_1.6.0_linux_amd64.zip

# Move to system path
sudo mv terraform /usr/local/bin/

# Verify
terraform version
```

**What to expect**:
- Installation takes 1-2 minutes
- You'll see "Terraform v1.5.x" or higher when done

---

### 1.4 Install Git (if not installed)

**What it is**: Git manages code versions.

**How to check if installed**:
```bash
git --version
```

**If not installed**:

#### On Mac:
```bash
brew install git
```

#### On Windows:
1. Download from: https://git-scm.com/download/win
2. Run installer
3. Use default options

#### On Linux:
```bash
sudo apt install git
```

---

### 1.5 Install Docker (Optional - for testing)

**What it is**: Docker lets us run a local database for testing.

**How to install**:

#### On Mac:
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Install and run Docker Desktop
3. Wait for it to start (whale icon in menu bar)

#### On Windows:
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Install and run Docker Desktop
3. Wait for it to start

#### On Linux:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

**Verify Docker**:
```bash
docker --version
# Should show: Docker version 24.x.x or higher
```

---

## Step 2: Set Up AWS Account

### 2.1 Create AWS Account

**Step-by-step**:

1. **Go to AWS website**:
   - Open browser
   - Go to: https://aws.amazon.com/
   - Click "Create an AWS Account" (top right)

2. **Enter email and account name**:
   - Enter your email address
   - Choose an account name (e.g., "Dental Hospital System")
   - Click "Continue"

3. **Enter password**:
   - Create a strong password
   - Re-enter password
   - Click "Create AWS Account"

4. **Contact information**:
   - Enter your full name
   - Company name (optional)
   - Phone number
   - Country/Region
   - Click "Continue"

5. **Payment information**:
   - Enter credit card details
   - **Don't worry**: You get free tier credits for 12 months
   - AWS won't charge you unless you exceed free tier limits
   - Click "Secure Submit"

6. **Phone verification**:
   - Choose "Text message" or "Voice call"
   - Enter phone number
   - Enter verification code when received
   - Click "Verify code"

7. **Support plan**:
   - Choose "Basic Plan" (Free)
   - Click "Complete sign up"

8. **Wait for account activation**:
   - Usually takes 5-10 minutes
   - You'll receive an email when ready
   - Check your email

**What you get with AWS Free Tier**:
- 750 hours/month of EC2 (we won't use this)
- 5GB S3 storage
- 25GB DynamoDB storage
- 1 million Lambda requests/month
- 1GB API Gateway requests/month
- **Most of our system fits in free tier!**

---

### 2.2 Create IAM User

**Why**: Don't use the root account. Create a separate user for security.

**Step-by-step**:

1. **Login to AWS Console**:
   - Go to: https://console.aws.amazon.com/
   - Sign in with your root account email and password

2. **Go to IAM**:
   - In the search bar at top, type "IAM"
   - Click on "IAM" service

3. **Create User**:
   - Click "Users" in left menu
   - Click "Create user" button (top right)

4. **Enter user details**:
   - User name: `dental-hospital-admin`
   - Click "Next"

5. **Set permissions**:
   - Select "Attach policies directly"
   - Search for "AdministratorAccess"
   - Check the box next to "AdministratorAccess"
   - Click "Next"

6. **Review and create**:
   - Review the settings
   - Click "Create user"

7. **⚠️ IMPORTANT - Save Access Keys**:
   - Click on the user you just created
   - Go to "Security credentials" tab
   - Click "Create access key"
   - Select "Command Line Interface (CLI)"
   - Check the confirmation box
   - Click "Next"
   - **Copy both values immediately**:
     - **Access Key ID**: `AKIA...` (starts with AKIA)
     - **Secret Access Key**: `wJalr...` (long random string)
   - **⚠️ WARNING**: You can only see the secret key once! Save it now!
   - Click "Done"

**Where to save**:
- Create a text file on your computer
- Name it: `aws-credentials.txt`
- Save both keys there
- **DO NOT** commit this file to git (it's already in .gitignore)

---

### 2.3 Configure AWS CLI

**What this does**: Connects your computer to AWS.

**Step-by-step**:

1. **Open Terminal/Command Prompt**

2. **Run configuration command**:
   ```bash
   aws configure
   ```

3. **Enter your credentials** (one at a time, press Enter after each):
   ```
   AWS Access Key ID [None]: AKIA... (paste your Access Key ID)
   AWS Secret Access Key [None]: wJalr... (paste your Secret Access Key)
   Default region name [None]: us-east-1
   Default output format [None]: json
   ```

4. **Verify it worked**:
   ```bash
   aws sts get-caller-identity
   ```

   **Expected output**:
   ```json
   {
       "UserId": "AIDA...",
       "Account": "123456789012",
       "Arn": "arn:aws:iam::123456789012:user/dental-hospital-admin"
   }
   ```

   **If you see this, it worked!** ✅

   **If you see an error**:
   - Check that you copied the keys correctly
   - Make sure there are no extra spaces
   - Try running `aws configure` again

---

### 2.4 Create S3 Bucket for Terraform State

**What is Terraform State**: Terraform remembers what it created in a "state file". We store this in S3 so it's safe and accessible.

**Step-by-step**:

1. **Choose a unique bucket name**:
   - S3 bucket names must be globally unique
   - Use: `dental-hospital-terraform-state-YOURNAME-2024`
   - Replace `YOURNAME` with your name or company
   - Example: `dental-hospital-terraform-state-john-doe-2024`

2. **Create the bucket**:
   ```bash
   # Replace YOUR-UNIQUE-NAME with your chosen name
   aws s3 mb s3://dental-hospital-terraform-state-YOUR-UNIQUE-NAME
   ```

   **Expected output**:
   ```
   make_bucket: dental-hospital-terraform-state-YOUR-UNIQUE-NAME
   ```

   **If you get an error "BucketAlreadyExists"**:
   - The name is taken, choose a different one
   - Try adding random numbers: `dental-hospital-terraform-state-john-doe-2024-12345`

3. **Enable versioning** (allows recovery of previous state):
   ```bash
   aws s3api put-bucket-versioning \
     --bucket dental-hospital-terraform-state-YOUR-UNIQUE-NAME \
     --versioning-configuration Status=Enabled
   ```

4. **Enable encryption**:
   ```bash
   aws s3api put-bucket-encryption \
     --bucket dental-hospital-terraform-state-YOUR-UNIQUE-NAME \
     --server-side-encryption-configuration '{
       "Rules": [{
         "ApplyServerSideEncryptionByDefault": {
           "SSEAlgorithm": "AES256"
         }
       }]
     }'
   ```

5. **Block public access** (security):
   ```bash
   aws s3api put-public-access-block \
     --bucket dental-hospital-terraform-state-YOUR-UNIQUE-NAME \
     --public-access-block-configuration \
       "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
   ```

6. **Verify bucket exists**:
   ```bash
   aws s3 ls | grep terraform-state
   ```

   **Expected output**:
   ```
   2024-01-08 00:00:00 dental-hospital-terraform-state-YOUR-UNIQUE-NAME
   ```

**Save your bucket name**: Write it down! You'll need it later.

---

## Step 3: Configure Your Computer

### 3.1 Navigate to Project Directory

**Step-by-step**:

1. **Open Terminal/Command Prompt**

2. **Navigate to project**:
   ```bash
   cd /Users/apple/repository/dental-hospital-system
   ```

   **On Windows**:
   ```cmd
   cd C:\Users\YourName\repository\dental-hospital-system
   ```
   (Adjust path to where you cloned the project)

3. **Verify you're in the right place**:
   ```bash
   pwd
   # Mac/Linux: Should show: /Users/apple/repository/dental-hospital-system
   # Windows: cd (without arguments) shows current directory
   
   ls
   # Should see: package.json, src/, infrastructure/, docs/, etc.
   ```

---

### 3.2 Install Project Dependencies

**What this does**: Downloads all the code libraries our project needs.

**Step-by-step**:

1. **Make sure you're in project directory**:
   ```bash
   pwd
   # Should show the dental-hospital-system directory
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

   **What happens**:
   - Downloads hundreds of packages
   - Creates `node_modules/` folder
   - Takes 2-5 minutes depending on internet speed

   **Expected output**:
   ```
   added 1234 packages, and audited 1235 packages in 2m
   ```

   **If you see errors**:
   - Check internet connection
   - Try again: `npm install`
   - If still fails, try: `npm cache clean --force` then `npm install`

3. **Verify installation**:
   ```bash
   ls node_modules
   # Should see many folders (this is normal!)
   ```

---

### 3.3 Create Environment Variables File

**What this does**: Stores configuration values your application needs.

**Step-by-step**:

1. **Get your AWS Account ID**:
   ```bash
   aws sts get-caller-identity --query Account --output text
   ```

   **Expected output**:
   ```
   123456789012
   ```
   (12-digit number - this is your AWS Account ID)

   **Copy this number!** You'll need it next.

2. **Generate a JWT Secret**:
   ```bash
   openssl rand -base64 32
   ```

   **Expected output**:
   ```
   aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890AbCdEf=
   ```
   (Long random string)

   **Copy this string!** You'll need it next.

3. **Create .env file**:
   ```bash
   # On Mac/Linux
   cat > .env << 'EOF'
   AWS_REGION=us-east-1
   AWS_ACCOUNT_ID=YOUR_ACCOUNT_ID_HERE
   ENVIRONMENT=production
   PROJECT_NAME=dental-hospital-system
   JWT_SECRET=YOUR_JWT_SECRET_HERE
   EOF
   ```

   **On Windows** (use Notepad):
   - Open Notepad
   - Type:
     ```
     AWS_REGION=us-east-1
     AWS_ACCOUNT_ID=YOUR_ACCOUNT_ID_HERE
     ENVIRONMENT=production
     PROJECT_NAME=dental-hospital-system
     JWT_SECRET=YOUR_JWT_SECRET_HERE
     ```
   - Replace `YOUR_ACCOUNT_ID_HERE` with your 12-digit account ID
   - Replace `YOUR_JWT_SECRET_HERE` with the generated secret
   - Save as `.env` in the project directory

4. **Verify .env file**:
   ```bash
   cat .env
   # Should show your configuration (JWT_SECRET will be visible - that's okay for now)
   ```

   **⚠️ Security Note**: The `.env` file is already in `.gitignore`, so it won't be committed to git. That's good!

---

## Step 4: Prepare the Project

### 4.1 Verify Project Structure

**What to check**:

```bash
ls -la
```

**You should see**:
- `package.json` - Project configuration
- `src/` - Source code
- `infrastructure/` - Terraform files
- `tests/` - Test files
- `docs/` - Documentation
- `.env` - Your environment file (just created)

**If anything is missing**:
- Make sure you cloned the complete repository
- Check that you're in the right directory

---

### 4.2 Test That Everything Works Locally

**Step-by-step**:

1. **Run type check** (checks for code errors):
   ```bash
   npm run type-check
   ```

   **Expected output**:
   ```
   # Should complete without errors
   # If you see errors, they're likely minor - we'll fix them
   ```

2. **Run unit tests**:
   ```bash
   npm run test:unit
   ```

   **Expected output**:
   ```
   PASS tests/unit/auth/AuthService.test.ts
     AuthService
       login
         ✓ should successfully login with valid credentials
         ...
   
   Test Suites: 1 passed, 1 total
   Tests:       6 passed, 6 total
   ```

   **If tests pass, you're ready to deploy!** ✅

---

## Step 5: Deploy Infrastructure

**What this does**: Creates all AWS resources (databases, storage, API, etc.)

### 5.1 Navigate to Infrastructure Directory

```bash
cd infrastructure
ls -la
# Should see: main.tf, variables.tf, dynamodb.tf, lambda.tf, etc.
```

---

### 5.2 Initialize Terraform

**What this does**: Downloads Terraform plugins and sets up backend.

**Step-by-step**:

1. **Replace YOUR-BUCKET-NAME** in the command below with your actual bucket name from Step 2.4

2. **Initialize Terraform**:
   ```bash
   terraform init \
     -backend-config="bucket=dental-hospital-terraform-state-YOUR-UNIQUE-NAME" \
     -backend-config="key=dental-hospital/terraform.tfstate" \
     -backend-config="region=us-east-1" \
     -backend-config="encrypt=true"
   ```

   **Expected output**:
   ```
   Initializing the backend...
   Initializing provider plugins...
   - Finding hashicorp/aws versions matching "~> 5.0"...
   - Installing hashicorp/aws v5.x.x...
   ...
   Terraform has been successfully initialized!
   ```

   **Time**: 1-2 minutes

   **If you see errors**:
   - Check bucket name is correct
   - Check AWS credentials: `aws sts get-caller-identity`
   - Make sure bucket exists: `aws s3 ls | grep terraform-state`

---

### 5.3 Create Terraform Variables File

**What this does**: Tells Terraform what values to use.

**Step-by-step**:

1. **Get your JWT secret from .env file**:
   ```bash
   cd ..
   cat .env | grep JWT_SECRET
   # Copy the value after the = sign
   cd infrastructure
   ```

2. **Create terraform.tfvars file**:
   ```bash
   cat > terraform.tfvars << 'EOF'
   aws_region = "us-east-1"
   environment = "production"
   project_name = "dental-hospital-system"
   jwt_secret = "PASTE_YOUR_JWT_SECRET_HERE"
   jwt_access_expiry = "30m"
   jwt_refresh_expiry = "30d"
   rate_limit_per_user = 15
   api_gateway_stage_name = "prod"
   enable_cloudfront = true
   EOF
   ```

3. **Edit the file**:
   - Open `terraform.tfvars` in a text editor
   - Replace `PASTE_YOUR_JWT_SECRET_HERE` with your actual JWT secret
   - Save the file

---

### 5.4 Validate Terraform Configuration

**What this does**: Checks for syntax errors.

```bash
terraform validate
```

**Expected output**:
```
Success! The configuration is valid.
```

**If you see errors**:
- Read the error message carefully
- Usually it's a typo or missing value
- Fix the error and try again

---

### 5.5 Review What Will Be Created

**What this does**: Shows you everything Terraform will create WITHOUT creating it yet.

```bash
terraform plan
```

**What you'll see**:
- Long list of resources with `+` (will be created)
- Review the list carefully
- Should see:
  - 8 DynamoDB tables
  - 10+ Lambda functions
  - 1 API Gateway
  - 3 S3 buckets
  - IAM roles and policies
  - EventBridge rules
  - CloudFront distribution

**Time**: 2-3 minutes

**Save the plan** (optional):
```bash
terraform plan -out=tfplan
```

---

### 5.6 Apply Infrastructure (Create Everything)

**⚠️ WARNING**: This creates real AWS resources and may incur costs (though most will be free tier).

**Step-by-step**:

1. **Apply the plan**:
   ```bash
   terraform apply
   ```

2. **Review the plan** (it will show again):
   - Read through what will be created
   - Make sure it looks correct

3. **Confirm**:
   - Type: `yes`
   - Press Enter

4. **Wait for completion**:
   - This takes 10-15 minutes
   - You'll see lots of output like:
     ```
     aws_dynamodb_table.users: Creating...
     aws_dynamodb_table.users: Creation complete after 5s
     aws_lambda_function.auth_handler: Creating...
     ...
     ```

5. **When complete**:
   ```
   Apply complete! Resources: 25 added, 0 changed, 0 destroyed.
   ```

**What was created**:
- ✅ 8 DynamoDB tables (databases)
- ✅ 10+ Lambda functions (code that runs)
- ✅ 1 API Gateway (API endpoint)
- ✅ 3 S3 buckets (file storage)
- ✅ IAM roles (permissions)
- ✅ EventBridge rules (scheduled tasks)
- ✅ CloudFront (CDN for images)

**If you see errors**:
- Don't panic! Read the error message
- Common issues:
  - Rate limiting: Wait 1 minute and try again
  - Permission errors: Check IAM user has AdministratorAccess
  - Region errors: Make sure you're using `us-east-1`

---

### 5.7 Save Important Information

**What this does**: Saves outputs (URLs, names, etc.) for later use.

```bash
# Save all outputs to file
terraform output -json > ../terraform-outputs.json

# View outputs
terraform output

# Save API Gateway URL (most important!)
terraform output api_gateway_url > ../api-url.txt
cat ../api-url.txt
```

**Expected output**:
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

**⚠️ Save this URL!** You'll need it to test the API.

**Other important outputs**:
- `images_bucket_name` - Where images are stored
- `cloudfront_url` - CDN URL for images
- `dynamodb_table_names` - All table names

---

## Step 6: Deploy Application Code

**What this does**: Uploads your application code to Lambda functions.

### 6.1 Build the Code

**What this does**: Compiles TypeScript to JavaScript.

```bash
# Go back to project root
cd ..

# Build Lambda functions
npm run build:lambda
```

**Expected output**:
```
# Compiles TypeScript files
# Creates dist/lambda/ directory with compiled code
```

**Time**: 30-60 seconds

**Verify build**:
```bash
ls -la dist/lambda/
# Should see: auth/, users/, patients/, procedures/, images/, etc.
```

---

### 6.2 Package Lambda Functions

**What this does**: Creates zip files for each Lambda function.

**Step-by-step**:

1. **Use the deployment script** (easiest way):
   ```bash
   ./scripts/deploy-lambda.sh
   ```

   **OR manually**:
   ```bash
   cd dist/lambda
   
   # Package each function
   for dir in */; do
     cd "$dir"
     zip -r "../${dir%/}.zip" . -x "*.git*" -x "*.DS_Store"
     cd ..
   done
   
   cd ../..
   ```

2. **Verify packages**:
   ```bash
   ls -lh dist/*.zip
   # Should see zip files for each handler
   # Each should be 1-5 MB
   ```

---

### 6.3 Create Environment Variables File for Lambda

**What this does**: Creates a file with all environment variables Lambda functions need.

**Step-by-step**:

1. **Get table names from Terraform**:
   ```bash
   cd infrastructure
   
   # Create environment variables JSON
   cat > ../lambda-env.json << EOF
   {
     "USERS_TABLE_NAME": "$(terraform output -raw users_table_name)",
     "PATIENTS_TABLE_NAME": "$(terraform output -raw patients_table_name)",
     "PROCEDURES_TABLE_NAME": "$(terraform output -raw procedures_table_name)",
     "PROCEDURE_STEPS_TABLE_NAME": "$(terraform output -raw procedure_steps_table_name)",
     "IMAGES_TABLE_NAME": "$(terraform output -raw images_table_name)",
     "CONSENT_TABLE_NAME": "$(terraform output -raw consent_table_name)",
     "AUDIT_LOGS_TABLE_NAME": "$(terraform output -raw audit_logs_table_name)",
     "USER_PATIENT_MAPPING_TABLE_NAME": "$(terraform output -raw user_patient_mapping_table_name)",
     "IMAGES_BUCKET": "$(terraform output -raw images_bucket_name)",
     "ARCHIVE_BUCKET": "$(terraform output -raw archive_bucket_name)",
     "JWT_SECRET": "$(terraform output -raw jwt_secret)",
     "JWT_ACCESS_EXPIRY": "30m",
     "JWT_REFRESH_EXPIRY": "30d",
     "AWS_REGION": "us-east-1"
   }
   EOF
   
   cd ..
   ```

2. **Verify file was created**:
   ```bash
   cat lambda-env.json
   # Should show JSON with all table names and bucket names
   ```

---

### 6.4 Deploy Lambda Functions

**What this does**: Uploads code to each Lambda function.

**Step-by-step**:

1. **Get function names**:
   ```bash
   cd infrastructure
   terraform output -json | jq -r '.lambda_functions.value[]'
   # If jq is not installed, we'll deploy manually
   cd ..
   ```

2. **Deploy each function** (replace function names if different):
   ```bash
   # List of functions to deploy
   FUNCTIONS=(
     "auth-handler"
     "users-handler"
     "patients-handler"
     "procedures-handler"
     "images-handler"
     "consent-handler"
     "audit-handler"
     "admin-handler"
     "steps-handler"
     "archive-handler"
   )
   
   # Deploy each one
   for func in "${FUNCTIONS[@]}"; do
     echo "Deploying $func..."
     
     # Update function code
     aws lambda update-function-code \
       --function-name "dental-hospital-system-production-${func}" \
       --zip-file "fileb://dist/${func}.zip" \
       --region us-east-1
     
     # Wait a moment
     sleep 2
     
     # Update environment variables
     aws lambda update-function-configuration \
       --function-name "dental-hospital-system-production-${func}" \
       --environment "Variables=$(cat lambda-env.json)" \
       --region us-east-1
     
     echo "$func deployed successfully!"
   done
   ```

   **Time**: 5-10 minutes (depends on number of functions)

   **Expected output**:
   ```
   Deploying auth-handler...
   {
       "FunctionName": "dental-hospital-system-production-auth-handler",
       "LastModified": "2024-01-08T00:00:00.000Z",
       ...
   }
   auth-handler deployed successfully!
   ...
   ```

**If you see errors**:
- "Function not found": Wait a few minutes after Terraform apply, then try again
- "Access denied": Check IAM permissions
- "Invalid zip": Check that zip files were created correctly

---

### 6.5 Deploy API Gateway

**What this does**: Makes the API accessible via URL.

```bash
cd infrastructure

# Get API Gateway ID
API_ID=$(terraform output -raw api_gateway_id)

# Create deployment
aws apigateway create-deployment \
  --rest-api-id "$API_ID" \
  --stage-name prod \
  --description "Initial deployment"

# Get API URL
API_URL=$(terraform output -raw api_gateway_url)
echo "Your API URL: $API_URL"

cd ..
```

**Expected output**:
```
Your API URL: https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

**⚠️ Save this URL!** This is your API endpoint.

---

## Step 7: Test Everything

### 7.1 Test API Health (if endpoint exists)

```bash
API_URL=$(cat api-url.txt)
curl "$API_URL/health"
```

**Expected**: Either a health response or 404 (both are okay if API is working)

---

### 7.2 Test Lambda Function Directly

```bash
# Test auth handler
aws lambda invoke \
  --function-name dental-hospital-system-production-auth-handler \
  --payload '{"httpMethod":"GET","path":"/health"}' \
  response.json

cat response.json
```

**Expected**: JSON response (even if it's an error, it means Lambda is working)

---

### 7.3 Check CloudWatch Logs

```bash
# View logs for auth handler
aws logs tail /aws/lambda/dental-hospital-system-production-auth-handler --follow
```

**What to look for**:
- No errors
- Logs showing function execution

**To stop watching logs**: Press `Ctrl+C`

---

## Step 8: Create First User

**What this does**: Creates the first admin user so you can login.

### 8.1 Generate Password Hash

**What this does**: Creates a secure hash of your password.

```bash
# Generate hash for password "Admin123!"
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin123!', 10).then(hash => console.log(hash))"
```

**Expected output**:
```
$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUV
```

**⚠️ Copy this hash!** You'll need it next.

---

### 8.2 Create Admin User in DynamoDB

**What this does**: Inserts the admin user directly into the database.

```bash
# Get table name
cd infrastructure
USERS_TABLE=$(terraform output -raw users_table_name)
cd ..

# Create admin user
aws dynamodb put-item \
  --table-name "$USERS_TABLE" \
  --item '{
    "PK": {"S": "USER#admin-001"},
    "SK": {"S": "USER#admin-001"},
    "GSI1PK": {"S": "MOBILE#9999999999"},
    "user_id": {"S": "admin-001"},
    "mobile_number": {"S": "9999999999"},
    "name": {"S": "Hospital Admin"},
    "roles": {"SS": ["HOSPITAL_ADMIN"]},
    "password_hash": {"S": "PASTE_YOUR_HASH_HERE"},
    "created_at": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"},
    "updated_at": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"},
    "login_count": {"N": "0"},
    "is_default_password": {"BOOL": false},
    "is_blocked": {"BOOL": false}
  }'
```

**Replace `PASTE_YOUR_HASH_HERE`** with the hash from Step 8.1

**Expected output**:
```
# No output means success!
```

---

### 8.3 Test Login

```bash
API_URL=$(cat api-url.txt)

curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "9999999999",
    "password": "Admin123!"
  }'
```

**Expected output**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "admin-001",
    "name": "Hospital Admin",
    "roles": ["HOSPITAL_ADMIN"]
  }
}
```

**If you see this, everything is working!** ✅

---

## Troubleshooting Guide

### Problem: "aws: command not found"

**Solution**:
- AWS CLI is not installed or not in PATH
- Reinstall AWS CLI (see Step 1.2)
- On Windows, restart Command Prompt after installation

---

### Problem: "terraform: command not found"

**Solution**:
- Terraform is not installed or not in PATH
- Reinstall Terraform (see Step 1.3)
- On Windows, make sure terraform.exe is in a PATH directory

---

### Problem: "Access Denied" when running AWS commands

**Solution**:
1. Check AWS credentials:
   ```bash
   aws sts get-caller-identity
   ```
2. If it fails, reconfigure:
   ```bash
   aws configure
   ```
3. Check IAM user has AdministratorAccess policy

---

### Problem: "BucketAlreadyExists" when creating S3 bucket

**Solution**:
- S3 bucket names must be globally unique
- Choose a different name
- Try adding random numbers or your name

---

### Problem: Terraform init fails with "Failed to get existing workspaces"

**Solution**:
1. Check bucket exists:
   ```bash
   aws s3 ls | grep terraform-state
   ```
2. Check bucket name is correct in terraform init command
3. Check AWS credentials are working
4. Wait 1-2 minutes after creating bucket, then try again

---

### Problem: "Function not found" when deploying Lambda

**Solution**:
- Wait 2-3 minutes after `terraform apply` completes
- Lambda functions need time to be fully created
- Try again after waiting

---

### Problem: API Gateway returns 500 error

**Solution**:
1. Check Lambda function logs:
   ```bash
   aws logs tail /aws/lambda/dental-hospital-system-production-auth-handler
   ```
2. Check environment variables are set:
   ```bash
   aws lambda get-function-configuration \
     --function-name dental-hospital-system-production-auth-handler
   ```
3. Verify Lambda function code was deployed

---

### Problem: Login returns "Invalid credentials"

**Solution**:
1. Check password hash was generated correctly
2. Verify user was created in DynamoDB:
   ```bash
   aws dynamodb get-item \
     --table-name dental-hospital-system-production-users \
     --key '{"PK":{"S":"USER#admin-001"},"SK":{"S":"USER#admin-001"}}'
   ```
3. Try creating user again with correct hash

---

## Common Questions

### Q: How much will this cost?

**A**: 
- **First 12 months**: Mostly free (AWS Free Tier)
- **After free tier**: $20-50/month for low traffic
- **Cost breakdown**:
  - DynamoDB: $0-5/month (on-demand billing)
  - Lambda: $0-2/month (1M requests free)
  - S3: $0-5/month (5GB free)
  - API Gateway: $0-3/month (1GB free)
  - CloudFront: $0-5/month
  - **Total**: ~$20-50/month

---

### Q: Can I delete everything if I make a mistake?

**A**: Yes! Run:
```bash
cd infrastructure
terraform destroy
# Type: yes
```

**⚠️ WARNING**: This deletes EVERYTHING. Only do this if you're sure!

---

### Q: How do I update the code after deployment?

**A**: 
1. Make code changes
2. Build: `npm run build:lambda`
3. Deploy: `./scripts/deploy-lambda.sh`
4. Or manually deploy each function (see Step 6.4)

---

### Q: Where are my images stored?

**A**: In S3 bucket. Get bucket name:
```bash
cd infrastructure
terraform output images_bucket_name
```

View images:
```bash
aws s3 ls s3://YOUR-BUCKET-NAME/
```

---

### Q: How do I view logs?

**A**: 
```bash
# View logs for any Lambda function
aws logs tail /aws/lambda/FUNCTION-NAME --follow

# View in AWS Console:
# 1. Go to CloudWatch
# 2. Click "Log groups"
# 3. Find your function name
```

---

### Q: What if I forget my API URL?

**A**: 
```bash
cd infrastructure
terraform output api_gateway_url
```

---

## Next Steps

1. ✅ **Test all API endpoints** using the API URL
2. ✅ **Create more users** via the admin interface
3. ✅ **Upload test images** to verify S3 is working
4. ✅ **Set up monitoring** in CloudWatch
5. ✅ **Review security settings** in IAM
6. ✅ **Document your configuration** (save all URLs and names)

---

## Support

If you get stuck:
1. Check CloudWatch logs for errors
2. Review this guide's troubleshooting section
3. Check AWS Service Health Dashboard
4. Review error messages carefully (they usually tell you what's wrong)

---

**🎉 Congratulations!** You've successfully deployed the Dental Hospital Records System!

**Last Updated**: 2025-01-08  
**Version**: 3.0 (Complete Beginner's Guide)

