module.exports = (sequelize, type) => {
    return sequelize.define('eshopComment', {
        id: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false
        },
        orderId: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false
        },
        eshopId: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false
        },
        comment: {
            type: type.STRING(2048),
            allowNull: false
        },
        ratting: {
            type: type.FLOAT(1,1),
            allowNull: true
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