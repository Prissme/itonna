const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');

// --- CONFIGURATION ---
// Sur Koyeb, crée une variable d'environnement nommée : DISCORD_TOKEN
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; 

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// --- DONNÉES DU CLASSEMENT (En mémoire) ---
let leaderboardData = [
    { name: "Naell", time: "04:31.00", date: "04/05/2026", proof: "https://youtu.be/n3uWxAc_6nU?si=wa1VXIMiFmiVvcQR" },
    { name: "HutaoMarryMe", time: "04:33.00", date: "04/05/2026", proof: "https://youtu.be/1b2d3pVnTDI" },
    { name: "Prissme", time: "05:16.00", date: "04/05/2026", proof: "https://youtu.be/3EbWp6dwKtA?si=QtmfTchaZYtl0Bz2" },
    { name: "Pizza", time: "07:00.00", date: "04/05/2026", proof: "#" }
];

// --- CRÉATION DE L'EMBED ---
function createLeaderboardEmbed() {
    const sorted = [...leaderboardData].sort((a, b) => a.time.localeCompare(b.time));
    
    const embed = new EmbedBuilder()
        .setTitle('🏆 RANKED NB SPEEDRUN | BRONZE 2%')
        .setDescription('Tableau officiel des records mondiaux')
        .setColor(0xcd7f32)
        .setThumbnail('https://media.discordapp.net/attachments/1434252768633290952/1500845879475703919/9k.png')
        .setTimestamp()
        .setFooter({ text: 'Propulsé par PRISSME TV', iconURL: 'https://media.discordapp.net/attachments/1434252768633290952/1500845879475703919/9k.png' });

    let leaderboardString = "";
    sorted.forEach((p, i) => {
        const rank = i + 1;
        const trophy = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '👤';
        const recordBadge = rank === 1 ? ' **[WR]**' : '';
        leaderboardString += `${trophy} **#${rank}** - **${p.name}**${recordBadge}\n⏱️ \`${p.time}\` | [Voir le Clip](${p.proof})\n\n`;
    });

    embed.addFields({ name: 'Classement Actuel', value: leaderboardString || 'Aucun record.' });
    return embed;
}

// --- INITIALISATION ---
client.once('ready', async () => {
    console.log(`Bot connecté : ${client.user.tag}`);

    const commands = [
        new SlashCommandBuilder()
            .setName('leaderboard')
            .setDescription('Afficher le classement'),
        new SlashCommandBuilder()
            .setName('add-record')
            .setDescription('Ajouter un joueur')
            .addStringOption(opt => opt.setName('joueur').setDescription('Nom du joueur').setRequired(true))
            .addStringOption(opt => opt.setName('temps').setDescription('Format MM:SS.mm (ex: 04:30.00)').setRequired(true))
            .addStringOption(opt => opt.setName('lien').setDescription('Lien YouTube').setRequired(true)),
        new SlashCommandBuilder()
            .setName('remove-record')
            .setDescription('Retirer un joueur')
            .addStringOption(opt => opt.setName('joueur').setDescription('Nom exact du joueur').setRequired(true)),
    ];

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('Commandes slash enregistrées.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'leaderboard') {
        await interaction.reply({ embeds: [createLeaderboardEmbed()] });
    }

    if (interaction.commandName === 'add-record') {
        const name = interaction.options.getString('joueur');
        const time = interaction.options.getString('temps');
        const proof = interaction.options.getString('lien');
        const date = new Date().toLocaleDateString('fr-FR');

        leaderboardData = leaderboardData.filter(p => p.name.toLowerCase() !== name.toLowerCase());
        leaderboardData.push({ name, time, proof, date });
        
        await interaction.reply(`✅ Record de **${name}** ajouté avec succès !`);
    }

    if (interaction.commandName === 'remove-record') {
        const name = interaction.options.getString('joueur');
        const initialLength = leaderboardData.length;
        leaderboardData = leaderboardData.filter(p => p.name.toLowerCase() !== name.toLowerCase());
        
        if (leaderboardData.length < initialLength) {
            await interaction.reply(`🗑️ **${name}** a été retiré du classement.`);
        } else {
            await interaction.reply(`❌ Joueur **${name}** introuvable.`);
        }
    }
});

client.login(TOKEN);
