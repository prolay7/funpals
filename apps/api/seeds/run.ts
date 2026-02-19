/**
 * run.ts — Full database seed.
 * Creates 5 sample users + profiles, channels, messages, events,
 * posts, questions, skills, goals, notifications and materials.
 * Safe to run multiple times (uses ON CONFLICT DO NOTHING).
 *
 * Run:  npm run seed   (from apps/api/)
 * All seeded accounts use password: Funpals@123
 */
import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Fixed UUIDs ──────────────────────────────────────────────────────────────
const U = {
  admin: 'a0000000-0000-0000-0000-000000000001',
  alice: 'a0000000-0000-0000-0000-000000000002',
  bob:   'a0000000-0000-0000-0000-000000000003',
  carol: 'a0000000-0000-0000-0000-000000000004',
  dave:  'a0000000-0000-0000-0000-000000000005',
};

const C = {
  general:       'c0000000-0000-0000-0000-000000000001',
  activities:    'c0000000-0000-0000-0000-000000000002',
  announcements: 'c0000000-0000-0000-0000-000000000003',
  bookclub:      'c0000000-0000-0000-0000-000000000004',
};

async function seed() {
  const hash = await bcrypt.hash('Funpals@123', 10);
  console.log('⏳  Seeding database...');

  // ── 1. Users ────────────────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO users (id, email, phone, password_hash, username, display_name, role) VALUES
      ('${U.admin}', 'admin@funpals.com',  NULL,           '${hash}', 'admin',     'Admin',          'admin'),
      ('${U.alice}', 'alice@funpals.com',  '+11234567890', '${hash}', 'alice99',   'Alice Johnson',  'user'),
      ('${U.bob}',   'bob@funpals.com',    '+11234567891', '${hash}', 'bob_dev',   'Bob Martinez',   'user'),
      ('${U.carol}', 'carol@funpals.com',  '+11234567892', '${hash}', 'carol_c',   'Carol Chen',     'user'),
      ('${U.dave}',  'dave@funpals.com',   '+11234567893', '${hash}', 'dave_fit',  'Dave Thompson',  'user')
    ON CONFLICT (email) DO NOTHING
  `);
  console.log('   ✔  users');

  // ── 2. User profiles ────────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO user_profiles
      (user_id, age_range, gender, zip_code, bio, can_do, cannot_do, interests, available_for, expertise_level, search_radius_miles)
    VALUES
      ('${U.admin}', '30-40', 'male',   '10001', 'Funpals platform administrator.',
        ARRAY['coding','planning'], ARRAY[]::TEXT[], ARRAY['tech','community'],   ARRAY['chat','video'], 5, 25),
      ('${U.alice}', '20-30', 'female', '10002', 'Love reading and hiking!',
        ARRAY['hiking','reading'],  ARRAY['cycling'], ARRAY['books','outdoors'],  ARRAY['chat','meet'], 3, 25),
      ('${U.bob}',   '25-35', 'male',   '10003', 'Software dev & board game fan.',
        ARRAY['coding','chess'],    ARRAY[]::TEXT[], ARRAY['games','tech'],       ARRAY['chat','video'], 4, 25),
      ('${U.carol}', '20-30', 'female', '10004', 'Art lover and coffee addict.',
        ARRAY['painting','yoga'],   ARRAY[]::TEXT[], ARRAY['art','wellness'],     ARRAY['chat','meet'], 2, 25),
      ('${U.dave}',  '30-40', 'male',   '10005', 'Fitness enthusiast & trail runner.',
        ARRAY['running','cycling'], ARRAY[]::TEXT[], ARRAY['fitness','outdoors'], ARRAY['meet','video'], 4, 25)
    ON CONFLICT (user_id) DO NOTHING
  `);
  console.log('   ✔  user_profiles');

  // ── 3. Online presence ──────────────────────────────────────────────────────
  for (const uid of Object.values(U)) {
    await pool.query(
      `INSERT INTO online_presence (user_id, is_online, available_call)
       VALUES ($1, FALSE, FALSE) ON CONFLICT (user_id) DO NOTHING`,
      [uid],
    );
  }
  console.log('   ✔  online_presence');

  // ── 4. Activity categories ──────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO activity_categories (name, icon) VALUES
      ('games',     '🎮'),
      ('parks',     '🌳'),
      ('trails',    '🥾'),
      ('libraries', '📚'),
      ('books',     '📖'),
      ('other',     '✨')
    ON CONFLICT (name) DO NOTHING
  `);
  console.log('   ✔  activity_categories');

  // ── 5. Activities ───────────────────────────────────────────────────────────
  const { rows: cats } = await pool.query('SELECT id, name FROM activity_categories');
  const catMap: Record<string, string> = Object.fromEntries(cats.map((c: { id: string; name: string }) => [c.name, c.id]));

  const activities: [string, string, string, string | null, string | null, number][] = [
    [catMap.games,     'Chess Club Meetup',   'Play chess with local enthusiasts', null, null, 0],
    [catMap.games,     'Board Game Night',    'Strategy, trivia, and fun',          null, null, 1],
    [catMap.parks,     'Central Park Walk',   'Morning walk in the park',           '123 Park Ave', null, 0],
    [catMap.libraries, 'Public Library',      'Study sessions and book clubs',      '456 Main St', 'https://library.example.com', 0],
    [catMap.books,     'Book of the Month',   'Join the monthly reading circle',    null, null, 0],
    [catMap.trails,    'Riverside Trail',     '3-mile scenic trail run/walk',       'Riverside Dr', null, 0],
  ];
  for (const [cat, title, desc, address, url, sort] of activities) {
    await pool.query(
      `INSERT INTO activities (category_id, title, description, address, external_url, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
      [cat, title, desc, address, url, sort],
    );
  }
  console.log('   ✔  activities');

  // ── 6. App categories ───────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO categories (name, is_special, sort_order) VALUES
      ('Fitness & Sports',   FALSE, 1),
      ('Arts & Creativity',  FALSE, 2),
      ('Technology',         FALSE, 3),
      ('Books & Learning',   FALSE, 4),
      ('Outdoors & Nature',  FALSE, 5),
      ('Games & Fun',        FALSE, 6),
      ('Wellness & Health',  FALSE, 7),
      ('Community & Social', FALSE, 8)
    ON CONFLICT DO NOTHING
  `);
  console.log('   ✔  categories');

  // ── 7. Channels ─────────────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO channels (id, name, description, is_default, created_by) VALUES
      ('${C.general}',       'General',       'General discussion for all members', TRUE,  '${U.admin}'),
      ('${C.activities}',    'Activities',    'Coordinate activities and meetups',  TRUE,  '${U.admin}'),
      ('${C.announcements}', 'Announcements', 'Important updates',                  TRUE,  '${U.admin}'),
      ('${C.bookclub}',      'Book Club',     'Monthly book discussions',           FALSE, '${U.alice}')
    ON CONFLICT (id) DO NOTHING
  `);
  console.log('   ✔  channels');

  // ── 8. Channel members ──────────────────────────────────────────────────────
  const defaultChs = [C.general, C.activities, C.announcements];
  for (const uid of Object.values(U)) {
    for (const chId of defaultChs) {
      await pool.query(
        `INSERT INTO channel_members (channel_id, user_id, role)
         VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [chId, uid, uid === U.admin ? 'admin' : 'member'],
      );
    }
  }
  // Book Club
  for (const [uid, role] of [[U.alice, 'owner'], [U.carol, 'member']] as [string, string][]) {
    await pool.query(
      `INSERT INTO channel_members (channel_id, user_id, role)
       VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [C.bookclub, uid, role],
    );
  }
  console.log('   ✔  channel_members');

  // ── 9. Messages ─────────────────────────────────────────────────────────────
  const msgs: [string, string, string, string][] = [
    [C.general,       U.admin, 'Welcome to Funpals! 🎉 This is your community space.', 'system'],
    [C.general,       U.alice, 'Thanks! Excited to be here.', 'text'],
    [C.general,       U.bob,   'Hey everyone! Ready to meet some fun people.', 'text'],
    [C.general,       U.carol, 'This looks amazing. Love the vibe already!', 'text'],
    [C.activities,    U.carol, 'Who is up for a hike this weekend?', 'text'],
    [C.activities,    U.dave,  'I am in! Saturday morning works for me.', 'text'],
    [C.activities,    U.alice, 'Count me in — I know a great trail nearby.', 'text'],
    [C.announcements, U.admin, 'Platform is live — share your feedback!', 'text'],
    [C.announcements, U.admin, 'New feature: video meetings are now available.', 'text'],
    [C.bookclub,      U.alice, 'This month we are reading "Atomic Habits". Thoughts?', 'text'],
    [C.bookclub,      U.carol, 'Love that book! So many practical tips.', 'text'],
  ];
  for (const [chId, senderId, content, type] of msgs) {
    await pool.query(
      `INSERT INTO messages (channel_id, sender_id, content, type) VALUES ($1,$2,$3,$4)`,
      [chId, senderId, content, type],
    );
  }
  console.log('   ✔  messages');

  // ── 10. Events ──────────────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO events (title, description, location, starts_at, ends_at, created_by, channel_id, is_group) VALUES
      ('Morning Hike at Riverside Trail',
        'Casual 3-mile hike, all levels welcome. Bring water!',
        'Riverside Dr Trailhead', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 2 hours',
        '${U.dave}', '${C.activities}', TRUE),
      ('Board Game Night',
        'Bring your favourite board games — winner takes bragging rights.',
        '789 Community Hall', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 3 hours',
        '${U.bob}', '${C.activities}', TRUE),
      ('Book Club: Atomic Habits',
        'Monthly discussion — Chapters 1–10. Coffee and snacks provided.',
        'Public Library, Room 2', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 2 hours',
        '${U.alice}', '${C.bookclub}', TRUE),
      ('Community Park Clean-Up',
        'Join us to keep our park beautiful. Gloves provided.',
        'Central Park Main Entrance', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days 2 hours',
        '${U.carol}', '${C.general}', TRUE)
    ON CONFLICT DO NOTHING
  `);
  console.log('   ✔  events');

  // ── 11. Event RSVPs ─────────────────────────────────────────────────────────
  const { rows: evts } = await pool.query('SELECT id FROM events ORDER BY created_at LIMIT 4');
  if (evts[0]) {
    for (const uid of [U.alice, U.bob, U.carol]) {
      await pool.query(
        `INSERT INTO event_rsvps (event_id, user_id, status) VALUES ($1,$2,'going') ON CONFLICT DO NOTHING`,
        [evts[0].id, uid],
      );
    }
  }
  if (evts[1]) {
    for (const uid of [U.bob, U.dave]) {
      await pool.query(
        `INSERT INTO event_rsvps (event_id, user_id, status) VALUES ($1,$2,'going') ON CONFLICT DO NOTHING`,
        [evts[1].id, uid],
      );
    }
    await pool.query(
      `INSERT INTO event_rsvps (event_id, user_id, status) VALUES ($1,$2,'maybe') ON CONFLICT DO NOTHING`,
      [evts[1].id, U.alice],
    );
  }
  if (evts[2]) {
    for (const uid of [U.alice, U.carol]) {
      await pool.query(
        `INSERT INTO event_rsvps (event_id, user_id, status) VALUES ($1,$2,'going') ON CONFLICT DO NOTHING`,
        [evts[2].id, uid],
      );
    }
  }
  console.log('   ✔  event_rsvps');

  // ── 12. Open posts ──────────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO open_posts (user_id, title, content, tags) VALUES
      ('${U.alice}', 'My Favourite Hiking Trails',
        'Here are my top 5 local trails for beginners. The Riverside Trail is perfect for a morning walk...',
        ARRAY['outdoors','hiking','nature']),
      ('${U.bob}',   'Chess Opening Tips for Beginners',
        'Starting with the Italian Game gives you solid central control. Here is how to play it...',
        ARRAY['chess','games','strategy']),
      ('${U.carol}', 'Watercolour Painting for Stress Relief',
        'I started painting 6 months ago and it genuinely changed how I handle anxiety...',
        ARRAY['art','wellness','creativity']),
      ('${U.dave}',  'Running Nutrition: What I Eat Before a Race',
        'Pre-race meals matter more than most people realise. Here is my race-day breakfast routine...',
        ARRAY['fitness','running','nutrition']),
      ('${U.bob}',   'Why I Switched From React to React Native',
        'After 3 years of web dev I made the jump to mobile. Here is what surprised me most...',
        ARRAY['tech','react-native','mobile'])
    ON CONFLICT DO NOTHING
  `);
  console.log('   ✔  open_posts');

  // ── 13. Open questions ──────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO open_questions (user_id, question, tags) VALUES
      ('${U.alice}', 'What is the best lightweight tent for weekend hikes?',   ARRAY['outdoors','gear','hiking']),
      ('${U.bob}',   'Any good strategy board games for 2 players?',           ARRAY['games','board-games']),
      ('${U.carol}', 'Recommendations for beginner yoga classes near NYC?',    ARRAY['wellness','yoga','fitness']),
      ('${U.dave}',  'Best trail running shoes under \$100?',                  ARRAY['fitness','running','gear']),
      ('${U.alice}', 'How do I stay motivated to read more consistently?',     ARRAY['books','habits','learning'])
    ON CONFLICT DO NOTHING
  `);
  console.log('   ✔  open_questions');

  // ── 14. Shares ──────────────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO shares (user_id, content, category, share_type, channel_id) VALUES
      ('${U.dave}',  'Just hit 500 miles of trail running this year!',          'fitness',  'internal', '${C.activities}'),
      ('${U.alice}', 'Finished my 20th book of the year. Highly recommend it.', 'learning', 'internal', '${C.bookclub}'),
      ('${U.bob}',   'Won my first chess tournament today!',                    'games',    'internal', '${C.general}'),
      ('${U.carol}', 'Finished a new painting — my best one yet.',              'art',      'global',   NULL)
    ON CONFLICT DO NOTHING
  `);
  console.log('   ✔  shares');

  // ── 15. Materials ───────────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO materials (category, title, description, is_active, sort_order) VALUES
      ('wellness',  'Mindfulness 101',         'Introduction to mindfulness and meditation practices', TRUE, 1),
      ('fitness',   'Beginner Running Plan',   '8-week plan to run your first 5K',                    TRUE, 2),
      ('learning',  'Speed Reading Guide',     'Techniques to double your reading speed',             TRUE, 3),
      ('tech',      'Git for Beginners',       'Version control basics every developer should know',  TRUE, 4),
      ('outdoors',  'Trail Safety Tips',       'Essential safety guidelines for hikers',              TRUE, 5),
      ('art',       'Watercolour for Newbies', 'A step-by-step guide to your first painting',         TRUE, 6),
      ('nutrition', 'Meal Prep Fundamentals',  'How to prep healthy meals for the whole week',        TRUE, 7)
    ON CONFLICT DO NOTHING
  `);
  console.log('   ✔  materials');

  // ── 16. User skills ─────────────────────────────────────────────────────────
  const skills: [string, string, string, string][] = [
    [U.alice, 'Hiking',      'Experienced with local trails',       'can_do'],
    [U.alice, 'Reading',     'Avid reader — 2 books per month',     'can_do'],
    [U.alice, 'Cycling',     'Would love to learn trail cycling',   'interested'],
    [U.bob,   'Chess',       'Club-level player, 5 years',          'can_do'],
    [U.bob,   'TypeScript',  'Professional web developer',          'can_do'],
    [U.bob,   'Hiking',      'Want to start hiking this year',      'learning'],
    [U.carol, 'Painting',    'Watercolour and acrylic',             'can_do'],
    [U.carol, 'Yoga',        'Practising for 3 years',              'can_do'],
    [U.carol, 'Photography', 'Interested in learning',              'interested'],
    [U.dave,  'Running',     'Half-marathon finisher',              'can_do'],
    [U.dave,  'Cycling',     'Weekend road cyclist',                'can_do'],
    [U.dave,  'Swimming',    'Learning freestyle technique',        'learning'],
  ];
  for (const [uid, name, desc, status] of skills) {
    await pool.query(
      `INSERT INTO user_skills (user_id, name, description, status) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
      [uid, name, desc, status],
    );
  }
  console.log('   ✔  user_skills');

  // ── 17. User goals ──────────────────────────────────────────────────────────
  const goals: [string, string][] = [
    [U.alice, 'Complete a 10-mile hike by end of year'],
    [U.alice, 'Read 24 books this year'],
    [U.bob,   'Reach 1500 ELO in chess'],
    [U.bob,   'Launch a side project using the Funpals API'],
    [U.carol, 'Finish 12 paintings this year'],
    [U.carol, 'Complete a 30-day yoga challenge'],
    [U.dave,  'Run a full marathon'],
    [U.dave,  'Cycle 500 miles this summer'],
  ];
  for (const [uid, desc] of goals) {
    await pool.query(
      `INSERT INTO user_goals (user_id, description) VALUES ($1,$2)`,
      [uid, desc],
    );
  }
  console.log('   ✔  user_goals');

  // ── 18. Notifications ───────────────────────────────────────────────────────
  const notifs: [string, string, string, string][] = [
    [U.alice, 'welcome', 'Welcome to Funpals!',          'Start exploring activities near you.'],
    [U.bob,   'welcome', 'Welcome to Funpals!',          'Start exploring activities near you.'],
    [U.carol, 'welcome', 'Welcome to Funpals!',          'Start exploring activities near you.'],
    [U.dave,  'welcome', 'Welcome to Funpals!',          'Start exploring activities near you.'],
    [U.alice, 'event',   'New Event: Hike Saturday',     'Dave invited you to Morning Hike at Riverside Trail.'],
    [U.carol, 'message', 'New message in Book Club',     'Alice posted in the Book Club channel.'],
    [U.bob,   'event',   'Board Game Night is tomorrow', 'You RSVP\'d going — see you there!'],
  ];
  for (const [uid, type, title, body] of notifs) {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body) VALUES ($1,$2,$3,$4)`,
      [uid, type, title, body],
    );
  }
  console.log('   ✔  notifications');

  // ── 19. User activities (link users to activities) ──────────────────────────
  const { rows: actRows } = await pool.query('SELECT id FROM activities LIMIT 6');
  const activityLinks: [string, number][] = [
    [U.alice, 3], [U.alice, 4], [U.alice, 5],
    [U.bob,   0], [U.bob,   1],
    [U.carol, 4],
    [U.dave,  2], [U.dave,  5],
  ];
  for (const [uid, idx] of activityLinks) {
    if (!actRows[idx]) continue;
    await pool.query(
      `INSERT INTO user_activities (user_id, activity_id, status) VALUES ($1,$2,'available') ON CONFLICT DO NOTHING`,
      [uid, actRows[idx].id],
    );
  }
  console.log('   ✔  user_activities');

  await pool.end();
  console.log('\n✅  Seed complete!');
  console.log('\n   Accounts (password: Funpals@123)');
  console.log('   ─────────────────────────────────');
  console.log('   admin@funpals.com  (role: admin)');
  console.log('   alice@funpals.com  (role: user)');
  console.log('   bob@funpals.com    (role: user)');
  console.log('   carol@funpals.com  (role: user)');
  console.log('   dave@funpals.com   (role: user)');
}

seed().catch(err => { console.error('❌  Seed failed:', err.message); process.exit(1); });
