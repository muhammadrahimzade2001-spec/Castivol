const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType, StringSelectMenuBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const PREFIX = "!";

// --- ⚙️ HATAYI ÇÖZELİM ---
// Buradaki sürece dikkat: Token'ı en alta tırnak içine yapıştıracaksın!

client.on('ready', () => {
    console.log(`🚀 SİSTEM ONLINE: ${client.user.tag}`);
    client.user.setActivity('Castivol Yönetim Sistemi', { type: 3 }); // İzliyor...
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- 🛠️ 20+ KOMUTLUK DEV LİSTE ---

    // 1. Yardım
    if (command === "yardım") {
        const help = new EmbedBuilder()
            .setTitle("🛡️ Castivol Komut Paneli")
            .setColor("#ff0000")
            .setDescription("**Owner** ve **Founder** yetkileri için tam donanımlı sistem.")
            .addFields(
                { name: '🏗️ Ana Sistem', value: '`!kur`, `!panel-at`, `!sıfırla`' },
                { name: '🔨 Moderasyon', value: '`!sil`, `!ban`, `!kick`, `!unban`, `!kilit`, `!yavaş-mod`' },
                { name: '📢 Duyuru/Etkinlik', value: '`!duyuru`, `!savaş-duyuru`, `!o-gecesi`, `!çekiliş`' },
                { name: '⚙️ Yetki/Yönetim', value: '`!rol-ver`, `!rol-al`, `!yetki-say`, `!sicil`' },
                { name: 'ℹ️ Genel', value: '`!ping`, `!istatistik`, `!avatar`, `!sunucu-bilgi`, `!reboot`' }
            );
        return message.channel.send({ embeds: [help] });
    }

    // 2. Sil
    if (command === "sil") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const amount = parseInt(args[0]) || 100;
        await message.channel.bulkDelete(amount > 100 ? 100 : amount, true);
        return message.channel.send(`🧹 **${amount}** mesaj imha edildi.`).then(m => setTimeout(() => m.delete(), 2000));
    }

    // 3. Duyuru (Gelişmiş)
    if (command === "duyuru") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const msg = args.join(' ');
        const embed = new EmbedBuilder().setTitle("🚨 RESMİ DUYURU").setDescription(msg).setColor("Red").setFooter({ text: "Castivol Management" });
        message.channel.send({ content: "@everyone", embeds: [embed] });
        return message.delete();
    }

    // 4. Savaş Duyuru (Kırmızı Alarm)
    if (command === "savaş-duyuru") {
        const embed = new EmbedBuilder().setTitle("⚔️ SAVAŞ ALARMI").setDescription(args.join(' ') || "Acil kadro toplanın!").setColor("DarkRed");
        return message.channel.send({ content: "@everyone", embeds: [embed] });
    }

    // 5. Oyun Gecesi
    if (command === "o-gecesi") {
        const embed = new EmbedBuilder().setTitle("🎮 OYUN GECESİ BAŞLIYOR").setDescription("Herkes ses kanalına, eğlence başlıyor!").setColor("Purple");
        return message.channel.send({ content: "@everyone", embeds: [embed] });
    }

    // 6. Ban
    if (command === "ban") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return;
        const member = message.mentions.members.first();
        if (member) await member.ban({ reason: 'Yargı Dağıtıldı.' });
        return message.reply("🔨 Yasaklandı.");
    }

    // 7. Kick
    if (command === "kick") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return;
        const member = message.mentions.members.first();
        if (member) await member.kick();
        return message.reply("👢 Atıldı.");
    }

    // 8. Kilit
    if (command === "kilit") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;
        message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false });
        return message.reply("🔒 Kanal kilitlendi.");
    }

    // 9. Yavaş Mod
    if (command === "yavaş-mod") {
        const time = parseInt(args[0]) || 5;
        message.channel.setRateLimitPerUser(time);
        return message.reply(`🕒 Mod: ${time}s`);
    }

    // 10. Rol Ver
    if (command === "rol-ver") {
        const target = message.mentions.members.first();
        const role = message.mentions.roles.first();
        if (target && role) await target.roles.add(role);
        return message.reply("✅ Rol verildi.");
    }

    // 11. Rol Al
    if (command === "rol-al") {
        const target = message.mentions.members.first();
        const role = message.mentions.roles.first();
        if (target && role) await target.roles.remove(role);
        return message.reply("❌ Rol geri alındı.");
    }

    // 12. Ping
    if (command === "ping") return message.reply(`🛰️ Gecikme: ${client.ws.ping}ms`);

    // 13. Sunucu Bilgi
    if (command === "sunucu-bilgi") {
        const embed = new EmbedBuilder().setTitle(message.guild.name).setThumbnail(message.guild.iconURL()).addFields({ name: 'Üye Sayısı', value: `${message.guild.memberCount}` });
        return message.channel.send({ embeds: [embed] });
    }

    // 14. Avatar
    if (command === "avatar") {
        const user = message.mentions.users.first() || message.author;
        return message.reply(user.displayAvatarURL({ size: 1024, dynamic: true }));
    }

    // 15. İstatistik
    if (command === "istatistik") {
        return message.reply(`🛡️ Castivol Gücü: **${message.guild.memberCount}** üye aktif!`);
    }

    // 16. Reboot
    if (command === "reboot") {
        if (message.author.id !== message.guild.ownerId) return;
        await message.reply("🔄 Sistem yeniden başlatılıyor...");
        process.exit();
    }

    // 17. Çekiliş (Taslak)
    if (command === "çekiliş") {
        const prize = args.join(' ') || "Ödül Belirlenmedi";
        const embed = new EmbedBuilder().setTitle("🎁 ÇEKİLİŞ").setDescription(`Ödül: **${prize}**\nKatılmak için 🎉 emojisine tıkla!`).setColor("Gold");
        const msg = await message.channel.send({ embeds: [embed] });
        return msg.react("🎉");
    }

    // 18. Yetki Say
    if (command === "yetki-say") {
        const admins = message.guild.members.cache.filter(m => m.permissions.has(PermissionsBitField.Flags.Administrator)).size;
        return message.reply(`🚨 Sunucuda toplam **${admins}** yetkili bulunuyor.`);
    }

    // 19. Kur (Mega İnşa)
    if (command === "kur") {
        if (message.author.id !== message.guild.ownerId) return message.reply("Bu işlem sadece **Owner** tarafından yapılabilir.");
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('kur_onay').setLabel('İnşayı Başlat').setStyle(ButtonStyle.Success));
        return message.channel.send({ content: "🏯 **Castivol İmparatorluğu**'nu kurmaya hazır mısın?", components: [row] });
    }

    // 20. Panel At
    if (command === "panel-at") {
        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('tk_menu').setPlaceholder('Yapılacak işlemi seçin...').addOptions([
                { label: 'Klan Alımı', value: 'klan', emoji: '⚔️' },
                { label: 'Partnerlik', value: 'partner', emoji: '🤝' },
                { label: 'Merge', value: 'merge', emoji: '💠' },
                { label: 'Destek', value: 'destek', emoji: '🎫' }
            ])
        );
        return message.channel.send({ content: "🧧 **İşlem Merkezi**", components: [menu] });
    }
});

