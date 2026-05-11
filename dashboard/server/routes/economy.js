import express from 'express';
import { db } from '../index.js';
import { requireStaff } from './auth.js';

const router = express.Router();
router.use(requireStaff);

// ==============================
// GET /api/economy/leaderboard
// Top 20 users by total balance
// ==============================
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT user_id, balance, bank, (balance + bank) AS total
      FROM economy
      WHERE guild_id = $1
      ORDER BY total DESC
      LIMIT 20
    `, [process.env.GUILD_ID]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// GET /api/economy/user/:userId
// Get balance for a specific user
// ==============================
router.get('/user/:userId', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT balance, bank FROM economy WHERE guild_id = $1 AND user_id = $2',
      [process.env.GUILD_ID, req.params.userId]
    );
    res.json(result.rows[0] || { balance: 0, bank: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// PATCH /api/economy/user/:userId
// Add/remove Viper Coins from a user's balance
// Body: { amount: 500, reason: "Staff adjustment" }
// ==============================
router.patch('/user/:userId', async (req, res) => {
  const { amount, reason } = req.body;
  try {
    await db.query(`
      INSERT INTO economy (guild_id, user_id, balance)
      VALUES ($1, $2, $3)
      ON CONFLICT (guild_id, user_id) DO UPDATE
      SET balance = GREATEST(0, economy.balance + $3), updated_at = NOW()
    `, [process.env.GUILD_ID, req.params.userId, amount]);

    // Log the adjustment
    await db.query(`
      INSERT INTO economy_logs (guild_id, user_id, staff_id, amount, reason)
      VALUES ($1, $2, $3, $4, $5)
    `, [process.env.GUILD_ID, req.params.userId, req.user.discord_id, amount, reason]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// GET /api/economy/shop
// List all shop items
// ==============================
router.get('/shop', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM shop_items WHERE guild_id = $1 ORDER BY price ASC',
      [process.env.GUILD_ID]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// POST /api/economy/shop
// Add a new shop item
// ==============================
router.post('/shop', async (req, res) => {
  const { name, description, price, role_id, type } = req.body;
  try {
    await db.query(`
      INSERT INTO shop_items (guild_id, name, description, price, role_id, type)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [process.env.GUILD_ID, name, description, price, role_id, type]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// DELETE /api/economy/shop/:itemId
// Remove a shop item
// ==============================
router.delete('/shop/:itemId', async (req, res) => {
  try {
    await db.query('DELETE FROM shop_items WHERE id = $1 AND guild_id = $2', [
      req.params.itemId,
      process.env.GUILD_ID,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
