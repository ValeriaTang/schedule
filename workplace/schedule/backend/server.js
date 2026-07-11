const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const argon2 = require('argon2');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ==========================================
// 1. ユーザー登録 API (POST)
// ==========================================
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 入力された生のパスワードをArgon2でハッシュ化（解読不能に）する
    const hash = await argon2.hash(password);

    // Neonデータベースにユーザー情報を保存（パスワードはハッシュを保存）
    const queryText = `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email; -- パスワードハッシュは返さない
    `;
    const result = await pool.query(queryText, [name, email, hash]);

    res.status(201).json({
      message: 'ユーザー登録が完了しました',
      user: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    // メールアドレスが重複していた場合のエラーハンドリング
    if (err.code === '23505') {
       return res.status(400).json({ error: 'このメールアドレスは既に登録されています' });
    }
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// ==========================================
// 2. ログイン API (POST)
// ==========================================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. 入力されたメールアドレスを持つユーザーをNeonから探す
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが間違っています' });
    }

    const user = userResult.rows[0];

    // 2. 入力された生のパスワードと、Neonから持ってきたハッシュが一致するか検証する
    // argon2.verifyが自動で安全に計算・比較してくれます
    const isPasswordValid = await argon2.verify(user.password_hash, password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが間違っています' });
    }

    // 3. ログイン成功
    res.json({
      message: 'ログインに成功しました',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.error(`Server running on port ${PORT}`));