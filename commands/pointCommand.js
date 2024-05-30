const point = require("../point");

function parseUserId(m) {
  // message format : <@123456789012345678>
  const id = m.split("<@")[1].split(">")[0];
  if (id.length < 18) return undefined;
  return id;
}

module.exports = async function (message) {
  const msg = message.content;
  const command = msg.split(" ")[0];
  if (msg === "내포인트" || msg === "내 포인트") {
    const curPoint = await point.getPoint(message.author.id);
    return await message.reply(`현재 포인트 : ${curPoint}`);
  }
  if (command == "포인트추가") {
    if (message.author.id !== "251349298300715008")
      return message.reply("권한이 없습니다.");
    const userId = parseUserId(msg.split(" ")[2]);
    const value = Number(msg.split(" ")[1]);
    if (isNaN(value) || value === undefined || userId === undefined) return;
    const result = await point.addPoint(userId, value);
    return await message.reply(
      `<@${userId}>님에게 ${value} 포인트가 추가되었습니다.\n현재 포인트 : ${result}`
    );
  }
  if (command == "포인트전송") {
    const value = Number(msg.split(" ")[1]);
    const userId = parseUserId(msg.split(" ")[2]);
    if (isNaN(value) || value === undefined || userId === undefined) return;
    const subPointRes = await point.subPoint(message.author.id, value);
    if (subPointRes === false)
      return await message.reply("포인트가 부족합니다.");
    const result = await point.addPoint(userId, value);
    return await message.reply(
      `<@${message.author.id}>님이 <@${userId}>님에게 ${value} 포인트를 전송했습니다.\n<@${userId}>님의 현재 포인트 : ${result}`
    );
  }
};
