module.exports = (sequelize, type) => {
  return sequelize.define('login_history', {
    id: {
        type: type.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: type.STRING(255),
        allowNull: false
    },
    ip: {
        type: type.STRING(15),
        allowNull: false
    }
  }, {
        freezeTableName: true,
        timestamps: false
  });
};
