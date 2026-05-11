import { logger } from '../utils/logger.js';


export const botConfig = {
  // =========================
  // BOT PRESENCE (what users see under the bot name)
  // =========================
  // `status` options:
  // - "online"    = green dot
  // - "idle"      = yellow moon
  // - "dnd"       = red do-not-disturb
  // - "invisible" = appears offline
  presence: {
    // Current online state shown on Discord.
    status: "online",

    // Activity lines shown under the bot name.
    // `type` number mapping from Discord:
    // 0 = Playing
    // 1 = Streaming
    // 2 = Listening
    // 3 = Watching
    // 4 = Custom
    // 5 = Competing
    activities: [
      {
        // Watching ViperFox on Twitch
        name: "ViperFox on Twitch",
        // Activity type 3 = Watching
        type: 3,
        // Twitch stream URL for streaming status
        url: "https://www.twitch.tv/ViperFox",
      },
    ],
  },

  // =========================
  // COMMAND BEHAVIOR
  // =========================
  commands: {
    // Bot owner user IDs (comma-separated in OWNER_IDS env var).
    // Owners can access owner/admin-level bot commands.
    owners: process.env.OWNER_IDS?.split(",") || [],

    // Default wait time between command uses (in seconds).
    defaultCooldown: 3,

    // If true, old commands are removed before re-registering.
    deleteCommands: false,

    // Optional server ID used for testing slash commands quickly.
    testGuildId: process.env.TEST_GUILD_ID,

    // Default prefix for text-based commands.
    prefix: "!",

    // Maintenance mode — if true, only owners can use commands.
    maintenance: false,

    // Log level for the bot (debug | info | warn | error).
    logLevel: "info",
  },

  // =========================
  // APPLICATIONS SYSTEM
  // =========================
  applications: {
    // Default questions shown when someone fills out an application.
    defaultQuestions: [
      { question: "What is your name?", required: true },
      { question: "How old are you?", required: true },
      { question: "Why do you want to join?", required: true },
    ],

    // Embed colors by application status.
    statusColors: {
      pending: "#FFA500",
      approved: "#2ECC71",
      denied: "#ED4245",
    },

    // How long users must wait before submitting another application (hours).
    applicationCooldown: 24,

    // Auto-delete denied applications after this many days.
    deleteDeniedAfter: 7,

    // Auto-delete approved applications after this many days.
    deleteApprovedAfter: 30,

    // Role IDs allowed to manage applications.
    managerRoles: [],
  },

  // =========================
  // EMBED COLORS & BRANDING
  // =========================
  // Green & Black color scheme for ViperGuard
  embeds: {
    colors: {
      // Main brand colors.
      primary: "#2ECC71",     // Viper Green
      secondary: "#1A1A1A",   // Deep Black

      // Standard status colors.
      success: "#2ECC71",     // Green
      error: "#ED4245",       // Red
      warning: "#FEE75C",     // Yellow
      info: "#1ABC9C",        // Teal Green

      // Neutral utility colors.
      light: "#FFFFFF",
      dark: "#0D0D0D",
      gray: "#99AAB5",

      // Discord-style palette shortcuts.
      blurple: "#5865F2",
      green: "#2ECC71",
      yellow: "#FEE75C",
      fuchsia: "#EB459E",
      red: "#ED4245",
      black: "#000000",

      // Feature-specific colors.
      giveaway: {
        active: "#2ECC71",
        ended: "#ED4245",
      },
      ticket: {
        open: "#2ECC71",
        claimed: "#FAA61A",
        closed: "#ED4245",
        pending: "#99AAB5",
      },
      economy: "#2ECC71",
      birthday: "#1ABC9C",
      moderation: "#2ECC71",

      // Ticket priority color mapping.
      priority: {
        none: "#95A5A6",
        low: "#1ABC9C",
        medium: "#2ECC71",
        high: "#F1C40F",
        urgent: "#ED4245",
      },
    },
    footer: {
      // Default footer text used in bot embeds.
      text: "ViperGuard",
      // Footer icon URL (null = no icon).
      icon: null,
    },
    // Default thumbnail URL for embeds (null = no thumbnail).
    thumbnail: null,
    author: {
      name: "ViperGuard",
      icon: null,
      url: null,
    },
  },

  // =========================
  // ECONOMY SETTINGS
  // =========================
  economy: {
    currency: {
      // Currency display name.
      name: "Viper Coin",
      // Plural display name.
      namePlural: "Viper Coins",
      // Currency symbol shown in balances.
      symbol: "🐍",
    },

    // Starting balance for new users.
    startingBalance: 0,

    // Maximum bank amount before upgrades.
    baseBankCapacity: 100000,

    // Daily reward amount.
    dailyAmount: 100,

    // Work command random payout range.
    workMin: 10,
    workMax: 100,

    // Beg command random payout range.
    begMin: 5,
    begMax: 50,

    // Tax rate on transfers between users (0.05 = 5%).
    transferTax: 0.05,

    // Maximum amount transferable in one transaction.
    maxTransferAmount: 50000,

    // Whether the lottery system is enabled.
    lotteryEnabled: true,

    // Chance to succeed when robbing (0.4 = 40%).
    robSuccessRate: 0.4,

    // Jail time after failed rob (milliseconds).
    // 3600000 = 1 hour.
    robFailJailTime: 3600000,
  },

  // =========================
  // SHOP SETTINGS
  // =========================
  shop: {
    // Maximum number of items allowed in the shop.
    maxItems: 50,

    // Default duration for shop items (days). null = permanent.
    defaultItemDuration: null,

    // Allow users to create their own shop listings.
    allowUserShops: false,
  },

  // =========================
  // TICKET SYSTEM
  // =========================
  tickets: {
    // Category ID where new tickets are created (null = no forced category).
    defaultCategory: null,

    // Role IDs allowed to manage/support tickets.
    supportRoles: [],

    // Priority options users/staff can assign.
    priorities: {
      none: {
        emoji: "⚪",
        color: "#95A5A6",
        label: "None",
      },
      low: {
        emoji: "🟢",
        color: "#2ECC71",
        label: "Low",
      },
      medium: {
        emoji: "🟡",
        color: "#F1C40F",
        label: "Medium",
      },
      high: {
        emoji: "🔴",
        color: "#E74C3C",
        label: "High",
      },
      urgent: {
        emoji: "🚨",
        color: "#ED4245",
        label: "Urgent",
      },
    },

    // Default priority for new tickets.
    defaultPriority: "none",

    // Category ID where closed tickets are archived.
    archiveCategory: null,

    // Channel ID where ticket logs are sent.
    logChannel: null,
  },

  // =========================
  // GIVEAWAY SETTINGS
  // =========================
  giveaways: {
    // Default giveaway duration in milliseconds.
    // 86400000 = 24 hours.
    defaultDuration: 86400000,

    // Default message shown in giveaway embeds.
    defaultMessage: "🎉 A new giveaway has started! React to enter!",

    // Allowed winner count range.
    minimumWinners: 1,
    maximumWinners: 10,

    // Allowed giveaway duration range in milliseconds.
    minimumDuration: 300000,      // 5 minutes
    maximumDuration: 2592000000,  // 30 days

    // Role IDs allowed to host giveaways.
    allowedRoles: [],

    // Role IDs that bypass giveaway restrictions.
    bypassRoles: [],
  },

  // =========================
  // BIRTHDAY SETTINGS
  // =========================
  birthday: {
    // Role ID given to users on their birthday.
    defaultRole: null,

    // Channel ID where birthday announcements are posted.
    announcementChannel: null,

    // Hour of the day to post birthday announcements (24hr, UTC).
    announcementTime: 9,

    // Timezone used to calculate birthday dates.
    timezone: "UTC",
  },

  // =========================
  // VERIFICATION SETTINGS
  // =========================
  verification: {
    // Message shown when posting the verification panel.
    defaultMessage: "Click the button below to verify yourself and gain access to the server!",

    // Text on the verification button.
    defaultButtonText: "Verify",

    // Automatic verification behavior.
    autoVerify: {
      defaultCriteria: "none",
      defaultAccountAgeDays: 7,
      serverSizeThreshold: 1000,
      minAccountAge: 1,
      maxAccountAge: 365,
      sendDMNotification: true,
      criteria: {
        account_age: "Account must be older than specified days",
        server_size: "All users if server has less than 1000 members",
        none: "All users immediately",
      },
    },

    // Minimum time between verification attempts (milliseconds).
    verificationCooldown: 5000,

    // Maximum failed attempts allowed inside the time window below.
    maxVerificationAttempts: 3,

    // Time window for counting attempts (milliseconds).
    attemptWindow: 60000,

    // In-memory safety limits.
    maxCooldownEntries: 10000,
    maxAttemptEntries: 10000,
    cooldownCleanupInterval: 300000,
    maxAuditMetadataBytes: 4096,
    maxInMemoryAuditEntries: 1000,
    logAllVerifications: true,
    keepAuditTrail: true,
  },

  // =========================
  // WELCOME / GOODBYE MESSAGES
  // =========================
  welcome: {
    // Placeholders: {user}, {server}, {memberCount}
    defaultWelcomeMessage:
      "Welcome {user} to {server}! We now have {memberCount} members!",
    // Placeholders: {user}, {memberCount}
    defaultGoodbyeMessage:
      "{user} has left the server. We now have {memberCount} members.",
    defaultWelcomeChannel: null,
    defaultGoodbyeChannel: null,
    // Whether to send welcome/goodbye as an embed.
    embedEnabled: true,
  },

  // =========================
  // AUTO-ROLE ON JOIN
  // =========================
  autoRole: {
    // Whether auto-role is enabled.
    enabled: true,

    // Role ID(s) to assign when a user joins the server.
    // Add multiple role IDs to this array if needed.
    roles: [],

    // Delay before assigning the role (milliseconds). 0 = immediate.
    delay: 0,
  },

  // =========================
  // BOOST REWARDS
  // =========================
  boostRewards: {
    // Whether boost rewards are enabled.
    enabled: true,

    // Role ID to assign when a user boosts the server.
    role: null,

    // Viper Coins to award on boost.
    coinsReward: 5000,

    // Channel ID to announce boosts in.
    announcementChannel: null,

    // Message sent when someone boosts.
    // Placeholders: {user}, {server}
    message: "🐍 {user} just boosted {server}! Thank you for your support!",
  },

  // =========================
  // MODERATION SETTINGS
  // =========================
  moderation: {
    // DM the user when they are kicked.
    dmOnKick: true,

    // DM the user when they are banned.
    dmOnBan: true,

    // DM the user when they are muted/timed out.
    dmOnMute: true,

    // DM the user when they receive a warning.
    dmOnWarn: true,

    // Channel ID where all moderation actions are logged.
    auditLogChannel: null,

    // Moderation actions tracked in staff history.
    trackedActions: ["warn", "kick", "ban", "mute", "timeout", "strike"],

    // Auto-escalation thresholds — action taken when warn count is reached.
    autoEscalation: {
      enabled: false,
      thresholds: [
        { warns: 3, action: "mute",    duration: 3600000 },  // 1 hour mute at 3 warns
        { warns: 5, action: "kick",    duration: null },      // Kick at 5 warns
        { warns: 7, action: "ban",     duration: null },      // Ban at 7 warns
      ],
    },
  },

  // =========================
  // USER NOTES
  // =========================
  notes: {
    // Whether the notes system is enabled.
    enabled: true,

    // Maximum number of notes per user.
    maxNotesPerUser: 20,

    // Role IDs allowed to add/view notes (populated from mod roles or env).
    allowedRoles: [],
  },

  // =========================
  // USER HISTORY
  // =========================
  history: {
    // Whether user moderation history is enabled.
    enabled: true,

    // How long to keep history entries (days). null = forever.
    retentionDays: null,

    // Whether to include expired/pardoned actions in history.
    includeExpired: true,
  },

  // =========================
  // STAFF HISTORY
  // =========================
  staffHistory: {
    // Whether staff action history is enabled.
    enabled: true,

    // Actions logged to staff history.
    trackedActions: ["warn", "kick", "ban", "mute", "timeout", "strike"],

    // Whether staff members can view their own history.
    selfView: true,

    // How long to retain staff history entries (days). null = forever.
    retentionDays: null,
  },

  // =========================
  // CROSS-BAN SYSTEM
  // =========================
  // Cross-ban syncs bans across ALL servers the bot is in.
  crossBan: {
    // Whether the cross-ban system is enabled.
    enabled: true,

    // If true, bans sync automatically to all servers the bot is in.
    // If false, each server must opt in individually.
    autoSync: true,

    // Server IDs that are exempt from receiving cross-bans.
    exemptGuilds: [],

    // If true, only bot owners can issue cross-bans.
    // If false, allowedRoles can also issue them.
    ownerOnly: false,

    // Role IDs allowed to issue cross-bans (if ownerOnly is false).
    allowedRoles: [],

    // Whether to log cross-ban actions to the audit log channel.
    logToBanAudit: true,

    // Message posted in each server when a cross-ban is issued.
    // Placeholders: {user}, {reason}, {issuer}
    banMessage: "🐍 Cross-ban issued for {user} | Reason: {reason} | Issued by: {issuer}",
  },

  // =========================
  // COUNTER CHANNELS
  // =========================
  counters: {
    defaults: {
      name: "{name} Counter",
      description: "Server {name} counter",
      type: "voice",
      channelName: "{name}-{count}",
    },
    permissions: {
      deny: ["VIEW_CHANNEL"],
      allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
    },
    messages: {
      created: "✅ Created counter **{name}**",
      deleted: "🗑️ Deleted counter **{name}**",
      updated: "🔄 Updated counter **{name}**",
    },
    types: {
      members: {
        name: "👥 Members",
        description: "Total members in the server",
        getCount: (guild) => guild.memberCount.toString(),
      },
      bots: {
        name: "🤖 Bots",
        description: "Total bot accounts in the server",
        getCount: (guild) =>
          guild.members.cache.filter((m) => m.user.bot).size.toString(),
      },
      members_only: {
        name: "👤 Humans",
        description: "Total human members (non-bots)",
        getCount: (guild) =>
          guild.members.cache.filter((m) => !m.user.bot).size.toString(),
      },
    },
  },

  // =========================
  // GENERIC BOT MESSAGES
  // =========================
  messages: {
    noPermission: "🐍 You do not have permission to use this command.",
    cooldownActive: "🐍 Please wait {time} before using this command again.",
    errorOccurred: "🐍 An error occurred while executing this command.",
    missingPermissions: "🐍 I am missing required permissions to perform this action.",
    commandDisabled: "🐍 This command has been disabled.",
    maintenanceMode: "🐍 ViperGuard is currently in maintenance mode. Please try again later.",
  },

  // =========================
  // FEATURE TOGGLES
  // =========================
  features: {
    // Core systems.
    economy: true,
    leveling: true,
    moderation: true,
    logging: true,
    welcome: true,

    // Community engagement.
    tickets: true,
    giveaways: true,
    birthday: true,
    counter: true,

    // Security and self-service.
    verification: true,
    reactionRoles: true,
    joinToCreate: true,

    // ViperGuard exclusive features.
    autoRole: true,
    boostRewards: true,
    notes: true,
    history: true,
    staffHistory: true,
    crossBan: true,

    // Utility/quality-of-life.
    voice: true,
    search: true,
    tools: true,
    utility: true,
    community: true,
    fun: true,
  },
};


