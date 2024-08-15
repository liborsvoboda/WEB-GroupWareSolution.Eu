
@ECHO off
@ECHO start deploying PHP
ncftpput -u lsvobodaFTP -p xfmr!LWuG7mAM groupware-solution.eu /web/ *.html
ncftpput -R -u lsvobodaFTP -p xfmr!LWuG7mAM groupware-solution.eu /web/dist/ dist/*.*
ncftpput -R -u lsvobodaFTP -p xfmr!LWuG7mAM groupware-solution.eu /web/docs/ docs/*.*
ncftpput -R -u lsvobodaFTP -p xfmr!LWuG7mAM groupware-solution.eu /web/pages/ pages/*.*
ncftpput -R -u lsvobodaFTP -p xfmr!LWuG7mAM groupware-solution.eu /web/plugins/ plugins/*.*
@ECHO done
