const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType, StringSelectMenuBuilder } = require('discord.js');
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Castivol God Mode Online! 🛡️'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

const PREFIX = "!";

client.on('ready', () => { console.log(`🚀 ${client.user.tag} İmparatorluk sistemi başlatıldı!`); });

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- 🛠️ MODERASYON & YÖNETİM KOMUTLARI (15+ ADET) ---

    // 1. Gelişmiş Yardım
    if (command === "yardım") {
        const embed = new EmbedBuilder()
            .setTitle("🛡️ Castivol Komut Merkezi")
            .setColor("#000000")
            .addFields(
                { name: '🏗️ Ana Sistem', value: '`!kur`, `!sıfırla`, `!panel-at`' },
                { name: '🔨 Moderasyon', value: '`!sil`, `!ban`, `!kick`, `!unban`, `!yasaklı-kelime`' },
                { name: '📢 Duyuru/Etkinlik', value: '`!duyuru`, `!savaş-duyuru`, `!o-gecesi`, `!çekiliş`' },
                { name: '👤 Kullanıcı/Yetki', value: '`!rol-ver`, `!rol-al`, `!yavaş-mod`, `!kilit`, `!istatistik`' },
                { name: 'ℹ️ Bilgi', value: '`!ping`, `!sunucu-bilgi`, `!avatar`' }
            );
        return message.channel.send({ embeds: [embed] });
    }

    // 2. Sil
    if (command === "sil") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const sayi = parseInt(args[0]) || 100;
        await message.channel.bulkDelete(sayi > 100 ? 100 : sayi, true);
        return message.channel.send(`🧹 **${sayi}** mesaj süpürüldü!`).then(m => setTimeout(() => m.delete(), 2000));
    }

    // 3. Duyuru
    if (command === "duyuru") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const msg = args.join(' ');
        const embed = new EmbedBuilder().setTitle("📢 Duyuru").setDescription(msg).setColor("Red").setTimestamp();
        message.channel.send({ content: "@everyone", embeds: [embed] });
        return message.delete();
    }

    // 4. Savaş Duyuru
    if (command === "savaş-duyuru") {
        const embed = new EmbedBuilder().setTitle("⚔️ SAVAŞ ÇAĞRISI").setDescription(args.join(' ') || "Kadro toplanıyor, acil destek!").setColor("DarkRed");
        return message.channel.send({ content: "@everyone", embeds: [embed] });
    }

    // 5. Oyun Gecesi
    if (command === "o-gecesi") {
        const embed = new EmbedBuilder().setTitle("🎮 OYUN GECESİ").setDescription("Bu gece Castivol meydanında oyun var! Hazır mısın?").setColor("Blue");
        return message.channel.send({ content: "@everyone", embeds: [embed] });
    }

    // 6. Ban
    if (command === "ban") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return;
        const user = message.mentions.members.first();
        if (user) await user.ban();
        return message.reply("🔨 Adalet yerini buldu.");
    }

    // 7. Kick
    if (command === "kick") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return;
        const user = message.mentions.members.first();
        if (user) await user.kick();
        return message.reply("👢 Sunucudan uzaklaştırıldı.");
    }

    // 8. Rol Ver
    if (command === "rol-ver") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return;
        const member = message.mentions.members.first();
        const role = message.mentions.roles.first();
        if (member && role) await member.roles.add(role);
        return message.reply("✅ Rol başarıyla tanımlandı.");
    }

    // 9. Yavaş Mod
    if (command === "yavaş-mod") {
        const sec = parseInt(args[0]) || 5;
        message.channel.setRateLimitPerUser(sec);
        return message.reply(`🕒 Sohbet ${sec} saniye yavaşlatıldı.`);
    }

    // 10. Kilit
    if (command === "kilit") {
        message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false });
        return message.reply("🔒 Kanal kilitlendi.");
    }

    // 11. Ping
    if (command === "ping") return message.reply(`🏓 Gecikme: **${client.ws.ping}ms**`);

    // 12. Sunucu Bilgi
    if (command === "sunucu-bilgi") {
        const embed = new EmbedBuilder().setTitle(message.guild.name).addFields({ name: 'Üye Sayısı', value: `${message.guild.memberCount}` });
        return message.channel.send({ embeds: [embed] });
    }

    // 13. Avatar
    if (command === "avatar") {
        const user = message.mentions.users.first() || message.author;
        return message.reply(user.displayAvatarURL({ dynamic: true, size: 1024 }));
    }

    // 14. İstatistik
    if (command === "istatistik") {
        return message.reply(`Sunucuda toplam **${message.guild.memberCount}** nefer bulunuyor!`);
    }

    // 15. KURULUM (GELİŞMİŞ)
    if (command === "kur") {
        if (message.author.id !== message.guild.ownerId) return message.reply("Bu emir sadece en üst yetkiliye aittir.");
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('confirm').setLabel('Sistemi İnşa Et').setStyle(ButtonStyle.Danger));
        return message.channel.send({ content: "🚨 **Sunucu Sıfırlama ve İnşa Protokolü** onay bekliyor!", components: [row] });
    }
});

