const { ButtonBuilder, ButtonStyle } = require("discord.js");
const point = require("../point");
const { ActionRowBuilder } = require("@discordjs/builders");
const games = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class Game {
  constructor(waitingRoomMessage, createUserId, memberLimit, bettingPoint) {
    this.round = 0;
    this.randIdx = -1;
    this.turnIdx = -1;
    this.bangCnt = 0;

    this.isStarted = false;
    this.createUserId = createUserId;
    this.memberList = [createUserId];
    this.memberLimit = memberLimit;
    this.bettingPoint = bettingPoint;
    this.waitingRoomMessage = waitingRoomMessage;
    this.reward = bettingPoint;
    this.lastMessage;

    this.join = async (userId) => {
      if (this.memberList.indexOf(userId) !== -1) return;
      if (this.memberList.length === this.memberLimit)
        return await this.waitingRoomMessage.channel.send(
          "인원이 꽉 찼습니다."
        );
      const subPointRes = await point.subPoint(userId, this.bettingPoint);
      if (subPointRes === false)
        return await this.waitingRoomMessage.channel.send(
          `<@${userId}>님, ` + "포인트가 부족합니다."
        );
      await this.waitingRoomMessage.channel.send(
        `<@${userId}>\n` +
          `${this.bettingPoint}가 차감되었습니다.\n잔여 포인트 : ${subPointRes}`
      );

      this.reward += this.bettingPoint;
      this.memberList.push(userId);
      const joinBtn = new ButtonBuilder()
        .setCustomId("rrJoin")
        .setLabel("참가")
        .setStyle(ButtonStyle.Primary);
      const startBtn = new ButtonBuilder()
        .setCustomId("rrStart")
        .setLabel("시작")
        .setStyle(ButtonStyle.Secondary);
      const row = new ActionRowBuilder().addComponents(joinBtn, startBtn);
      this.reward += this.bettingPoint;
      waitingRoomMessage.edit({
        content: `러시안룰렛 게임을 시작합니다.\n\`베팅 포인트 : ${bettingPoint}\`\n참가하시겠습니까?\n\n\`참가인원 : ${
          this.memberList.length
        }\`\n ${this.memberList.map((e) => `<@${e}>\n`)}\n`,
        components: [row],
      });
    };

    this.startGame = async (userId) => {
      if (userId !== this.createUserId) return;
      this.isStarted = true;
      this.lastMessage = await waitingRoomMessage.edit({
        content: "게임이 시작되었습니다.",
        components: [],
      });
      this.nextRound();
    };

    this.nextRound = async () => {
      if (this.memberList.length === 1) return this.endGame();
      this.round++;
      this.randIdx = Math.floor(Math.random() * 6);
      this.turnIdx = Math.floor(Math.random() * this.memberList.length);
      this.bangCnt = 0;
      const bangBtn = new ButtonBuilder()
        .setCustomId("rrBang")
        .setLabel("😨🔫")
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(bangBtn);
      this.lastMessage = await this.waitingRoomMessage.channel.send({
        content: `\`라운드 : ${this.round}\`\n생존자 : ${
          this.memberList.length
        }\n<@${
          this.memberList[this.turnIdx]
        }>님 차례입니다.\n**아래 버튼을 눌러 자신을 향해 방아쇠를 당기세요!**`,
        components: [row],
      });
    };

    this.useTurn = async (interaction) => {
      if (this.memberList[this.turnIdx] !== interaction.user.id) return;
      this.lastMessage = await this.lastMessage.edit({
        content: `🔫`,
        components: [],
      });
      const rand = Math.floor(Math.random() * 500);
      await sleep(1000 + rand);
      if (this.randIdx === this.bangCnt) {
        await this.lastMessage.edit({ content: `💥🔫`, components: [] });
        await this.lastMessage.channel.send(
          `<@${this.memberList[this.turnIdx]}>님은 죽었습니다.`
        );
        this.memberList.splice(this.turnIdx, 1);
        return this.nextRound();
      } else {
        await this.lastMessage.edit({ content: `🏁🔫`, components: [] });
        await this.lastMessage.channel.send(
          `<@${this.memberList[this.turnIdx]}>님은 살았습니다.`
        );
        this.bangCnt++;
        this.turnIdx = (this.turnIdx + 1) % this.memberList.length;
        const bangBtn = new ButtonBuilder()
          .setCustomId("rrBang")
          .setLabel("😨🔫")
          .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(bangBtn);
        this.lastMessage = await this.lastMessage.channel.send({
          content: `\`라운드 : ${this.round}\`\n<@${
            this.memberList[this.turnIdx]
          }>님 차례입니다.\n**아래 버튼을 눌러 자신을 향해 방아쇠를 당기세요!**`,
          components: [row],
        });
      }
    };

    this.endGame = async () => {
      await point.addPoint(this.memberList[0], this.reward);
      this.lastMessage.channel.send({
        content: `게임이 종료되었습니다.\n\n<@${this.memberList[0]}>님, 생존을 축하드립니다.\n${this.reward}포인트를 획득하셨습니다.`,
        components: [],
      });
      games.pop();
    };
  }
}

