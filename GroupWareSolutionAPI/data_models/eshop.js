module.exports = (sequelize, type) => {
    return sequelize.define('eshop', {
        id: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name_cz: {
            type: type.STRING(255),
            allowNull: false
        },
        name_en: {
            type: type.STRING(255),
            allowNull: false
        },
        shortDescription_cz: {
            type: type.TEXT('medium'),
            allowNull: false
        },
        shortDescription_en: {
            type: type.TEXT('medium'),
            allowNull: false
        },
        description_cz: {
            type: type.TEXT('medium'),
            allowNull: false
        },
        description_en: {
            type: type.TEXT('medium'),
            allowNull: false
        },
        blankUrl: {
            type: type.STRING(1024),
            allowNull: true
        },
        price: {
            type: type.DOUBLE(10,2),
            allowNull: true
        },
        priceType: {
            type: type.ENUM('VALUE', 'CALCULATE', 'AGREED'),
            allowNull: false
        },
        enabled: {
            type: type.BOOLEAN,
            allowNull: false
        },
        vatId: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false
        },
    }, {
        freezeTableName: true,
        timestamps: false
    });
};