'use strict';
const uWS = require('uWebSockets.js');
const Sequelize = require('sequelize');
const IndexHints = Sequelize.IndexHints;
const moment = require('moment');
const fastJson = require('fast-json-stringify');
const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');
//const decoder = require('text-encoding');
const decoder = new TextDecoder();
const db = require('./api_models/ws_db');

const cfg = JSON.parse(fs.readFileSync(path.join('./config/ws_config.json'), 'utf8'));
const schemas = JSON.parse(fs.readFileSync(path.join('./api_schemas/ws_schemas.json'), 'utf8'));
const messages = JSON.parse(fs.readFileSync(path.join('./api_messages/ws_messages.json'), 'utf8'));
const updateSchema = fastJson(schemas.default);

//request, response definiton
const setChatResponse = fastJson(schemas.setChat.response);
const getChatResponse = fastJson(schemas.getChat.response);
const readChatResponse = fastJson(schemas.readChat.response);
const getEmailResponse = fastJson(schemas.getEmail.response);
const readEmailResponse = fastJson(schemas.readEmail.response);

const ajv = new Ajv({ removeAdditional: true });
const setChatRequest = ajv.compile(schemas.setChat.request);
const getChatRequest = ajv.compile(schemas.getChat.request);
const readChatRequest = ajv.compile(schemas.readChat.request);
const getEmailRequest = ajv.compile(schemas.getEmail.request);
const readEmailRequest = ajv.compile(schemas.readEmail.request);

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