// --- 🖱️ ETKİLEŞİM & KURULUM MANTIĞI ---
client.on('interactionCreate', async (i) => {
    if (i.customId === 'confirm') {
        await i.reply({ content: "🏗️ İnşaat başladı kanka, her şey ayarlanıyor...", ephemeral: true });

        // KANALLARI SİL
        const channels = await i.guild.channels.fetch();
        for (const c of channels.values()) await c.delete().catch(() => {});
        
        // ROLLERİ SİL & YENİDEN YAP (OWNER > FOUNDER)
        const roles = await i.guild.roles.fetch();
        for (const r of roles.values()) { if (!r.managed && r.name !== "@everyone") await r.delete().catch(() => {}); }

        const rData = [
            { n: '🛡️ Castivol', c: '#000000' }, 
            { n: '👑 owner', c: '#ff0000' }, // En Üst
            { n: '👑 founder', c: '#990000' }, 
            { n: '⚔️ co founder', c: '#990000' },
            { n: '🏅 co owner', c: '#ff4d4d' },
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
        for (const rd of rData) await i.guild.roles.create({ name: rd.n, color: rd.c, hoist: true });

        // KATEGORİ & KANAL İNŞASI
        const cat = await i.guild.channels.create({ name: '─── CASTIVOL MERKEZ ───', type: ChannelType.GuildCategory });
        const tChan = await i.guild.channels.create({ name: '🧧-işlem-merkezi', parent: cat.id });
        await i.guild.channels.create({ name: '📢-duyuru', parent: cat.id });
        await i.guild.channels.create({ name: '💬-sohbet', parent: cat.id });
        await i.guild.channels.create({ name: '⚡-abone-kanıt', parent: cat.id });
        await i.guild.channels.create({ name: '🎁-klan-çekiliş', parent: cat.id });

        // TICKET SİSTEMİ (GELİŞMİŞ)
        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('tk').setPlaceholder('Talep türü seç...').addOptions([
                { label: 'Klan Alımı', value: 'klan', emoji: '⚔️' },
                { label: 'Partnerlik', value: 'partner', emoji: '🤝' },
                { label: 'Merge', value: 'merge', emoji: '💠' },
                { label: 'Destek', value: 'destek', emoji: '🎫' }
            ])
        );
        await tChan.send({ content: "🧧 **Castivol İşlem Merkezi**\nKategori seçerek odanı açabilirsin.", components: [menu] });
    }

    if (i.customId === 'tk') {
        const c = await i.guild.channels.create({
            name: `${i.values[0]}-${i.user.username}`,
            permissionOverwrites: [{ id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }, { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }]
        });
        await c.send({ content: `Hoş geldin ${i.user}. Bir yetkili birazdan burada olacak.`, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('kapat').setLabel('Kapat').setStyle(ButtonStyle.Danger))] });
        await i.reply({ content: `✅ Oda açıldı: ${c}`, ephemeral: true });
    }

    if (i.customId === 'kapat') {
        await i.reply("Kapatılıyor...");
        setTimeout(() => i.channel.delete(), 2000);
    }
});

client.login("TOKEN_BURAYA");
