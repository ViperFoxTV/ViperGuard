import { Events, AuditLogEvent } from 'discord.js';
import { logger } from '../utils/logger.js';

export default {
  name: Events.GuildBanAdd,
  once: false,

  async execute(ban) {
    try {
      const { guild, user } = ban;
      const client = guild.client;

      // Check if cross-ban is enabled in the database for this guild
      const result = await client.db.query(
        `SELECT features FROM guild_settings WHERE guild_id = $1`,
        [guild.id]
      ).catch(() => null);

      const features = result?.rows?.[0]?.features;
      if (features?.crossBan === false) return;

      // Check if this ban is already a cross-ban (avoid infinite loops)
      const existingCrossBan = await client.db.query(
        `SELECT user_id FROM cross_bans WHERE user_id = $1 AND active = true`,
        [user.id]
      ).catch(() => null);

      if (!existingCrossBan?.rows?.length) return;

      // Fetch audit log to get the ban reason
      let reason = 'Cross-ban from another server';
      let moderatorId = null;
      try {
        const auditLogs = await guild.fetchAuditLogs({
          type: AuditLogEvent.MemberBanAdd,
          limit: 5,
        });
        const entry = auditLogs.entries.find(e => e.target?.id === user.id);
        if (entry) {
          reason = entry.reason || reason;
          moderatorId = entry.executor?.id;
        }
      } catch (err) {
        logger.debug('Could not fetch audit log for cross-ban:', err);
      }

      // Insert into cross_bans table
      await client.db.query(
        `INSERT INTO cross_bans (user_id, issuer_id, reason, active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (user_id) DO UPDATE SET reason = $3, active = true, updated_at = NOW()`,
        [user.id, moderatorId, reason]
      ).catch(err => logger.error('Error inserting cross-ban:', err));

      // Sync the ban to all other guilds the bot is in
      const guilds = client.guilds.cache;
      let syncedCount = 0;

      for (const [guildId, targetGuild] of guilds) {
        // Skip the guild where the ban originated
        if (guildId === guild.id) continue;

        try {
          // Check if cross-ban is enabled in this guild
          const targetResult = await client.db.query(
            `SELECT features FROM guild_settings WHERE guild_id = $1`,
            [guildId]
          ).catch(() => null);

          const targetFeatures = targetResult?.rows?.[0]?.features;
          if (targetFeatures?.crossBan === false) continue;

          // Check if user is already banned in this guild
          const existingBan = await targetGuild.bans.fetch(user.id).catch(() => null);
          if (existingBan) continue;

          // Ban the user
          await targetGuild.members.ban(user.id, {
            reason: `[ViperGuard Cross-Ban] ${reason}`,
            deleteMessageSeconds: 0,
          });

          // Log to mod_logs
          await client.db.query(
            `INSERT INTO mod_logs (guild_id, target_id, moderator_id, action, reason)
             VALUES ($1, $2, $3, 'ban', $4)`,
            [guildId, user.id, client.user.id, `[Cross-Ban] ${reason}`]
          ).catch(() => {});

          // Log to audit channel if set
          const configResult = await client.db.query(
            `SELECT audit_log_channel FROM guild_settings WHERE guild_id = $1`,
            [guildId]
          ).catch(() => null);

          const auditChannelId = configResult?.rows?.[0]?.audit_log_channel;
          if (auditChannelId) {
            const auditChannel = targetGuild.channels.cache.get(auditChannelId);
            if (auditChannel?.isTextBased()) {
              await auditChannel.send(
                `🐍 **Cross-ban applied** | ${user.tag} (\`${user.id}\`) was banned.\n**Reason:** ${reason}\n**Origin:** ${guild.name}`
              ).catch(() => {});
            }
          }

          syncedCount++;
          logger.info(`Cross-ban synced: ${user.tag} banned in ${targetGuild.name}`);

        } catch (err) {
          logger.warn(`Failed to cross-ban ${user.tag} in guild ${guildId}:`, err.message);
        }
      }

      logger.info(`Cross-ban complete: ${user.tag} synced to ${syncedCount} server(s)`);

    } catch (error) {
      logger.error('Error in guildBanAdd (cross-ban) event:', error);
    }
  }
};
