import express from 'express';
import { db } from '../index.js';
import { requireStaff } from './auth.js';

const router = express.Router();

// All routes here require staff login
router.use(requireStaff);

// ==============================
// GET /api/server/settings
// Returns current server settings (channels, welcome msg, etc.)
// ==============================
router.get('/settings', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM guild_settings WHERE guild_id = $1',
      [process.env.GUILD_ID]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// PATCH /api/server/settings
// Update server settings — channels, welcome message, etc.
// Body example: { welcome_channel: "123456", log_channel: "789012" }
// ==============================
router.patch('/settings', async (req, res) => {
  const {
    welcome_channel,
    goodbye_channel,
    log_channel,
    audit_log_channel,
    ticket_category,
    auto_role,
    welcome_message,
    goodbye_message,
  } = req.body;

  try {
    await db.query(`
      INSERT INTO guild_settings (
        guild_id, welcome_channel, goodbye_channel, log_channel,
        audit_log_channel, ticket_category, auto_role,
        welcome_message, goodbye_message
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (guild_id) DO UPDATE SET
        welcome_channel   = COALESCE($2, guild_settings.welcome_channel),
        goodbye_channel   = COALESCE($3, guild_settings.goodbye_channel),
        log_channel       = COALESCE($4, guild_settings.log_channel),
        audit_log_channel = COALESCE($5, guild_settings.audit_log_channel),
        ticket_category   = COALESCE($6, guild_settings.ticket_category),
        auto_role         = COALESCE($7, guild_settings.auto_role),
        welcome_message   = COALESCE($8, guild_settings.welcome_message),
        goodbye_message   = COALESCE($9, guild_settings.goodbye_message),
        updated_at        = NOW()
    `, [
      process.env.GUILD_ID,
      welcome_channel, goodbye_channel, log_channel,
      audit_log_channel, ticket_category, auto_role,
      welcome_message, goodbye_message,
    ]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// GET /api/server/stats
// Quick stats for the dashboard overview panel
// ==============================
router.get('/stats', async (req, res) => {
  try {
    const [bans, tickets, economy, crossBans] = await Promise.all([
      db.query('SELECT COUNT(*) FROM bans WHERE guild_id = $1 AND active = true', [process.env.GUILD_ID]),
      db.query('SELECT COUNT(*) FROM tickets WHERE guild_id = $1 AND status = $2', [process.env.GUILD_ID, 'open']),
      db.query('SELECT SUM(balance + bank) as total FROM economy WHERE guild_id = $1', [process.env.GUILD_ID]),
      db.query('SELECT COUNT(*) FROM cross_bans WHERE active = true'),
    ]);

    res.json({
      activeBans: parseInt(bans.rows[0].count),
      openTickets: parseInt(tickets.rows[0].count),
      coinsInCirculation: parseInt(economy.rows[0].total || 0),
      crossBans: parseInt(crossBans.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
