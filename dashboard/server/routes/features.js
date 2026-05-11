import express from 'express';
import { db } from '../index.js';
import { requireStaff } from './auth.js';

const router = express.Router();
router.use(requireStaff);

// ==============================
// GET /api/features
// Get current feature toggle states for this guild
// ==============================
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT features FROM guild_settings WHERE guild_id = $1',
      [process.env.GUILD_ID]
    );
    res.json(result.rows[0]?.features || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// PATCH /api/features
// Toggle a feature on or off
// Body: { feature: "economy", enabled: false }
// ==============================
router.patch('/', async (req, res) => {
  const { feature, enabled } = req.body;
  try {
    await db.query(`
      UPDATE guild_settings
      SET features = jsonb_set(
        COALESCE(features, '{}'),
        $1,
        $2,
        true
      ),
      updated_at = NOW()
      WHERE guild_id = $3
    `, [`{${feature}}`, JSON.stringify(enabled), process.env.GUILD_ID]);

    res.json({ success: true, feature, enabled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
