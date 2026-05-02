const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require('discord.js');

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
    console.log(`🛡️ Castivol v6.0 Sistemi Geri Döndü: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- 🔨 KLASİK KOMUTLAR ---

    if (command === "kur") {
        if (message.author.id !== message.guild.ownerId) return message.reply("Bu yetki sadece Sunucu Sahibi (**Owner**) içindir.");
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('kur_onay').setLabel('Castivol Düzenini Kur').setStyle(ButtonStyle.Danger)
        );

        message.channel.send({ content: "⚠️ Sunucu sıfırlanacak ve Castivol v6.0 hiyerarşisi kurulacak. Onaylıyor musun?", components: [row] });
    }

    if (command === "sil") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const miktar = parseInt(args[0]) || 100;
        await message.channel.bulkDelete(miktar > 100 ? 100 : miktar, true);
        message.channel.send(`🧹 **${miktar}** mesaj temizlendi.`).then(m => setTimeout(() => m.delete(), 2000));
    }

    if (command === "duyuru") {
        const metin = args.join(' ');
        if (!metin) return message.reply("Duyuru metni yazmalısın!");
        const embed = new EmbedBuilder().setTitle("📢 DUYURU").setDescription(metin).setColor("Red");
        message.channel.send({ content: "@everyone", embeds: [embed] });
        message.delete();
    }

    if (command === "ping") return message.reply(`🛰️ Gecikme: ${client.ws.ping}ms`);
});

client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;

    if (i.customId === 'kur_onay') {
        await i.reply({ content: "🛠️ Eski düzen yıkılıyor, Castivol v6.0 inşa ediliyor...", ephemeral: true });

        // 🌪️ TEMİZLİK
        const channels = await i.guild.channels.fetch();
        for (const channel of channels.values()) await channel.delete().catch(() => {});
        const roles = await i.guild.roles.fetch();
        for (const role of roles.values()) { 
            if (!role.managed && role.name !== "@everyone") await role.delete().catch(() => {}); 
        }

        // 👑 ROL HİYERARŞİSİ (V6.0)
        const roller = [
            { ad: '🛡️ Castivol', renk: 'Black' },
            { ad: '👑 owner', renk: 'Red' },
            { ad: '👑 founder', renk: 'DarkRed' },
            { ad: '⚔️ co founder', renk: 'DarkRed' },
            { ad: '💎 admin', renk: 'Green' },
            { ad: '👤 üye', renk: 'Grey' }
        ];

        for (const r of roller) {
            await i.guild.roles.create({ name: r.ad, color: r.renk, hoist: true });
        }

        // 📂 KANAL KURULUMU
        const kategori = await i.guild.channels.create({ name: '─── CASTIVOL ───', type: ChannelType.GuildCategory });
        await i.guild.channels.create({ name: '💬-sohbet', parent: kategori.id });
        await i.guild.channels.create({ name: '📢-duyuru', parent: kategori.id });
        await i.guild.channels.create({ name: '🏮-işlem-merkezi', parent: kategori.id });
    }
});

// 🔑 RAILWAY'DEKİ TOKENI ÇEKER
client.login(process.env.TOKEN);
