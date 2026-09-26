@echo off
title S TEC SECURE - dev server
cd /d "%~dp0"
if not exist node_modules call npm install
call npm run dev -- -p 3001 > dev-log.txt 2>&1
pause
