module.exports = (sequelize, type) => {
    return sequelize.define('configuration', {
        id: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: type.STRING(50),
            allowNull: false
        },
        value: {
            type: type.TEXT,
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