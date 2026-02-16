/**
 * run.ts — Seeds initial data: activity categories, sample activities, default channels.
 * Safe to run multiple times (uses ON CONFLICT DO NOTHING).
 */
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  // Activity categories
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

  // Sample activities
  const { rows: cats } = await pool.query('SELECT id, name FROM activity_categories');
  const catMap = Object.fromEntries(cats.map((c: { id: string; name: string }) => [c.name, c.id]));

  const activities = [
    [catMap.games,     'Chess Club Meetup',     'Play chess with local enthusiasts', null, null, 0],
    [catMap.games,     'Board Game Night',      'Strategy, trivia, and fun', null, null, 1],
    [catMap.parks,     'Central Park Walk',     'Morning walk in the park', '123 Park Ave', null, 0],
    [catMap.libraries, 'Public Library',        'Study sessions and book clubs', '456 Main St', 'https://library.example.com', 0],
    [catMap.books,     'Book of the Month',     'Join the monthly reading circle', null, null, 0],
    [catMap.trails,    'Riverside Trail',       '3-mile scenic trail run/walk', 'Riverside Dr', null, 0],
  ];

  for (const [cat, title, desc, address, url, sort] of activities) {
    await pool.query(
      `INSERT INTO activities (category_id, title, description, address, external_url, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
      [cat, title, desc, address, url, sort],
    );
  }

  // Default channels
  await pool.query(`
    INSERT INTO channels (name, description, is_default) VALUES
      ('General',     'General discussion for all members', TRUE),
      ('Activities',  'Coordinate activities and meetups',  TRUE),
      ('Announcements','Important updates',                 TRUE)
    ON CONFLICT DO NOTHING
  `);

  await pool.end();
  console.log('✅ Seed data inserted');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
