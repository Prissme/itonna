const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');

// --- CONFIGURATION ---
// Sur Koyeb, crée une variable d'environnement nommée : DISCORD_TOKEN
const TOKEN = process.env.DISCORD_TOKEN;

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
        // Ajout de ton image violette en bannière
        .setImage('https://media.discordapp.net/attachments/1311029253457580045/1336473634045952131/image_98d720.jpg?ex=67a3ed1e&is=67a29b9e&hm=c1767e415b3e75e11f77d33b86027a42129c5468846c988975975005898d2495&=&format=webp')
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
        console.log('Rafraîchissement des commandes...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('Commandes enregistrées !');
    } catch (error) {
        console.error('Erreur commandes :', error);
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
        
        leaderboardData = leaderboardData.filter(p => p.name.toLowerCase() !== name.toLowerCase());
        leaderboardData.push({ name, time, proof, date: new Date().toLocaleDateString('fr-FR') });
        
        await interaction.reply(`✅ Record de **${name}** ajouté !`);
    }

    if (interaction.commandName === 'remove-record') {
        const name = interaction.options.getString('joueur');
        const initialLength = leaderboardData.length;
        leaderboardData = leaderboardData.filter(p => p.name.toLowerCase() !== name.toLowerCase());
        
        if (leaderboardData.length < initialLength) {
            await interaction.reply(`🗑️ **${name}** retiré.`);
        } else {
            await interaction.reply(`❌ Joueur introuvable.`);
        }
    }
});

if (TOKEN) {
    client.login(TOKEN).catch(err => console.error("Erreur login :", err));
} else {
    console.error("Variable DISCORD_TOKEN manquante.");
}
