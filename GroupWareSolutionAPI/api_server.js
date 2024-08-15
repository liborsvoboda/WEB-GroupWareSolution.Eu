'use strict';
const fs = require('fs');
const path = require('path');
const fastify = require('fastify');
const cors = require('fastify-cors');
const compress = require('fastify-compress');
const helmet = require('fastify-helmet');
const reCAPTCHA = require('recaptcha2');
const bcrypt = require('bcrypt');
const moment = require('moment');
const fastJson = require('fast-json-stringify');
const axios = require('axios');
const nodemailer = require('nodemailer');
const Sequelize = require('sequelize');
const IndexHints = Sequelize.IndexHints;
const db = require('./api_models/api_db');
const { Op } = require("sequelize");
const parser = require('fast-xml-parser');
const rss = require('rss');

const cfg = JSON.parse(fs.readFileSync(path.join('./config/api_config.json'), 'utf8'));
const schemas = JSON.parse(fs.readFileSync(path.join('./api_schemas/api_schemas.json'), 'utf8'));
const msg = JSON.parse(fs.readFileSync(path.join('./api_messages/api_messages.json'), 'utf8'));

var transporter = nodemailer.createTransport({
    host: cfg.smtp.host,
    port: cfg.smtp.port,
    secure: cfg.smtp.secure, 
    auth: {
        user: cfg.smtp.auth.user,
        pass: cfg.smtp.auth.pass
    },
    ignoreTLS: true,
    tls: {
        rejectUnauthorized: cfg.smtp.auth.rejectUnauthorize
    }
});


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
    keepDefaultTimezone: true,
    dialectOptions: {
        //        useUTC: false, 
        dateStrings: true,
        typeCast: true
    },
});

const recaptcha = new reCAPTCHA({
    siteKey: cfg.recaptcha.key,
    secretKey: cfg.recaptcha.secret,
    ssl: true
});

//bodyLimit: 50000000,
const server = fastify({
    bodyLimit: 90000000,
    http2: true,
    https: {
        key: fs.readFileSync(path.join(__dirname, cfg.ssl.key), 'utf8'),
        cert: fs.readFileSync(path.join(__dirname, cfg.ssl.cert), 'utf8')
    }
});
server.register(cors, {
    origin: true
});
server.register(compress);
server.register(helmet);

// test api
server.get('/', { schema: schemas.hello }, (req, reply) => {
    reply.header('Content-Type', 'application/json').code(200);
    reply.send({ hello: 'world' });
});

// ALZA RSS
// test api
//https://www.npmjs.com/package/rss
server.get('/rssItems', { schema: schemas.hello }, (req, reply) => {
    var rssFeed = new rss({
        title: 'GroupWare-Solution Eshop Items',
        feed_url: 'https://groupware-solution.eu:444/rssItems',
        site_url: 'https://groupware-solution.eu',
        description: 'Alza Eshop Items',
        webMaster: 'Libor Svoboda'
    });

    return sequelize.query('CALL getAlzaRSSFeed()')
        .then(eshopItems => {
            eshopItems.forEach(eshopItem => {
                rssFeed.item({
                    title: eshopItem.name_cz,
                    description: eshopItem.shortDescription_cz,
                    custom_elements: [
                        { 'long_description': eshopItem.description_cz, },
                        { 'price': eshopItem.price },
                        //{ 'file': new Buffer(eshopItem.attachment, 'base64').toString('binary') }
                    ]
                });
            });

            var rssXml = rssFeed.xml({ indent: true });
            reply.header('Content-Type', 'application/rss+xml').code(200);
            reply.send(rssXml);

        }).catch(err => {
            return reply.send(msg.db);
        });
});

server.get('/getCurrencies', { schema: schemas.getCurrencies, attachValidation: true }, (req, reply) => {
    reply.header('Content-Type', 'application/json').code(200);
    return db.Currency.findAll({
        raw: true,
        attributes: [
            'id',
            'country',
            'name',
            'value',
        ]
    }).then(currencies => {
        return reply.send({ result: 1, currencies: currencies });
    });
    return reply.send(msg.db);
});

server.get('/getVats', { schema: schemas.getVats, attachValidation: true }, (req, reply) => {
    reply.header('Content-Type', 'application/json').code(200);
    return db.Vat.findAll({
        where: {
            enabled: 1
        },
        raw: true,
        attributes: [
            'id',
            'name',
            'value',
            'enabled'
        ]
    }).then(vats => {
        return reply.send({ result: 1, vats: vats });
    });
    return reply.send(msg.db);
});

server.get('/getConfiguration', { schema: schemas.getConfiguration, attachValidation: true }, (req, reply) => {
    reply.header('Content-Type', 'application/json').code(200);
    return db.Configuration.findAll({
        where: {
            enabled: 1
        },
        raw: true,
        attributes: [
            'id',
            'name',
            'value',
            'enabled'
        ]
    }).then(configurations => {
        return reply.send({ result: 1, configurations: configurations });
    });
    return reply.send(msg.db);
});

server.post('/setMenuContent', { schema: schemas.setMenuContent, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        var error = typeof req.validationError.validation === 'object' && typeof req.validationError.validation[0] === 'object' && 'params' in req.validationError.validation[0] && typeof req.validationError.validation[0]['params'] === 'object' && 'missingProperty' in req.validationError.validation[0]['params'] && req.validationError.validation[0]['params']['missingProperty'] === 'session' ? msg.auth : req.validationError;
        var code = error === msg.auth ? 200 : 400;
        return reply.code(code).send(error);
    }
    reply.header('Content-Type', 'application/json').code(200);
    if ('session' in req.body && req.body.session.length === 36) {
        return db.Sessions.findOne({
            where: {
                session: req.body.session,
                ip: req.raw.connection.remoteAddress
            },
            attributes: ['session', 'ip'],
            include: [{
                model: db.Users,
                where: { isAdmin: 1 },
                attributes: ['id'],
                required: true
            }]
        }).then(sessions => {
            if (!sessions) {
                return reply.send(msg.auth);
            }
            return db.MenuContent.update({
                cz: req.body.cz,
                en: req.body.en,
                enabled: req.body.enabled
            }, {
                where: {
                    name: req.body.name
                }
            }).then(updated => {
                if (!updated) {
                    return reply.send(msg.db);
                } else {
                    return reply.send(msg.update);
                }
            });
        }).catch(err => {
            console.log(err);
            return reply.send(msg.db);
        });
    }
    return reply.send(msg.auth);
});

