const express = require("express");
const app = express();

const mariadb = require("mariadb");

const db = require('./models');
const { User } = require('./models');
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

app.get('/select', (req, res) => {
  User.findAll({where: {firstName: "Hexa"}}).then((users) => {
    res.send(users);
  }).catch((err) => {
    console.log(err);
  });
  //res.send('select');
});
app.get('/insert', (req, res) => {
    User.create({
    firstName: "Hexa",
    age:29,
  }).catch((err) => {
    if (err)
    {
      console.log(err);
    }
  })
  res.send('insert');
});
app.get('/delete', (req, res) => {
  User.destroy({ where: { id: 5 } });
  res.send('delete');
});
db.sequelize.sync().then((req) => {

    app.listen(3000, () => {
        console.log("server running");
    });

});
createDatabaseIfNotExists('database_development', 'root', 'ABHIrup_27', 'localhost')