uWS.SSLApp({
    key_file_name: path.join(__dirname, cfg.ssl.key),
    cert_file_name: path.join(__dirname, cfg.ssl.cert)
}).ws('/*', {
    /* Options */
    compression: 0,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 121,
    /* Handlers */
    open: (ws, req) => {
        //
    },
    message: (ws, message, isBinary) => {
        if (!isBinary) {
            try {
                var msg = JSON.parse(decoder.decode(message));
            } catch (e) {
                return ws.send(updateSchema(messages.request.error));
            }
            if (typeof msg === 'object' && 'method' in msg && 'data' in msg) {


                if (msg.method === 'getChat') {
                    if (!getChatRequest(msg.data)) {
                        var r = messages.request.error;
                        r['req'] = msg.req;
                        return ws.send(updateSchema(r));
                    }
                    return db.Sessions.findOne({
                        where: {
                            session: msg.data.session
                        },
                        attributes: ['session', 'ip'],
                        include: [{
                            model: db.Users,
                            attributes: ['email'],
                            required: true
                        }]
                    }).then(sessions => {
                        if (!sessions) {
                            var r = messages.privileges.error;
                            r['req'] = msg.req;
                            return ws.send(updateSchema(r));
                        }
                        return sequelize.query('CALL getChat(:email,:mySession,:lastTimestamp)',
                            {
                                replacements: {
                                    email: sessions.user.dataValues.email,
                                    mySession: msg.data.session,
                                    lastTimestamp: [msg.data.lastTimestamp].length > 0 ? msg.data.lastTimestamp : ""
                                }
                            }).then(chat => {
                                return ws.send(getChatResponse({ req: msg.req, result: chat.length > 0 ? 1 : 0, code: chat.length > 0 ? 'getChatOk' : 'getOk' , message: chat }));
                            }).catch(err => {
                                console.log("getChat:", err);
                                var r = messages.get.error;
                                r['req'] = msg.req;
                                return ws.send(updateSchema(r));
                            });
                    }).catch(err => {
                        var r = messages.get.error;
                        r['req'] = msg.req;
                        return ws.send(updateSchema(r));
                    });


                } else if (msg.method === 'setChat') {
                    if (!setChatRequest(msg.data)) {
                        var r = messages.request.error;
                        r['req'] = msg.req;
                        return ws.send(updateSchema(r));
                    }
                    return db.Sessions.findOne({
                        where: {
                            session: msg.data.session
                        },
                        attributes: ['session', 'ip'],
                        include: [{
                            model: db.Users,
                            attributes: ['email', 'isAdmin'],
                            required: true
                        }]
                    }).then(sessions => {
                        if (!sessions) {
                            var r = messages.privileges.error;
                            r['req'] = msg.req;
                            return ws.send(updateSchema(r));
                        }
                        return db.Chat.create({
                            fromEmail: sessions.user.dataValues.email,
                            toEmail: msg.data.toEmail,
                            message: msg.data.message
                        }).then(chat => {
                            var r = messages.update.ok;
                            r['req'] = msg.req;
                            return ws.send(setChatResponse({ req: msg.req, result: chat.length > 0 ? 1 : 0, code: 'get-ok', message: chat }));
                        }).catch(err => {
                            console.log("setChat:", err);
                            var r = messages.update.error;
                            r['req'] = msg.req;
                            return ws.send(updateSchema(r));
                        });
                    }).catch(err => {
                        var r = messages.get.error;
                        r['req'] = msg.req;
                        return ws.send(updateSchema(r));
                    });
                } else if (msg.method === 'readChat') {
                    if (!readChatRequest(msg.data)) {
                        var r = messages.request.error;
                        r['req'] = msg.req;
                        return ws.send(updateSchema(r));
                    }
                    return db.Sessions.findOne({
                        where: {
                            session: msg.data.session
                        },
                        attributes: ['session', 'ip'],
                        include: [{
                            model: db.Users,
                            attributes: ['email'],
                            required: true
                        }]
                    }).then(sessions => {
                        if (!sessions) {
                            var r = messages.privileges.error;
                            r['req'] = msg.req;
                            return ws.send(updateSchema(r));
                        }
                        return sequelize.query('CALL readChat(:email, :lastTimestamp)',
                            {
                                replacements: {
                                    email: sessions.user.dataValues.email,
                                    lastTimestamp: [msg.data.lastTimestamp].length > 0 ? msg.data.lastTimestamp : ""
                                }
                            }).then(chat => {
                                var r = messages.update.ok;
                                r['req'] = msg.req;
                                return ws.send(readChatResponse({ req: msg.req, result: 1, code: 'get-ok', message: chat }));
                            }).catch(err => {
                                var r = messages.get.error;
                                r['req'] = msg.req;
                                return ws.send(updateSchema(r));
                            });
                    }).catch(err => {
                        var r = messages.get.error;
                        r['req'] = msg.req;
                        return ws.send(updateSchema(r));
                    });

                } else if (msg.method === 'getEmail') {
                    if (!getEmailRequest(msg.data)) {
                        var r = messages.request.error;
                        r['req'] = msg.req;
                        return ws.send(updateSchema(r));
                    }
                    return db.Sessions.findOne({
                        where: {
                            session: msg.data.session
                        },
                        attributes: ['session', 'ip'],
                        include: [{
                            model: db.Users,
                            attributes: ['email'],
                            required: true
                        }]
                    }).then(sessions => {
                        if (!sessions) {
                            var r = messages.privileges.error;
                            r['req'] = msg.req;
                            return ws.send(updateSchema(r));
                        }
                        return sequelize.query('CALL getEmail(:email,:lastTimestamp,1,0,"")',
                            {
                                replacements: {
                                    email: sessions.user.dataValues.email,
                                    lastTimestamp: [msg.data.lastTimestamp].length > 0 ? msg.data.lastTimestamp : ""
                                }
                            }).then(email => {
                                return ws.send(getEmailResponse({ req: msg.req, result: email.length > 0 ? 1 : 0, code: email.length > 0 ? 'getEmailOk' : 'getOk', message: email }));
                            }).catch(err => {
                                console.log("getChat:", err);
                                var r = messages.get.error;
                                r['req'] = msg.req;
                                return ws.send(updateSchema(r));
                            });
                    }).catch(err => {
                        var r = messages.get.error;
                        r['req'] = msg.req;
                        return ws.send(updateSchema(r));
                    });


                } else if (msg.method === 'readEmail') {
                    if (!readEmailRequest(msg.data)) {
                        var r = messages.request.error;
                        r['req'] = msg.req;
                        return ws.send(updateSchema(r));
                    }
                    return db.Sessions.findOne({
                        where: {
                            session: msg.data.session
                        },
                        attributes: ['session', 'ip'],
                        include: [{
                            model: db.Users,
                            attributes: ['email'],
                            required: true
                        }]
                    }).then(sessions => {
                        if (!sessions) {
                            var r = messages.privileges.error;
                            r['req'] = msg.req;
                            return ws.send(updateSchema(r));
                        }
                        return sequelize.query('CALL readEmail(:email, :lastTimestamp)',
                            {
                                replacements: {
                                    email: sessions.user.dataValues.email,
                                    lastTimestamp: [msg.data.lastTimestamp].length > 0 ? msg.data.lastTimestamp : ""
                                }
                            }).then(email => {
                                var r = messages.update.ok;
                                r['req'] = msg.req;
                                return ws.send(readEmailResponse({ req: msg.req, result: 1, code: 'get-ok', message: email }));
                            }).catch(err => {
                                var r = messages.get.error;
                                r['req'] = msg.req;
                                return ws.send(updateSchema(r));
                            });
                    }).catch(err => {
                        var r = messages.get.error;
                        r['req'] = msg.req;
                        return ws.send(updateSchema(r));
                    });

                } //else method

            } else {
                console.log(messages.request.error);
                var r = messages.request.error;
                r['req'] = msg.req;
                return ws.send(updateSchema(r));
            }
        }
    },
    drain: (ws) => {
        console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
         console.log('WebSocket closed');
    }
}).any('/*', (res, req) => {
    // Load balancing
    res.writeHeader('content-type', 'application/json; charset=utf-8').writeHeader('Access-Control-Allow-Origin', '*').end(JSON.stringify({ ws: 'wss://' + cfg.host + ':' + cfg.port + '/' }));
}).listen(cfg.port, (token) => {
    if (token) {
        console.log('Listening on port ' + cfg.port);
    } else {
        console.log('Failed to listen on port ' + cfg.port);
    }
});
