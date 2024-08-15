module.exports = (sequelize, type) => {
    return sequelize.define('vat', {
        id: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: type.STRING(10),
            allowNull: false
        },
        value: {
            type: type.DOUBLE(10, 2),
            allowNull: false
        },
        enabled: {
            type: type.BOOLEAN,
            allowNull: false
        },
    }, {
        freezeTableName: true,
        timestamps: false
    });
};