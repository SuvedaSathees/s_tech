@echo off
title S TEC SECURE - build and run
cd /d "%~dp0"
echo [0/3] Removing files from the concept version (a copy is kept in _new-site-concept)...
if exist "src\app\api\*" (rmdir /s /q "src\app\api") else (if exist "src\app\api" del /q "src\app\api")
if exist "src\app\studio\*" (rmdir /s /q "src\app\studio") else (if exist "src\app\studio" del /q "src\app\studio")
if exist "src\engine\*" (rmdir /s /q "src\engine") else (if exist "src\engine" del /q "src\engine")
if exist "src\components\media\*" (rmdir /s /q "src\components\media") else (if exist "src\components\media" del /q "src\components\media")
if exist "src\components\hero\HeroHud.tsx\*" (rmdir /s /q "src\components\hero\HeroHud.tsx") else (if exist "src\components\hero\HeroHud.tsx" del /q "src\components\hero\HeroHud.tsx")
if exist "src\components\hero\RealtimeFilm.tsx\*" (rmdir /s /q "src\components\hero\RealtimeFilm.tsx") else (if exist "src\components\hero\RealtimeFilm.tsx" del /q "src\components\hero\RealtimeFilm.tsx")
if exist "src\components\hero\SequenceFilm.tsx\*" (rmdir /s /q "src\components\hero\SequenceFilm.tsx") else (if exist "src\components\hero\SequenceFilm.tsx" del /q "src\components\hero\SequenceFilm.tsx")
if exist "src\components\hero\VideoFilm.tsx\*" (rmdir /s /q "src\components\hero\VideoFilm.tsx") else (if exist "src\components\hero\VideoFilm.tsx" del /q "src\components\hero\VideoFilm.tsx")
if exist "src\components\hero\filmTime.ts\*" (rmdir /s /q "src\components\hero\filmTime.ts") else (if exist "src\components\hero\filmTime.ts" del /q "src\components\hero\filmTime.ts")
if exist "src\components\ui\Arrow.tsx\*" (rmdir /s /q "src\components\ui\Arrow.tsx") else (if exist "src\components\ui\Arrow.tsx" del /q "src\components\ui\Arrow.tsx")
if exist "src\components\ui\Logo.tsx\*" (rmdir /s /q "src\components\ui\Logo.tsx") else (if exist "src\components\ui\Logo.tsx" del /q "src\components\ui\Logo.tsx")
if exist "src\components\ui\SocialIcon.tsx\*" (rmdir /s /q "src\components\ui\SocialIcon.tsx") else (if exist "src\components\ui\SocialIcon.tsx" del /q "src\components\ui\SocialIcon.tsx")
if exist "src\config\hero.ts\*" (rmdir /s /q "src\config\hero.ts") else (if exist "src\config\hero.ts" del /q "src\config\hero.ts")
if exist "src\lib\gsap.ts\*" (rmdir /s /q "src\lib\gsap.ts") else (if exist "src\lib\gsap.ts" del /q "src\lib\gsap.ts")
if exist "src\lib\heroProgress.ts\*" (rmdir /s /q "src\lib\heroProgress.ts") else (if exist "src\lib\heroProgress.ts" del /q "src\lib\heroProgress.ts")
if exist "src\lib\useReducedMotion.ts\*" (rmdir /s /q "src\lib\useReducedMotion.ts") else (if exist "src\lib\useReducedMotion.ts" del /q "src\lib\useReducedMotion.ts")
if exist "src\app\fonts\InstrumentSerif-Italic.woff\*" (rmdir /s /q "src\app\fonts\InstrumentSerif-Italic.woff") else (if exist "src\app\fonts\InstrumentSerif-Italic.woff" del /q "src\app\fonts\InstrumentSerif-Italic.woff")
if exist "src\app\fonts\InstrumentSerif-Regular.woff\*" (rmdir /s /q "src\app\fonts\InstrumentSerif-Regular.woff") else (if exist "src\app\fonts\InstrumentSerif-Regular.woff" del /q "src\app\fonts\InstrumentSerif-Regular.woff")
if exist "docs\VISUAL_CONCEPT.md\*" (rmdir /s /q "docs\VISUAL_CONCEPT.md") else (if exist "docs\VISUAL_CONCEPT.md" del /q "docs\VISUAL_CONCEPT.md")
if exist "public\icon.svg\*" (rmdir /s /q "public\icon.svg") else (if exist "public\icon.svg" del /q "public\icon.svg")
if exist "public\media\README.md\*" (rmdir /s /q "public\media\README.md") else (if exist "public\media\README.md" del /q "public\media\README.md")
if exist "public\media\products\*" (rmdir /s /q "public\media\products") else (if exist "public\media\products" del /q "public\media\products")
if exist "public\media\projects\*" (rmdir /s /q "public\media\projects") else (if exist "public\media\projects" del /q "public\media\projects")
if exist "public\media\solutions\*" (rmdir /s /q "public\media\solutions") else (if exist "public\media\solutions" del /q "public\media\solutions")
if exist "public\media\hero\poster.jpg\*" (rmdir /s /q "public\media\hero\poster.jpg") else (if exist "public\media\hero\poster.jpg" del /q "public\media\hero\poster.jpg")
if exist ".env.example\*" (rmdir /s /q ".env.example") else (if exist ".env.example" del /q ".env.example")
echo [1/3] Installing packages (first run takes a few minutes)...
call npm install > install-log.txt 2>&1
if errorlevel 1 (echo npm install FAILED - see install-log.txt & type install-log.txt & pause & exit /b 1)
echo [2/3] Building production site...
call npm run build > build-log.txt 2>&1
set BUILD_ERR=%errorlevel%
type build-log.txt
if not "%BUILD_ERR%"=="0" (echo BUILD FAILED - see build-log.txt & pause & exit /b 1)
echo [3/3] Starting site at http://localhost:3000 ...
call npm start
pause
