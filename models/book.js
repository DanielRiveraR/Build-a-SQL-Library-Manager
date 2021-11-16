'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
    // associations can be defined here
    }
  };

  Book.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "title"'
        },
        notEmpty: {
          msg: 'Please provide a value for "title"'
        }
      } 
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "author"'
        },
        notEmpty: {
          msg: 'Please provide a value for "author"'
        }
      }
    },
    genre: DataTypes.STRING,
    year: DataTypes.INTEGER
  }, { sequelize });
  return Book;
};