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
    console.log(`✅ ${client.user.tag} Savaş Modunda!`);
    client.user.setActivity("Castivol Savaşlarını", { type: 3 });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 1. SAVAŞ DUYURU (Maç Duyuru Yerine)
    if (command === "savaş-duyuru") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const icerik = args.join(" ");
        if (!icerik) return message.reply("Savaş detaylarını (Saat, Rakip, Oyun) yazmalısın kanka!");

        const embed = new EmbedBuilder()
            .setTitle("⚔️ SAVAŞ ÇAĞRISI: CEPHEYE!")
            .setDescription(`**Savaş Detayları:**\n${icerik}\n\n✅ Katılacaklar tepki versin!`)
            .setColor("#ff0000")
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: "Castivol Ordusu Toplanıyor" });

        const mesaj = await message.channel.send({ content: "@everyone", embeds: [embed] });
        await mesaj.react("✅");
        await mesaj.react("❌");
        message.delete();
    }

    // 2. MESAJ SİLME
    if (command === "sil") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const miktar = parseInt(args[0]);
        if (!miktar || miktar < 1 || miktar > 100) return message.reply("1 ile 100 arasında bir sayı yaz kanka.");

        await message.channel.bulkDelete(miktar, true);
        message.channel.send(`✅ **${miktar}** adet mesaj süpürüldü!`).then(m => setTimeout(() => m.delete(), 3000));
    }

    // 3. ROL ALMA SİSTEMİ
    if (command === "rolal-kur") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const embed = new EmbedBuilder()
            .setTitle("🎮 OYUN ROLÜNÜ SEÇ")
            .setDescription("Oynadığın oyunların rollerini aşağıdan alabilirsin kanka. Böylece savaş duyurularında seni de çağırabiliriz!")
            .setColor("#5865F2");

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('rol_secim')
                .setPlaceholder('Oynadığın oyunları seç...')
                .addOptions([
                    { label: 'Valorant', value: 'valorant_rol_id', emoji: '🔫' }, // BURAYA ROL IDLERİNİ YAZMALISIN
                    { label: 'League of Legends', value: 'lol_rol_id', emoji: '⚔️' },
                    { label: 'Counter-Strike 2', value: 'cs2_rol_id', emoji: '💣' }
                ])
        );

        message.channel.send({ embeds: [embed], components: [row] });
    }

    // --- ESKİ KOMUTLAR (Duyuru, Ticket, Uyar, SA) ---
    if (command === "duyuru") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const metin = args.join(" ");
        if (!metin) return;
        const embed = new EmbedBuilder().setTitle("📢 DUYURU").setDescription(metin).setColor("#00d4ff");
        message.channel.send({ content: "@everyone", embeds: [embed] });
        message.delete();
    }

    if (command === "ticket-kur") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const embed = new EmbedBuilder().setTitle("🛡️ CASTIVOL İŞLEM MERKEZİ").setDescription("Alım, Öneri veya Partnerlik için tıkla!").setColor("#2f3136");
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('t_alim').setLabel('Klan Alımı').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('t_oneri').setLabel('Öneri/Şikayet').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('t_partner').setLabel('Partnerlik').setStyle(ButtonStyle.Primary)
        );
        message.channel.send({ embeds: [embed], components: [row] });
    }

    if (command === "sa") message.reply("Aleyküm Selam kanka!");
});

// --- ROL VE TICKET ETKİLEŞİMLERİ ---
client.on('interactionCreate', async (i) => {
    if (i.isStringSelectMenu() && i.customId === 'rol_secim') {
        const roleId = i.values[0];
        const role = i.guild.roles.cache.get(roleId);
        if (!role) return i.reply({ content: "Bu rol bulunamadı (ID ayarlanmamış olabilir kanka).", ephemeral: true });

        if (i.member.roles.cache.has(roleId)) {
            await i.member.roles.remove(roleId);
            return i.reply({ content: `✅ **${role.name}** rolü üzerinden alındı.`, ephemeral: true });
        } else {
            await i.member.roles.add(roleId);
            return i.reply({ content: `✅ **${role.name}** rolü sana verildi.`, ephemeral: true });
        }
    }

    // (Buraya eski ticket buton kodlarını ekleyebilirsin, v2'deki gibi)
});

client.login(process.env.TOKEN);