// --- 🖱️ INTERACTION HANDLER ---
client.on('interactionCreate', async (i) => {
    if (i.customId === 'kur_onay') {
        await i.reply({ content: "🏗️ Sıfırlanıyor ve kuruluyor...", ephemeral: true });

        // Temizlik
        const channels = await i.guild.channels.fetch();
        for (const c of channels.values()) await c.delete().catch(() => {});
        const roles = await i.guild.roles.fetch();
        for (const r of roles.values()) { if (!r.managed && r.name !== "@everyone") await r.delete().catch(() => {}); }

        // ROLLER (OWNER > FOUNDER)
        const roleData = [
            { n: '🛡️ Castivol', c: '#000000' },
            { n: '👑 owner', c: '#ff0000' }, // En Üstte
            { n: '👑 founder', c: '#990000' },
            { n: '⚔️ co founder', c: '#990000' },
            { n: '🎖️ co owner', c: '#ff4d4d' },
            { n: '✨ jr.founder', c: '#ff4d4d' },
            { n: '💎 admin', c: '#2ecc71' },
            { n: '🧩 jr.admin', c: '#2ecc71' },
            { n: '🤝 Yardımcı', c: '#3498db' },
            { n: '📢 Asistan', c: '#3498db' },
            { n: '🛡️ AAC', c: '#f1c40f' },
            { n: '🛡️ deneme aac', c: '#f1c40f' },
            { n: '📜 rehber', c: '#9b59b6' },
            { n: '👤 üye', c: '#bdc3c7' },
            { n: '⚡ abone', c: '#e67e22' }
        ];
        for (const r of roleData) await i.guild.roles.create({ name: r.n, color: r.c, hoist: true });

        // Kanallar
        const cat = await i.guild.channels.create({ name: '─── CASTIVOL MERKEZ ───', type: ChannelType.GuildCategory });
        await i.guild.channels.create({ name: '📢-duyuru', parent: cat.id });
        const p = await i.guild.channels.create({ name: '🧧-işlem-merkezi', parent: cat.id });
        await i.guild.channels.create({ name: '💬-sohbet', parent: cat.id });
        await i.guild.channels.create({ name: '⚡-abone-kanıt', parent: cat.id });
        
        // İşlem Panelini At
        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('tk_menu').setPlaceholder('Kategori Seç...').addOptions([
                { label: 'Klan Alımı', value: 'klan', emoji: '⚔️' },
                { label: 'Partnerlik', value: 'partner', emoji: '🤝' },
                { label: 'Destek', value: 'destek', emoji: '🎫' }
            ])
        );
        await p.send({ content: "🧧 **İşlem Başlatmak İçin Seçin**", components: [menu] });
    }

    if (i.customId === 'tk_menu') {
        const ch = await i.guild.channels.create({
            name: `${i.values[0]}-${i.user.username}`,
            permissionOverwrites: [{ id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }, { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }]
        });
        await ch.send({ content: `Hoş geldin ${i.user}.`, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('sil').setLabel('Kapat').setStyle(ButtonStyle.Danger))] });
        await i.reply({ content: `✅ Oda açıldı: ${ch}`, ephemeral: true });
    }

    if (i.customId === 'sil') {
        await i.reply("Kapatılıyor...");
        setTimeout(() => i.channel.delete(), 2000);
    }
});

// --- ‼️ KRİTİK NOKTA ‼️ ---
client.login("BURAYA_DISCORD_DEVELOPER_PORTAL_DAKI_TOKENI_YAZ");
