const { Client } = require('pg');
const fs = require('fs');

// Database connection details of pre migration
const dbConfigPreMigration = {
  host: 'localhost',
  port: 5432,
  user: 'old',
  password: 'hehehe',
  database: 'old',
};

// Database connection details of post migration

const dbConfigPostMigration = {
  host: 'localhost',
  port: 5433,
  user: 'new',
  password: 'hahaha',
  database: 'new',
};

// Assuming we have more than one table in database.
// Function to get all table names from the database
async function getTableNames(client) {
  const res = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
  `);
  return res.rows.map(row => row.table_name);
}

// Function to get data from a table
async function getDataFromTable(client, tableName) {
  const res = await client.query(`SELECT * FROM ${tableName}`);
  return res.rows;
}

// Function to compare data from two datasets
function compareData(dataPre, dataPost, primaryKey) {
  const preMap = new Map(dataPre.map(row => [row[primaryKey], row]));
  const postMap = new Map(dataPost.map(row => [row[primaryKey], row]));

  const differences = {
    missingInPost: [],
    newInPost: [],
    corrupted: []
  };

  dataPre.forEach(rowPre => {
    const postRow = postMap.get(rowPre[primaryKey]);
    if (!postRow) {
      differences.missingInPost.push(rowPre);
    } else {
      const commonFieldsPre = {};
      const commonFieldsPost = {};
      Object.keys(rowPre).forEach(key => {
        if (key in postRow) {
          commonFieldsPre[key] = rowPre[key];
          commonFieldsPost[key] = postRow[key];
        }
      });
      if (JSON.stringify(commonFieldsPre) !== JSON.stringify(commonFieldsPost)) {
        differences.corrupted.push({ preRow: rowPre, postRow });
      }
    }
  });

  dataPost.forEach(row => {
    if (!preMap.has(row[primaryKey])) {
      differences.newInPost.push(row);
    }
  });

  return differences;
}

// Main function to compare databases and generate report
async function compareDatabases() {
  const clientPreMigration = new Client(dbConfigPreMigration);
  const clientPostMigration = new Client(dbConfigPostMigration);

  try {
    await clientPreMigration.connect();
    await clientPostMigration.connect();

    const preTableNames = await getTableNames(clientPreMigration);
    const postTableNames = await getTableNames(clientPostMigration);

    const commonTableNames = preTableNames.filter(table => postTableNames.includes(table));
    const report = [];

    for (const tableName of commonTableNames) {
      const dataPreMigration = await getDataFromTable(clientPreMigration, tableName);
      const dataPostMigration = await getDataFromTable(clientPostMigration, tableName);

      // Assuming 'id' is the primary key. Change as necessary.
      const primaryKey = 'id';

      const differences = compareData(dataPreMigration, dataPostMigration, primaryKey);

      if (differences.missingInPost.length || differences.newInPost.length || differences.corrupted.length) {
        report.push(`Table: ${tableName}`);
        
        if (differences.missingInPost.length) {
          report.push('Missing in post-migration:');
          report.push(JSON.stringify(differences.missingInPost, null, 2));
          report.push('-----------------------');
        }
        if (differences.newInPost.length) {
          report.push('New in post-migration:');
          report.push(JSON.stringify(differences.newInPost, null, 2));
          report.push('-----------------------');
        }
        if (differences.corrupted.length) {
          report.push('Corrupted rows:');
          differences.corrupted.forEach(diff => {
            report.push(`Pre-migration: ${JSON.stringify(diff.preRow, null, 2)}`);
            report.push(`Post-migration: ${JSON.stringify(diff.postRow, null, 2)}`);
            report.push('-----------------------');
          });
        }
      }
    }

    const reportContent = report.join('\n\n');
    console.log(reportContent);

    // Save report to a file
    fs.writeFileSync('database_comparison_report.txt', reportContent);
  } catch (error) {
    console.error('Error comparing databases:', error);
  } finally {
    await clientPreMigration.end();
    await clientPostMigration.end();
  }
}

// Call the main function
compareDatabases();
