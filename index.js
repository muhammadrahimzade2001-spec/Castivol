const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require('discord.js');
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Castivol Ultimate Online! 🛡️'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers
    ]
});

const PREFIX = "!";

client.on('ready', () => { console.log(`🛡️ ${client.user.tag} İmparatorluk hazır!`); });

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- 🛠️ GELİŞMİŞ MODERASYON KOMUTLARI ---
    if (command === "temizle" || command === "sil") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const miktar = parseInt(args[0]) || 50;
        await message.channel.bulkDelete(miktar > 100 ? 100 : miktar, true);
        return message.channel.send(`🧹 **${miktar}** parşömen yakıldı!`).then(m => setTimeout(() => m.delete(), 3000));
    }

    if (command === "ban") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return;
        const user = message.mentions.users.first();
        if (!user) return message.reply("Kimi sürgün edeceğiz senpai?");
        message.guild.members.ban(user).then(() => message.reply(`🔨 **${user.tag}** sonsuza dek sürüldü!`));
    }

    if (command === "kick") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return;
        const user = message.mentions.users.first();
        if (!user) return message.reply("Kimi köyden çıkaracağız?");
        message.guild.members.kick(user).then(() => message.reply(`👢 **${user.tag}** köyden atıldı!`));
    }

    if (command === "rol-ver") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return;
        const member = message.mentions.members.first();
        const role = message.mentions.roles.first();
        if (!member || !role) return message.reply("Kime hangi rütbeyi vereceğiz? (!rol-ver @üye @rol)");
        member.roles.add(role);
        message.reply(`⚔️ **${member.user.username}** artık bir **${role.name}**!`);
    }

    // --- 🧨 MEGA KURULUM KOMUTU ---
    if (command === "kur") {
        if (message.author.id !== message.guild.ownerId) return message.reply("❌ Sadece Sunucu Sahibi bu emri verebilir!");

        const onay = new EmbedBuilder()
            .setTitle("🏮 İMPARATORLUK İNŞAATI")
            .setDescription("Sunucu sıfırlanacak ve devasa bir yapı kurulacak. Onaylıyor musun?")
            .setColor("#ff0000");
        const btn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('onay_kur').setLabel('Yık ve Yeniden Kur!').setStyle(ButtonStyle.Danger)
        );
        return message.channel.send({ embeds: [onay], components: [btn] });
    }
});

client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;

    if (i.customId === 'onay_kur') {
        await i.reply({ content: "🚨 Castivol mimarları çalışmaya başladı...", ephemeral: true });

        // 1. TAM TEMİZLİK
        const currentChannels = await i.guild.channels.fetch();
        for (const c of currentChannels.values()) await c.delete().catch(() => {});
        const currentRoles = await i.guild.roles.fetch();
        for (const r of currentRoles.values()) {
            if (r.managed || r.name === "@everyone") continue;
            await r.delete().catch(() => {});
        }

        // 2. RÜTBELER (ROLLER)
        const s_rol = await i.guild.roles.create({ name: '🛡️ Castivol Shogun', color: '#ff0000', hoist: true, permissions: [PermissionsBitField.Flags.Administrator] });
        const y_rol = await i.guild.roles.create({ name: '🎎 IzaKaya Yönetim', color: '#ffb7c5', hoist: true });
        const m_rol = await i.guild.roles.create({ name: '⚔️ Shinobi (Mod)', color: '#2f3136', hoist: true });
        const v_rol = await i.guild.roles.create({ name: '🗡️ Samuray (Vip)', color: '#f1c40f', hoist: true });
        const u_rol = await i.guild.roles.create({ name: '🌸 Senpai (Üye)', color: '#ffffff', hoist: true });

        // 3. KATEGORİ: MERKEZ
        const cat_bilgi = await i.guild.channels.create({ name: '━━━ CASTIVOL MERKEZ ━━━', type: ChannelType.GuildCategory });
        await i.guild.channels.create({ name: '📜-kurallar', parent: cat_bilgi.id });
        await i.guild.channels.create({ name: '📢-duyurular', parent: cat_bilgi.id });
        const c_basvuru = await i.guild.channels.create({ name: '🧧-başvuru-merkezi', parent: cat_bilgi.id });

        // 4. KATEGORİ: SOSYAL MEYDAN
        const cat_sosyal = await i.guild.channels.create({ name: '━━━ SOHBET ALANI ━━━', type: ChannelType.GuildCategory });
        await i.guild.channels.create({ name: '🍵-genel-chat', parent: cat_sosyal.id });
        await i.guild.channels.create({ name: '📸-galeri', parent: cat_sosyal.id });
        await i.guild.channels.create({ name: '🤖-bot-komut', parent: cat_sosyal.id });
        await i.guild.channels.create({ name: '🎲-oyun-chat', parent: cat_sosyal.id });

        // 5. KATEGORİ: SESLİ ODALAR (DEVSAL)
        const cat_ses = await i.guild.channels.create({ name: '━━━ SESLİ ODALAR ━━━', type: ChannelType.GuildCategory });
        await i.guild.channels.create({ name: '🔊 Sohbet I', type: ChannelType.GuildVoice, parent: cat_ses.id });
        await i.guild.channels.create({ name: '🔊 Sohbet II', type: ChannelType.GuildVoice, parent: cat_ses.id });
        await i.guild.channels.create({ name: '🎮 Oyun Odası', type: ChannelType.GuildVoice, parent: cat_ses.id });
        await i.guild.channels.create({ name: '🎵 Müzik I', type: ChannelType.GuildVoice, parent: cat_ses.id });
        await i.guild.channels.create({ name: '💤 AFK (Sessiz)', type: ChannelType.GuildVoice, parent: cat_ses.id });

        // 6. KATEGORİ: YÖNETİM (GİZLİ)
        const cat_admin = await i.guild.channels.create({ 
            name: '━━━ YÖNETİM ━━━', 
            type: ChannelType.GuildCategory,
            permissionOverwrites: [{ id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }, { id: y_rol.id, allow: [PermissionsBitField.Flags.ViewChannel] }]
        });
        await i.guild.channels.create({ name: '🔒-admin-chat', parent: cat_admin.id });
        await i.guild.channels.create({ name: '📂-loglar', parent: cat_admin.id });

        // TICKET PANELİ
        const tEmbed = new EmbedBuilder().setTitle("🧧 Başvuru & Destek").setDescription("Yeni bir işlem için butona tıkla!").setColor("#ffb7c5");
        const tBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ac').setLabel('Talep Aç').setStyle(ButtonStyle.Primary).setEmoji('🧧'));
        await c_basvuru.send({ embeds: [tEmbed], components: [tBtn] });
    }

    // TICKET SİSTEMİ ÇALIŞTIRICI
    if (i.customId === 'ac') {
        const chan = await i.guild.channels.create({
            name: `oda-${i.user.username}`,
            permissionOverwrites: [
                { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });
        const closeBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('kapat').setLabel('Kapat').setStyle(ButtonStyle.Danger));
        await chan.send({ content: `${i.user} Hoş geldin!`, components: [closeBtn] });
        await i.reply({ content: `✅ Odan açıldı: ${chan}`, ephemeral: true });
    }

    if (i.customId === 'kapat') {
        await i.reply("🔒 Oda kapatılıyor...");
        setTimeout(() => i.channel.delete(), 3000);
    }
});

client.login(process.env.TOKEN);
