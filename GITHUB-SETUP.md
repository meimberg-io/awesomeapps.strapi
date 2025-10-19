# GitHub Setup

Initial configuration required for automatic deployment.

## GitHub Variables

**Settings → Variables → Actions**

| Name | Value | Description |
|------|-------|-------------|
| `APP_DOMAIN` | `awesomeapps-strapi.meimberg.io` | Application domain |
| `SERVER_HOST` | `hc-02.meimberg.io` | Server hostname |
| `SERVER_USER` | `deploy` | SSH user (optional, defaults to `deploy`) |

## GitHub Secrets

**Settings → Secrets → Actions**

| Name | Value | Description |
|------|-------|-------------|
| `SSH_PRIVATE_KEY` | `<private key contents>` | Deploy user private key |
| `DATABASE_PASSWORD` | `<secure password>` | MySQL root/user password |
| `APP_KEYS` | `<generated keys>` | Strapi app keys (comma-separated) |
| `API_TOKEN_SALT` | `<generated salt>` | Strapi API token salt |
| `ADMIN_JWT_SECRET` | `<generated secret>` | Strapi admin JWT secret |
| `TRANSFER_TOKEN_SALT` | `<generated salt>` | Strapi transfer token salt |
| `JWT_SECRET` | `<generated secret>` | Strapi JWT secret |

**Get SSH private key:**
```bash
# Linux/Mac
cat ~/.ssh/id_rsa
# Or your deploy key: cat ~/.ssh/deploy_key

# Windows PowerShell
Get-Content C:\Users\YourName\.ssh\id_rsa
```

Copy entire output including `-----BEGIN` and `-----END` lines.

**Generate Strapi secrets:**
```bash
# Generate APP_KEYS (4 random keys)
node -e "console.log(Array.from({length:4}, () => require('crypto').randomBytes(16).toString('base64')).join(','))"

# Generate salts and secrets
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

Run the last command 4 times to generate:
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `JWT_SECRET`



# DNS Configuration

**Add A record:**
```
strapi.meimberg.io  →  CNAME  →  hc-02.meimberg.io
```

# Server Infrastructure

**Prerequisites (one-time setup):**

Run Ansible to setup server infrastructure:

```bash
cd ../io.meimberg.ansible

# Install Ansible collections
ansible-galaxy collection install -r requirements.yml

# Run infrastructure setup
ansible-playbook -i inventory/hosts.ini playbooks/site.yml --vault-password-file vault_pass
```

**This installs:**
- ✅ Docker + Docker Compose
- ✅ Traefik reverse proxy (automatic SSL)
- ✅ `deploy` user (for deployments)
- ✅ Firewall rules (SSH, HTTP, HTTPS)
- ✅ Automated backups

**Server must be ready before first deployment!**

**Note:** Ansible automatically creates deploy user and configures SSH access.



# First Deployment

After completing all steps above:

```bash
git add .
git commit -m "Setup deployment"
git push origin main
```

**Monitor:** https://github.com/yourusername/awesomeapps.strapi/actions

**Deployment takes ~3-4 minutes:**
1. ✅ Docker image builds
2. ✅ Pushes to GitHub Container Registry
3. ✅ SSHs to server
4. ✅ Deploys containers (Strapi + MySQL) with Traefik labels
5. ✅ App live at https://strapi.meimberg.io

# Additional Information

## Checklist

Before first deployment:

- [ ] GitHub Variables added: `APP_DOMAIN`, `SERVER_HOST`, `SERVER_USER`
- [ ] GitHub Secrets added: `SSH_PRIVATE_KEY`, `DATABASE_PASSWORD`, Strapi secrets
- [ ] DNS A record configured
- [ ] Server infrastructure deployed via Ansible
- [ ] Can SSH to server: `ssh deploy@hc-02.meimberg.io`

**Estimated setup time:** 20-25 minutes


## Troubleshooting

**GitHub Actions fails at deploy step:**
```bash
# Test SSH manually
ssh -i ~/.ssh/deploy_key deploy@hc-02.meimberg.io

# Check deploy user exists
ssh root@hc-02.meimberg.io "id deploy"
```

**Container not starting:**
```bash
ssh deploy@hc-02.meimberg.io "docker logs strapi"
ssh deploy@hc-02.meimberg.io "docker logs strapiDB"
```

**SSL certificate issues:**
```bash
# Check Traefik logs
ssh root@hc-02.meimberg.io "docker logs traefik | grep strapi"

# Verify DNS propagated
dig strapi.meimberg.io +short
```

**Image pull failed:**
- Automatically handled via `GITHUB_TOKEN`
- If still failing, verify package permissions in GitHub



## Changing Domain

1. Update DNS A record
2. Update GitHub Variable `APP_DOMAIN`
3. Push to trigger redeploy

No code changes needed!



## Related Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment operations
- [../io.meimberg.ansible/README.md](../io.meimberg.ansible/README.md) - Ansible overview
- [../io.meimberg.ansible/docs/SETUP.md](../io.meimberg.ansible/docs/SETUP.md) - Server setup
- [../io.meimberg.ansible/docs/SSH-KEYS.md](../io.meimberg.ansible/docs/SSH-KEYS.md) - SSH key configuration

