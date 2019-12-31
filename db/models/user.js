const user = (sequelize, DataTypes) => {
  const User = sequelize.define("users", {
    username: {
      type: DataTypes.STRING
    }
  });
  User.associate = models => {
    User.belongsToMany(models.Addiction, {
      through: "UserAddictions",
      as: "addictions",
      foreignKey: "userId",
      otherKey: "addictionId"
    });
  };
  return User;
};

module.exports = user;
