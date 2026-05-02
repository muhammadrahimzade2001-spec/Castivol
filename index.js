const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType, StringSelectMenuBuilder } = require('discord.js');
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Castivol Master Online! 🛡️'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers
    ]
});

const PREFIX = "!";

client.on('ready', () => { console.log(`🛡️ ${client.user.tag} Tüm sistemlerle aktif!`); });

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- 📜 GELİŞMİŞ YARDIM MENÜSÜ ---
    if (command === "yardım") {
        const embed = new EmbedBuilder()
            .setTitle("🛡️ Castivol Komut Merkezi")
            .setColor("#2f3136")
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: '🏗️ Sistem Kurulumu', value: '`!kur`: Sunucuyu sıfırdan tüm kanallar ve rollerle kurar.' },
                { name: '🔨 Yönetim', value: '`!sil [1-100]`: Mesaj temizler.\n`!duyuru [mesaj]`: Herkese duyuru geçer.\n`!rol-ver @üye @rol`: Rütbe atar.' },
                { name: '🛡️ Güvenlik', value: '`!ban @üye`: Sürgün eder.\n`!kick @üye`: Köyden atar.' }
            );
        return message.channel.send({ embeds: [embed] });
    }

    // --- 📢 DUYURU ---
    if (command === "duyuru") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const txt = args.join(' ');
        if (!txt) return message.reply("Duyuru metni gir kanka!");
        const de = new EmbedBuilder().setTitle("📢 Castivol Duyurusu").setDescription(txt).setColor("#f1c40f").setTimestamp();
        message.channel.send({ content: "@everyone", embeds: [de] });
        return message.delete().catch(() => {});
    }

    // --- 🧹 SİL ---
    if (command === "sil" || command === "temizle") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const m = parseInt(args[0]) || 50;
        await message.channel.bulkDelete(m > 100 ? 100 : m, true);
        message.channel.send(`🧹 **${m}** mesaj süpürüldü!`).then(x => setTimeout(() => x.delete(), 2000));
    }

    // --- 🧨 FULL KURULUM (GÖRSELDEKİ TÜM KANALLAR) ---
    if (command === "kur") {
        if (message.author.id !== message.guild.ownerId) return message.reply("❌ Bu emir sadece Founder'a aittir!");

        const onayEmbed = new EmbedBuilder().setTitle("⚠️ SIFIRLAMA ONAYI").setDescription("Sunucu tamamen silinecek ve hiyerarşi + tüm özel kanallar kurulacak!").setColor("Red");
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('full_onay').setLabel('Sıfırla ve Kur').setStyle(ButtonStyle.Danger));
        return message.channel.send({ embeds: [onayEmbed], components: [row] });
    }
});

