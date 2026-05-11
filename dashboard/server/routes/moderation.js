import express from 'express';
import { db } from '../index.js';
import { requireStaff } from './auth.js';

const router = express.Router();
router.use(requireStaff);

// ==============================
// GET /api/moderation/history/:userId
// Get full moderation history for a user
// ==============================
router.get('/history/:userId', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT action, reason, moderator_id, created_at, expires_at, active
      FROM mod_logs
      WHERE guild_id = $1 AND target_id = $2
      ORDER BY created_at DESC
    `, [process.env.GUILD_ID, req.params.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// GET /api/moderation/staff-history/:staffId
// Get all actions taken BY a specific staff member
// ==============================
router.get('/staff-history/:staffId', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT action, target_id, reason, created_at
      FROM mod_logs
      WHERE guild_id = $1 AND moderator_id = $2
      ORDER BY created_at DESC
      LIMIT 100
    `, [process.env.GUILD_ID, req.params.staffId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// POST /api/moderation/warn
// Issue a warning to a user
// ==============================
router.post('/warn', async (req, res) => {
  const { userId, reason } = req.body;
  try {
    await db.query(`
      INSERT INTO mod_logs (guild_id, target_id, moderator_id, action, reason)
      VALUES ($1, $2, $3, 'warn', $4)
    `, [process.env.GUILD_ID, userId, req.user.discord_id, reason]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// POST /api/moderation/ban
// Ban a user (optionally cross-ban)
// ==============================
router.post('/ban', async (req, res) => {
  const { userId, reason, crossBan = false } = req.body;
  try {
    await db.query(`
      INSERT INTO bans (guild_id, user_id, moderator_id, reason, active)
      VALUES ($1, $2, $3, $4, true)
      ON CONFLICT (guild_id, user_id) DO UPDATE SET reason = $4, active = true, updated_at = NOW()
    `, [process.env.GUILD_ID, userId, req.user.discord_id, reason]);

    await db.query(`
      INSERT INTO mod_logs (guild_id, target_id, moderator_id, action, reason)
      VALUES ($1, $2, $3, 'ban', $4)
    `, [process.env.GUILD_ID, userId, req.user.discord_id, reason]);

    // If cross-ban is requested, insert into cross_bans table
    // Your bot will pick this up and action it across all servers
    if (crossBan) {
      await db.query(`
        INSERT INTO cross_bans (user_id, issuer_id, reason, active)
        VALUES ($1, $2, $3, true)
        ON CONFLICT (user_id) DO UPDATE SET reason = $3, active = true, updated_at = NOW()
      `, [userId, req.user.discord_id, reason]);
    }

    res.json({ success: true, crossBan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// POST /api/moderation/unban
// Unban a user
// ==============================
router.post('/unban', async (req, res) => {
  const { userId, reason } = req.body;
  try {
    await db.query(
      'UPDATE bans SET active = false, updated_at = NOW() WHERE guild_id = $1 AND user_id = $2',
      [process.env.GUILD_ID, userId]
    );
    await db.query(`
      INSERT INTO mod_logs (guild_id, target_id, moderator_id, action, reason)
      VALUES ($1, $2, $3, 'unban', $4)
    `, [process.env.GUILD_ID, userId, req.user.discord_id, reason]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// GET /api/moderation/notes/:userId
// Get all notes for a user
// ==============================
router.get('/notes/:userId', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, note, staff_id, created_at
      FROM user_notes
      WHERE guild_id = $1 AND user_id = $2
      ORDER BY created_at DESC
    `, [process.env.GUILD_ID, req.params.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// POST /api/moderation/notes
// Add a note to a user
// ==============================
router.post('/notes', async (req, res) => {
  const { userId, note } = req.body;
  try {
    await db.query(`
      INSERT INTO user_notes (guild_id, user_id, staff_id, note)
      VALUES ($1, $2, $3, $4)
    `, [process.env.GUILD_ID, userId, req.user.discord_id, note]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// DELETE /api/moderation/notes/:noteId
// Delete a note
// ==============================
router.delete('/notes/:noteId', async (req, res) => {
  try {
    await db.query('DELETE FROM user_notes WHERE id = $1 AND guild_id = $2', [
      req.params.noteId,
      process.env.GUILD_ID,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// GET /api/moderation/crossbans
// List all active cross-bans
// ==============================
router.get('/crossbans', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT user_id, issuer_id, reason, created_at
      FROM cross_bans
      WHERE active = true
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
