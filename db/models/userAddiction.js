const userAddiction = (sequelize, DataTypes) => {
  const UserAddiction = sequelize.define("UserAddictions", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "id"
      }
    },
    addictionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Addiction",
        key: "id"
      }
    },
    started: {
      type: DataTypes.INTEGER
    },
    status: {
      type: DataTypes.STRING
    }
  });

  return UserAddiction;
};
module.exports = userAddiction;
