import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { handleInteractionError } from '../../utils/errorHandler.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName("crossban")
        .setDescription("Ban a user across ALL servers ViperGuard is in")
        .addUserOption((option) =>
            option.setName("target").setDescription("The user to cross-ban").setRequired(true),
        )
        .addStringOption((option) =>
            option.setName("reason").setDescription("Reason for the cross-ban").setRequired(true),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    category: "moderation",

    async execute(interaction, config, client) {
        const deferSuccess = await InteractionHelper.safeDefer(interaction);
        if (!deferSuccess) return;

        try {
            if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                throw new Error("You need the `Ban Members` permission to issue cross-bans.");
            }

            const targetUser = interaction.options.getUser("target");
            const reason = interaction.options.getString("reason");
            const moderator = interaction.user;
            const guildId = interaction.guildId;

            if (targetUser.id === interaction.user.id) throw new Error("You cannot cross-ban yourself.");
            if (targetUser.id === client.user.id) throw new Error("You cannot cross-ban the bot.");

            // Add to cross_bans table
            await client.db.query(
                `INSERT INTO cross_bans (user_id, issuer_id, reason, active)
                 VALUES ($1, $2, $3, true)
                 ON CONFLICT (user_id) DO UPDATE SET reason = $3, active = true, updated_at = NOW()`,
                [targetUser.id, moderator.id, reason]
            );

            // Loop through all guilds and ban
            const guilds = client.guilds.cache;
            let successCount = 0;
            let failCount = 0;
            const failedGuilds = [];

            for (const [id, guild] of guilds) {
                try {
                    // Check if already banned
                    const existingBan = await guild.bans.fetch(targetUser.id).catch(() => null);
                    if (existingBan) {
                        successCount++;
                        continue;
                    }

                    // Check if cross-ban is enabled for this guild
                    const settingsResult = await client.db.query(
                        `SELECT features, audit_log_channel FROM guild_settings WHERE guild_id = $1`,
                        [id]
                    ).catch(() => null);

                    const features = settingsResult?.rows?.[0]?.features;
                    if (features?.crossBan === false) continue;

                    // Ban the user
                    await guild.members.ban(targetUser.id, {
                        reason: `[ViperGuard Cross-Ban] ${reason} | Issued by: ${moderator.tag}`,
                        deleteMessageSeconds: 0,
                    });

                    // Log to mod_logs
                    await client.db.query(
                        `INSERT INTO mod_logs (guild_id, target_id, moderator_id, action, reason)
                         VALUES ($1, $2, $3, 'ban', $4)`,
                        [id, targetUser.id, moderator.id, `[Cross-Ban] ${reason}`]
                    ).catch(() => {});

                    // Post to audit log channel
                    const auditChannelId = settingsResult?.rows?.[0]?.audit_log_channel;
                    if (auditChannelId) {
                        const auditChannel = guild.channels.cache.get(auditChannelId);
                        if (auditChannel?.isTextBased()) {
                            const auditEmbed = new EmbedBuilder()
                                .setColor('#ED4245')
                                .setTitle('🐍 Cross-Ban Applied')
                                .addFields(
                                    { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                                    { name: 'Issued By', value: `${moderator.tag}`, inline: true },
                                    { name: 'Reason', value: reason, inline: false },
                                )
                                .setTimestamp()
                                .setFooter({ text: 'ViperGuard Cross-Ban' });

                            await auditChannel.send({ embeds: [auditEmbed] }).catch(() => {});
                        }
                    }

                    successCount++;
                    logger.info(`Cross-ban applied: ${targetUser.tag} banned in ${guild.name}`);

                } catch (err) {
                    failCount++;
                    failedGuilds.push(guild.name);
                    logger.warn(`Cross-ban failed in ${guild.name}:`, err.message);
                }
            }

            // DM the banned user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('🐍 You have been cross-banned')
                    .setDescription('You have been banned from all servers using ViperGuard.')
                    .addFields(
                        { name: 'Reason', value: reason, inline: false },
                        { name: 'Issued By', value: moderator.tag, inline: true },
                    )
                    .setTimestamp()
                    .setFooter({ text: 'ViperGuard' });

                await targetUser.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                logger.debug(`Could not DM user ${targetUser.id} for cross-ban`);
            }

            // Log in current guild mod_logs
            await client.db.query(
                `INSERT INTO mod_logs (guild_id, target_id, moderator_id, action, reason)
                 VALUES ($1, $2, $3, 'ban', $4)`,
                [guildId, targetUser.id, moderator.id, `[Cross-Ban] ${reason}`]
            ).catch(() => {});

            await InteractionHelper.safeEditReply(interaction, {
                embeds: [
                    successEmbed(
                        `🐍 Cross-ban issued for ${targetUser.tag}`,
                        `**Reason:** ${reason}\n**Banned in:** ${successCount} server(s)${failCount > 0 ? `\n**Failed in:** ${failedGuilds.join(', ')}` : ''}`,
                    ),
                ],
            });

        } catch (error) {
            logger.error('Cross-ban command error:', error);
            await handleInteractionError(interaction, error, { subtype: 'crossban_failed' });
        }
    }
};
