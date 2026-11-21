const { MongoClient } = require('mongodb');

const databaseName = process.env.MONGODB_DB_NAME || 'tictactoe';
let client;
let users;
let matches;

async function connect() {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    throw new Error('MONGO_URL must be set before starting the service');
  }
  client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(databaseName);
    users = database.collection('users');
    matches = database.collection('matches');
    await Promise.all([
      users.createIndex({ email: 1 }, { unique: true }),
      users.createIndex({ token: 1 }, { unique: true, sparse: true }),
      matches.createIndex({ email: 1, id: 1 }, { unique: true }),
      matches.createIndex({ email: 1, recordedAt: -1 }),
    ]);
  } catch (error) {
    await client.close();
    throw error;
  }
}

function getUserByEmail(email) {
  assertValidEmail(email);
  return users.findOne({ email });
}

async function getUserByToken(token) {
  if (typeof token !== 'string' || token.length === 0) return null;
  assertValidToken(token);
  return users.findOne({ token });
}

function createUser(user) {
  assertValidUser(user);
  return users.insertOne(user);
}

function updateUserToken(email, token) {
  assertValidEmail(email);
  assertValidToken(token);
  return users.updateOne({ email }, { $set: { token } });
}

function removeUserToken(email) {
  assertValidEmail(email);
  return users.updateOne({ email }, { $unset: { token: '' } });
}

async function getMatches(email) {
  assertValidEmail(email);
  return matches.find(
    { email },
    { projection: { _id: 0, email: 0, recordedAt: 0 } },
  ).sort({ recordedAt: -1, _id: -1 }).limit(50).toArray();
}

async function addMatch(email, match) {
  assertValidEmail(email);
  const validatedMatch = validateMatch(match);
  if (!validatedMatch) throw new Error('Invalid match details');
  try {
    await matches.updateOne(
      { email, id: validatedMatch.id },
      { $setOnInsert: { ...validatedMatch, email, recordedAt: new Date() } },
      { upsert: true },
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
  const oldMatches = await matches.find({ email })
    .sort({ recordedAt: -1, _id: -1 })
    .skip(50)
    .project({ _id: 1 })
    .toArray();
  if (oldMatches.length) {
    await matches.deleteMany({ _id: { $in: oldMatches.map(({ _id }) => _id) } });
  }
  return getMatches(email);
}

function clearMatches(email) {
  assertValidEmail(email);
  return matches.deleteMany({ email });
}

function validateMatch(body) {
  if (!body || typeof body !== 'object') return null;
  const validId = typeof body.id === 'string' && body.id.length > 0 && body.id.length <= 100;
  const validOpponent = typeof body.opponent === 'string' && body.opponent.trim().length > 0 && body.opponent.length <= 28;
  const validMode = body.mode === 'bot' || body.mode === 'multiplayer';
  const validDifficulty = ['easy', 'medium', 'hard'].includes(body.difficulty);
  const validResult = ['Win', 'Loss', 'Draw'].includes(body.result);
  const playedAt = typeof body.playedAt === 'string' && Number.isFinite(Date.parse(body.playedAt));
  if (!validId || !validOpponent || !validMode || !validDifficulty || !validResult || !playedAt) return null;
  return {
    id: body.id,
    opponent: body.opponent.trim(),
    mode: body.mode,
    difficulty: body.difficulty,
    result: body.result,
    playedAt: new Date(body.playedAt).toISOString(),
  };
}

function assertValidEmail(email) {
  if (typeof email !== 'string'
    || email.length > 254
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email');
  }
}

function assertValidToken(token) {
  if (typeof token !== 'string' || token.length === 0 || token.length > 100) {
    throw new Error('Invalid authentication token');
  }
}

function assertValidUser(user) {
  assertValidEmail(user?.email);
  if (typeof user.displayName !== 'string'
    || user.displayName.trim().length === 0
    || user.displayName.length > 28
    || typeof user.passwordHash !== 'string'
    || user.passwordHash.length === 0) {
    throw new Error('Invalid user');
  }
  assertValidToken(user.token);
}

module.exports = {
  addMatch,
  clearMatches,
  connect,
  createUser,
  getMatches,
  getUserByEmail,
  getUserByToken,
  removeUserToken,
  updateUserToken,
  validateMatch,
};
