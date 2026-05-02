const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require('discord.js');
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Castivol Mega System Online! 🛡️'));
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
    console.log(`🛡️ ${client.user.tag} devasa kurulum için hazır!`); 
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // --- MODERASYON KOMUTLARI ---
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "sil" || command === "temizle") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const miktar = parseInt(args[0]) || 10;
        await message.channel.bulkDelete(miktar, true);
        return message.channel.send(`🧹 **${miktar}** mesaj süpürüldü!`).then(m => setTimeout(() => m.delete(), 3000));
    }

    if (command === "ban") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return;
        const user = message.mentions.users.first();
        if (user) {
            const member = message.guild.members.resolve(user);
            if (member) member.ban().then(() => message.reply(`🔨 ${user.tag} yargılandı!`));
        }
    }

    // --- MEGA KURULUM KOMUTU ---
    if (command === "kur") {
        if (message.author.id !== message.guild.ownerId) return message.reply("❌ Shogun değilsin!");

        const onayEmbed = new EmbedBuilder()
            .setTitle("🏮 MEGA KURULUM BAŞLIYOR")
            .setDescription("Sunucu tamamen sıfırlanacak; onlarca kanal, ses odası ve rütbe eklenecek. Onaylıyor musun?")
            .setColor("#ff0000");

        const onayBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('onay_mega_kur').setLabel('İmparatorluğu Kur!').setStyle(ButtonStyle.Danger)
        );

        return message.channel.send({ embeds: [onayEmbed], components: [onayBtn] });
    }
});

client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;

    if (i.customId === 'onay_mega_kur') {
        await i.reply({ content: "🚨 İnşaat başladı kanka, arkanı yaslan...", ephemeral: true });

        // 1. TEMİZLİK
        const channels = await i.guild.channels.fetch();
        for (const channel of channels.values()) await channel.delete().catch(() => {});
        const roles = await i.guild.roles.fetch();
        for (const role of roles.values()) {
            if (role.managed || role.name === "@everyone") continue;
            await role.delete().catch(() => {});
        }

        // 2. RÜTBELER (ROLLER)
        const r_shogun = await i.guild.roles.create({ name: '🛡️ Castivol Shogun', color: '#ff0000', hoist: true, permissions: [PermissionsBitField.Flags.Administrator] });
        const r_yonetim = await i.guild.roles.create({ name: '🎎 IzaKaya Yönetim', color: '#ffb7c5', hoist: true });
        const r_shinobi = await i.guild.roles.create({ name: '⚔️ Shinobi (Mod)', color: '#2f3136', hoist: true });
        const r_samuray = await i.guild.roles.create({ name: '🗡️ Samuray (Vip)', color: '#f1c40f', hoist: true });
        const r_senpai = await i.guild.roles.create({ name: '🌸 Senpai (Üye)', color: '#ffffff', hoist: true });

        // 3. KATEGORİ: BİLGİLENDİRME
        const k_bilgi = await i.guild.channels.create({ name: '━━━ BİLGİ ━━━', type: ChannelType.GuildCategory });
        await i.guild.channels.create({ name: '📜-kurallar', type: ChannelType.GuildText, parent: k_bilgi.id });
        await i.guild.channels.create({ name: '📢-duyurular', type: ChannelType.GuildText, parent: k_bilgi.id });
        const c_basvuru = await i.guild.channels.create({ name: '🧧-başvuru-merkezi', type: ChannelType.GuildText, parent: k_bilgi.id });

        // 4. KATEGORİ: SOHBET MEYDANI
        const k_sohbet = await i.guild.channels.create({ name: '━━━ SOHBET ━━━', type: ChannelType.GuildCategory });
        await i.guild.channels.create({ name: '🍵-genel-chat', type: ChannelType.GuildText, parent: k_sohbet.id });
        await i.guild.channels.create({ name: '📷-galeri', type: ChannelType.GuildText, parent: k_sohbet.id });
        await i.guild.channels.create({ name: '🤖-bot-komut', type: ChannelType.GuildText, parent: k_sohbet.id });

        // 5. KATEGORİ: SES ODALARI (MEGA)
        const k_ses = await i.guild.channels.create({ name: '━━━ SES ODALARI ━━━', type: ChannelType.GuildCategory });
        await i.guild.channels.create({ name: '🔊 Sohbet I', type: ChannelType.GuildVoice, parent: k_ses.id });
        await i.guild.channels.create({ name: '🔊 Sohbet II', type: ChannelType.GuildVoice, parent: k_ses.id });
        await i.guild.channels.create({ name: '🎵 Müzik Odası', type: ChannelType.GuildVoice, parent: k_ses.id });
        await i.guild.channels.create({ name: '🎮 Oyun Odası', type: ChannelType.GuildVoice, parent: k_ses.id });
        await i.guild.channels.create({ name: '💤 AFK', type: ChannelType.GuildVoice, parent: k_ses.id });

        // TICKET PANELİ KURULUMU
        const tEmbed = new EmbedBuilder()
            .setTitle("🧧 Castivol Başvuru Hattı")
            .setDescription("Destek veya yetki başvurusu için butona tıkla senpai!")
            .setColor("#ffb7c5");
        const tBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ac').setLabel('Talep Aç').setStyle(ButtonStyle.Danger).setEmoji('🧧')
        );
        await c_basvuru.send({ embeds: [tEmbed], components: [tBtn] });
    }

    // TICKET MANTIĞI
    if (i.customId === 'ac') {
        const ticketChannel = await i.guild.channels.create({
            name: `oda-${i.user.username}`,
            permissionOverwrites: [
                { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });
        await ticketChannel.send({ content: `${i.user} Hoş geldin kanka! Kapatmak için butona bas.`, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('kapat').setLabel('Kapat').setStyle(ButtonStyle.Secondary))] });
        await i.reply({ content: `✅ Odan açıldı: ${ticketChannel}`, ephemeral: true });
    }

    if (i.customId === 'kapat') {
        await i.reply("🔒 Oda siliniyor...");
        setTimeout(() => i.channel.delete().catch(() => {}), 3000);
    }
});

client.login(process.env.TOKEN);
