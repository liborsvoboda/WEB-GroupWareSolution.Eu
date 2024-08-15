module.exports = (sequelize, type) => {
    return sequelize.define('documentMark', {
        id: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        prefix: {
            type: type.STRING(10),
            allowNull: false
        },
        counter: {
            type: type.STRING(10),
            allowNull: false
        },
        fromDate: {
            type: type.DATE,
            allowNull: false
        },
        toDate: {
            type: type.DATE,
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