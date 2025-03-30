
@ECHO off
@ECHO start deploying API
pscp.exe -P 22 -r -pw password *.js root@domain.com:/root/groupwaresolutionAPI
pscp.exe -P 22 -r -pw password startupPm2 root@domain.com:/root/groupwaresolutionAPI
pscp.exe -P 22 -r -pw password *.json root@domain.com:/root/groupwaresolutionAPI

pscp.exe -P 22 -r -pw password api* root@domain.com:/root/groupwaresolutionAPI
pscp.exe -P 22 -r -pw password config* root@domain.com:/root/groupwaresolutionAPI
pscp.exe -P 22 -r -pw password data* root@domain.com:/root/groupwaresolutionAPI
@ECHO done