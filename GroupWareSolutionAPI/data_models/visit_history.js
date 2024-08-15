module.exports = (sequelize, type) => {
  return sequelize.define('visit_history', {
    id: {
        type: type.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    ip: {
        type: type.STRING(40),
        allowNull: false
    },
    route: {
        type: type.STRING(255),
        allowNull: false
    }
  }, {
        freezeTableName: true,
        timestamps: false
  });
};