module.exports = {
  create: async function (message) {
    const msg = message.content;
    const msgSplit = msg.split(" ");
    const command = msgSplit.shift();
    if (command !== "러시안룰렛") return;
    if (games.length !== 0)
      return await message.reply("이미 생성된 게임이 있습니다.");
    const memberLimit = Number(msgSplit.shift());
    if (!memberLimit || isNaN(memberLimit)) return;
    const bettingPoint = Number(msgSplit.shift());
    if (!bettingPoint || isNaN(bettingPoint)) return;
    const subPointRes = await point.subPoint(message.author.id, bettingPoint);
    if (subPointRes === false)
      return await message.reply(
        `<@${message.author.id}>님, 포인트가 부족하여 게임을 생성할 수 없습니다.`
      );
    const joinBtn = new ButtonBuilder()
      .setCustomId("rrJoin")
      .setLabel("참가")
      .setStyle(ButtonStyle.Primary);
    const startBtn = new ButtonBuilder()
      .setCustomId("rrStart")
      .setLabel("시작")
      .setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder().addComponents(joinBtn, startBtn);
    const waitingRoomMessage = await message.reply({
      content: `러시안룰렛 게임을 시작합니다. \`베팅 포인트 : ${bettingPoint}\`\n참가하시겠습니까?\n\n\`참가인원 : 1\`\n <@${message.author.id}>\n`,
      components: [row],
    });
    games.push(
      new Game(waitingRoomMessage, message.author.id, memberLimit, bettingPoint)
    );
  },

  checkIfGameExists: async (interaction) => {
    if (games.length === 0) {
      await interaction.message.delete();
      await interaction.reply({
        content: "진행중인 게임이 없습니다. 게임을 다시 시작해주세요.",
        components: [],
      });
      return false;
    }
    return true;
  },
  buttonInteraction: async function (interaction) {
    if (interaction.customId == "rrJoin") {
      if (!(await this.checkIfGameExists(interaction))) return;
      const userId = interaction.user.id;
      if (games.length === 0) return;
      games[0].join(userId);
      return interaction.deferUpdate();
    }

    if (interaction.customId == "rrStart") {
      if (!(await this.checkIfGameExists(interaction))) return;
      games[0].startGame(interaction.user.id);
      return interaction.deferUpdate();
    }

    if (interaction.customId == "rrBang") {
      if (!(await this.checkIfGameExists(interaction))) return;
      if (games.length === 0) {
        await interaction.message.delete();
        return await interaction.reply({
          content: "진행중인 게임이 없습니다. 게임을 다시 시작해주세요.",
          components: [],
        });
      }
      games[0].useTurn(interaction);
      return interaction.deferUpdate();
    }
  },
};