server.post('/setNewCalendar', { schema: schemas.setNewCalendar, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        var error = typeof req.validationError.validation === 'object' && typeof req.validationError.validation[0] === 'object' && 'params' in req.validationError.validation[0] && typeof req.validationError.validation[0]['params'] === 'object' && 'missingProperty' in req.validationError.validation[0]['params'] && req.validationError.validation[0]['params']['missingProperty'] === 'session' ? msg.auth : req.validationError;
        var code = error === msg.auth ? 200 : 400;
        return reply.code(code).send(error);
    }
    reply.header('Content-Type', 'application/json').code(200);
    if ('session' in req.body && req.body.session.length === 36) {
        return db.Sessions.findOne({
            where: {
                session: req.body.session,
                ip: req.raw.connection.remoteAddress
            },
            attributes: ['session', 'ip'],
            include: [{
                model: db.Users,
                attributes: ['id'],
                required: true
            }]
        }).then(sessions => {
            if (!sessions) {
                return reply.send(msg.auth);
            }
            return db.CalendarAgendas.create({
                userId: sessions.dataValues.user.id,
                name: req.body.name,
                content: req.body.content,
                enabled: 1
            }).then(next => {
                return reply.send(msg.insert);
            }).catch(err => {
                console.log(err.message);
                return reply.send(msg.db);
            });
        }).catch(err => {
            console.log(err);
            return reply.send(msg.db);
        });
    }
    return reply.send(msg.auth);
});

server.post('/updateCalendar', { schema: schemas.setNewCalendar, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        var error = typeof req.validationError.validation === 'object' && typeof req.validationError.validation[0] === 'object' && 'params' in req.validationError.validation[0] && typeof req.validationError.validation[0]['params'] === 'object' && 'missingProperty' in req.validationError.validation[0]['params'] && req.validationError.validation[0]['params']['missingProperty'] === 'session' ? msg.auth : req.validationError;
        var code = error === msg.auth ? 200 : 400;
        return reply.code(code).send(error);
    }
    reply.header('Content-Type', 'application/json').code(200);
    if ('session' in req.body && req.body.session.length === 36) {
        return db.Sessions.findOne({
            where: {
                session: req.body.session,
                ip: req.raw.connection.remoteAddress
            },
            attributes: ['session', 'ip'],
            include: [{
                model: db.Users,
                attributes: ['id'],
                required: true
            }]
        }).then(sessions => {
            if (!sessions) {
                return reply.send(msg.auth);
            }
            return db.CalendarAgendas.update({
                content: req.body.content
            }, {
                where: {
                    userId: sessions.dataValues.user.id,
                    name: req.body.name
                }
            }).then(next => {
                return reply.send(msg.update);
            }).catch(err => {
                console.log(err.message);
                return reply.send(msg.db);
            });
        }).catch(err => {
            console.log(err);
            return reply.send(msg.db);
        });
    }
    return reply.send(msg.auth);
});

server.post('/deleteCalendar', { schema: schemas.deleteCalendar, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        var error = typeof req.validationError.validation === 'object' && typeof req.validationError.validation[0] === 'object' && 'params' in req.validationError.validation[0] && typeof req.validationError.validation[0]['params'] === 'object' && 'missingProperty' in req.validationError.validation[0]['params'] && req.validationError.validation[0]['params']['missingProperty'] === 'session' ? msg.auth : req.validationError;
        var code = error === msg.auth ? 200 : 400;
        return reply.code(code).send(error);
    }
    reply.header('Content-Type', 'application/json').code(200);
    if ('session' in req.body && req.body.session.length === 36) {
        return db.Sessions.findOne({
            where: {
                session: req.body.session,
                ip: req.raw.connection.remoteAddress
            },
            attributes: ['session', 'ip'],
            include: [{
                model: db.Users,
                attributes: ['id'],
                required: true
            }]
        }).then(sessions => {
            if (!sessions) {
                return reply.send(msg.auth);
            }
            return db.CalendarAgendas.destroy({
                where: {
                    userId: sessions.dataValues.user.id,
                    name: req.body.name
                }
            }).then(rows => {
                if (rows < 1) {
                    return reply.send(msg.db);
                }
                return reply.send(msg.delete);
            }).catch(err => {
                console.log(err.message);
                return reply.send(msg.db);
            });
        }).catch(err => {
            console.log(err);
            return reply.send(msg.db);
        });
    }
    return reply.send(msg.auth);
});

