const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType, StringSelectMenuBuilder } = require('discord.js');
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Castivol Professional System Online! 🛡️'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers
    ]
});

const PREFIX = "!";

client.on('ready', () => { console.log(`🛡️ ${client.user.tag} Operasyon için hazır!`); });

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- 📜 PROFESYONEL REHBER (SS'DEKİ DÜZEN) ---
    if (command === "yardım") {
        const helpEmbed = new EmbedBuilder()
            .setTitle("🛡️ CASTIVOL OPERASYON MERKEZİ")
            .setDescription("Sunucu ekosistemini yönetmek ve asayişi sağlamak için yetkili komutları aşağıdadır.")
            .setColor("#000000")
            .setThumbnail(message.guild.iconURL())
            .addFields(
                { name: '📊 SİSTEM YÖNETİMİ', value: '`!kur`: Tüm sunucuyu (Rol/Kanal/Ticket) profesyonel düzende inşa eder.\n`!temizle [sayı]`: Belirtilen miktarda mesajı veri tabanından siler.', inline: false },
                { name: '⚔️ ASKERİ & SOSYAL', value: '`!duyuru`: Sunucu geneline resmi bildiri yayınlar.\n`!savaş-duyuru`: Klan savaşları ve turnuvalar için yüksek öncelikli çağrı yapar.\n`!istatistik`: Sunucunun aktiflik ve üye verilerini döker.', inline: false },
                { name: '🎫 TICKET SİSTEMİ', value: 'Klan başvurusu, partnerlik veya şikayetler için `#işlem-merkezi` kanalını kullanın. Her talep ilgili departmana iletilir.', inline: false }
            )
            .setFooter({ text: "Castivol Security Solutions | 2026" });

        return message.channel.send({ embeds: [helpEmbed] });
    }

    // --- 🧹 TEMİZLİK PROTOKOLÜ ---
    if (command === "temizle" || command === "sil") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const amount = parseInt(args[0]) || 50;
        await message.channel.bulkDelete(amount > 100 ? 100 : amount, true);
        message.channel.send(`🧹 **${amount}** adet mesaj başarıyla imha edildi.`).then(m => setTimeout(() => m.delete(), 3000));
    }

    // --- 📢 DUYURU SİSTEMLERİ ---
    if (command === "duyuru" || command === "savaş-duyuru") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const text = args.join(' ');
        if (!text) return message.reply("İçerik girmeden duyuru yapamazsın kanka.");

        const isWar = command === "savaş-duyuru";
        const embed = new EmbedBuilder()
            .setTitle(isWar ? "⚔️ ACİL DURUM: SAVAŞ ÇAĞRISI" : "📢 RESMİ BİLGİLENDİRME")
            .setDescription(text)
            .setColor(isWar ? "#ff0000" : "#ffffff")
            .setTimestamp()
            .setFooter({ text: `Onaylayan: ${message.author.username}` });

        message.channel.send({ content: "@everyone", embeds: [embed] });
        return message.delete().catch(() => {});
    }

    // --- 🧨 MEGA KURULUM (FULL KANALLAR + ROLLER) ---
    if (command === "kur") {
        if (message.author.id !== message.guild.ownerId) return message.reply("Bu protokol sadece Founder yetkisindedir.");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('mega_onay').setLabel('Sistemi Yapılandır').setStyle(ButtonStyle.Danger)
        );
        message.channel.send({ content: "⚠️ **DİKKAT:** Sunucu sıfırlanacak. Onaylıyor musun?", components: [row] });
    }
});

