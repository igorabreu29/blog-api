import { sql } from './lib/postgres.ts'

async function setup() {
	await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT NOT NULL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'CUSTOMER',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `

	await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT NOT NULL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      user_id TEXT NOT NULL,
      CONSTRAINT fk_users FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `

	await sql`
    CREATE TABLE IF NOT EXISTS likes(
      id TEXT NOT NULL PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      post_id TEXT NOT NULL UNIQUE,

      CONSTRAINT fk_users FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_posts FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
  `

	await sql`   
    CREATE TABLE IF NOT EXISTS followers(
      id TEXT NOT NULL PRIMARY KEY,
      follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      followee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

      CONSTRAINT unique_follow UNIQUE (follower_id, followee_id),
      CONSTRAINT no_self_follow CHECK (follower_id <> followee_id)
    );
  `

	await sql`
    CREATE TABLE IF NOT EXISTS comments(
      id TEXT NOT NULL PRIMARY KEY,
      comment TEXT NOT NULL,
      
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE
    );
  `

	await sql`
    CREATE TABLE IF NOT EXISTS auth_links(
      id TEXT NOT NULL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );
  `

	await sql`
    CREATE TABLE IF NOT EXISTS attachments(
      id TEXT NOT NULL PRIMARY KEY,
      url TEXT NOT NULL
    );
  `

	await sql.end()
}

await setup()
