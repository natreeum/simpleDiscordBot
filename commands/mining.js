const point = require("../point");
const { ButtonBuilder, ButtonStyle } = require("discord.js");
const { ActionRowBuilder } = require("@discordjs/builders");

const messages = {};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  command: async function (message) {
    if (message.author.bot) return;
    const msg = message.content;
    if (msg !== "채굴") return;

    if (messages[message.author.id])
      return await message.reply("이미 진행중인 게임이 있습니다.");

    const randNum1 = Math.floor(Math.random() * 51);
    const randNum2 = Math.floor(Math.random() * 51);
    const randNum3 = Math.floor(Math.random() * 51);

    const answer = randNum1 + randNum2 + randNum3;
    const wrong1 = Math.floor(Math.random() * 151);
    const wrong2 = Math.floor(Math.random() * 151);

    const answerIdx = Math.floor(Math.random() * 3);
    const wrong1Idx = (answerIdx + 1) % 3;
    const wrong2Idx = (answerIdx + 2) % 3;

    const answers = [];

    answers[answerIdx] = answer;
    answers[wrong1Idx] = wrong1;
    answers[wrong2Idx] = wrong2;

    const buttons = answers.map((value) =>
      new ButtonBuilder()
        .setCustomId(`miningButton:${answer}:${value}:${message.author.id}`)
        .setLabel(value.toString())
        .setStyle(ButtonStyle.Primary)
    );

    const explanation = `0~50의 숫자 중 3개의 숫자가 나옵니다. 모든 숫자의 합을 3초안에 맞추면 100포인트를 얻습니다.\n\n\`${randNum1} + ${randNum2} + ${randNum3} = ?\``;
    const row = new ActionRowBuilder().addComponents(...buttons);
    const reply = await message.reply({
      content: explanation,
      components: [row],
    });

    messages[message.author.id] = { reply, status: false };
    await sleep(3000);
    const isSolved = messages[message.author.id]?.status;
    if (!isSolved) {
      if (messages[message.author.id])
        await messages[message.author.id].reply.edit({
          content: `시간 초과! 정답은 ${answer}입니다.`,
          components: [],
        });
    }
    delete messages[message.author.id];
  },
  buttonInteraction: async function (interaction) {
    const btnType = interaction.customId.split(":")[0];
    if (btnType !== "miningButton") return;

    const answer = interaction.customId.split(":")[1];
    const value = interaction.customId.split(":")[2];
    const userId = interaction.customId.split(":")[3];

    if (interaction.user.id !== userId) return;

    if (answer === value) {
      const percent = Math.floor(Math.random() * 100);

      let winPoint;
      let isJackpot = false;
      if (percent < 5) {
        winPoint = 1000;
        isJackpot = true;
      } else winPoint = 100;

      const curPoint = await point.addPoint(userId, winPoint);
      await interaction.update({
        content: `${
          isJackpot ? `🎉\`채굴 10배 당첨!!\`🎉\n\n` : ""
        }정답입니다! ${winPoint}포인트를 얻었습니다.\n현재 포인트 : ${curPoint}`,
        components: [],
      });
      delete messages[userId];
    } else {
      await interaction.update({
        content: `틀렸습니다! 정답은 ${answer}입니다.`,
        components: [],
      });
      delete messages[userId];
    }
  },
};