client.on('interactionCreate', async (i) => {
    if (i.customId === 'mega_onay') {
        await i.reply({ content: "🛠️ Castivol yapılandırılıyor, lütfen bekleyin...", ephemeral: true });

        // 1. TEMİZLİK
        const channels = await i.guild.channels.fetch();
        for (const c of channels.values()) await c.delete().catch(() => {});
        const roles = await i.guild.roles.fetch();
        for (const r of roles.values()) { if (!r.managed && r.name !== "@everyone") await r.delete().catch(() => {}); }

        // 2. ÖZEL ROLLER (HİYERARŞİK)
        const rolesData = [
            { name: '🛡️ Castivol', color: '#000000' }, { name: '👑 founder', color: '#990000' },
            { name: '⚔️ co founder', color: '#990000' }, { name: '🛡️ co owner', color: '#ff0000' },
            { name: '🎖️ owner', color: '#ff0000' }, { name: '✨ jr.founder', color: '#ff4d4d' },
            { name: '💎 admin', color: '#2ecc71' }, { name: '🧩 jr.admin', color: '#2ecc71' },
            { name: '🤝 Yardımcı', color: '#3498db' }, { name: '📢 Asistan', color: '#3498db' },
            { name: '🛡️ AAC', color: '#f1c40f' }, { name: '🛡️ deneme aac', color: '#f1c40f' },
            { name: '📜 rehber', color: '#9b59b6' }, { name: '📜 deneme rehber', color: '#9b59b6' },
            { name: '👤 üye', color: '#bdc3c7' }, { name: '⚡ abone', color: '#e67e22' }
        ];
        for (const r of rolesData) await i.guild.roles.create({ name: r.name, color: r.color, hoist: true });

        // 3. GELİŞMİŞ KANAL YAPISI
        const createC = (n, t, p) => i.guild.channels.create({ name: n, type: t, parent: p });

        // Kategori: Merkezi Sistemler
        const cat1 = await i.guild.channels.create({ name: '─── MERKEZİ SİSTEMLER ───', type: ChannelType.GuildCategory });
        await createC('📢-duyurular', ChannelType.GuildText, cat1.id);
        await createC('📜-kurallar', ChannelType.GuildText, cat1.id);
        const c_ticket = await createC('🧧-işlem-merkezi', ChannelType.GuildText, cat1.id);
        await createC('👋-hoşgeldin', ChannelType.GuildText, cat1.id);

        // Kategori: Sosyal Alan
        const cat2 = await i.guild.channels.create({ name: '─── SOSYAL ALAN ───', type: ChannelType.GuildCategory });
        await createC('💬-genel-chat', ChannelType.GuildText, cat2.id);
        await createC('📷-medya-galeri', ChannelType.GuildText, cat2.id);
        await createC('🤖-bot-komut', ChannelType.GuildText, cat2.id);
        await createC('🔢-sayı-sayma', ChannelType.GuildText, cat2.id);

        // Kategori: Abone & Teknik
        const cat3 = await i.guild.channels.create({ name: '─── ABONE & TEKNİK ───', type: ChannelType.GuildCategory });
        await createC('⚡-abone-kanıt', ChannelType.GuildText, cat3.id);
        await createC('📁-özel-texture', ChannelType.GuildText, cat3.id);
        await createC('🖥️-profil-kodları', ChannelType.GuildText, cat3.id);

        // Kategori: Klan Departmanı
        const cat4 = await i.guild.channels.create({ name: '─── KLAN DEPARTMANI ───', type: ChannelType.GuildCategory });
        await createC('⚔️-klan-duyuru', ChannelType.GuildText, cat4.id);
        await createC('🛡️-klan-chat', ChannelType.GuildText, cat4.id);
        await createC('🎁-klan-çekiliş', ChannelType.GuildText, cat4.id);

        // Kategori: Ses Kanalları
        const cat5 = await i.guild.channels.create({ name: '─── SES KOMUTANLIĞI ───', type: ChannelType.GuildCategory });
        await createC('🔊 Genel Sohbet', ChannelType.GuildVoice, cat5.id);
        await createC('🛡️ Toplantı Odası', ChannelType.GuildVoice, cat5.id);
        await createC('💤 AFK Odası', ChannelType.GuildVoice, cat5.id);

        // 4. GELİŞMİŞ TICKET PANELİ
        const tEmbed = new EmbedBuilder()
            .setTitle("🧧 CASTIVOL İŞLEM MERKEZİ")
            .setDescription("Yapmak istediğiniz işlem için aşağıdan kategori seçiniz.\n\n`🔥` **Klan Alımı**\n`🤝` **Partnerlik**\n`⚔️` **Merge (Birleşme)**\n`🎫` **Destek & Şikayet**")
            .setColor("#000000");

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('tk_menu').setPlaceholder('İşlem türünü belirleyin...').addOptions([
                { label: 'Klan Alımı', value: 'klan', emoji: '🔥' },
                { label: 'Partnerlik', value: 'partner', emoji: '🤝' },
                { label: 'Merge (Birleşme)', value: 'merge', emoji: '⚔️' },
                { label: 'Destek / Şikayet', value: 'destek', emoji: '🎫' }
            ])
        );
        await c_ticket.send({ embeds: [tEmbed], components: [menu] });
    }

    if (i.customId === 'tk_menu') {
        const chan = await i.guild.channels.create({
            name: `${i.values[0]}-${i.user.username}`,
            permissionOverwrites: [{ id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }, { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }]
        });
        await chan.send({ content: `${i.user} Hoş geldiniz. Yetkililer talebinizi inceleyecektir.`, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('bitir').setLabel('Talebi Sonlandır').setStyle(ButtonStyle.Danger))] });
        await i.reply({ content: `✅ Departman odanız açıldı: ${chan}`, ephemeral: true });
    }

    if (i.customId === 'bitir') {
        await i.reply("İşlem sonlandırılıyor...");
        setTimeout(() => i.channel.delete(), 2000);
    }
});

client.login(process.env.TOKEN);
