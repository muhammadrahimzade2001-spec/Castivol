const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('IzaKaya Shogun Aktif! 🏮'));
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
    console.log(`✅ ${client.user.tag} Yıkım ve Yeniden İnşa İçin Hazır!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- 🧨 SIFIRDAN KURULUM KOMUTU ---
    if (command === "kur") {
        if (message.author.id !== message.guild.ownerId) {
            return message.reply("Bu komut o kadar tehlikeli ki sadece sunucu sahibi kullanabilir! ❌");
        }

        message.channel.send("⚠️ **Yıkım başladı!** 10 saniye içinde her şey silinecek ve Castivol düzeni kurulacak. Sayonara...");

        setTimeout(async () => {
            try {
                // 1. TÜM KANALLARI SİL
                const channels = await message.guild.channels.fetch();
                for (const channel of channels.values()) {
                    await channel.delete().catch(err => console.log(`Kanal silinemedi: ${err.message}`));
                }

                // 2. TÜM ROLLERİ SİL (Botun rolü ve @everyone hariç)
                const roles = await message.guild.roles.fetch();
                for (const role of roles.values()) {
                    if (role.managed || role.name === "@everyone") continue;
                    await role.delete().catch(err => console.log(`Rol silinemedi: ${err.message}`));
                }

                // 3. YENİ ROLLERİ OLUŞTUR
                const shogunRol = await message.guild.roles.create({ name: '🛡️ Castivol Shogun', color: '#ff0000', hoist: true, permissions: [PermissionsBitField.Flags.Administrator] });
                const yonetimRol = await message.guild.roles.create({ name: '🎎 IzaKaya Yönetim', color: '#ffb7c5', hoist: true });
                const senpaiRol = await message.guild.roles.create({ name: '🌸 Senpai (Üye)', color: '#ffffff', hoist: true });

                // 4. YENİ KATEGORİ VE KANALLARI OLUŞTUR
                const kategori = await message.guild.channels.create({ name: '🏮 IZAKAYA MERKEZ', type: ChannelType.GuildCategory });

                const textChannels = ['🏮-duyurular', '🎎-kurallar', '🍵-sohbet', '⛩️-başvuru'];
                for (const name of textChannels) {
                    const c = await message.guild.channels.create({ name, type: ChannelType.GuildText, parent: kategori.id });
                    
                    // Başvuru kanalına ticket sistemini otomatik kur
                    if (name === '⛩️-başvuru') {
                        const embed = new EmbedBuilder()
                            .setTitle("🏮 Destek & Başvuru")
                            .setDescription("İşlem başlatmak için butona bas senpai!")
                            .setColor("#ffb7c5");
                        const btn = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId('izakaya_ticket').setLabel('Talep Aç').setStyle(ButtonStyle.Primary).setEmoji('🧧')
                        );
                        await c.send({ embeds: [embed], components: [btn] });
                    }
                }

                await message.guild.channels.create({ name: '🔊-ses-odası', type: ChannelType.GuildVoice, parent: kategori.id });

            } catch (error) {
                console.error("Kurulum hatası:", error);
            }
        }, 10000); // 10 saniye bekleme süresi (vazgeçmek istersen botu kapat diye)
    }
});

// --- TICKET ETKİLEŞİMİ (Butonun çalışması için şart) ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'izakaya_ticket') {
        const c = await interaction.guild.channels.create({
            name: `talep-${interaction.user.username}`,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });
        await c.send(`${interaction.user} Hoş geldin!`);
        await interaction.reply({ content: "Odan açıldı!", ephemeral: true });
    }
});

client.login(process.env.TOKEN);
