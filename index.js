const { 
    Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, 
    ActionRowBuilder, ButtonBuilder, ButtonStyle 
} = require('discord.js');
const express = require('express');

// --- REPLIT İÇİN 7/24 AKTİF TUTMA (DÜZELTİLMİŞ PORT) ---
const app = express();
app.get('/', (req, res) => res.send('Castivol Bot 7/24 Yayında!'));
// Replit'in istediği portu otomatik ayarlar, hata vermez
const port = process.env.PORT || 8080; 
app.listen(port, () => console.log(`Web sunucusu ${port} portunda aktif.`));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

const PREFIX = "!";

client.on('ready', () => {
    console.log(`✅ Giriş Yapıldı: ${client.user.tag}`);
    client.user.setActivity("Castivol Klanını", { type: 3 });
});

// --- KOMUTLAR ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 📢 Duyuru Sistemi
    if (command === "duyuru") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const metin = args.join(" ");
        if (!metin) return message.reply("Duyuru metni yaz!");
        const embed = new EmbedBuilder()
            .setTitle("📢 CASTIVOL DUYURU")
            .setDescription(metin)
            .setColor("#0099ff")
            .setTimestamp();
        message.channel.send({ content: "@everyone", embeds: [embed] });
        message.delete();
    }

    // ⚠️ Uyarı Sistemi
    if (command === "uyar") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const user = message.mentions.users.first();
        if (!user) return message.reply("Kimi uyaracağız?");
        message.channel.send(`⚠️ ${user}, **Castivol** kurallarına uyman konusunda uyarıldın!`);
    }

    // 📩 Ticket Kurulum
    if (command === "ticket-kur") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('t_ac').setLabel('Destek Aç').setStyle(ButtonStyle.Primary).setEmoji('🎫')
        );
        const embed = new EmbedBuilder()
            .setTitle("Castivol Destek")
            .setDescription("Destek veya başvuru için butona tıkla!")
            .setColor("#00bfff");
        message.channel.send({ embeds: [embed], components: [row] });
    }

    // 🎉 Çekiliş Sistemi (Basit)
    if (command === "cekilis") {
        const odul = args.join(" ");
        if (!odul) return message.reply("Ödülü yaz!");
        message.channel.send(`🎉 **ÇEKİLİŞ:** ${odul}\nKatılmak için 5 saniye içinde herhangi bir şey yaz!`);
        const collector = message.channel.createMessageCollector({ time: 5000 });
        let p = [];
        collector.on('collect', m => { if(!m.author.bot && !p.includes(m.author.id)) p.push(m.author.id); });
        collector.on('end', () => {
            if(p.length === 0) return message.channel.send("Katılan olmadı.");
            const w = p[Math.floor(Math.random() * p.length)];
            message.channel.send(`🎊 Kazanan: <@${w}>! Ödül: **${odul}**`);
        });
    }
});

// --- TICKET ETKİLEŞİM ---
client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;
    if (i.customId === 't_ac') {
        const c = await i.guild.channels.create({
            name: `destek-${i.user.username}`,
            permissionOverwrites: [
                { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });
        i.reply({ content: `Kanalın açıldı: ${c}`, ephemeral: true });
        c.send(`Hoş geldin ${i.user}, yetkililer burada olacak.`);
    }
});

client.login(process.env.TOKEN);
