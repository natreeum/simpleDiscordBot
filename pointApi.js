const point = require("./point");
const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const auth = req.headers.authorization;
  const apiKey = require("./config.json").api_key;
  if (auth !== `Bearer ${apiKey}`)
    return res.status(401).json({ message: "Unauthorized" });
  else {
    next();
  }
});

app.patch("/addpoint", async (req, res) => {
  const { userId, value } = req.body;
  if (!userId || !value)
    return res.status(400).json({ message: "Bad Request" });
  const curPoint = await point.addPoint(userId, value);
  res.json({ point: curPoint });
});
app.patch("/subpoint", async (req, res) => {
  const { userId, value } = req.body;
  if (!userId || !value)
    return res.status(400).json({ message: "Bad Request" });
  const curPoint = await point.subPoint(userId, value);
  if (!curPoint) return res.json({ message: "Insufficient Balance" });
  res.json({ point: curPoint });
});

const port = 80;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
