module.exports = (sequelize, type) => {
    return sequelize.define('menuContent', {
        id: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        emailId: {
            type: type.INTEGER(10),
            allowNull: false
        },
        name: {
            type: type.STRING(50),
            allowNull: false
        },
        cz: {
            type: type.TEXT('medium'),
            allowNull: false
        },
        en: {
            type: type.TEXT('medium'),
            allowNull: false
        },
        enabled: {
            type: type.INTEGER(1),
            allowNull: false
        }
    }, {
        freezeTableName: true,
        timestamps: false
    });
};