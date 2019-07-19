"use strict";
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Course",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      estimatedTime: DataTypes.STRING,
      materialsNeeded: DataTypes.STRING
    },
    {}
  );
  Course.associate = function(models) {
    Course.belongsTo(models.User, {
      foreignKey: {
        fieldName: "userId",
        allowNull: true
      }
    });
  };
  return Course;
};
