const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType, StringSelectMenuBuilder } = require('discord.js');
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Castivol System Online! 🛡️'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers
    ]
});

const PREFIX = "!";

client.on('ready', () => { console.log(`🛡️ ${client.user.tag} Castivol için göreve hazır!`); });

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- 📜 YARDIM MENÜSÜ ---
    if (command === "yardım") {
        const helpEmbed = new EmbedBuilder()
            .setTitle("🛡️ Castivol Yönetim Paneli")
            .setDescription("Sunucuyu yönetmek için kullanabileceğin kutsal komutlar aşağıdadır senpai!")
            .addFields(
                { name: '🏗️ İnşa Komutları', value: '`!kur`: Sunucuyu sıfırdan Castivol düzenine göre kurar.\n`!panel-at`: Gelişmiş Ticket panelini gönderir.', inline: false },
                { name: '🔨 Moderasyon', value: '`!sil [1-100]`: Mesajları temizler.\n`!duyuru [mesaj]`: Şık bir duyuru yayınlar.\n`!ban / !kick`: Kuralları çiğneyenleri cezalandırır.', inline: false },
                { name: '✨ Yetki Sistemi', value: '`!rol-ver @üye @rol`: Üyelere rütbe atar.', inline: false }
            )
            .setColor("#2f3136")
            .setThumbnail(message.guild.iconURL())
            .setFooter({ text: "Castivol Pro Service" });

        return message.channel.send({ embeds: [helpEmbed] });
    }

    // --- 📢 DUYURU KOMUTU ---
    if (command === "duyuru") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const duyuruMesaj = args.join(' ');
        if (!duyuruMesaj) return message.reply("Duyuru metni girmelisin kanka!");

        const dEmbed = new EmbedBuilder()
            .setTitle("📢 Castivol Bilgilendirme")
            .setDescription(duyuruMesaj)
            .setColor("#f1c40f")
            .setTimestamp()
            .setFooter({ text: `Yayınlayan: ${message.author.username}` });

        message.channel.send({ content: "@everyone", embeds: [dEmbed] });
        return message.delete().catch(() => {});
    }

    // --- 🧨 MEGA KURULUM (ROLLÜ) ---
    if (command === "kur") {
        if (message.author.id !== message.guild.ownerId) return message.reply("❌ Bu emir sadece Founder'a aittir!");

        const onay = new EmbedBuilder()
            .setTitle("🚨 DİKKAT: YIKIM BAŞLIYOR")
            .setDescription("Sunucu tamamen sıfırlanacak ve verdiğin hiyerarşiye göre (Founder -> Abone) yeniden kurulacak. Onaylıyor musun?")
            .setColor("#ff0000");
        const btn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('onay_kur').setLabel('Yık ve Kur!').setStyle(ButtonStyle.Danger)
        );
        return message.channel.send({ embeds: [onay], components: [btn] });
    }
});