server.post('/getCalendarAgendas', { schema: schemas.getCalendarAgendas, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        var error = typeof req.validationError.validation === 'object' && typeof req.validationError.validation[0] === 'object' && 'params' in req.validationError.validation[0] && typeof req.validationError.validation[0]['params'] === 'object' && 'missingProperty' in req.validationError.validation[0]['params'] && req.validationError.validation[0]['params']['missingProperty'] === 'session' ? msg.auth : req.validationError;
        var code = error === msg.auth ? 200 : 400;
        return reply.code(code).send(error);
    }
    reply.header('Content-Type', 'application/json').code(200);
    if ('session' in req.body && req.body.session.length === 36) {
        return db.Sessions.findOne({
            where: {
                session: req.body.session,
                ip: req.raw.connection.remoteAddress
            },
            attributes: ['session', 'ip'],
            include: [{
                model: db.Users,
                attributes: ['id'],
                required: true
            }]
        }).then(sessions => {
            if (!sessions) {
                return reply.send(msg.auth);
            }
            return db.CalendarAgendas.findAll({
                where: {
                    enabled: 1,
                    userId: sessions.dataValues.user.id,
                    name: (req.body.calendarName) ? req.body.calendarName : { [Op.like]: '%%' }
                },
                raw: true,
                attributes: ['id', 'userId', 'name', 'content', 'enabled', 'timestamp' ]
            }).then(agendas => {
                agendas.forEach((agenda) => {
                    agenda.content = JSON.parse(agenda.content.replace(/'/g, '"'));
                });
                return reply.send({ result: 1, agendas: agendas });
            }).catch(err => {
                console.log(err);
                return reply.send(msg.db);
            });
        }).catch(err => {
            console.log(err);
            return reply.send(msg.db);
        });
    }
    return reply.send(msg.auth);
});

server.get('/getActualCurrency', { schema: schemas.getCurrencies, attachValidation: true }, (req, reply) => {
    reply.header('Content-Type', 'application/json').code(200);
    return db.Currency.findAll({
        where: {
            fromDate: { [Op.lte]: moment().format('YYYY-MM-DD') },
            toDate: { [Op.gte]: moment().format('YYYY-MM-DD') }
        },
        raw: true,
        attributes: [
            'id',
            'country',
            'name',
            'value'
        ]
    }).then(currencies => {
        return reply.send({ result: 1, currencies: currencies });
    }).catch(err => {
        console.log(err.message);
        return reply.send(msg.db);
    });
    return reply.send(msg.db);
});

server.get('/getDeliveryTypes', { schema: schemas.getDeliveryTypes, attachValidation: true }, (req, reply) => {
    reply.header('Content-Type', 'application/json').code(200);
    return db.DeliveryTypes.findAll({
        where: {
            enabled: 1
        },
        raw: true,
        attributes: [
            'id',
            'cz',
            'en'
        ]
    }).then(deliveryTypes => {
        return reply.send({ result: 1, deliveryTypes: deliveryTypes });
    }).catch(err => {
        console.log(err.message);
        return reply.send(msg.db);
    });
    return reply.send(msg.db);
});

server.get('/getPaymentTypes', { schema: schemas.getPaymentTypes, attachValidation: true }, (req, reply) => {
    reply.header('Content-Type', 'application/json').code(200);
    return db.PaymentTypes.findAll({
        where: {
            enabled: 1
        },
        raw: true,
        attributes: [
            'id',
            'cz',
            'en'
        ]
    }).then(paymentTypes => {
        return reply.send({ result: 1, paymentTypes: paymentTypes });
    }).catch(err => {
        console.log(err.message);
        return reply.send(msg.db);
    });
    return reply.send(msg.db);
});

server.get('/getKnowledgeLanguages', { schema: schemas.getKnowledgeLanguages, attachValidation: true }, (req, reply) => {
    reply.header('Content-Type', 'application/json').code(200);
    return db.KnowledgeLanguages.findAll({
        raw: true,
        attributes: [
            'id',
            'language'
        ]
    }).then(knowledgeLanguages => {
        return reply.send({ result: 1, knowledgeLanguages: knowledgeLanguages });
    });
    return reply.send(msg.auth);
});

server.post('/getMenuList', { schema: schemas.getMenuList, attachValidation: true }, (req, reply) => {
    reply.header('Content-Type', 'application/json').code(200);
    return db.MenuContent.findAll({
        where: {
            enabled: 1
        },
        raw: true,
        attributes: ['name']
    }).then(menuList => {
        return reply.send({ result: 1, menuList: menuList });
    }).catch(err => {
        return reply.send(msg.db);
    });
});

server.post('/setUserConfiguration', { schema: schemas.setUserConfiguration, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        var error = typeof req.validationError.validation === 'object' && typeof req.validationError.validation[0] === 'object' && 'params' in req.validationError.validation[0] && typeof req.validationError.validation[0]['params'] === 'object' && 'missingProperty' in req.validationError.validation[0]['params'] && req.validationError.validation[0]['params']['missingProperty'] === 'session' ? msg.auth : req.validationError;
        var code = error === msg.auth ? 200 : 400;
        return reply.code(code).send(error);
    }
    reply.header('Content-Type', 'application/json').code(200);
    if ('session' in req.body && req.body.session.length === 36) {
        return db.Sessions.findOne({
            where: {
                session: req.body.session,
                ip: req.raw.connection.remoteAddress
            },
            attributes: ['session', 'ip'],
            include: [{
                model: db.Users,
                attributes: ['id'],
                required: true
            }]
        }).then(sessions => {
            if (!sessions) {
                return reply.send(msg.auth);
            }
            return sequelize.query('CALL setUserConfiguration(:userId,:config)',
                {
                    replacements: {
                        userId: sessions.dataValues.user.id,
                        config: req.body.config
                    }
                }).then(update => {
                    return reply.send(msg.update);
                }).catch(err => {
                    console.log(err);
                    return reply.send(msg.db);
                });
        }).catch(err => {
            console.log(err);
            return reply.send(msg.db);
        });
    }
    return reply.send(msg.auth);
});


server.post('/writeVisit', { schema: schemas.responseOnly, attachValidation: true }, (req, reply) => {
    reply.header('Content-Type', 'application/json').code(200);
    return db.VisitHistory.create({
        ip: req.raw.connection.remoteAddress,
        route: req.body.route
    }).then(next => {
        return reply.send(msg.insert);
    }).catch(err => {
        console.log(err.message);
        return reply.send(msg.db);
    });
    return reply.send(msg.db);
});


server.post('/setEshopOrder', { schema: schemas.setEshopOrder, attachValidation: true }, (req, reply) => {
    reply.header('Content-Type', 'application/json').code(200);
    return sequelize.query('CALL setEshopOrder(:variableSymbol,:session,:paymentTypeText,:deliveryTypeText,:totalPrice,:totalVatPrice,:description,:companyName,:name,:street,:city,:postCode,:email,:phone,:otherDeliveryAddress,:deliveryCompanyName,:deliveryName,:deliveryStreet,:deliveryCity,:deliveryPostCode,:deliveryEmail,:deliveryPhone,:language,:items)',
        {
            replacements: {
                variableSymbol: req.body.variableSymbol,
                session: req.body.session,
                paymentTypeText: req.body.paymentType,
                deliveryTypeText: req.body.deliveryType,
                totalPrice: req.body.totalPrice,
                totalVatPrice: req.body.totalVatPrice,
                description: req.body.description,
                companyName: req.body.companyName,
                name: req.body.name,
                street: req.body.street,
                city: req.body.city,
                postCode: req.body.postCode,
                email: req.body.email,
                phone: req.body.phone,
                otherDeliveryAddress: req.body.otherDeliveryAddress,
                deliveryCompanyName: req.body.deliveryCompanyName,
                deliveryName: req.body.deliveryName,
                deliveryStreet: req.body.deliveryStreet,
                deliveryCity: req.body.deliveryCity,
                deliveryPostCode: req.body.deliveryPostCode,
                deliveryEmail: req.body.deliveryEmail,
                deliveryPhone: req.body.deliveryPhone,
                language: req.body.language,
                items: req.body.items
            }
        }).then(next => {
            let info = transporter.sendMail({
                from: cfg.smtp.adminEmail,
                to: req.body.email + (req.body.otherDeliveryAddress) ? "," + req.body.deliveryEmail : "" ,
                bcc: cfg.smtp.adminEmail,
                subject: (req.body.language == "cz") ? "Vaše objednávka z GroupWare-Solution.Eu: " + req.body.variableSymbol : "Your Order from GroupWare-Solution.Eu: " + req.body.variableSymbol,
                html: (req.body.language == "cz")
                    ? "Dobrý den,<br /><br />" +
                    "Přijali jsme vaši objednávku s číslem:" + req.body.variableSymbol + "<br />" +
                    req.body.printOrderArea + "<br />" +
                    req.body.printPriceArea + "<br />" +
                    req.body.printItemArea +
                    "<br /><br />S pozdravem <br />Groupware Solution<br />Web: <a href='https://groupware-solution.eu'>https://groupware-solution.eu</a><br />Mail: <a href='mailTo:sales@groupware-solution.eu'>sales@groupware-solution.eu</a><br />Tel: +420 724 986 873"
                    : "Dear customer,<br /><br />" +
                    "We have received your order number:" + req.body.variableSymbol + "<br />" +
                    req.body.printOrderArea + "<br />" +
                    req.body.printPriceArea + "<br />" +
                    req.body.printItemArea +
                    "<br /><br />Best regards <br />Groupware Solution<br />Web: <a href='https://groupware-solution.eu'>https://groupware-solution.eu</a><br />Mail: <a href='mailTo:sales@groupware-solution.eu'>sales@groupware-solution.eu</a><br />Tel: +420 724 986 873"
            }).then((res) => {
                return reply.send(msg.insert);
            }).catch((err) => {
                return reply.send(msg.emailErr);
            });
        }).catch(err => {
            console.log(err);
            return reply.send(msg.db);
        });
    return reply.send(msg.db);
});

