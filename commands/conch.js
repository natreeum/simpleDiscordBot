const point = require("../point");
const channelId = "1245246347767058432";

module.exports = async function (message) {
  if (message.channelId !== channelId) return;
  if (message.author.bot) return;
  const msg = message.content.split(" ");
  const command = msg.shift();
  const inputMessage = msg.join(" ");
  if (command !== "마법의소라고동") return;

  const answers = [
    "언젠가는 하겠죠.",
    "가만있어요.",
    "다 안 돼요.",
    "그것도 안 돼요.",
    "좋아요.",
    "다시 한 번 물어봐요.",
    "안 돼요.",
  ];

  const answer = answers[Math.floor(Math.random() * answers.length)];

  const curPoint = await point.getPoint(message.author.id);
  if (curPoint < 10) return await message.reply("포인트가 부족합니다.");
  const newBalance = await point.subPoint(message.author.id, 10);
  return await message.reply(
    `[질문] ${inputMessage}\n[답변] ${answer}\n잔액 : ${newBalance}`
  );
};
