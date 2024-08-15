module.exports = (sequelize, type) => {
    return sequelize.define('currency', {
        id: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        country: {
            type: type.STRING(3),
            allowNull: false
        },
        name: {
            type: type.STRING(50),
            allowNull: false
        },
        value: {
            type: type.DOUBLE(10,5),
            allowNull: false
        },
        fromDate: {
            type: type.DATE,
            allowNull: false
        },
        toDate: {
            type: type.DATE,
            allowNull: false
        }
    }, {
        freezeTableName: true,
        timestamps: false
    });
};