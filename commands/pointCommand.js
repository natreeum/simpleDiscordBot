const point = require("../point");
module.exports = async function (message) {
  const msg = message.content;
  const command = msg.split(" ")[0];
  if (msg === "내포인트" || msg === "내 포인트") {
    const curPoint = await point.getPoint(message.author.id);
    return await message.reply(`현재 포인트 : ${curPoint}`);
  }
  if (command == "포인트추가") {
    // if (message.author.id !== "251349298300715008")
    //   return message.reply("권한이 없습니다.");
    const userId = msg.split(" ")[2];
    const value = Number(msg.split(" ")[1]);
    if (value === NaN || value === undefined) return;
    await point.addPoint(userId, value);
    return await message.reply(
      `<@${userId}>님에게 ${value} 포인트가 추가되었습니다.`
    );
  }
};
