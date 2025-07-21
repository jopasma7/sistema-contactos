@echo off
echo Construyendo ejecutable de la aplicacion...
echo.

REM Configurar variables para evitar el problema del espacio en la ruta
set npm_config_cache=C:\temp\.npm
set ELECTRON_SKIP_BINARY_DOWNLOAD=1

echo Paso 1: Limpiando cache...
call npm cache clean --force

echo Paso 2: Instalando dependencias nativas...
call npx electron-rebuild --force

echo Paso 3: Construyendo aplicacion...
call npx electron-builder --win --x64

echo.
echo ¡Construccion completada!
echo El ejecutable estara en la carpeta 'dist'
pause
