const sqlite = require("sqlite3");

function executeQuery(query, params = []) {
  const db = new sqlite.Database("dev.db", (err) => {
    if (err) {
      console.error(err.message);
    } else {
    }
  });
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        db.close();
        reject(err);
      } else {
        db.close();
        resolve(rows);
      }
    });
  });
}

module.exports = executeQuery;
