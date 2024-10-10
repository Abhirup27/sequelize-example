const express = require("express");
const app = express();
require('dotenv').config();
const { Sequelize } = require('sequelize');

async function createDatabaseIfNotExists(dbName, dbUser, dbPassword, dbHost) {
   // Create a temporary Sequelize instance without specifying a database
  const tempSequelize = new Sequelize('', dbUser, dbPassword, {
    host: dbHost,
    dialect: 'mariadb'
  });

  try {
    // Try to create the database
    await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS ${dbName};`);
    console.log(`Database ${dbName} created or already exists.`);
  } catch (error) {
    console.error('Error creating database:', error);
     await tempSequelize.query(`CREATE DATABASE ${dbName};`);
  } finally {
    // Close the temporary connection
    await tempSequelize.close();
  }

  // Now create a Sequelize instance with the database specified
  const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'mariadb'
  });

  return sequelize;
}

// Create the database before requiring models
createDatabaseIfNotExists(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_HOST)
  .then(() => {
    const db = require('./models');
    const { User } = db;

    app.get('/select', (req, res) => {
      User.findAll({where: {firstName: "Hexa"}}).then((users) => {
        res.send(users);
      }).catch((err) => {
        console.log(err);
      });
    });

    app.get('/insert', (req, res) => {
      User.create({
        firstName: "Hexa",
        age:29,
      }).catch((err) => {
        if (err) {
          console.log(err);
        }
      })
      res.send('insert');
    });

    app.get('/delete', (req, res) => {
      User.destroy({ where: { id: 5 } });
      res.send('delete');
    });

    db.sequelize.sync({  }).then(() => {
      app.listen(3000, () => {
        console.log("server running");
      });
    }).catch((err) => {
      console.error("Error syncing database:", err);
    });
  })
  .catch((err) => {
    console.error("Error creating database:", err);
  });