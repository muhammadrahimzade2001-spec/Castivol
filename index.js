const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');

// --- 7/24 AKTİF TUTMA SİSTEMİ ---
const app = express();
app.get('/', (req, res) => res.send('Castivol Bot 7/24 Aktif!'));
app.listen(process.env.PORT || 3000); // Port hatasını otomatik çözer

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const PREFIX = "!";

client.on('ready', () => {
    console.log(`🚀 Bot ${client.user.tag} olarak giriş yaptı!`);
});

// --- KOMUTLAR ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Duyuru Komutu
    if (command === "duyuru") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const text = args.join(" ");
        const embed = new EmbedBuilder()
            .setTitle("📢 CASTIVOL DUYURU")
            .setDescription(text || "Duyuru metni girilmedi!")
            .setColor("#00BFFF");
        message.channel.send({ content: "@everyone", embeds: [embed] });
    }

    // Ticket Sistemi Kurulumu
    if (command === "ticket-kur") {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_ac').setLabel('Destek Talebi Aç').setStyle(ButtonStyle.Primary)
        );
        message.channel.send({ content: "Yardım almak için butona tıklayın!", components: [row] });
    }
});

// TOKEN'I SİSTEM AYARLARINDAN ÇEKER
client.login(process.env.TOKEN);
