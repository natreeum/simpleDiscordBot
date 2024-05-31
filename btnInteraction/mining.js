const point = require("../point");
const { ButtonBuilder, ButtonStyle } = require("discord.js");
const { ActionRowBuilder } = require("@discordjs/builders");

const messages = {};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const miningChannel = "1245663517902766111";

module.exports = {
  sendInitialMsg: async function (client) {
    const channel = await client.channels.fetch(miningChannel);
    const startButton = new ButtonBuilder()
      .setCustomId("startMining")
      .setLabel("채굴")
      .setStyle(ButtonStyle.Primary);
    return await channel.send({
      content: "⛏️ 채굴하기",
      components: [new ActionRowBuilder().addComponents(startButton)],
    });
  },
  start: async function (interaction) {
    // 봇이 클릭한 경우
    if (interaction.user.bot) return;

    const customId = interaction.customId;
    if (customId !== "startMining") return;

    const randNum1 = Math.floor(Math.random() * 51);
    const randNum2 = Math.floor(Math.random() * 51);
    const randNum3 = Math.floor(Math.random() * 51);

    const answer = randNum1 + randNum2 + randNum3;
    let wrong1 = Math.floor(Math.random() * 151);
    let wrong2 = Math.floor(Math.random() * 151);
    while (wrong1 === answer) wrong1 = Math.floor(Math.random() * 151);
    while (wrong2 === answer) wrong2 = Math.floor(Math.random() * 151);

    const answerIdx = Math.floor(Math.random() * 3);
    const wrong1Idx = (answerIdx + 1) % 3;
    const wrong2Idx = (answerIdx + 2) % 3;

    const answers = [];

    answers[answerIdx] = answer;
    answers[wrong1Idx] = wrong1;
    answers[wrong2Idx] = wrong2;

    const buttons = answers.map((value) =>
      new ButtonBuilder()
        .setCustomId(`miningButton:${answer}:${value}:${interaction.user.id}`)
        .setLabel(value.toString())
        .setStyle(ButtonStyle.Primary)
    );

    const explanation = `0~50의 숫자 중 3개의 숫자가 나옵니다. 모든 숫자의 합을 3초안에 맞추면 100포인트를 얻습니다.\n\n\`${randNum1} + ${randNum2} + ${randNum3} = ?\``;
    const row = new ActionRowBuilder().addComponents(...buttons);
    const reply = await interaction.update({
      content: explanation,
      components: [row],
    });

    messages[interaction.user.id] = {
      isSelected: false,
    };
    const userId = interaction.user.id;
    const client = interaction.client;
    await sleep(3000);
    if (!messages[userId].isSelected) {
      await reply.edit({
        content: "시간이 초과되었습니다.",
        components: [],
      });
    }
    delete messages[userId];
    await this.sendInitialMsg(client);
  },

  buttonInteraction: async function (interaction) {
    const btnType = interaction.customId.split(":")[0];
    if (btnType !== "miningButton") return;

    const answer = interaction.customId.split(":")[1];
    const value = interaction.customId.split(":")[2];
    const userId = interaction.customId.split(":")[3];

    if (interaction.user.id !== userId) return;

    messages[userId].isSelected = true;

    if (answer === value) {
      let winPoint = 100;

      const percent = Math.floor(Math.random() * 100);
      let isJackpot = false;
      if (percent < 5) {
        winPoint *= 10;
        isJackpot = true;
      }

      const curPoint = await point.addPoint(userId, winPoint);
      await interaction.update({
        content: `${
          isJackpot ? `🎉\`채굴 10배 당첨!!\`🎉\n\n` : ""
        } 🙆‍♂️정답입니다! ${winPoint}포인트를 얻었습니다.\n현재 포인트 : ${curPoint}`,
        components: [],
      });
    } else {
      await interaction.update({
        content: `🙅‍♀️틀렸습니다! 정답은 ${answer}입니다.`,
        components: [],
      });
    }
  },
};
