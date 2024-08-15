module.exports = (sequelize, type) => {
    return sequelize.define('sessions', {
        session: {
            type: type.UUID,
            primaryKey: true,
            defaultValue: type.UUIDV4,
            allowNull: false
        },
        email: {
            type: type.STRING(255),
            allowNull: false
        },
        ip: {
            type: type.STRING(40),
            allowNull: false
        },
        route: {
            type: type.STRING(255),
            allowNull: false
        }
    },
    {
        freezeTableName: true,
        timestamps: false
  });
};