server.get('/getVariableSymbol', { schema: schemas.getVariableSymbol, attachValidation: true }, (req, reply) => {
    reply.header('Content-Type', 'application/json').code(200);
    return sequelize.query('CALL getVariableSymbol()',
        {}).then(variableSymbol => {
            return reply.send({ result: 1, code: 'variableSymbolOk', variableSymbol: variableSymbol[0].orderNumber });
        }).catch(err => {
            console.log(err);
            return reply.send(msg.db);
        });
    return reply.send(msg.auth);
});

server.post('/getMenuContent', { schema: schemas.getMenuContent, attachValidation: true }, (req, reply) => {
    reply.header('Content-Type', 'application/json').code(200);
    return db.MenuContent.findOne({
        where: {
            enabled: 1,
            name: req.body.name
        },
        raw: true,
        attributes: [
            'id',
            'name',
            'cz', 'en',
            'enabled'
        ]
    }).then(menu => {
        return reply.send({ result: 1, menu: menu });
    });
    return reply.send(msg.auth);
});

server.post('/authStatus', { schema: schemas.authStatus, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        var error = typeof req.validationError.validation === 'object' && typeof req.validationError.validation[0] === 'object' && 'params' in req.validationError.validation[0] && typeof req.validationError.validation[0]['params'] === 'object' && 'missingProperty' in req.validationError.validation[0]['params'] && req.validationError.validation[0]['params']['missingProperty'] === 'session' ? msg.auth : req.validationError;
        var code = error === msg.auth ? 200 : 400;
        return reply.code(code).send(error);
    }
    reply.header('Content-Type', 'application/json').code(200);
    if ('session' in req.body && req.body.session.length === 36) {
        return db.Sessions.findOne({
            where: {
                session: req.body.session,
                ip: req.raw.connection.remoteAddress
            },
            attributes: ['session', 'ip', 'email'],
        }).then(sessions => {
            if (!sessions.dataValues.email) {
                return reply.send(msg.auth);
            }
            return sequelize.query('CALL getUser(:email)',
                {
                    replacements: {
                        email: sessions.dataValues.email
                    }
                }).then(user => {
                    if (user[0].configuration != []) {
                        user[0].configuration = JSON.parse(user[0].configuration.toString());
                    }

                    var r = msg.authStatus.ok;
                    r['user'] = user[0];
                    return reply.send(r);
                }).catch(err => {
                    console.log(err);
                    return reply.send(msg.db);
                });
        }).catch(err => {
            return reply.send(msg.db);
        });
    }
    return reply.send(msg.auth);
});

server.post('/updateProfile', { schema: schemas.updateProfile, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        var error = typeof req.validationError.validation === 'object' && typeof req.validationError.validation[0] === 'object' && 'params' in req.validationError.validation[0] && typeof req.validationError.validation[0]['params'] === 'object' && 'missingProperty' in req.validationError.validation[0]['params'] && req.validationError.validation[0]['params']['missingProperty'] === 'session' ? msg.auth : req.validationError;
        var code = error === msg.auth ? 200 : 400;
        return reply.code(code).send(error);
    }
    reply.header('Content-Type', 'application/json').code(200);
    if ('session' in req.body && req.body.session.length === 36) {
        return db.Sessions.findOne({
            where: {
                session: req.body.session,
                ip: req.raw.connection.remoteAddress
            },
            attributes: ['session', 'ip'],
            include: [{
                model: db.Users,
                attributes: ['name', 'surname', 'email', 'sex', 'isAdmin', 'street', 'city', 'postcode', 'phone', 'agreeTerms', 'companyName', 'picture'],
                required: true
            }]
        }).then(sessions => {
            if (!sessions.dataValues.user) {
                return reply.send(msg.auth);
            }

            return db.Users.update({
                companyName: req.body.companyName,
                name: req.body.name,
                surname: req.body.surname,
                street: req.body.street,
                city: req.body.city,
                postcode: req.body.postcode,
                phone: req.body.phone,
                agreeTerms: (req.body.agreeTerms) ? req.body.agreeTerms : sessions.dataValues.user.agreeTerms,
                picture: (req.body.picture != undefined) ? req.body.picture : sessions.dataValues.user.picture
            },{
                where: {
                    email: sessions.dataValues.user.email
                }
            }).then(updated => {
                if (!updated) {
                    return reply.send(msg.db);
                } else {
                    return reply.send(msg.update);
                }
            });

        }).catch(err => {
            console.log(err);
            return reply.send(msg.db);
        });
    }
    return reply.send(msg.auth);
});

server.post('/readEmail', { schema: schemas.readEmail, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        var error = typeof req.validationError.validation === 'object' && typeof req.validationError.validation[0] === 'object' && 'params' in req.validationError.validation[0] && typeof req.validationError.validation[0]['params'] === 'object' && 'missingProperty' in req.validationError.validation[0]['params'] && req.validationError.validation[0]['params']['missingProperty'] === 'session' ? msg.auth : req.validationError;
        var code = error === msg.auth ? 200 : 400;
        return reply.code(code).send(error);
    }
    reply.header('Content-Type', 'application/json').code(200);
    if ('session' in req.body && req.body.session.length === 36) {
        return db.Sessions.findOne({
            where: {
                session: req.body.session,
                ip: req.raw.connection.remoteAddress
            },
            attributes: ['session', 'ip'],
            include: [{
                model: db.Users,
                attributes: ['name', 'surname', 'email', 'sex', 'isAdmin'],
                required: true
            }]
        }).then(sessions => {
            if (!sessions.dataValues.user) {
                return reply.send(msg.auth);
            }
            return sequelize.query('CALL readEmail(:email,:emailId)',
                {
                    replacements: {
                        email: sessions.user.dataValues.email,
                        emailId: req.body.emailId
                    }
                }).then(email => {
                    email[0].attachments = JSON.parse(email[0].attachments.toString());
                    return reply.send({ result: 1, code: 'getEmailOk', email: email[0] });
                }).catch(err => {
                    console.log(err);
                    return reply.send(msg.db);
                });
        }).catch(err => {
            console.log(err);
            return reply.send(msg.db);
        });
    }
    return reply.send(msg.auth);
});

