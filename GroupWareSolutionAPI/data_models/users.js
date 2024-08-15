module.exports = (sequelize, type) => {
    return sequelize.define('users', {
        id: {
            type: type.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        type: {
            type: type.STRING(10),
            allowNull: false
        },
        email: {
            type: type.STRING(255),
            allowNull: false
        },
        password: {
            type: type.STRING(255),
            allowNull: true
        },
        name: {
            type: type.STRING(50),
            allowNull: true
        },
        surname: {
            type: type.STRING(50),
            allowNull: true
        },
        accessToken: {
            type: type.STRING(1024),
            allowNull: true
        },
        sex: {
            type: type.INTEGER(1),
            allowNull: true
        },
        agreeTerms: {
            type: type.INTEGER(1),
            allowNull: true
        },
        companyName: {
            type: type.STRING(255),
            allowNull: true
        },
        street: {
            type: type.STRING(255),
            allowNull: true
        },
        city: {
            type: type.STRING(150),
            allowNull: true
        },
        postcode: {
            type: type.STRING(10),
            allowNull: true
        },
        phone: {
            type: type.STRING(20),
            allowNull: true
        },
        picture: {
            type: type.BLOB('medium'),
            allowNull: true
        },
        confirmPasswordRequest: {
            type: type.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        confirmationPassword: {
            type: type.STRING(32),
            allowNull: true
        },
        confirmPasswordExpiry: {
            type: type.INTEGER(11),
            allowNull: true
        }
    }, {
        freezeTableName: true,
        timestamps: false
    });
};