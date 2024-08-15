
@ECHO off
@ECHO start deploying webPages
REM ncftpput -u lsvobodaFTP -p xfmr!LWuG7mAM 192.168.1.50 /web/ package.json
REM ncftpput -R -u lsvobodaFTP -p xfmr!LWuG7mAM 192.168.1.50 /web/ dist/*.*
REM ncftpput -R -u lsvobodaFTP -p xfmr!LWuG7mAM groupware-solution.eu /web/docs/ public/*.*

REM pscp.exe -P 22 -r -pw Ubuntu1980 package.json root@192.168.1.50:/var/www/clients/client1/web1/web
pscp.exe -P 22 -r -pw Ubuntu1980 dist/* root@192.168.1.55:/var/www/clients/client1/web1/web
@ECHO done
