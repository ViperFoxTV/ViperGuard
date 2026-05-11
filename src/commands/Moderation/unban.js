import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { successEmbed } from '../../utils/embeds.js';
import { logModerationAction } from '../../utils/moderation.js';
import { logger } from '../../utils/logger.js';
import { ModerationService } from '../../services/moderationService.js';
import { handleInteractionError } from '../../utils/errorHandler.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban a user from the server")
        .addUserOption(option =>
            option.setName("target").setDescription("The user to unban (can be ID or mention)").setRequired(true)
        )
        .addStringOption(option =>
            option.setName("reason").setDescription("Reason for the unban").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    category: "moderation",

    async execute(interaction, config, client) {
        const deferSuccess = await InteractionHelper.safeDefer(interaction);
        if (!deferSuccess) {
            logger.warn(`Unban interaction defer failed`, {
                userId: interaction.user.id,
                guildId: interaction.guildId,
                commandName: 'unban'
            });
            return;
        }

        try {
            const targetUser = interaction.options.getUser("target");
            const reason = interaction.options.getString("reason") || "No reason provided";
            const moderator = interaction.user;
            const guildId = interaction.guildId;

            const result = await ModerationService.unbanUser({
                guild: interaction.guild,
                user: targetUser,
                moderator: interaction.member,
                reason
            });

            // Log to mod_logs table (for dashboard)
            try {
                await client.db.query(
                    `INSERT INTO mod_logs (guild_id, target_id, moderator_id, action, reason)
                     VALUES ($1, $2, $3, 'unban', $4)`,
                    [guildId, targetUser.id, moderator.id, reason]
                );
            } catch (dbError) {
                logger.debug('Could not log unban to mod_logs:', dbError.message);
            }

            // Update bans table
            try {
                await client.db.query(
                    `UPDATE bans SET active = false, updated_at = NOW()
                     WHERE guild_id = $1 AND user_id = $2`,
                    [guildId, targetUser.id]
                );
            } catch (dbError) {
                logger.debug('Could not update bans table for unban:', dbError.message);
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
                            .setColor('#2ECC71')
                            .setTitle('✅ Member Unbanned')
                            .addFields(
                                { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
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

            // Try to DM the unbanned user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#2ECC71')
                    .setTitle(`✅ You have been unbanned from ${interaction.guild.name}`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: false },
                        { name: 'Moderator', value: moderator.tag, inline: true },
                    )
                    .setTimestamp()
                    .setFooter({ text: 'ViperGuard' });

                await targetUser.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                logger.debug(`Could not DM user ${targetUser.id} for unban:`, dmError.message);
            }

            await InteractionHelper.safeEditReply(interaction, {
                embeds: [
                    successEmbed(
                        "✅ User Unbanned",
                        `Successfully unbanned **${targetUser.tag}** from the server.\n\n**Reason:** ${reason}\n**Case ID:** #${result.caseId}`
                    )
                ]
            });

        } catch (error) {
            logger.error('Unban command error:', error);
            await handleInteractionError(interaction, error, { subtype: 'unban_failed' });
        }
    }
};
