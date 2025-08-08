@echo off
echo building brain...
echo.

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: pnpm is not installed. Please install pnpm first.
    exit /b 1
)

REM Check if Rust is installed
where cargo >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Rust is not installed. Please install Rust from https://rustup.rs/
    exit /b 1
)

echo Step 1: Installing dependencies...
pnpm install

echo.
echo Step 2: Building the frontend...
pnpm build

echo.
echo Step 3: Building the Tauri app...
cd src-tauri
cargo tauri build

echo.
echo ========================================
echo build completed!
echo.
echo The installer can be found at:
echo src-tauri\target\release\bundle\
echo.
echo - MSI installer: msi\brain_0.1.0_x64_en-US.msi
echo - EXE installer: nsis\brain_0.1.0_x64-setup.exe
echo.
echo ========================================
pause