# GitHub Actions — CI/CD to AWS EC2

**Project:** JobFit AI — An AI-Powered Job Matching Platform

By the end of this guide, every time you push code to GitHub, it will automatically deploy to your live EC2 server without manual intervention. No more manual SSH sessions or forgotten application restarts.

---

## Prerequisites

- Module backend running locally or tested
- A GitHub repository with your project pushed
- An AWS EC2 instance running Ubuntu with your backend app configured
- Your `.pem` private key file used for SSH access

---

## 1. What Is CI/CD — The Simplest Explanation

Traditional manual deployment workflow requires multiple repetitive steps on every change:
```text
Write code → git push → SSH into EC2 manually → git pull manually → pm2 restart manually
```

CI/CD automates this entire pipeline:
```text
Write code → git push → GitHub Actions handles deployment automatically
```

- **CI (Continuous Integration):** Automatically checks code validity and builds.
- **CD (Continuous Deployment):** Automatically transfers and deploys working code to your live server.

---

## 2. How GitHub Actions Deploys to EC2

GitHub Actions runs on cloud virtual machines called *runners*. When you push code, a runner spins up, checks out your code, and securely connects to your EC2 instance via SSH. It requires two key elements configured as GitHub Secrets:
1. **EC2 Server IP Address:** Where the runner connects.
2. **`.pem` Private Key:** Authenticates the secure connection.

---

### Step 1 — Store Your Secrets in GitHub

Never store your IP address or private key inside code files or configuration repositories. Navigate to your repository on GitHub:
```text
Your Repo → Settings → Secrets and variables → Actions → New repository secret
```

Create two repository secrets:
- **`EC2_HOST`**: Your EC2 public IPv4 address (e.g., `13.233.45.67`).
- **`EC2_SSH_KEY`**: The complete contents of your `.pem` key file.

To copy your key file content from your terminal, run:
```bash
cat key_pair.pem
```

Copy the entire output including the header and footer lines (`-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`) and paste it into the `EC2_SSH_KEY` secret value field.

---

### Step 2 — Update the EC2 Security Group

GitHub Actions uses a rotating pool of IP addresses, so you must allow incoming SSH connections from any IP on port 22.

1. Go to the AWS Console → **EC2** → **Instances** → Select your instance.
2. Open the **Security** tab and click on your Security Group.
3. Edit inbound rules and add a rule: 
   - **Type:** SSH
   - **Protocol:** TCP
   - **Port:** 22
   - **Source:** `0.0.0.0/0` (Anywhere-IPv4)

> **Security Note:** Opening port 22 to `0.0.0.0/0` is standard for CI/CD runners. Your server remains completely secure because SSH authentication requires your private cryptographic key file.

---

### Step 3 — Create the Workflow File

In your project root directory, create the GitHub Actions workflow directory and file:
```bash
mkdir -p .github/workflows
touch .github/workflows/ci.yml
```

Paste the following configuration into `.github/workflows/ci.yml`:

```yaml
name: Deploy to EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/jobfit-ai/server
            git pull origin main
            npm install
            pm2 restart jobfit-api
```

#### Workflow Breakdown
- `on: push: branches: [main]`: Triggers the workflow automatically whenever code is pushed to the `main` branch.
- `uses: appleboy/ssh-action@v1`: A trusted community action that manages the secure SSH connection and remote script execution.
- `script:`: The exact shell commands executed on your EC2 instance sequentially after connection.

---

### Step 4 — Make Sure PM2 Is Running on EC2

PM2 keeps your Node.js application running persistently. SSH into your EC2 instance once manually to set up the initial PM2 process:
```bash
ssh -i key_pair.pem ubuntu@YOUR_EC2_IP
```

Inside your server, run:
```bash
cd ~/jobfit-ai/server
npm install
pm2 start server.js --name jobfit-api
pm2 save
pm2 startup
```

Run the generated startup command printed by PM2 in your terminal so your app automatically restarts after server reboots.

---

## 3. Push and Verify

Commit and push your workflow file to GitHub:
```bash
git add .
git commit -m "Add GitHub Actions CI/CD deploy workflow"
git push origin main
```

Go to your GitHub repository **Actions** tab to monitor the live execution log in real-time. Once complete with a green checkmark, your updates are live!

---

## 4. Troubleshooting Common Failures

- **SSH Connection Refused:** Check that port 22 is open to `0.0.0.0/0` in your EC2 security group.
- **PM2 Process Not Found:** Verify that the application was started once manually with the exact name `jobfit-api` on EC2.
- **Git Pull Permission Denied:** Ensure your EC2 has proper read access keys configured for your GitHub repository.