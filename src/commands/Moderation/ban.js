import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { successEmbed } from '../../utils/embeds.js';
import { logModerationAction } from '../../utils/moderation.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { ModerationService } from '../../services/moderationService.js';
import { handleInteractionError } from '../../utils/errorHandler.js';

export default {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a user from the server")
        .addUserOption((option) =>
            option.setName("target").setDescription("The user to ban").setRequired(true),
        )
        .addStringOption((option) =>
            option.setName("reason").setDescription("Reason for the ban"),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    category: "moderation",

    async execute(interaction, config, client) {
        try {
            const user = interaction.options.getUser("target");
            const reason = interaction.options.getString("reason") || "No reason provided";
            const moderator = interaction.user;
            const guildId = interaction.guildId;

            if (user.id === interaction.user.id) throw new Error("You cannot ban yourself.");
            if (user.id === client.user.id) throw new Error("You cannot ban the bot.");

            const result = await ModerationService.banUser({
                guild: interaction.guild,
                user,
                moderator: interaction.member,
                reason
            });

            // DM the banned user before banning
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle(`🚫 You have been banned from ${interaction.guild.name}`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: false },
                        { name: 'Moderator', value: moderator.tag, inline: true },
                    )
                    .setTimestamp()
                    .setFooter({ text: 'ViperGuard' });

                await user.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                logger.debug(`Could not DM user ${user.id} for ban:`, dmError.message);
            }

            // Log to mod_logs table (for dashboard)
            try {
                await client.db.query(
                    `INSERT INTO mod_logs (guild_id, target_id, moderator_id, action, reason)
                     VALUES ($1, $2, $3, 'ban', $4)`,
                    [guildId, user.id, moderator.id, reason]
                );
            } catch (dbError) {
                logger.debug('Could not log ban to mod_logs:', dbError.message);
            }

            // Also log to bans table
            try {
                await client.db.query(
                    `INSERT INTO bans (guild_id, user_id, moderator_id, reason, active)
                     VALUES ($1, $2, $3, $4, true)
                     ON CONFLICT (guild_id, user_id) DO UPDATE SET reason = $4, active = true, updated_at = NOW()`,
                    [guildId, user.id, moderator.id, reason]
                );
            } catch (dbError) {
                logger.debug('Could not log ban to bans table:', dbError.message);
            }

            // Send to audit log channel
            try {
                const settingsResult = await client.db.query(
                    `SELECT audit_log_channel FROM guild_settings WHERE guild_id = $1`,
                    [guildId]
                );
                const auditChannelId = settingsResult?.rows?.[0]?.audit_log_channel;
                if (auditChannelId) {
                    const auditChannel = interaction.guild.channels.cache.get(auditChannelId);
                    if (auditChannel?.isTextBased()) {
                        const auditEmbed = new EmbedBuilder()
                            .setColor('#ED4245')
                            .setTitle('🚫 Member Banned')
                            .addFields(
                                { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                                { name: 'Moderator', value: `${moderator.tag} (${moderator.id})`, inline: true },
                                { name: 'Reason', value: reason, inline: false },
                            )
                            .setTimestamp()
                            .setFooter({ text: 'ViperGuard' });

                        await auditChannel.send({ embeds: [auditEmbed] });
                    }
                }
            } catch (auditError) {
                logger.debug('Could not send to audit log channel:', auditError.message);
            }

            await InteractionHelper.universalReply(interaction, {
                embeds: [
                    successEmbed(
                        `🚫 **Banned** ${user.tag}`,
                        `**Reason:** ${reason}\n**Case ID:** #${result.caseId}`,
                    ),
                ],
            });

        } catch (error) {
            logger.error('Ban command error:', error);
            await handleInteractionError(interaction, error, { subtype: 'ban_failed' });
        }
    },
};
