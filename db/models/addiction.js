const addiction = (sequelize, DataTypes) => {
  const Addiction = sequelize.define("addictions", {
    name: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    }
  });
  Addiction.associate = models => {
    Addiction.belongsToMany(models.User, {
      through: "UserAddictions",
      as: "users",
      foreignKey: "addictionId",
      otherKey: "userId"
    });
  };
  return Addiction;
};
module.exports = addiction;
