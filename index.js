/**
 * Reads the state of the server and generate a visualisation.
 */
module.exports = {
	connect: connect,
};

const Discord = require('discord.js');
const textVisualiser = require('./text-visualiser');
const webVisualiser = require('./web-visualiser');

const discordClient = new Discord.Client();

// Users in a guild { guild1_id: { guild1 }, guild2_id: { guild2 } }
const guilds = {};

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
discordClient.on('ready', () => console.log('Discord Bot is ready'));

// Record presence changes of users
discordClient.on('presenceUpdate', (oldMember, newMember) => {
	const { guild: newGuild, user: newUser, presence: newPresence } = newMember;
	const { guild: oldGuild, user: oldUser, presence: oldPresence } = oldMember;
	// User started an activity
	if (!oldPresence.game && newPresence.game) {
		console.log(`[${newGuild.name}] ${newUser.username} is now ${parsePresenceType(newPresence.game.type)} ${newPresence.game.name}`);
	}
	// User stopped an activity
	else if (oldPresence.game && !newPresence.game) {
		console.log(`[${oldGuild.name}] ${oldUser.username} has stopped ${parsePresenceType(oldPresence.game.type)} ${oldPresence.game.name}`);
	}
	// User changed activities
	else if (oldPresence.game && !oldPresence.game.equals(newPresence.game)) {
		console.log(`[${newGuild.name}] ${newUser.username} is now ${parsePresenceType(newPresence.game.type)} ${newPresence.game.name}`);
	}
	// User changed status
	else if (oldPresence.status !== newPresence.status) {
		console.log(`[${newGuild.name}] ${newUser.username} is now ${newPresence.status}`);
	}

	guilds[newGuild.id] = newGuild;
	textVisualiser.updateMembers(newGuild.members);
});

// Record messages and the channel it was sent in
discordClient.on('message', message => {
	const { guild, author, content, channel } = message;
	if (content) {
		console.log(`[${guild.name}] ${author.username} said ${content} (in ${channel.name})`);
	}
});

// Record emoji reactions
discordClient.on('messageReactionAdd', (messageReaction, user) => {
	const { message, emoji } = messageReaction;
	console.log(`[${message.guild.name}] ${user.username} reacted with ${emoji.name}`);
});

// Record voice channel updates
discordClient.on('voiceStateUpdate', (oldMember, newMember) => {
	const { guild: newGuild, user: newUser, voiceChannel: newVoice } = newMember;
	const { guild: oldGuild, user: oldUser, voiceChannel: oldVoice } = oldMember;
	// User joins a voice channel
	if (!oldVoice && newVoice) {
		console.log(`[${newGuild.name}] ${newUser.username} has joined voice channel ${newVoice.name}`);
	}
	// User leaves a voice channel
	else if (oldVoice && !newVoice) {
		console.log(`[${oldGuild.name}] ${oldUser.username} has left voice channel ${oldVoice.name}`);
	}
	// User switches to another voice channel
	else if (oldVoice && newVoice && !oldVoice.equals(newVoice)) {
		console.log(`[${newGuild.name}] ${newUser.username} has joined voice channel ${newVoice.name}`);
	}

	guilds[newGuild.id] = newGuild;
	textVisualiser.updateMembers(newGuild.members);
});

function parsePresenceType(type) {
	if (type === 0) { return 'playing'; }
	else if (type === 1) { return 'streaming'; }
	else if (type === 2) { return 'listening to'; }
	else if (type === 3) { return 'watching'; }
	else { return 'doing something'; }
}

// Required to connect as a user after OAuth2 authentication returns their access token
function connect(token) {
	console.log(`Authenticating with token: ${token}`);
	discordClient.login(token).catch(err => console.log(err));
}

// textVisualiser.start();
webVisualiser.start();