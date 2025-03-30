
@ECHO off
@ECHO start deploying webPages

pscp.exe -P 22 -r -pw password dist/* username@domain.cz:/
@ECHO done
