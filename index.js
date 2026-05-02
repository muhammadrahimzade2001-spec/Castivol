const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Castivol Bot Aktif!'));
app.listen(process.env.PORT || 3000);

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
    console.log(`✅ ${client.user.tag} Duyuru ve tüm sistemler aktif!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 📢 DUYURU KOMUTU (YENİDEN DÜZENLENDİ)
    if (command === "duyuru") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.reply("Yetkin yok kanka!");
        const metin = args.join(" ");
        if (!metin) return message.reply("Duyuru metni yazmalısın! Örn: !duyuru Merhaba");

        const embed = new EmbedBuilder()
            .setTitle("📢 CASTIVOL RESMİ DUYURU")
            .setDescription(metin)
            .setColor("#00fbff")
            .setFooter({ text: `Duyuruyu Yapan: ${message.author.username}` })
            .setTimestamp();

        try {
            await message.channel.send({ content: "@everyone", embeds: [embed] });
            await message.delete(); // Kendi yazdığın komutu siler, sadece botun mesajı kalır.
        } catch (err) {
            console.log("Duyuru hatası:", err);
            message.channel.send("Duyuru gönderirken bir hata oluştu!");
        }
    }

    // 🛡️ DİĞER KOMUTLAR (SA, SİL, KLAN)
    if (command === "sa") return message.reply("Aleyküm Selam kanka!");

    if (command === "sil") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const miktar = parseInt(args[0]);
        if (!miktar || miktar < 1 || miktar > 100) return message.reply("1-100 arası sayı gir.");
        await message.channel.bulkDelete(miktar, true);
        return message.channel.send(`✅ ${miktar} mesaj silindi.`).then(m => setTimeout(() => m.delete(), 3000));
    }

    if (command === "klan") {
        const embed = new EmbedBuilder()
            .setTitle("🛡️ CASTIVOL")
            .setDescription("Güç, Sadakat, Zafer!")
            .setColor("#ffcc00");
        return message.channel.send({ embeds: [embed] });
    }
});

client.login(process.env.TOKEN);
