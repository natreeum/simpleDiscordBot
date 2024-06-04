const db = require("./db");
module.exports = {
  getPoint: async function (id) {
    const query = "SELECT point FROM users WHERE id = ?";
    const data = await db(query, [id]);
    if (data.length === 0) {
      const query2 = "INSERT INTO users (id) VALUES (?)";
      await db(query2, [id]);
      return 0;
    }
    return data[0].point;
  },
  addPoint: async function (id, value) {
    const curPoint = await this.getPoint(id);
    const query = "UPDATE users SET point = ? WHERE id = ?";
    value = Math.floor(value);
    await db(query, [curPoint + value, id]);
    return await this.getPoint(id);
  },
  subPoint: async function (id, value) {
    const curPoint = await this.getPoint(id);
    const query = "UPDATE users SET point = ? WHERE id = ?";
    if (curPoint - value < 0) return false;
    value = Math.floor(value);
    await db(query, [curPoint - value, id]);
    return await this.getPoint(id);
  },
  setPoint: async function () {},
};
