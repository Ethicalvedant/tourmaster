#!/usr/bin/env bash
# Render Production Build Script for TourMaster (Fullstack Python Flask + React Vite)
set -o errexit

echo "=========================================="
echo " Starting TourMaster Production Build "
echo "=========================================="

echo "--> Step 1: Upgrading pip and installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "--> Step 2: Installing Node.js dependencies..."
npm install --include=dev

echo "--> Step 3: Compiling React + Vite frontend bundle..."
npm run build

echo "=========================================="
echo " TourMaster Build Completed Successfully! "
echo " Static assets generated in ./dist "
echo " Ready for Gunicorn production server. "
echo "=========================================="
