const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Castivol Savaş Botu Aktif!'));
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
    console.log(`✅ ${client.user.tag} Hazır!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ROL ALMA KURULUM (Genişletilmiş)
    if (command === "rolal-kur") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const embed = new EmbedBuilder()
            .setTitle("🎮 OYUN ROLLERİNİ SEÇ")
            .setDescription("Oynadığın oyunları menüden seçerek rolünü alabilirsin kanka!")
            .setColor("#5865F2");

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('rol_secim')
                .setPlaceholder('Oyunlarını buradan seç...')
                .addOptions([
                    { label: 'Valorant', value: '1500078242357444649', emoji: '🔫' },
                    { label: 'League of Legends', value: '1500078269033218088', emoji: '⚔️' },
                    { label: 'Counter-Strike 2', value: '1500078269817556992', emoji: '💣' },
                    { label: 'Roblox', value: '1500078273567260682', emoji: '🧱' },
                    { label: 'Minecraft', value: '1500078274058129530', emoji: '⛏️' },
                    { label: 'Brawl Stars', value: '1500078274242543626', emoji: '⭐' }
                ])
        );

        message.channel.send({ embeds: [embed], components: [row] });
    }
    
    // SAVAŞ DUYURU
    if (command === "savaş-duyuru") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const icerik = args.join(" ");
        if (!icerik) return message.reply("Savaş detaylarını yaz!");

        const embed = new EmbedBuilder()
            .setTitle("⚔️ SAVAŞ ÇAĞRISI!")
            .setDescription(icerik)
            .setColor("#ff0000");

        const m = await message.channel.send({ content: "@everyone", embeds: [embed] });
        await m.react("✅");
        await m.react("❌");
        message.delete();
    }
});

// ETKİLEŞİM İŞLEMCİSİ
client.on('interactionCreate', async (i) => {
    if (!i.isStringSelectMenu()) return;
    if (i.customId === 'rol_secim') {
        const roleId = i.values[0];
        // Eğer ID'leri henüz girmediysen bot burada hata verir, uyaralım.
        if (roleId.startsWith("ROL_ID")) return i.reply({ content: "Kanka kodun içindeki ROL_ID kısımlarını henüz ayarlamamışsın!", ephemeral: true });

        const role = i.guild.roles.cache.get(roleId);
        if (!role) return i.reply({ content: "Rol bulunamadı!", ephemeral: true });

        if (i.member.roles.cache.has(roleId)) {
            await i.member.roles.remove(roleId);
            i.reply({ content: `✅ **${role.name}** rolü çıkarıldı.`, ephemeral: true });
        } else {
            await i.member.roles.add(roleId);
            i.reply({ content: `✅ **${role.name}** rolü verildi.`, ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
