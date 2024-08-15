module.exports = (sequelize, type) => {
    return sequelize.define('emails', {
        id: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        fromName: {
            type: type.STRING(101),
            allowNull: false
        },
        fromEmail: {
            type: type.STRING(255),
            allowNull: false
        },
        toEmail: {
            type: type.STRING(255),
            allowNull: false
        },
        subject: {
            type: type.STRING(500),
            allowNull: false
        },
        content: {
            type: type.TEXT('medium'),
            allowNull: false
        }
    }, {
        freezeTableName: true,
        timestamps: false
    });
};