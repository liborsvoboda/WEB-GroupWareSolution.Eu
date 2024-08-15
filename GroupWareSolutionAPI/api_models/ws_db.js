const Sequelize = require('sequelize');
const moment = require('moment');
const bcrypt = require('bcrypt');
const fs = require('fs');
//const path = require('path');
const ChatModel = require('../data_models/chat');
const UsersModel = require('../data_models/users');
const SessionsModel = require('../data_models/sessions');

const cfg = JSON.parse(fs.readFileSync('./config/api_config.json'));
const sequelize = new Sequelize(cfg.db.dbname, cfg.db.user, cfg.db.password, {
  host: cfg.db.host,
  dialect: cfg.db.type,
  logging: false,
  operatorsAliases: false,
  pool: {
    max: cfg.db.poolMax,
    min: cfg.db.poolMin,
    acquire: cfg.db.poolAcquire,
    idle: cfg.db.poolIdle
    },
  dialectOptions: {
        //        useUTC: false, 
        dateStrings: true,
        typeCast: true
  },
  keepDefaultTimezone: true
});

const Chat = ChatModel(sequelize, Sequelize);
const Sessions = SessionsModel(sequelize, Sequelize);
const Users = UsersModel(sequelize, Sequelize);

//hooks


//Lists



//data foreign keys
Sessions.belongsTo(Users, {
    foreignKey: 'email',
    targetKey: 'email',
    onDelete: 'CASCADE'
});

// export models
module.exports.Chat = Chat;
module.exports.Users = Users;
module.exports.Sessions = Sessions;
