import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import serverRoutes from './routes/server.js';
import moderationRoutes from './routes/moderation.js';
import economyRoutes from './routes/economy.js';
import featuresRoutes from './routes/features.js';

dotenv.config();

// ==============================
// DATABASE CONNECTION
// ==============================
export const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const app = express();
const PgSession = connectPgSimple(session);

// ==============================
// MIDDLEWARE
// ==============================
app.set('trust proxy', 1);

app.use(express.json());

app.use(cors({
  origin: 'https://viper-guard.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Sessions stored in your existing Postgres DB
app.use(session({
  store: new PgSession({ pool: db, tableName: 'dashboard_sessions' }),
  secret: process.env.SESSION_SECRET || 'vipergard-secret-fallback',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: true,
    sameSite: 'none',
    httpOnly: true,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// ==============================
// DISCORD OAUTH STRATEGY
// ==============================
passport.use(new DiscordStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:3001/auth/discord/callback',
  scope: ['identify', 'guilds', 'guilds.members.read'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    await db.query(`
      INSERT INTO dashboard_users (discord_id, username, avatar, access_token, refresh_token)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (discord_id) DO UPDATE
      SET username = $2, avatar = $3, access_token = $4, refresh_token = $5, last_login = NOW()
    `, [profile.id, profile.username, profile.avatar, accessToken, refreshToken]);
    return done(null, profile);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query('SELECT * FROM dashboard_users WHERE discord_id = $1', [id]);
    done(null, result.rows[0] || null);
  } catch (err) {
    done(err, null);
  }
});

// ==============================
// ROUTES
// ==============================
app.use('/auth', authRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/economy', economyRoutes);
app.use('/api/features', featuresRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', bot: 'ViperGuard' }));

// ==============================
// START SERVER
// ==============================
const PORT = process.env.DASHBOARD_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🐍 ViperGuard Dashboard API running on http://localhost:${PORT}`);
});