export function validateConfig(config) {
  const errors = [];

  if (process.env.NODE_ENV !== 'production') {
    logger.debug('Environment variables check:');
    logger.debug('DISCORD_TOKEN exists:', !!process.env.DISCORD_TOKEN);
    logger.debug('TOKEN exists:', !!process.env.TOKEN);
    logger.debug('CLIENT_ID exists:', !!process.env.CLIENT_ID);
    logger.debug('GUILD_ID exists:', !!process.env.GUILD_ID);
    logger.debug('POSTGRES_HOST exists:', !!process.env.POSTGRES_HOST);
    logger.debug('NODE_ENV:', process.env.NODE_ENV);
  }

  if (!process.env.DISCORD_TOKEN && !process.env.TOKEN) {
    errors.push("Bot token is required (DISCORD_TOKEN or TOKEN environment variable)");
  }

  if (!process.env.CLIENT_ID) {
    errors.push("Client ID is required (CLIENT_ID environment variable)");
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.POSTGRES_HOST) {
      errors.push("PostgreSQL host is required in production (POSTGRES_HOST environment variable)");
    }
    if (!process.env.POSTGRES_USER) {
      errors.push("PostgreSQL user is required in production (POSTGRES_USER environment variable)");
    }
    if (!process.env.POSTGRES_PASSWORD) {
      errors.push("PostgreSQL password is required in production (POSTGRES_PASSWORD environment variable)");
    }
  }

  return errors;
}


const configErrors = validateConfig(botConfig);
if (configErrors.length > 0) {
  logger.error("ViperGuard configuration errors:", configErrors.join("\n"));
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}


export const BotConfig = botConfig;

export function getColor(path, fallback = "#99AAB5") {
  if (typeof path === "number") return path;
  if (typeof path === "string" && path.startsWith("#")) {
    return parseInt(path.replace("#", ""), 16);
  }
  const result = path
    .split(".")
    .reduce(
      (obj, key) => (obj && obj[key] !== undefined ? obj[key] : fallback),
      botConfig.embeds.colors,
    );
  if (typeof result === "string" && result.startsWith("#")) {
    return parseInt(result.replace("#", ""), 16);
  }
  return result;
}

export function getRandomColor() {
  const colors = Object.values(botConfig.embeds.colors).flatMap((color) =>
    typeof color === "string" ? color : Object.values(color),
  );
  return colors[Math.floor(Math.random() * colors.length)];
}

export default botConfig;
