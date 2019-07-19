'use strict';
module.exports = (sequelize, DataTypes) => {
  const Courses = sequelize.define('Courses', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    estimatedTime: DataTypes.STRING,
    materialsNeeded: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {});
  Courses.associate = function(models) {
    // associations can be defined here
  };
  return Courses;
};