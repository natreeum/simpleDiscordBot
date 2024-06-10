const point = require("../point");
const channelId = "1247450789333438534";

const rollDice = () => {
  return Math.floor(Math.random() * 6) + 1;
};
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let isGameOn = false;

module.exports = async function (message) {
  if (message.channelId !== channelId) return;
  if (message.author.bot) return;
  if (isGameOn) return;
  const msg = message.content.split(" ");
  const command = msg[0];
  const value = Number(msg[1]);
  if (command !== "다이스" && command !== "d") return;
  if (isNaN(value)) return;
  if (!value) return;
  if (value < 1) return message.reply("1 이상의 숫자를 입력해주세요.");

  const curPoint = await point.getPoint(message.author.id);
  if (curPoint < value) return await message.reply("포인트가 부족합니다.");

  isGameOn = true;
  const userMsg = await message.channel.send(
    `<@${message.author.id}>님이 ${value}포인트로 주사위를 던집니다.`
  );
  const p1 = rollDice();
  const p2 = rollDice();
  const pSum = p1 + p2;
  const isPSame = p1 === p2;
  const pMax = Math.max(p1, p2);

  await sleep(1000);
  await userMsg.edit(`🫣 🎲 : **${p1}**  🎲 : **${p2}**`);
  const dealerMsg = await message.channel.send(
    `[🤖] 컴퓨터가 주사위를 던집니다.`
  );

  const d1 = rollDice();
  const d2 = rollDice();
  const dSum = d1 + d2;
  const isDSame = d1 === d2;
  const dMax = Math.max(d1, d2);

  await sleep(1000);
  await dealerMsg.edit(`🤖 🎲 : **${d1}**  🎲 : **${d2}**`);

  if (pSum > dSum) {
    let reward = value;
    if (isPSame) reward *= 2;
    const sendingMessage = `승리하셨습니다! 🎉`;
    const newBalance = await point.addPoint(message.author.id, reward);
    await message.channel.send(
      sendingMessage +
        `\n잔액 : ${newBalance}(+${reward}${isPSame ? "(더블 x2)" : ""})포인트`
    );
    isGameOn = false;
    return;
  }
  if (pSum < dSum) {
    const sendingMessage = `패배하셨습니다.`;
    const newBalance = await point.subPoint(message.author.id, value);
    await message.channel.send(
      sendingMessage + `\n잔액 : ${newBalance}(-${value})포인트`
    );
    isGameOn = false;
    return;
  }
  // draw but win by double
  if (isPSame && !isDSame) {
    let reward = value;
    const sendingMessage = `비겼지만 더블로 승리하셨습니다! 🎉`;
    const newBalance = await point.addPoint(message.author.id, reward);
    await message.channel.send(
      sendingMessage + `\n잔액 : ${newBalance}(+${reward})포인트`
    );
    isGameOn = false;
    return;
  }
  // draw but lose by double
  if (isDSame && !isPSame) {
    const sendingMessage = `비겼지만 더블로 패배하셨습니다.`;
    const newBalance = await point.subPoint(message.author.id, value);
    await message.channel.send(
      sendingMessage + `\n잔액 : ${newBalance}(-${value})포인트`
    );
    isGameOn = false;
    return;
  }
  // draw but win by max
  if (pMax > dMax) {
    let reward = value;
    const sendingMessage = `비겼지만 더 높은 눈의 주사위를 보유하여 승리하셨습니다! 🎉`;
    const newBalance = await point.addPoint(message.author.id, reward);
    await message.channel.send(
      sendingMessage + `\n잔액 : ${newBalance}(+${reward})포인트`
    );
    isGameOn = false;
    return;
  }
  // draw but lose by max
  if (pMax < dMax) {
    const sendingMessage = `비겼지만 더 높은 눈의 주사위를 보유하지 못하여 패배하셨습니다.`;
    const newBalance = await point.subPoint(message.author.id, value);
    await message.channel.send(sendingMessage + `\n잔액 : ${newBalance}`);
    isGameOn = false;
    return;
  }

  const newBal = await point.subPoint(message.author.id, value * 0.2);
  const drawMessage = `비겼습니다. 베팅한 ${value}포인트의 80%를 돌려받습니다.\n잔액 : ${newBal}`;
  await message.channel.send(drawMessage);
  isGameOn = false;
  return;
};
