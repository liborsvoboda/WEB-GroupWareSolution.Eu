module.exports = (sequelize, type) => {
    return sequelize.define('deliveryType', {
        id: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        cz: {
            type: type.STRING(50),
            allowNull: false
        },
        en: {
            type: type.STRING(50),
            allowNull: false
        },
        enabled: {
            type: type.BOOLEAN,
            allowNull: false
        }
    }, {
        freezeTableName: true,
        timestamps: false
    });
};