server.post('/getEmails', { schema: schemas.getEmails, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        var error = typeof req.validationError.validation === 'object' && typeof req.validationError.validation[0] === 'object' && 'params' in req.validationError.validation[0] && typeof req.validationError.validation[0]['params'] === 'object' && 'missingProperty' in req.validationError.validation[0]['params'] && req.validationError.validation[0]['params']['missingProperty'] === 'session' ? msg.auth : req.validationError;
        var code = error === msg.auth ? 200 : 400;
        return reply.code(code).send(error);
    }
    reply.header('Content-Type', 'application/json').code(200);
    if ('session' in req.body && req.body.session.length === 36) {
        return db.Sessions.findOne({
            where: {
                session: req.body.session,
                ip: req.raw.connection.remoteAddress
            },
            attributes: ['session', 'ip'],
            include: [{
                model: db.Users,
                attributes: ['name', 'surname', 'email', 'sex', 'isAdmin'],
                required: true
            }]
        }).then(sessions => {
            if (!sessions.dataValues.user) {
                return reply.send(msg.auth);
            }
            return sequelize.query('CALL getEmail(:email,:lastTimestamp,0,:pageNo,:direction)',
                {
                    replacements: {
                        email: sessions.user.dataValues.email,
                        lastTimestamp: req.body.lastTimestamp.length > 0 ? req.body.lastTimestamp : "",
                        pageNo: req.body.pageNo,
                        direction: req.body.direction
                    }
                }).then(emails => {
                    return reply.send({ result: 1, code: 'getEmailOk', emails: emails });
                }).catch(err => {
                    var r = err.message;
                    r['req'] = msg.req;
                    return ws.send(updateSchema(r));
                });
        }).catch(err => {
            console.log(err);
            return reply.send(msg.db);
        });
    }
    return reply.send(msg.auth);
});


server.post('/getAdminEshopItems', { schema: schemas.getAdminEshopItems, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        var error = typeof req.validationError.validation === 'object' && typeof req.validationError.validation[0] === 'object' && 'params' in req.validationError.validation[0] && typeof req.validationError.validation[0]['params'] === 'object' && 'missingProperty' in req.validationError.validation[0]['params'] && req.validationError.validation[0]['params']['missingProperty'] === 'session' ? msg.auth : req.validationError;
        var code = error === msg.auth ? 200 : 400;
        return reply.code(code).send(error);
    }
    reply.header('Content-Type', 'application/json').code(200);
    if ('session' in req.body && req.body.session.length === 36) {
        return db.Sessions.findOne({
            where: {
                session: req.body.session,
                ip: req.raw.connection.remoteAddress
            },
            attributes: ['session', 'ip'],
            include: [{
                model: db.Users,
                where: { isAdmin: 1 },
                attributes: ['name', 'surname', 'email', 'sex', 'isAdmin'],
                required: true
            }]
        }).then(sessions => {
            if (!sessions.dataValues.user) {
                return reply.send(msg.auth);
            }
            return sequelize.query('CALL getEshopItems(:pageNo,:onlyDefaultAttachment,:withInactive,:id)',
                {
                    replacements: {
                        pageNo: req.body.pageNo,
                        onlyDefaultAttachment: req.body.onlyDefaultAttachment,
                        withInactive: req.body.withInactive,
                        id: (req.body.id) ? req.body.id : null
                   }
                }).then(eshopItems => {
                    eshopItems.forEach(eshopItem => {
                        if (eshopItem.attachmentExist) {
                            eshopItem.attachments = JSON.parse(eshopItem.attachments.toString());
                        } else { eshopItem.attachments = []; }

                        if (eshopItem.comments != []) {
                            eshopItem.comments = JSON.parse(eshopItem.comments.toString()).reverse();
                        }

                        if (eshopItem.atributs != []) {
                            eshopItem.atributs = JSON.parse(eshopItem.atributs.toString());
                        }
                    });
                    return reply.send({ result: 1, code: 'geteshopItemsOk', eshopItems: eshopItems });
                }).catch(err => {
                    var r = err.message;
                    r['req'] = msg.req;
                    return ws.send(updateSchema(r));
                });
        }).catch(err => {
            console.log(err);
            return reply.send(msg.db);
        });
    }
    return reply.send(msg.auth);
});

server.post('/getEshopItems', { schema: schemas.getEshopItems, attachValidation: true }, (req, reply) => {
    reply.header('Content-Type', 'application/json').code(200);
    return sequelize.query('CALL getEshopItems(:pageNo,:onlyDefaultAttachment,:withInactive,:id)',
        {
            replacements: {
                pageNo: req.body.pageNo,
                onlyDefaultAttachment: req.body.onlyDefaultAttachment,
                withInactive: req.body.withInactive,
                id: (req.body.id) ? req.body.id : null
            }
        }).then(eshopItems => {
            eshopItems.forEach(eshopItem => {
                if (eshopItem.attachmentExist) {
                    eshopItem.attachments = JSON.parse(eshopItem.attachments.toString());
                } else { eshopItem.attachments = []; }

                if (eshopItem.comments != []) {
                    eshopItem.comments = JSON.parse(eshopItem.comments.toString()).reverse();
                }

                if (eshopItem.atributs != []) {
                    eshopItem.atributs = JSON.parse(eshopItem.atributs.toString());
                }
            });
            return reply.send({ result: 1, code: 'geteshopItemsOk', eshopItems: eshopItems });
        }).catch(err => {
            var r = err.message;
            r['req'] = msg.req;
            return ws.send(updateSchema(r));
        });
    }
);

server.post('/deleteEshopItems', { schema: schemas.deleteEshopItems, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        var error = typeof req.validationError.validation === 'object' && typeof req.validationError.validation[0] === 'object' && 'params' in req.validationError.validation[0] && typeof req.validationError.validation[0]['params'] === 'object' && 'missingProperty' in req.validationError.validation[0]['params'] ? msg.auth : req.validationError;
        var code = error === msg.auth ? 200 : 400;
        return reply.code(code).send(error);
    }

    reply.header('Content-Type', 'application/json').code(200);
    if ('session' in req.body && req.body.session.length === 36) {
        return db.Sessions.findOne({
            where: {
                session: req.body.session,
                ip: req.raw.connection.remoteAddress
            },
            attributes: ['session', 'ip'],
            include: [{
                model: db.Users,
                where: { isAdmin: 1 },
                attributes: ['name', 'surname', 'email'],
                required: true
            }]
        }).then(sessions => {
            if (!sessions.dataValues.user) {
                return reply.send(msg.auth);
            }

            return db.Eshop.update({
                enabled: 0
            },{
                where: {
                    id: { [Op.in]: req.body.ids }
                }
            }).then(rows => {
                if (rows < 1) {
                    return reply.send(msg.db);
                }
                return reply.send(msg.update);
            }).catch(err => {
                return reply.send(msg.db);
            });
        }).catch(err => {
            console.log(err.message);
            return reply.send(msg.db);
        });
    }
    return reply.send(msg.auth);
});


