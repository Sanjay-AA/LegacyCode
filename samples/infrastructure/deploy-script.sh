#!/bin/bash
# Legacy Bare-Metal Deployment Script
apt-get update
apt-get install -y nginx nodejs
systemctl restart nginx
