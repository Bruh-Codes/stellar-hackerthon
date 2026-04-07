@echo off
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\Common7\Tools\VsDevCmd.bat" -arch=x64 -host_arch=x64
set PATH=C:\Users\hp\.cargo\bin;%PATH%
set CARGO_TARGET_DIR=C:\stellar-build\target
set TEMP=C:\stellar-build\tmp
set TMP=C:\stellar-build\tmp
if not exist C:\stellar-build mkdir C:\stellar-build
if not exist C:\stellar-build\target mkdir C:\stellar-build\target
if not exist C:\stellar-build\tmp mkdir C:\stellar-build\tmp
cd /d D:\projects\escrow\stellar-hackathon\contracts
stellar contract build