client.on('interactionCreate', async (i) => {
    if (i.isButton()) {
        if (i.customId === 'full_onay') {
            await i.reply({ content: "🚨 İnşaat başladı kanka, birazdan her şey çok güzel olacak!", ephemeral: true });

            // 1. TEMİZLİK
            const chs = await i.guild.channels.fetch();
            for (const c of chs.values()) await c.delete().catch(() => {});
            const rls = await i.guild.roles.fetch();
            for (const r of rls.values()) { if (!r.managed && r.name !== "@everyone") await r.delete().catch(() => {}); }

            // 2. ROLLER (TAM LİSTE)
            const roller = ['🛡️ Castivol', '👑 Founder', '⚔️ Co-Founder', '🛡️ Owner', '🏅 Co-Owner', '✨ Jr.Founder', '💎 Admin', '🧩 Jr.Admin', '🤝 Yardımcı', '📢 Asistan', '🛡️ AAC', '🛡️ Deneme AAC', '📜 Rehber', '📜 Deneme Rehber', '👤 Üye', '⚡ Abone'];
            for (const rName of roller) await i.guild.roles.create({ name: rName, color: 'Random', hoist: true });

            // 3. KATEGORİ: AKTİFLİK
            const cat_akt = await i.guild.channels.create({ name: '─── AKTİFLİK ───', type: ChannelType.GuildCategory });
            await i.guild.channels.create({ name: '🔔-gördüysen-tıkla', parent: cat_akt.id });
            await i.guild.channels.create({ name: '👋-hoş-geldin', parent: cat_akt.id });

            // 4. KATEGORİ: ÖNEMLİ KANALLAR (GÖRSELDEKİLER)
            const cat_onemli = await i.guild.channels.create({ name: '─── ÖNEMLİ ───', type: ChannelType.GuildCategory });
            await i.guild.channels.create({ name: '📢 Duyuru', parent: cat_onemli.id });
            await i.guild.channels.create({ name: '📜 Kurallar', parent: cat_onemli.id });
            const c_ticket = await i.guild.channels.create({ name: '🧧 Destek-Taleb', parent: cat_onemli.id });
            await i.guild.channels.create({ name: '🔥 Klan-Partner', parent: cat_onemli.id });
            await i.guild.channels.create({ name: '🎭 Rol-Al', parent: cat_onemli.id });
            await i.guild.channels.create({ name: '🧩 Set-Yardım', parent: cat_onemli.id });

            // 5. KATEGORİ: ABONE ROLÜ
            const cat_abone = await i.guild.channels.create({ name: '⚡ ABONE ROLÜ ⚡', type: ChannelType.GuildCategory });
            await i.guild.channels.create({ name: '📂-abone-texture', parent: cat_abone.id });
            await i.guild.channels.create({ name: '🖥️-abone-profilkod', parent: cat_abone.id });
            await i.guild.channels.create({ name: '📷-abone-kanıt', parent: cat_abone.id });
            await i.guild.channels.create({ name: 'ℹ️-abone-bilgi', parent: cat_abone.id });

            // 6. KATEGORİ: KLAN ÖZEL
            const cat_klan = await i.guild.channels.create({ name: '─── KLAN ÖZEL ───', type: ChannelType.GuildCategory });
            await i.guild.channels.create({ name: '🔥-klan-duyuru', parent: cat_klan.id });
            await i.guild.channels.create({ name: '💬-klan-sohbet', parent: cat_klan.id });
            await i.guild.channels.create({ name: '🎁-klan-çekiliş', parent: cat_klan.id });

            // 7. KATEGORİ: MİNİ OYUN
            const cat_mini = await i.guild.channels.create({ name: '─── MİNİ OYUN ───', type: ChannelType.GuildCategory });
            await i.guild.channels.create({ name: '🔢-sayı-saymaca', parent: cat_mini.id });

            // 8. SES KANALLARI (TAM LİSTE)
            const cat_ses = await i.guild.channels.create({ name: '─── SES KANALLARI ───', type: ChannelType.GuildCategory });
            const sesler = ['🔊 Genel', '👥 İki Kişilik', '👨‍👩‍👦 Üç Kişilik', '🎵 Müzik', '💤 AFK', '🛡️ Toplantı Odası'];
            for (const s of sesler) await i.guild.channels.create({ name: s, type: ChannelType.GuildVoice, parent: cat_ses.id });

            // TICKET PANELİ
            const te = new EmbedBuilder().setTitle("🧧 Castivol İşlem Merkezi").setDescription("Klan, Partner veya Destek için tıkla!").setColor("Blurple");
            const tb = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('tk_ac').setLabel('İşlem Başlat').setStyle(ButtonStyle.Primary).setEmoji('🧧'));
            await c_ticket.send({ embeds: [te], components: [tb] });
        }

        if (i.customId === 'tk_ac') {
            const sm = new StringSelectMenuBuilder().setCustomId('tk_secim').setPlaceholder('Konu seç...').addOptions([
                { label: 'Klan Alımı', value: 'klan', emoji: '🔥' },
                { label: 'Partnerlik', value: 'partner', emoji: '🤝' },
                { label: 'Merge', value: 'merge', emoji: '⚔️' },
                { label: 'Destek', value: 'destek', emoji: '🎫' }
            ]);
            await i.reply({ content: 'Lütfen kategori seç kanka:', components: [new ActionRowBuilder().addComponents(sm)], ephemeral: true });
        }

        if (i.customId === 'kapat') {
            await i.reply("Oda 3 saniye içinde kapatılıyor...");
            setTimeout(() => i.channel.delete().catch(() => {}), 3000);
        }
    }

    if (i.isStringSelectMenu() && i.customId === 'tk_secim') {
        const c = await i.guild.channels.create({
            name: `${i.values[0]}-${i.user.username}`,
            permissionOverwrites: [{ id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }, { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }]
        });
        await c.send({ content: `${i.user} Hoş geldin!`, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('kapat').setLabel('Kapat').setStyle(ButtonStyle.Danger))] });
        await i.reply({ content: `✅ Kanalın açıldı: ${c}`, ephemeral: true });
    }
});

client.login(process.env.TOKEN);