server.post('/eshopItemAdd', { schema: schemas.eshopItemAdd, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        var error = typeof req.validationError.validation === 'object' && typeof req.validationError.validation[0] === 'object' && 'params' in req.validationError.validation[0] && typeof req.validationError.validation[0]['params'] === 'object' && 'missingProperty' in req.validationError.validation[0]['params'] ? msg.auth : req.validationError;
        var code = error === msg.auth ? 200 : 400;
        return reply.code(code).send(error);
    }

    reply.header('Content-Type', 'application/json').code(200);
    if ('session' in req.body && req.body.session.length === 36) {
        return db.Sessions.findOne({
            where: {
                session: req.body.session,
                ip: req.raw.connection.remoteAddress
            },
            attributes: ['session', 'ip'],
            include: [{
                model: db.Users,
                where: { isAdmin: 1 },
                attributes: ['name', 'surname', 'email'],
                required: true
            }]
        }).then(sessions => {
            if (!sessions.dataValues.user) {
                return reply.send(msg.auth);
            }
            if (!req.body.id) {
                return db.Eshop.create({
                    name_cz: req.body.name_cz,
                    name_en: req.body.name_en,
                    shortDescription_cz: req.body.shortDescription_cz,
                    shortDescription_en: req.body.shortDescription_en,
                    description_cz: req.body.description_cz,
                    description_en: req.body.description_en,
                    blankUrl: req.body.blankUrl,
                    price: req.body.price,
                    priceType: req.body.priceType,
                    enabled: req.body.enabled,
                    vatId: req.body.vatId
                }).then(eshopItem => {
                    if (!eshopItem) {
                        return reply.send(msg.db);
                    } else {
                        if (req.body.attachments.length > 0) {
                            req.body.attachments.forEach(function (attachment, index, array) {
                                attachment.source = 'eshop';
                                attachment.sourceId = eshopItem.dataValues.id;
                            });
                            db.Attachments.bulkCreate(
                                req.body.attachments
                            ).then(attachments => {
                                return reply.send(msg.insert);
                            }).catch((err) => {
                                console.log(err);
                                return reply.send(msg.insertErr);
                            });
                        } else { return reply.send(msg.insert); }
                    }
                }).catch(err => {
                    console.log(err.message);
                    return reply.send(msg.db);
                });
            } else {
                return db.Eshop.update({
                    name_cz: req.body.name_cz,
                    name_en: req.body.name_en,
                    shortDescription_cz: req.body.shortDescription_cz,
                    shortDescription_en: req.body.shortDescription_en,
                    description_cz: req.body.description_cz,
                    description_en: req.body.description_en,
                    blankUrl: req.body.blankUrl,
                    price: req.body.price,
                    priceType: req.body.priceType,
                    enabled: req.body.enabled,
                    vatId: req.body.vatId
                }, {
                    where: {
                        id: req.body.id
                    }
                }).then(eshopItem => {
                    if (!eshopItem) {
                        return reply.send(msg.db);
                    } else {
                        if (req.body.attachments.length > 0) {
                            req.body.attachments.forEach(function (attachment, index, array) {
                                attachment.source = 'eshop';
                                attachment.sourceId = req.body.id;
                            });
                            db.Attachments.destroy({
                                where: { sourceId: req.body.id }
                            }).then(res => {

                                db.Attachments.bulkCreate(
                                    req.body.attachments
                                ).then(attachments => {
                                    return reply.send(msg.update);
                                }).catch((err) => {
                                    console.log(err);
                                    return reply.send(msg.updateErr);
                                })
                            }).catch((err) => {
                                console.log(err);
                                return reply.send(msg.updateErr);
                            });
                        } else { return reply.send(msg.update); }
                    }
                }).catch(err => {
                    console.log(err.message);
                    return reply.send(msg.db);
                });
            }

        }).catch(err => {
            console.log(err.message);
            return reply.send(msg.db);
        });
    }
    return reply.send(msg.auth);
});


server.post('/deleteEmails', { schema: schemas.deleteEmails, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        var error = typeof req.validationError.validation === 'object' && typeof req.validationError.validation[0] === 'object' && 'params' in req.validationError.validation[0] && typeof req.validationError.validation[0]['params'] === 'object' && 'missingProperty' in req.validationError.validation[0]['params'] && req.validationError.validation[0]['params']['missingProperty'] === 'session' ? msg.auth : req.validationError;
        var code = error === msg.auth ? 200 : 400;
        return reply.code(code).send(error);
    }
    reply.header('Content-Type', 'application/json').code(200);
    if ('session' in req.body && req.body.session.length === 36) {
        return db.Sessions.findOne({
            where: {
                session: req.body.session,
                ip: req.raw.connection.remoteAddress
            },
            attributes: ['session', 'ip'],
            include: [{
                model: db.Users,
                attributes: ['name', 'surname', 'email', 'sex', 'isAdmin'],
                required: true
            }]
        }).then(sessions => {
            if (!sessions.dataValues.user) {
                return reply.send(msg.auth);
            }
            return sequelize.query('CALL deleteEmail(:email,:emailsId)',
                {
                    replacements: {
                        email: sessions.user.dataValues.email,
                        emailsId: req.body.emails
                    }
                }).then(emails => {
                    return reply.send({ result: 1, code: 'getEmailOk', message: "emails was deleted" });
                }).catch(err => {
                    var r = err.message;
                    r['req'] = msg.req;
                    return ws.send(updateSchema(r));
                });
        }).catch(err => {
            console.log(err);
            return reply.send(msg.db);
        });
    }
    return reply.send(msg.auth);
});

server.post('/getResetPassword', { schema: schemas.getResetPassword, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        return reply.code(400).send(req.validationError);
    }
    reply.header('Content-Type', 'application/json').code(200);
    recaptcha.validate(req.body.recaptcha).then(function () {
        return db.Users.findOne({
            where: {
                confirmationPassword: req.body.confirmationPassword,
                enabled: 1
            },
            attributes: ['email']
        }).then(user => {
            if (!user) {
                return reply.send(msg.password.notexist);
            }
            return reply.send({ result: 1, code: 'confirmation-password-valid', message: 'Confirmation Password is Valid', email: user.dataValues.email });
        }).catch(function (errorCodes) {
            return reply.send(msg.captcha);
        });
    }).catch(function (errorCodes) {
        console.log(recaptcha.translateErrors(errorCodes));
        return reply.send(msg.captcha);
    });
});

