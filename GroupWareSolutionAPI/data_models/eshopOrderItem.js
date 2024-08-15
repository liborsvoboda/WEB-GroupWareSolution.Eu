module.exports = (sequelize, type) => {
    return sequelize.define('eshopOrderItem', {
        id: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        orderId: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false
        },
        eshopId: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false
        },
        vatId: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false
        },
        currencyId: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false
        },
        price: {
            type: type.DOUBLE(10,2),
            allowNull: true
        },
        vatPrice: {
            type: type.DOUBLE(10, 2),
            allowNull: true
        },
        amount: {
            type: type.INTEGER(11),
            allowNull: false
        }
    }, {
        freezeTableName: true,
        timestamps: false
    });
};