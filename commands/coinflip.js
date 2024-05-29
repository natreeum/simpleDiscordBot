const channelId = "1245226732307615774";
const point = require("../point");

module.exports = async function (message) {
  if (message.channelId !== channelId) return;
  if (message.author.bot) return;
  const msg = message.content;
  const command = msg.split(" ")[0];
  const value = msg.split(" ")[1];
  let inputPoint = Number(msg.split(" ")[2]);
  if (command !== "동전던지기" && command !== "동" && command !== "coinflip")
    return;

  const values = ["앞", "뒤"];
  if (values.includes(value) === false) return;

  if (!inputPoint) return;
  const floorPoint = Math.floor(inputPoint);
  if (floorPoint < 2) return await message.reply("2 포인트 이상 베팅해주세요.");
  const curPoint = await point.getPoint(message.author.id);
  if (curPoint < floorPoint) return await message.reply("포인트가 부족합니다.");
  const newPoint = await point.subPoint(message.author.id, floorPoint);

  const randNum = Math.floor(Math.random() * 100);
  let gameResult;
  let valueResult;
  if (randNum > 55) {
    valueResult = value;
    gameResult = true;
  } else {
    valueResult = values.filter((v) => v !== value)[0];
    gameResult = false;
  }

  const betPoint = floorPoint;
  const betValue = value;
  const betMessage = `\`베팅 및 상금 포인트의 소수점은 버림처리합니다.\`\n[베팅][**${betValue}**] ${betPoint} 포인트 \n\n`;

  if (gameResult) {
    const addValue = Math.floor(floorPoint * 1.9);
    const addedPoint = await point.addPoint(message.author.id, addValue);
    return await message.reply(
      betMessage +
        `[결과] **${valueResult}** 🤩!\n잔액 : ${addedPoint}(+${
          addValue - floorPoint
        })`
    );
  } else
    return await message.reply(
      betMessage + `[결과] **${valueResult}** 😢!\n잔액 : ${newPoint}`
    );
};
