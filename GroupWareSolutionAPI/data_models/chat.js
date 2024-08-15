module.exports = (sequelize, type) => {
    return sequelize.define('chat', {
        id: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        fromEmail: {
            type: type.STRING(255),
            allowNull: false
        },
        toEmail: {
            type: type.STRING(255),
            allowNull: false
        },
        message: {
            type: type.STRING(4096),
            allowNull: false
        }
    }, {
        freezeTableName: true,
        timestamps: false
    });
};