server.post('/recoverPassword', { schema: schemas.recoverPassword, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        return reply.code(400).send(req.validationError);
    }
    reply.header('Content-Type', 'application/json').code(200);
    recaptcha.validate(req.body.recaptcha).then(function () {
        return db.Users.update({
            password: req.body.password,
            confirmPasswordRequest: false,
            confirmationPassword: null,
            confirmPasswordExpiry: null
        }, {
            where: {
                email: req.body.email
            },
            individualHooks: true
        }).then(user => {
            return db.Sessions.create({
                ip: req.raw.connection.remoteAddress,
                route: req.body.route,
                email: (req.body.type != 'facebook') ? req.body.email : req.body.password
            }).then(session => {
                if (!session) {
                    return reply.send(msg.db);
                } else {
                    return reply.send({
                        result: 1, code: 'recovery-password-success', message: 'Recovery password Successful', session: session.dataValues.session,
                        user: {
                            name: null,
                            surname: null,
                            email: req.body.email,
                            sex: 0,
                            isAdmin: 0
                        }
                    });
                }
            });
        }).catch(err => {
            console.log(err);
            return reply.send('email' in err.fields ? msg.signup.email : msg.db);
        });
    }).catch(function (errorCodes) {
        console.log(recaptcha.translateErrors(errorCodes));
        return reply.send(msg.captcha);
    });
});

server.post('/resetPassword', { schema: schemas.resetPassword, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        return reply.code(400).send(req.validationError);
    }
    reply.header('Content-Type', 'application/json').code(200);
    recaptcha.validate(req.body.recaptcha).then(function () {
        var confirmationPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        return db.Users.findOne({
            where: {
                email: req.body.email,
                enabled : 1
            },
            attributes: ['id']
        }).then(user => {
            if (!user) {
                return reply.send(msg.password.notexist);
            }
            return db.Users.update({
                confirmPasswordRequest: true,
                confirmationPassword: confirmationPassword,
                confirmPasswordExpiry: moment().unix()
            }, {
                where: {
                    email: req.body.email
                }
            }).then(user => {
                let info = transporter.sendMail({
                    from: cfg.smtp.adminEmail,
                    to: req.body.email,
                    subject: (req.body.language == "cz") ? "GroupWare-Solution Reset hesla" : "GroupWare-Solution Reset password",
                    html: (req.body.language == "cz")
                        ? "Dobrý den,<br /><br />" +
                        "<a href='https://groupware-solution.eu/resetpassword?confirm=" + confirmationPassword + "'>Kliknutím na tento odkaz můžete resetovat vaše heslo</a><br />" +
                        "Odkaz je platný 15 minut.<br /><br />" +
                        "Pokud jste nežádali o reset hesla, tak tento email ignorujte.<br /><br />" +
                        "S pozdravem <br />Groupware Solution<br />Web: <a href='https://groupware-solution.eu'>https://groupware-solution.eu</a><br />Mail: <a href='mailTo:admin@groupware-solution.eu'>admin@groupware-solution.eu</a><br />Tel: +420 724 986 873"
                        : "Dear customer,<br /><br />" +
                        "<a href='https://groupware-solution.eu/resetpassword?confirm=" + confirmationPassword + "'>You can reset password by click here</a><br />" +
                        "The link is valid for 15 minutes.<br /><br />" +
                        "If you did not request a password reset, then please disregard this email.<br /><br />" +
                        "Best regards <br />Groupware Solution<br />Web: <a href='https://groupware-solution.eu'>https://groupware-solution.eu</a><br />Mail: <a href='mailTo:admin@groupware-solution.eu'>admin@groupware-solution.eu</a><br />Tel: +420 724 986 873"
                }).then((res) => {
                    return reply.send(msg.password.verify);
                }).catch((err) => {
                    return reply.send(msg.emailErr);
                });
            }).catch(err => {
                return reply.send(msg.db);
            });
        }).catch(function (errorCodes) {
            return reply.send(msg.captcha);
        });
    }).catch(function (errorCodes) {
        console.log(recaptcha.translateErrors(errorCodes));
        return reply.send(msg.captcha);
    });
});

server.post('/signUp', { schema: schemas.signUp, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        return reply.code(400).send(req.validationError);
    }
    reply.header('Content-Type', 'application/json').code(200);
    recaptcha.validate(req.body.recaptcha).then(function () {
        return db.Users.create({
            email: (req.body.type != 'facebook') ? req.body.email : req.body.password,
            type: req.body.type,
            password: (req.body.type == 'facebook' || req.body.type == 'google') ? '' : req.body.password,
            accessToken: (req.body.type == 'facebook' || req.body.type == 'google') ? req.body.password : null,
            name: (req.body.type == 'facebook' || req.body.type == 'google') ? req.body.name : null,
            surname: (req.body.type == 'facebook' || req.body.type == 'google') ? req.body.surname : null,
            agreeTerms: (req.body.agreeTerms) ? 1 : 0
        }).then(user => {
            return db.Sessions.create({
                ip: req.raw.connection.remoteAddress,
                route: req.body.route,
                email: (req.body.type != 'facebook') ? req.body.email : req.body.password
            }).then(session => {
                if (!session) {
                    return reply.send(msg.db);
                } else {
                    return reply.send({
                        result: 1, code: 'registration-success', message: 'Registration Successful', session: session.dataValues.session,
                        user: {
                            name: null,
                            surname: null,
                            email: req.body.email,
                            sex: 0,
                            isAdmin: 0
                        }
                    });
                }
            });
        }).catch(err => {
            console.log(err);
            return reply.send('email' in err.fields ? msg.signup.email : msg.db);
        });
    }).catch(function (errorCodes) {
        console.log(recaptcha.translateErrors(errorCodes));
        return reply.send(msg.captcha);
    });
});

