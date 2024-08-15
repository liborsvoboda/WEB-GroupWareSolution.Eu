module.exports = (sequelize, type) => {
    return sequelize.define('attachments', {
        id: {
            type: type.INTEGER.UNSIGNED,
            allowNull: true,
            autoIncrement: true,
            primaryKey: true
        },
        source: {
            type: type.ENUM("email", "eshop"),
            allowNull: false
        },
        sourceId: {
            type: type.INTEGER(10),
            allowNull: false
        },
        fileName: {
            type: type.STRING(255),
            allowNull: false
        },
        mimeType: {
            type: type.STRING(150),
            allowNull: false
        },
        size: {
            type: type.INTEGER(11),
            allowNull: false
        },
        content: {
            type: type.BLOB('medium'),
            allowNull: false
        },
        default: {
            type: type.INTEGER(1),
            allowNull: false
        }
    }, {
        freezeTableName: true,
        timestamps: false
    });
};