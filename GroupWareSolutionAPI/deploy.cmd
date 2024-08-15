
@ECHO off
@ECHO start deploying API
pscp.exe -P 22 -r -pw Ubuntu1980 *.js root@192.168.1.55:/root/groupwaresolutionAPI
pscp.exe -P 22 -r -pw Ubuntu1980 startupPm2 root@192.168.1.55:/root/groupwaresolutionAPI
pscp.exe -P 22 -r -pw Ubuntu1980 *.json root@192.168.1.55:/root/groupwaresolutionAPI

pscp.exe -P 22 -r -pw Ubuntu1980 api* root@192.168.1.55:/root/groupwaresolutionAPI
pscp.exe -P 22 -r -pw Ubuntu1980 config* root@192.168.1.55:/root/groupwaresolutionAPI
pscp.exe -P 22 -r -pw Ubuntu1980 data* root@192.168.1.55:/root/groupwaresolutionAPI
@ECHO done