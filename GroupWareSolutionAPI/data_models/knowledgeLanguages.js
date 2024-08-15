module.exports = (sequelize, type) => {
    return sequelize.define('KnowledgeLanguages', {
        id: {
            type: type.INTEGER.UNSIGNED,
            allowNull: true,
            autoIncrement: true,
            primaryKey: true
        },
        language: {
            type: type.STRING(50),
            allowNull: false
        }
    }, {
        freezeTableName: true,
        timestamps: false
    });
};