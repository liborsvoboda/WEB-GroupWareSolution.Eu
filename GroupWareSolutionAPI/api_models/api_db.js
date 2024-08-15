const bcrypt = require('bcrypt');
const fs = require('fs');
const moment = require('moment');
const Sequelize = require('sequelize');

const AttachmentsModel = require('../data_models/attachments');
const CalendarAgendasModel = require('../data_models/calendarAgendas');
const ConfigurationModel = require('../data_models/configuration');
const CurrencyModel = require('../data_models/currency');
const DeliveryTypesModel = require('../data_models/deliveryType');
const DocumentMarkModel = require('../data_models/documentMark');
const EmailsModel = require('../data_models/emails');
const EshopCommentModel = require('../data_models/eshopComment');
const EshopModel = require('../data_models/eshop');
const EshopOrderModel = require('../data_models/eshopOrder');
const EshopOrderItemModel = require('../data_models/eshopOrderItem');
const KnowledgeLanguagesModel = require('../data_models/knowledgeLanguages');
const LoginHistoryModel = require('../data_models/login_history');
const MenuContentModel = require('../data_models/menuContent');
const OrderStatusModel = require('../data_models/orderStatus');
const PaymentTypesModel = require('../data_models/paymentType');
const PaymentStatusModel = require('../data_models/paymentStatus');
const SessionsModel = require('../data_models/sessions');
const UsersModel = require('../data_models/users');
const VatModel = require('../data_models/vat');
const VisitHistoryModel = require('../data_models/visit_history');
//const path = require('path');



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

const Attachments = AttachmentsModel(sequelize, Sequelize);
const CalendarAgendas = CalendarAgendasModel(sequelize, Sequelize);
const Configuration = ConfigurationModel(sequelize, Sequelize);
const Currency = CurrencyModel(sequelize, Sequelize);
const DeliveryTypes = DeliveryTypesModel(sequelize, Sequelize);
const DocumentMark = DocumentMarkModel(sequelize, Sequelize);
const Emails = EmailsModel(sequelize, Sequelize);
const EshopComment = EshopCommentModel(sequelize, Sequelize);
const Eshop = EshopModel(sequelize, Sequelize);
const EshopOrder = EshopOrderModel(sequelize, Sequelize);
const EshopOrderItem = EshopOrderItemModel(sequelize, Sequelize);
const KnowledgeLanguages = KnowledgeLanguagesModel(sequelize, Sequelize);
const LoginHistory = LoginHistoryModel(sequelize, Sequelize);
const MenuContent = MenuContentModel(sequelize, Sequelize);
const OrderStatus = OrderStatusModel(sequelize, Sequelize);
const PaymentTypes = PaymentTypesModel(sequelize, Sequelize);
const PaymentStatus = PaymentStatusModel(sequelize, Sequelize);
const Sessions = SessionsModel(sequelize, Sequelize);
const Users = UsersModel(sequelize, Sequelize);
const Vat = VatModel(sequelize, Sequelize);
const VisitHistory = VisitHistoryModel(sequelize, Sequelize);

//hooks
var hooks = {
    user: (instance, options) => {
        if (instance.changed('password')) {
            return bcrypt.hash(instance.get('password'), cfg.bcrypt.rounds).then(hash => {
                return instance.set('password', hash);
            });
        }
    },
    session: (instance, options) => {
        if (instance !== null && 'dataValues' in instance && 'session' in instance.dataValues && 'ip' in instance.dataValues) {
            return Sessions.update({ route: instance.dataValues.route }, { where: { session: instance.dataValues.session, ip: instance.dataValues.ip } }).then((result) => {
                return result;
            }).catch(err => {
                throw new Error(err);
            });
        }
    }
};

Users.prototype.comparePassword = function (password) {
    return new Promise(resolve => {
        bcrypt.compare(password, this.password, (err, res) => {
            resolve(res);
        });
    });
};

Users.beforeCreate(hooks.user);
Users.beforeUpdate(hooks.user);

//Lists



//data foreign keys
Sessions.afterFind(hooks.session);
Sessions.belongsTo(Users, {
    foreignKey: 'email',
    targetKey: 'email',
    onDelete: 'CASCADE'
});

LoginHistory.belongsTo(Users, {
    foreignKey: 'email',
    targetKey: 'email',
    onDelete: 'CASCADE'
});

// export models
module.exports.Attachments = Attachments;
module.exports.CalendarAgendas = CalendarAgendas;
module.exports.Configuration = Configuration;
module.exports.Currency = Currency;
module.exports.DeliveryTypes = DeliveryTypes;
module.exports.DocumentMark = DocumentMark;
module.exports.Emails = Emails;
module.exports.EshopComment = EshopComment;
module.exports.Eshop = Eshop;
module.exports.EshopOrder = EshopOrder;
module.exports.EshopOrderItem = EshopOrderItem;
module.exports.KnowledgeLanguages = KnowledgeLanguages;
module.exports.LoginHistory = LoginHistory;
module.exports.MenuContent = MenuContent;
module.exports.OrderStatus = OrderStatus;
module.exports.PaymentTypes = PaymentTypes;
module.exports.PaymentStatus = PaymentStatus;
module.exports.Sessions = Sessions;
module.exports.Users = Users;
module.exports.Vat = Vat;
module.exports.VisitHistory = VisitHistory;