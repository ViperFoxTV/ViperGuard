import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { successEmbed } from '../../utils/embeds.js';
import { logModerationAction } from '../../utils/moderation.js';
import { logger } from '../../utils/logger.js';
import { WarningService } from '../../services/warningService.js';
import { handleInteractionError } from '../../utils/errorHandler.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a user")
        .addUserOption((o) =>
            o.setName("target").setRequired(true).setDescription("User to warn"),
        )
        .addStringOption((o) =>
            o.setName("reason").setRequired(true).setDescription("Reason for the warning"),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    category: "moderation",

    async execute(interaction, config, client) {
        const deferSuccess = await InteractionHelper.safeDefer(interaction);
        if (!deferSuccess) {
            logger.warn(`Warn interaction defer failed`, {
                userId: interaction.user.id,
                guildId: interaction.guildId,
                commandName: 'warn'
            });
            return;
        }

        try {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                throw new Error("You need the `Moderate Members` permission to issue warnings.");
            }

            const target = interaction.options.getUser("target");
            const member = interaction.options.getMember("target");
            const reason = interaction.options.getString("reason");
            const moderator = interaction.user;
            const guildId = interaction.guildId;

            if (!member) {
                throw new Error("The target user is not currently in this server.");
            }

            // Store warning
            const result = await WarningService.addWarning({
                guildId,
                userId: target.id,
                moderatorId: moderator.id,
                reason,
                timestamp: Date.now()
            });

            if (!result.success) {
                throw new Error("Failed to store warning in database");
            }

            const totalWarns = result.totalCount;

            // DM the warned user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#FEE75C')
                    .setTitle(`⚠️ You have been warned in ${interaction.guild.name}`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: false },
                        { name: 'Moderator', value: moderator.tag, inline: true },
                        { name: 'Total Warnings', value: totalWarns.toString(), inline: true },
                    )
                    .setTimestamp()
                    .setFooter({ text: 'ViperGuard' });

                await target.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                logger.debug(`Could not DM user ${target.id} for warn:`, dmError.message);
            }

            // Log to mod_logs table (for dashboard)
            try {
                await client.db.query(
                    `INSERT INTO mod_logs (guild_id, target_id, moderator_id, action, reason)
                     VALUES ($1, $2, $3, 'warn', $4)`,
                    [guildId, target.id, moderator.id, reason]
                );
            } catch (dbError) {
                logger.debug('Could not log warn to mod_logs:', dbError.message);
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
                            .setColor('#FEE75C')
                            .setTitle('⚠️ Member Warned')
                            .addFields(
                                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                                { name: 'Moderator', value: `${moderator.tag} (${moderator.id})`, inline: true },
                                { name: 'Reason', value: reason, inline: false },
                                { name: 'Total Warnings', value: totalWarns.toString(), inline: true },
                            )
                            .setTimestamp()
                            .setFooter({ text: 'ViperGuard' });

                        await auditChannel.send({ embeds: [auditEmbed] });
                    }
                }
            } catch (auditError) {
                logger.debug('Could not send to audit log channel:', auditError.message);
            }

            // Log moderation action (existing system)
            await logModerationAction({
                client,
                guild: interaction.guild,
                event: {
                    action: "User Warned",
                    target: `${target.tag} (${target.id})`,
                    executor: `${moderator.tag} (${moderator.id})`,
                    reason,
                    metadata: {
                        userId: target.id,
                        moderatorId: moderator.id,
                        totalWarns,
                        warningNumber: totalWarns,
                        warningId: result.id
                    }
                }
            });

            await InteractionHelper.safeEditReply(interaction, {
                embeds: [
                    successEmbed(
                        `⚠️ **Warned** ${target.tag}`,
                        `**Reason:** ${reason}\n**Total Warns:** ${totalWarns}`,
                    ),
                ],
            });

        } catch (error) {
            logger.error('Warn command error:', error);
            await handleInteractionError(interaction, error, { subtype: 'warn_failed' });
        }
    }
};