// --- 🖱️ ETKİLEŞİMLER (TICKET & KURULUM) ---
client.on('interactionCreate', async (i) => {
    if (i.isButton()) {
        // TICKET BAŞLATMA
        if (i.customId === 'ticket_baslat') {
            const select = new StringSelectMenuBuilder()
                .setCustomId('ticket_tipi')
                .setPlaceholder('Lütfen bir kategori seç kanka...')
                .addOptions([
                    { label: 'Klan Alımı', description: 'Klanımıza katılmak için başvur.', value: 'klan_alim', emoji: '🔥' },
                    { label: 'Partnerlik', description: 'Sunucu ortaklığı için seç.', value: 'partner', emoji: '🤝' },
                    { label: 'Merge (Birleşme)', description: 'Klan birleşme talepleri için.', value: 'merge', emoji: '⚔️' },
                    { label: 'Öneri / İstek', description: 'Sunucuya öneri bırak.', value: 'oneri', emoji: '💡' },
                    { label: 'Destek / Şikayet', description: 'Hata bildir veya yardım al.', value: 'destek', emoji: '🎫' }
                ]);
            const row = new ActionRowBuilder().addComponents(select);
            return i.reply({ content: 'İşlem tipini seçiniz:', components: [row], ephemeral: true });
        }

        // MEGA KURULUM ONAYI
        if (i.customId === 'onay_kur') {
            await i.reply({ content: "🚨 Castivol mimarları çalışmaya başladı, her şey siliniyor...", ephemeral: true });

            // TEMİZLİK
            const chs = await i.guild.channels.fetch();
            for (const c of chs.values()) await c.delete().catch(() => {});
            const rls = await i.guild.roles.fetch();
            for (const r of rls.values()) {
                if (r.managed || r.name === "@everyone") continue;
                await r.delete().catch(() => {});
            }

            // ROLLER (SENİN LİSTEN)
            const roller = [
                { name: '🛡️ Castivol', color: '#ff0000' }, { name: '👑 Founder', color: '#ff0000' },
                { name: '⚔️ Co-Founder', color: '#ff0000' }, { name: '🛡️ Owner', color: '#ff0000' },
                { name: '🏅 Co-Owner', color: '#ff0000' }, { name: '✨ Jr.Founder', color: '#ff4444' },
                { name: '💎 Admin', color: '#00ff00' }, { name: '🧩 Jr.Admin', color: '#00ff00' },
                { name: '🤝 Yardımcı', color: '#00ffff' }, { name: '📢 Asistan', color: '#00ffff' },
                { name: '🛡️ AAC', color: '#ffff00' }, { name: '🛡️ Deneme AAC', color: '#ffff00' },
                { name: '📜 Rehber', color: '#5865f2' }, { name: '📜 Deneme Rehber', color: '#5865f2' },
                { name: '👤 Üye', color: '#ffffff' }, { name: '⚡ Abone', color: '#f1c40f' }
            ];
            for (const r of roller) await i.guild.roles.create({ name: r.name, color: r.color, hoist: true });

            // KATEGORİLER & KANALLAR
            const cat = await i.guild.channels.create({ name: '─── CASTIVOL MERKEZ ───', type: ChannelType.GuildCategory });
            await i.guild.channels.create({ name: '📢-duyuru', parent: cat.id });
            await i.guild.channels.create({ name: '📜-kurallar', parent: cat.id });
            const c_ticket = await i.guild.channels.create({ name: '🧧-işlem-merkezi', parent: cat.id });

            const cat_sohbet = await i.guild.channels.create({ name: '─── SOHBET MEYDANI ───', type: ChannelType.GuildCategory });
            await i.guild.channels.create({ name: '🍵-sohbet', parent: cat_sohbet.id });
            await i.guild.channels.create({ name: '📷-galeri', parent: cat_sohbet.id });
            await i.guild.channels.create({ name: '🎮-oyun-chat', parent: cat_sohbet.id });

            const cat_ses = await i.guild.channels.create({ name: '─── SES ODALARI ───', type: ChannelType.GuildCategory });
            await i.guild.channels.create({ name: '🔊 Sohbet Odası', type: ChannelType.GuildVoice, parent: cat_ses.id });
            await i.guild.channels.create({ name: '🎵 Müzik', type: ChannelType.GuildVoice, parent: cat_ses.id });

            // TICKET PANELİ KUR
            const pEmbed = new EmbedBuilder()
                .setTitle("🧧 Castivol Başvuru & Destek")
                .setDescription("Klan alımı, Partnerlik, Merge veya Destek talepleri için aşağıdaki butona tıkla!")
                .setColor("#2f3136");
            const pBtn = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_baslat').setLabel('İşlem Başlat').setStyle(ButtonStyle.Primary).setEmoji('🧧')
            );
            await c_ticket.send({ embeds: [pEmbed], components: [pBtn] });
        }
    }

    // TICKET SEÇİM MANTIĞI
    if (i.isStringSelectMenu()) {
        if (i.customId === 'ticket_tipi') {
            const tur = i.values[0];
            const channel = await i.guild.channels.create({
                name: `${tur}-${i.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                ],
            });

            await i.reply({ content: `✅ Kanalın oluşturuldu: ${channel}`, ephemeral: true });
            const btn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('kapat').setLabel('Kapat').setStyle(ButtonStyle.Danger));
            await channel.send({ content: `${i.user} Hoş geldin! Yetkililer en kısa sürede seninle ilgilenecek.`, components: [btn] });
        }
    }

    if (i.customId === 'kapat') {
        await i.reply("🔒 Oda 3 saniye içinde kapatılıyor...");
        setTimeout(() => i.channel.delete().catch(() => {}), 3000);
    }
});

client.login(process.env.TOKEN);
