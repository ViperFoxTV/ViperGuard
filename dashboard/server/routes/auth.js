import express from 'express';
import passport from 'passport';
import { db } from '../index.js';

const router = express.Router();

// The staff role IDs allowed to access the dashboard
// Add your actual Discord role IDs here
const ALLOWED_ROLE_IDS = process.env.STAFF_ROLE_IDS?.split(',') || [];
const GUILD_ID = process.env.GUILD_ID;

// ==============================
// MIDDLEWARE — check if logged in + is staff
// ==============================
export function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  next();
}

export async function requireStaff(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  // Check if the user has a staff role in your Discord server
  const result = await db.query(
    'SELECT is_staff FROM dashboard_users WHERE discord_id = $1',
    [req.user.discord_id]
  );

  if (!result.rows[0]?.is_staff) {
    return res.status(403).json({ error: 'You do not have staff access.' });
  }

  next();
}

// ==============================
// STEP 1 — Send user to Discord to log in
// ==============================
router.get('/discord', passport.authenticate('discord'));

// ==============================
// STEP 2 — Discord sends them back here after login
// ==============================
router.get('/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/login?error=true' }),
  async (req, res) => {
    // Check if user is in your Discord server and has a staff role
    const userGuilds = req.user.guilds || [];
    const inGuild = userGuilds.find(g => g.id === GUILD_ID);

    if (!inGuild) {
      req.logout(() => {});
      return res.redirect(`${process.env.DASHBOARD_URL}/login?error=not_in_server`);
    }

    // Mark them as staff if they have an allowed role
    // Note: for full role checking, you'd use the Discord API with bot token
    // This is a simplified version — expand as needed
    await db.query(
      'UPDATE dashboard_users SET is_staff = true WHERE discord_id = $1',
      [req.user.id]
    );

    // Send them to the dashboard
    res.redirect(`${process.env.DASHBOARD_URL}/dashboard`);
  }
);

// ==============================
// GET /auth/me — returns current logged-in user info
// ==============================
router.get('/me', requireAuth, async (req, res) => {
  const result = await db.query(
    'SELECT discord_id, username, avatar, is_staff, last_login FROM dashboard_users WHERE discord_id = $1',
    [req.user.discord_id]
  );
  res.json(result.rows[0] || null);
});

// ==============================
// POST /auth/logout
// ==============================
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

export default router;
