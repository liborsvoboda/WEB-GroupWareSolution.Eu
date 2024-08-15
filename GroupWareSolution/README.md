MYSQL configuration
SET GLOBAL group_concat_max_len = 100000000;
SET GLOBAL event_scheduler = ON;
SET @@GLOBAL.event_scheduler = ON;

FacebookToken: EAAwnN0gtZBAoBAFUy7FZCN6ZAY5pV1N3ryqMxrT7XOzdvReM31vvxVpb7RZCzAYE1tsEQmZBIgUQW6sKACsCDsUyCSICcn4pquYgJ4Csowa3ASTZC7giHAIyQ4kSDQdODMU7bEKYDHJfHxSbZBAwIZAj0ZBWCJe1mNPG8J4fmZCbtU7VoGk61IfNK7xv644dbTRMwZD

images must be added to folder
src\assets\img

$ sudo rm /etc/localtime
$ sudo ln -s /usr/share/zoneinfo/Europe/Prague /etc/localtime

mysql_tzinfo_to_sql /usr/share/zoneinfo/|mysql -u root mysql
mysql_tzinfo_to_sql /usr/share/zoneinfo/Europe/Prague Europe/Prague | mysql -u root
SET GLOBAL time_zone = 'Europe/Prague';
SET time_zone = 'Europe/Prague'

You can edit my.cnf/utf8.cnf and add
[mysql]
default_time_zone = Europe/Prague

API
sudo apt update
sudo apt upgrade -y
sudo apt install build-essential -y
curl -fsSL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get update
sudo apt install nodejs -y
sudo npm i -g pm2

wget -O - https://get.ispconfig.org | sh -s -- --use-ftp-ports=40110-40210 --unattended-upgrades

pm2 install pm2-logrotate
pm2 set pm2-logrotate:retain 5
pm2 set pm2-logrotate:max_size 10M
pm2 start ecosystem.config.js --watch
pm2 startup
pm2 save
reboot now

npm i -g vue-recaptcha-v3


# Admin LTE 3.2.0-rc - Vue 3.2.26

To login website use:

`username:` admin@example.com<br />
`password:` admin<br />

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Run your unit tests

```
npm run test:unit
```

### Run your end-to-end tests

```
npm run test:e2e
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
