const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');

// --- 7/24 AKTİF TUTMA ---
const app = express();
app.get('/', (req, res) => res.send('Castivol Bot 7/24 Aktif!'));
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
    console.log(`✅ ${client.user.tag} tıkır tıkır çalışıyor!`);
    client.user.setActivity("Castivol Klanını", { type: 3 });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 1. DUYURU KOMUTU
    if (command === "duyuru") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const metin = args.join(" ");
        if (!metin) return message.reply("Duyuru içeriği gir kanka!");
        
        const embed = new EmbedBuilder()
            .setTitle("📢 CASTIVOL DUYURU")
            .setDescription(metin)
            .setColor("#00d4ff")
            .setTimestamp();
            
        message.channel.send({ content: "@everyone", embeds: [embed] });
        message.delete();
    }

    // 2. TICKET / ALIM SİSTEMİ (Hatalı link kaldırıldı!)
    if (command === "ticket-kur") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const embed = new EmbedBuilder()
            .setTitle("🛡️ CASTIVOL MERKEZİ İŞLEM")
            .setDescription("Lütfen işlem yapmak istediğiniz kategoriyi aşağıdaki butonlardan seçin.\n\n**🔹 Klan Alımı:** Klana katılmak için başvuru yapın.\n**🔸 Öneri/Şikayet:** Fikirlerinizi bizimle paylaşın.\n**🤝 Partnerlik:** İş birliği talepleri için.")
            .setColor("#2f3136");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('t_alim').setLabel('Klan Alımı').setStyle(ButtonStyle.Success).setEmoji('⚔️'),
            new ButtonBuilder().setCustomId('t_oneri').setLabel('Öneri/Şikayet').setStyle(ButtonStyle.Secondary).setEmoji('💡'),
            new ButtonBuilder().setCustomId('t_partner').setLabel('Partnerlik').setStyle(ButtonStyle.Primary).setEmoji('🤝')
        );

        message.channel.send({ embeds: [embed], components: [row] });
    }

    // 3. UYAR KOMUTU
    if (command === "uyar") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const user = message.mentions.users.first();
        if (!user) return message.reply("Kimi uyaracağız?");
        message.channel.send(`⚠️ ${user}, **Castivol** kurallarına uyum sağlaman gerekiyor. Devamı cezai işlem olacaktır.`);
    }

    // 4. TEST
    if (command === "sa") {
        message.reply("Aleyküm Selam kanka, bot aktif!");
    }
});

// --- TICKET BUTONLARI ---
client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;
    
    let kategori = "";
    if (i.customId === 't_alim') kategori = "alim";
    if (i.customId === 't_oneri') kategori = "oneri";
    if (i.customId === 't_partner') kategori = "partner";

    if (kategori !== "") {
        const c = await i.guild.channels.create({
            name: `${kategori}-${i.user.username}`,
            permissionOverwrites: [
                { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });

        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`Hoş Geldin! [${kategori.toUpperCase()}]`)
            .setDescription(`Merhaba ${i.user}, yetkililer birazdan burada olur. Lütfen detayları yaz.`)
            .setColor("#00ff00");

        c.send({ content: `${i.user} | @here`, embeds: [welcomeEmbed] });
        i.reply({ content: `Kanalın açıldı: ${c}`, ephemeral: true });
    }
});

client.login(process.env.TOKEN);
