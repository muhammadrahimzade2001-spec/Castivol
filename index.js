const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require('discord.js');
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Castivol Shogun Online! 🛡️'));
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
    console.log(`🛡️ ${client.user.tag} Castivol için hazır!`); 
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Basit test komutu
    if (message.content === PREFIX + "ping") return message.reply("Castivol sistemleri aktif! 🛡️");

    // SIFIRDAN KURULUM KOMUTU
    if (message.content === PREFIX + "kur") {
        // Sadece sunucu sahibi yapabilsin (Güvenlik için)
        if (message.author.id !== message.guild.ownerId) {
            return message.reply("❌ Bu komutu sadece Castivol Shogunu (Sunucu Sahibi) kullanabilir!");
        }

        const onayEmbed = new EmbedBuilder()
            .setTitle("⚠️ KRİTİK UYARI")
            .setDescription("Sunucu tamamen sıfırlanacak ve Castivol düzeni kurulacak. Onaylıyor musun?")
            .setColor("#ff0000");

        const onayBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('onay_kur').setLabel('Sıfırla ve Kur').setStyle(ButtonStyle.Danger)
        );

        return message.channel.send({ embeds: [onayEmbed], components: [onayBtn] });
    }
});

// INTERACTION İŞLEMCİSİ
client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;

    // KURULUM BAŞLATMA
    if (i.customId === 'onay_kur') {
        await i.reply({ content: "🚨 Castivol düzeni kuruluyor... Her şey siliniyor!", ephemeral: true });

        // 1. KANALLARI SİL
        const channels = await i.guild.channels.fetch();
        for (const channel of channels.values()) {
            await channel.delete().catch(() => {});
        }

        // 2. ROLLERİ SİL (Bot ve @everyone hariç)
        const roles = await i.guild.roles.fetch();
        for (const role of roles.values()) {
            if (role.managed || role.name === "@everyone") continue;
            await role.delete().catch(() => {});
        }

        // 3. YENİ ROLLERİ OLUŞTUR
        const shogunRol = await i.guild.roles.create({ name: '🛡️ Castivol Shogun', color: '#ff0000', hoist: true, permissions: [PermissionsBitField.Flags.Administrator] });
        const yonetimRol = await i.guild.roles.create({ name: '🎎 IzaKaya Yönetim', color: '#ffb7c5', hoist: true });
        const senpaiRol = await i.guild.roles.create({ name: '🌸 Senpai', color: '#ffffff', hoist: true });

        // 4. KATEGORİ VE KANALLAR
        const kategori = await i.guild.channels.create({ name: '🛡️ CASTIVOL MERKEZ', type: ChannelType.GuildCategory });

        const kanallar = ['📜-kurallar', '📢-duyurular', '🍵-sohbet', '🧧-destek-talebi'];
        
        for (const ad of kanallar) {
            const c = await i.guild.channels.create({ name: ad, type: ChannelType.GuildText, parent: kategori.id });

            // Destek kanalına ticket panelini at
            if (ad === '🧧-destek-talebi') {
                const ticketEmbed = new EmbedBuilder()
                    .setTitle("🧧 Castivol Destek Merkezi")
                    .setDescription("Bir sorun mu var kanka? Aşağıdaki butona bas, sana özel oda açalım!")
                    .setColor("#2f3136");
                
                const ticketBtn = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('ac').setLabel('Talep Aç').setStyle(ButtonStyle.Secondary).setEmoji('🧧')
                );
                await c.send({ embeds: [ticketEmbed], components: [ticketBtn] });
            }
        }
        
        await i.guild.channels.create({ name: '🔊-sohbet-ses', type: ChannelType.GuildVoice, parent: kategori.id });
    }

    // TICKET AÇMA (TALEP AÇ)
    if (i.customId === 'ac') {
        const ticketChannel = await i.guild.channels.create({
            name: `talep-${i.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });

        const welcome = new EmbedBuilder()
            .setTitle("🛡️ Castivol Destek")
            .setDescription(`Selam ${i.user}, talebin oluşturuldu. Yetkililer birazdan burada olur kanka!`)
            .setColor("#ffb7c5");

        const kapatBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('kapat').setLabel('Odayı Mühürle').setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ embeds: [welcome], components: [kapatBtn] });
        await i.reply({ content: `✅ Odan açıldı: ${ticketChannel}`, ephemeral: true });
    }

    // TICKET KAPATMA
    if (i.customId === 'kapat') {
        await i.reply("🔒 Oda mühürleniyor, 5 saniye içinde duman olacak...");
        setTimeout(() => i.channel.delete().catch(() => {}), 5000);
    }
});

client.login(process.env.TOKEN);