server.post('/login', { schema: schemas.login, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        return reply.code(400).send(req.validationError);
    }
    reply.header('Content-Type', 'application/json').code(200);
    return recaptcha.validate(req.body.recaptcha).then(function () {
        return db.Users.findOne({
            where: {
                [Op.or]: [
                    { email: (req.body.type != 'facebook') ? req.body.email : 'nodata' },
                    { accessToken: (req.body.type == 'facebook') ? req.body.password : 'nodata' }
                ],
                enabled: 1
            },
            attributes: ['id', 'email', 'name', 'surname', 'password', 'sex', 'isAdmin']
        }).then(user => {
            if (!user) {
                return reply.send(msg.login.user);
            } else {
                if (req.body.type == "auth") {
                    return user.comparePassword(req.body.password).then(authenticated => {
                        if (authenticated) {
                            return db.Sessions.create({
                                ip: req.raw.connection.remoteAddress,
                                route: req.body.route,
                                email: (req.body.type != 'facebook') ? req.body.email : req.body.password
                            }).then(session => {
                                if (!session) {
                                    return reply.send(msg.db);
                                } else {
                                    return reply.send({
                                        result: 1, code: 'login-success', message: 'Login Successful', session: session.dataValues.session,
                                        user: {
                                            name: user.dataValues.name,
                                            surname: user.dataValues.surname,
                                            email: user.dataValues.email,
                                            sex: user.dataValues.sex,
                                            isAdmin: user.dataValues.isAdmin
                                        }
                                    });
                                }
                            });
                        } else {
                            return reply.send(msg.login.password);
                        }
                    }).catch(err => {
                        console.log(err.message);
                        return reply.send(msg.login.bcrypt);
                    });
                } else if (req.body.type == "google" || req.body.type == "facebook") {
                    return db.Sessions.create({
                        ip: req.raw.connection.remoteAddress,
                        route: req.body.route,
                        email: user.dataValues.email
                    }).then(session => {
                        if (!session) {
                            return reply.send(msg.db);
                        } else {
                            return reply.send({
                                result: 1, code: 'login-success', message: 'Login Successful', session: session.dataValues.session,
                                user: {
                                    name: user.dataValues.name,
                                    surname: user.dataValues.surname,
                                    email: user.dataValues.email,
                                    sex: user.dataValues.sex,
                                    isAdmin: user.dataValues.isAdmin
                                }
                            });
                        }
                    });
                }
            }
        }).catch(err => {
            return reply.send(msg.db);
        });
    }).catch(function (errorCodes) {
        console.log(errorCodes);
        return reply.send(msg.captcha);
    });
});

server.post('/sendEmail', { schema: schemas.sendEmail, attachValidation: true }, (req, reply) => {
    if (req.validationError) {
        var error = typeof req.validationError.validation === 'object' && typeof req.validationError.validation[0] === 'object' && 'params' in req.validationError.validation[0] && typeof req.validationError.validation[0]['params'] === 'object' && 'missingProperty' in req.validationError.validation[0]['params'] ? msg.auth : req.validationError;
        var code = error === msg.auth ? 200 : 400;
        return reply.code(code).send(error);
    }

    reply.header('Content-Type', 'application/json').code(200);
    if ('session' in req.body && req.body.session.length === 36) {
        return db.Sessions.findOne({
            where: {
                session: req.body.session,
                ip: req.raw.connection.remoteAddress
            },
            attributes: ['session', 'ip'],
            include: [{
                model: db.Users,
                attributes: ['name', 'surname', 'email'],
                required: true
            }]
        }).then(sessions => {
            if (!sessions.dataValues.user) {
                return reply.send(msg.auth);
            }

            return db.Emails.create({
                fromName: req.body.fromName,
                fromEmail: req.body.fromEmail,
                toEmail: (req.body.toEmail != null) ? req.body.toEmail : cfg.smtp.adminEmail,
                subject: req.body.subject,
                content: req.body.content
            }).then(email => {
                if (!email) {
                    return reply.send(msg.db);
                } else {
                    if (req.body.attachments.length > 0) {

                        let emailAttachment = [];
                        req.body.attachments.forEach(function (attachment, index, array) {
                            attachment.source = 'email';
                            attachment.sourceId = email.dataValues.id;
                            emailAttachment.push({ filename: attachment.fileName, path: attachment.content });
                        
                            if (index == array.length - 1) {
                                db.Attachments.bulkCreate(
                                    req.body.attachments
                                ).then(attachments => {
                                    let info = transporter.sendMail({
                                        from: req.body.fromEmail,
                                        to: (req.body.toEmail) ? req.body.toEmail : cfg.smtp.adminEmail,
                                        subject: req.body.subject,
                                        html: req.body.content,
                                        attachments: emailAttachment
                                    }).then((res) => {
                                        return reply.send(msg.emailOk);
                                    }).catch((err) => {
                                        console.log(err);
                                        return reply.send(msg.emailErr);
                                    });

                                }).catch((err) => {
                                    console.log(err);
                                    return reply.send(msg.emailErr);
                                });
                            }
                        });
                    } else {

                        let info = transporter.sendMail({
                            from: req.body.fromEmail,
                            to: (req.body.toEmail) ? req.body.toEmail : cfg.smtp.adminEmail,
                            subject: req.body.subject,
                            html: req.body.content
                        }).then((res) => {
                            return reply.send(msg.emailOk);
                        }).catch((err) => {
                            console.log(err);
                            return reply.send(msg.emailErr);
                        });
                    }
                }
            }).catch(err => {
                console.log(err.message);
                return reply.send(msg.db);
            });

        }).catch(err => {
            console.log(err.message);
            return reply.send(msg.db);
        });
    } else {
        return db.Emails.create({
            fromName: req.body.fromName,
            fromEmail: req.body.fromEmail,
            toEmail: cfg.smtp.adminEmail,
            subject: req.body.subject,
            content: req.body.content
        }).then(email => {
            if (!email) {
                return reply.send(msg.db);
            } else {
                if (req.body.attachments.length > 0) {

                    let emailAttachment = [];
                    req.body.attachments.forEach(function (attachment, index, array) {
                        attachment.source = 'email';
                        attachment.sourceId = email.dataValues.id;
                        emailAttachment.push({ filename: attachment.fileName, path: attachment.content });

                        if (index == array.length - 1) {
                            db.Attachments.bulkCreate(
                                req.body.attachments
                            ).then(attachments => {

                                let info = transporter.sendMail({
                                    from: req.body.fromEmail,
                                    to: cfg.smtp.adminEmail,
                                    subject: req.body.subject,
                                    html: req.body.content,
                                    attachments: emailAttachment
                                }).then((res) => {
                                    return reply.send(msg.emailOk);
                                }).catch((err) => {
                                    console.log(err);
                                    return reply.send(msg.emailErr);
                                });
                            }).catch((err) => {
                                console.log(err);
                                return reply.send(msg.emailErr);
                            });
                        }
                    });
                } else {
                    let info = transporter.sendMail({
                        from: req.body.fromEmail,
                        to: cfg.smtp.adminEmail,
                        subject: req.body.subject,
                        html: req.body.content
                    }).then((res) => {
                        return reply.send(msg.emailOk);
                    }).catch((err) => {
                        console.log(err);
                        return reply.send(msg.emailErr);
                    });
                }
            }
        }).catch((err) => {
            console.log(err);
            return reply.send(msg.emailErr);
        });
    }
});


server.listen(cfg.port, cfg.address, err => {
    if (err) throw err;
    console.log('Server listenting on ' + cfg.address + ':' + cfg.port);
});

