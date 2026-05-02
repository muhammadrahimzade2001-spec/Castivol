const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require('discord.js');
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Castivol Pro System Online! 🛡️'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers
    ]
});

const PREFIX = "!";

client.on('ready', () => { console.log(`🛡️ ${client.user.tag} Pro Kuruluma Hazır!`); });

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- MODERASYON KOMUTLARI ---
    if (command === "sil" || command === "temizle") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const miktar = parseInt(args[0]) || 50;
        await message.channel.bulkDelete(miktar > 100 ? 100 : miktar, true);
        return message.channel.send(`🧹 **${miktar}** mesaj temizlendi.`).then(m => setTimeout(() => m.delete(), 2000));
    }

    // --- PRO KURULUM KOMUTU ---
    if (command === "kur") {
        if (message.author.id !== message.guild.ownerId) return message.reply("❌ Bu emir sadece sunucu sahibine aittir!");

        const embed = new EmbedBuilder()
            .setTitle("🏮 CASTIVOL PRO KURULUM")
            .setDescription("Görsellerdeki o estetik yapı (Abone, Klan, Oyun) kurulacak. Sunucu sıfırlansın mı?")
            .setColor("#2f3136");
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('mega_onay').setLabel('Sıfırla ve Kur').setStyle(ButtonStyle.Danger)
        );

        return message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;

    if (i.customId === 'mega_onay') {
        await i.reply({ content: "🚨 Sistemler sıfırlanıyor, Castivol Pro inşa ediliyor...", ephemeral: true });

        // 1. TEMİZLİK
        const currentChannels = await i.guild.channels.fetch();
        for (const c of currentChannels.values()) await c.delete().catch(() => {});
        const currentRoles = await i.guild.roles.fetch();
        for (const r of currentRoles.values()) {
            if (r.managed || r.name === "@everyone") continue;
            await r.delete().catch(() => {});
        }

        // 2. ROLLER
        const r_shogun = await i.guild.roles.create({ name: '🛡️ Shogun (Kurucu)', color: '#ff0000', permissions: [PermissionsBitField.Flags.Administrator] });
        const r_abone = await i.guild.roles.create({ name: '⚡ Abone', color: '#f1c40f', hoist: true });
        const r_klan = await i.guild.roles.create({ name: '🔥 Klan Sahibi', color: '#e74c3c', hoist: true });
        const r_uye = await i.guild.roles.create({ name: '👤 Üye', color: '#ffffff', hoist: true });

        // 3. KATEGORİ: AKTİFLİK (Giriş Çıkış)
        const cat_aktif = await i.guild.channels.create({ name: '─── AKTİFLİK ───', type: ChannelType.GuildCategory });
        await i.guild.channels.create({ name: '🔔-gördüysen-tıkla', parent: cat_aktif.id });
        await i.guild.channels.create({ name: '👋-hoş-geldin', parent: cat_aktif.id });

        // 4. KATEGORİ: ÖNEMLİ KANALLAR
        const cat_onemli = await i.guild.channels.create({ name: '─── ÖNEMLİ ───', type: ChannelType.GuildCategory });
        const c_duyuru = await i.guild.channels.create({ name: '📢 Duyuru', parent: cat_onemli.id });
        await i.guild.channels.create({ name: '📜 Kurallar', parent: cat_onemli.id });
        const c_destek = await i.guild.channels.create({ name: '🎫 Destek-Taleb', parent: cat_onemli.id });
        await i.guild.channels.create({ name: '🔥 Klan-Partner', parent: cat_onemli.id });
        await i.guild.channels.create({ name: '🎭 Rol-Al', parent: cat_onemli.id });

        // 5. KATEGORİ: GENEL KANALLAR
        const cat_genel = await i.guild.channels.create({ name: '─── GENEL ───', type: ChannelType.GuildCategory });
        await i.guild.channels.create({ name: '💬 Sohbet', parent: cat_genel.id });
        await i.guild.channels.create({ name: '🖼️ Görsel-İçerik', parent: cat_genel.id });
        await i.guild.channels.create({ name: '💡 Önerim-Var', parent: cat_genel.id });
        await i.guild.channels.create({ name: '🤖 Bot-Komutları', parent: cat_genel.id });

        // 6. KATEGORİ: ABONE ROLÜ ÖZEL
        const cat_abone = await i.guild.channels.create({ name: '⚡ ABONE ÖZEL ⚡', type: ChannelType.GuildCategory });
        await i.guild.channels.create({ name: '📁-abone-texture', parent: cat_abone.id });
        await i.guild.channels.create({ name: '🖥️-profilkod', parent: cat_abone.id });
        await i.guild.channels.create({ name: '📷-abone-kanıt', parent: cat_abone.id });

        // 7. KATEGORİ: MİNİ OYUNLAR
        const cat_game = await i.guild.channels.create({ name: '─── MİNİ OYUN ───', type: ChannelType.GuildCategory });
        await i.guild.channels.create({ name: '🔢-sayı-saymaca', parent: cat_game.id });
        await i.guild.channels.create({ name: '🅰️-kelime-türetme', parent: cat_game.id });

        // 8. KATEGORİ: SES ODALARI (Görseldeki gibi limitli)
        const cat_ses = await i.guild.channels.create({ name: '─── SES KANALLARI ───', type: ChannelType.GuildCategory });
        await i.guild.channels.create({ name: '🔊 Genel Sohbet', type: ChannelType.GuildVoice, parent: cat_ses.id });
        await i.guild.channels.create({ name: '👥 İki Kişilik', type: ChannelType.GuildVoice, userLimit: 2, parent: cat_ses.id });
        await i.guild.channels.create({ name: '👨‍👩‍👦 Üç Kişilik', type: ChannelType.GuildVoice, userLimit: 3, parent: cat_ses.id });
        await i.guild.channels.create({ name: '🎵 Müzik Odası', type: ChannelType.GuildVoice, parent: cat_ses.id });
        await i.guild.channels.create({ name: '💤 AFK Odası', type: ChannelType.GuildVoice, parent: cat_ses.id });

        // TICKET SİSTEMİ MESAJI
        const tEmbed = new EmbedBuilder().setTitle("🎫 Destek Sistemi").setDescription("Bir sorunun mu var? Butona tıkla!").setColor("#f1c40f");
        const tBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ac').setLabel('Destek Aç').setStyle(ButtonStyle.Secondary));
        await c_destek.send({ embeds: [tEmbed], components: [tBtn] });
    }

    // TICKET MANTIĞI
    if (i.customId === 'ac') {
        const ch = await i.guild.channels.create({
            name: `destek-${i.user.username}`,
            permissionOverwrites: [{ id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }, { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }]
        });
        await ch.send(`${i.user} yetkililer gelene kadar bekle kanka!`);
        await i.reply({ content: `Odan açıldı: ${ch}`, ephemeral: true });
    }
});

client.login(process.env.TOKEN);
