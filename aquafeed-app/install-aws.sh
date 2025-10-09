#!/bin/bash

# install-aws.sh - Script completo de instalación en AWS Linux

echo "🏗️ Configurando AquaFeed en AWS Linux..."

# Actualizar sistema
sudo yum update -y

# Instalar Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Instalar PM2 y herramientas globales
sudo npm install -g pm2 @angular/cli serve

# Instalar y configurar Nginx
sudo yum install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Configurar firewall
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# Crear directorio de aplicación
mkdir -p /home/ec2-user/aquafeed-app
cd /home/ec2-user/aquafeed-app

echo "✅ Servidor configurado. Ahora sube tu código y ejecuta ./deploy.sh"
echo ""
echo "📋 Próximos pasos:"
echo "1. Subir código: git clone https://github.com/tu-usuario/aquafeed-app.git"
echo "2. Instalar dependencias: npm install"
echo "3. Ejecutar despliegue: ./deploy.sh"
echo "4. Configurar dominio en nginx.conf"
