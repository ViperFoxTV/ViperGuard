import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { logModerationAction } from '../../utils/moderation.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { TitanBotError, ErrorTypes } from '../../utils/errorHandler.js';

export default {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a user from the server")
        .addUserOption((option) =>
            option.setName("target").setDescription("The user to kick").setRequired(true),
        )
        .addStringOption((option) =>
            option.setName("reason").setDescription("Reason for the kick"),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    category: "moderation",

    async execute(interaction, config, client) {
        try {
            if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
                throw new TitanBotError("User lacks permission", ErrorTypes.PERMISSION, "You do not have permission to kick members.");
            }

            const targetUser = interaction.options.getUser("target");
            const member = interaction.options.getMember("target");
            const reason = interaction.options.getString("reason") || "No reason provided";
            const moderator = interaction.user;
            const guildId = interaction.guildId;

            if (targetUser.id === interaction.user.id) {
                throw new TitanBotError("Cannot kick self", ErrorTypes.VALIDATION, "You cannot kick yourself.");
            }
            if (targetUser.id === client.user.id) {
                throw new TitanBotError("Cannot kick bot", ErrorTypes.VALIDATION, "You cannot kick the bot.");
            }
            if (!member) {
                throw new TitanBotError("Target not found", ErrorTypes.USER_INPUT, "The target user is not currently in this server.", { subtype: 'user_not_found' });
            }
            if (interaction.member.roles.highest.position <= member.roles.highest.position) {
                throw new TitanBotError("Cannot kick user", ErrorTypes.PERMISSION, "You cannot kick a user with an equal or higher role than you.");
            }
            if (!member.kickable) {
                throw new TitanBotError("Bot cannot kick", ErrorTypes.PERMISSION, "I cannot kick this user. Please check my role position relative to the target user.");
            }

            // DM the user before kicking
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#FAA61A')
                    .setTitle(`👢 You have been kicked from ${interaction.guild.name}`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: false },
                        { name: 'Moderator', value: moderator.tag, inline: true },
                    )
                    .setTimestamp()
                    .setFooter({ text: 'ViperGuard' });

                await targetUser.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                logger.debug(`Could not DM user ${targetUser.id} for kick:`, dmError.message);
            }

            await member.kick(reason);

            // Log to mod_logs table (for dashboard)
            try {
                await client.db.query(
                    `INSERT INTO mod_logs (guild_id, target_id, moderator_id, action, reason)
                     VALUES ($1, $2, $3, 'kick', $4)`,
                    [guildId, targetUser.id, moderator.id, reason]
                );
            } catch (dbError) {
                logger.debug('Could not log kick to mod_logs:', dbError.message);
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
                            .setColor('#FAA61A')
                            .setTitle('👢 Member Kicked')
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

            const caseId = await logModerationAction({
                client,
                guild: interaction.guild,
                event: {
                    action: "Member Kicked",
                    target: `${targetUser.tag} (${targetUser.id})`,
                    executor: `${moderator.tag} (${moderator.id})`,
                    reason,
                    metadata: {
                        userId: targetUser.id,
                        moderatorId: moderator.id
                    }
                }
            });

            await InteractionHelper.universalReply(interaction, {
                embeds: [
                    successEmbed(
                        `👢 **Kicked** ${targetUser.tag}`,
                        `**Reason:** ${reason}\n**Case ID:** #${caseId}`,
                    ),
                ],
            });

        } catch (error) {
            logger.error('Kick command error:', error);
            const errorEmbed_default = errorEmbed(
                "An unexpected error occurred while trying to kick the user.",
                error.message || "Could not kick the user"
            );
            await InteractionHelper.universalReply(interaction, { embeds: [errorEmbed_default] });
        }
    }
};
