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
    console.log(`✅ ${client.user.tag} Tüm Komutlarla Hazır!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 1. SA KOMUTU (Çalışmıyor dediğin)
    if (command === "sa") {
        return message.reply("Aleyküm Selam kanka, Castivol Bot görevinin başında! 🛡️");
    }

    // 2. SİL KOMUTU (Çalışmıyor dediğin)
    if (command === "sil") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply("Bu komut için 'Mesajları Yönet' yetkin olmalı kanka.");
        const miktar = parseInt(args[0]);
        if (!miktar || miktar < 1 || miktar > 100) return message.reply("1-100 arası bir sayı yazmalısın.");

        await message.channel.bulkDelete(miktar, true).catch(err => message.reply("Eski mesajları (14 günden eski) silemiyorum kanka."));
        return message.channel.send(`✅ **${miktar}** mesaj başarıyla temizlendi!`).then(m => setTimeout(() => m.delete(), 3000));
    }

    // 3. KLAN KOMUTU (Çalışmıyor dediğin)
    if (command === "klan") {
        const embed = new EmbedBuilder()
            .setTitle("🛡️ CASTIVOL KLAN BİLGİSİ")
            .setDescription("Biz bir aileden fazlasıyız! Castivol olarak rekabetçi oyunlarda zirveyi hedefliyoruz.")
            .addFields(
                { name: '🎮 Ana Oyunlar', value: 'Valorant, LoL, CS2, Roblox, MC, Brawl Stars', inline: true },
                { name: '🏆 Hedef', value: 'Adil ve güçlü bir topluluk.', inline: true }
            )
            .setColor("#00ffcc");
        return message.channel.send({ embeds: [embed] });
    }

    // 4. SAVAŞ DUYURU
    if (command === "savaş-duyuru") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const icerik = args.join(" ");
        if (!icerik) return message.reply("Savaş detaylarını yaz!");
        const embed = new EmbedBuilder().setTitle("⚔️ SAVAŞ ÇAĞRISI!").setDescription(icerik).setColor("#ff0000");
        const m = await message.channel.send({ content: "@everyone", embeds: [embed] });
        await m.react("✅");
        await m.react("❌");
    }

    // 5. TICKET KUR
    if (command === "ticket-kur") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const embed = new EmbedBuilder().setTitle("🛡️ CASTIVOL İŞLEM MERKEZİ").setDescription("Alım veya Şikayet için tıkla!").setColor("#2f3136");
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('t_alim').setLabel('Klan Alımı').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('t_oneri').setLabel('Öneri/Şikayet').setStyle(ButtonStyle.Secondary)
        );
        message.channel.send({ embeds: [embed], components: [row] });
    }

    // 6. ROLAL KUR
    if (command === "rolal-kur") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('rol_secim').setPlaceholder('Oyun seç...').addOptions([
                { label: 'Valorant', value: 'ROL_ID_YAZ', emoji: '🔫' },
                { label: 'Minecraft', value: 'ROL_ID_YAZ', emoji: '⛏️' }
                // Diğerlerini buraya ekleyebilirsin
            ])
        );
        message.channel.send({ content: "Oyun rollerini al!", components: [row] });
    }
});

client.login(process.env.TOKEN);
