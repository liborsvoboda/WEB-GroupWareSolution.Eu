module.exports = (sequelize, type) => {
    return sequelize.define('calendarAgendas', {
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
        name: {
            type: type.STRING(50),
            allowNull: false
        },
        content: {
            type: type.TEXT,
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