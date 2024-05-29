1. need to create config.json

```json
{
  "token": "Your Bot Token"
}
```

2. need to create dev.db

```plain text
~$ touch dev.db
```

3. need to run js script below

```js
const db = require("./db");
const query = `CREATE TABLE users (id INT PRIMARY KEY, point INT DEFAULT 0)`;
db(query).then(console.log).catch(console.error);
```
