# PlataMX - Deployment Guide

## Prerequisitos

- Node.js 18+
- PostgreSQL 15+
- Nginx (para proxy reverso)
- PM2 (para gestión de procesos)

## Instalación Rápida

### 1. Preparar el servidor

```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Instalar Nginx
sudo apt install nginx
```

### 2. Configurar la base de datos

```bash
sudo -u postgres psql

CREATE DATABASE platamx;
CREATE USER platamx WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE platamx TO platamx;
\q
```

### 3. Desplegar la aplicación

```bash
# Extraer el archivo
tar -xzf PlaTax.V1.tar.gz
cd platamx

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Instalar dependencias
npm install

# Ejecutar migraciones de base de datos
npm run db:push

# Construir la aplicación
npm run build

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Configurar Nginx

```bash
# Copiar configuración
sudo cp nginx.conf /etc/nginx/sites-available/platamx
sudo ln -s /etc/nginx/sites-available/platamx /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl reload nginx
```

## Deployment con Docker (Alternativo)

```bash
# Construir y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## Variables de Entorno Importantes

- `DATABASE_URL`: Conexión a PostgreSQL
- `JWT_SECRET`: Clave secreta para JWT (genera una aleatoria)
- `STRIPE_SECRET_KEY`: Clave de Stripe para pagos
- `NODE_ENV=production`

## Comandos Útiles

```bash
# Ver aplicaciones PM2
pm2 list

# Ver logs
pm2 logs platamx

# Reiniciar aplicación
pm2 restart platamx

# Actualizar aplicación
pm2 reload platamx

# Monitoreo
pm2 monit
```

## SSL/HTTPS

Para habilitar HTTPS, obtén certificados SSL (recomendado: Let's Encrypt) y descomenta la configuración SSL en `nginx.conf`.

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tudominio.com

# Auto-renovación
sudo certbot renew --dry-run
```

## Backup de Base de Datos

```bash
# Crear backup
pg_dump -U platamx platamx > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U platamx platamx < backup_20250101.sql
```

## Troubleshooting

1. **Error de conexión a BD**: Verificar DATABASE_URL
2. **Error 502**: Verificar que PM2 esté ejecutándose
3. **Assets no cargan**: Verificar configuración de Nginx
4. **Error de permisos**: Verificar que el usuario tenga permisos en la carpeta

## Contacto

Para soporte, contacta al equipo de desarrollo.