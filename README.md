# Serviceatlas Strapi

## Development Setup

### Requirements (local)
```
nvm install 20
```
### Configure porject
```
cp .env.develop .env
```
### Start Database
```
docker-compose up --build
```
### Howto

```
npm install
npm run develop
```

## Setup Production
```bash
sudo apt update && sudo apt upgrade

# nvm & node

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

nvm install 20

# mysql

sudo apt install mysql-server mysql-client
ESC[200~sudo mysql_secure_installation
sudo mysql_secure_installation
mysql

# user strapi

adduser strapi
mkdir /srv/strapi
useradd -d /srv/strapi -s /bin/bash strapi
su - strapi
pwd
chown -R strapi.strapi /srv/strapi/
chown -R strapi:strapi /srv/strapi/

# pm2

su - strapi
npm install pm2 -g

# nginx

apt install nginx certbot python3-certbot-nginx
vim /etc/nginx/sites-available/strapi
ln -s /etc/nginx/sites-available/strapi /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
vim /etc/nginx/sites-available/strapi

```
    server {
        #    location ~ ^/(admin|api|content-manager) {
        location /strapi/ {
            proxy_pass http://localhost:1337;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
    
            client_max_body_size 500M;
    
            rewrite ^/strapi(/.*)$ $1 break;
        }
    
        listen 443 ssl; # managed by Certbot
        ssl_certificate /etc/letsencrypt/live/serviceatlas.meimberg.io/fullchain.pem; # managed by Certbot
        ssl_certificate_key /etc/letsencrypt/live/serviceatlas.meimberg.io/privkey.pem; # managed by Certbot
        include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
    
    }
    server {
        if ($host = serviceatlas.meimberg.io) {
            return 301 https://$host$request_uri;
        } # managed by Certbot        
        
        listen 80;
        server_name serviceatlas.meimberg.io;
        return 404; # managed by Certbot
    }
    
```bash
certbot --nginx -d serviceatlas.meimberg.io
```


## Deployment


