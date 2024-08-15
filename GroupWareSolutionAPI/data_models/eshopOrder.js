module.exports = (sequelize, type) => {
    return sequelize.define('eshopOrder', {
        id: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        number: {
            type: type.STRING(20),
            allowNull: false
        },
        userId: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false
        },
        statusId: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false
        },
        paymentTypeId: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false
        },
        paymentStatusId: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false
        },
        totalPrice: {
            type: type.DOUBLE(10,2),
            allowNull: true
        },
        totalVatPrice: {
            type: type.DOUBLE(10, 2),
            allowNull: true
        },
        comment: {
            type: type.STRING(2048),
            allowNull: false
        }
    }, {
        freezeTableName: true,
        timestamps: false
    });
};