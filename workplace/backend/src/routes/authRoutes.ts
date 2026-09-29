import { Hono } from 'hono'
import { Env } from '../types/hono'
import { AuthController } from '../controllers/authController'
import { authCheck } from '../middleware/authMiddleware'

export const authRoutes = new Hono<Env>()

// --- 環境変数 ---
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'

// People, Classroom, Calendar に必要なスコープ
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/calendar.readonly'
].join(' ')

// 1. Google の認可画面へリダイレクト
authRoutes.get('/google/login', (c) => {
  const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    access_type: 'offline', // リフレッシュトークンを取得したい場合
    prompt: 'consent'
  })

  return c.redirect(`${AUTH_ENDPOINT}?${params.toString()}`)
})

// 2. Google からのコールバック処理 (トークン発行 & 3つの API 並列呼び出し)
authRoutes.get('/google/callback', async (c) => {
  const code = c.req.query('code')
  if (!code) {
    return c.json({ error: '認可コード (code) がありません' }, 400)
  }

  // A. アクセストークンの取得 (axios 不使用・標準 fetch)
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    })
  })

  const tokenData = await tokenRes.json()
  const accessToken = tokenData.access_token

  if (!accessToken) {
    return c.json({ error: 'アクセストークンの取得に失敗しました', details: tokenData }, 400)
  }

  // B. 3つの API を並列で取得 (Promise.all)
  const authHeader = { Authorization: `Bearer ${accessToken}` }

  const [peopleRes, classroomRes, calendarRes] = await Promise.all([
    // People API (ユーザー情報)
    fetch('https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos', { headers: authHeader }),
    // Classroom API (コース一覧)
    fetch('https://classroom.googleapis.com/v1/courses', { headers: authHeader }),
    // Calendar API (カレンダー一覧)
    fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', { headers: authHeader })
  ])

  const peopleData = await peopleRes.json()
  const classroomData = await classroomRes.json()
  const calendarData = await calendarRes.json()

  // TODO: 必要に応じてここで AuthController を呼び出して DB 保存や JWT Cookie 発行を行う
  // 例: AuthController.handleOAuthCallback(c, peopleData, accessToken)

  return c.json({
    user: peopleData,
    courses: classroomData.courses || [],
    calendars: calendarData.items || []
  })
})

// --- 既存のルート ---

// ID Token 方式の Google ログイン
authRoutes.post('/google', async (c) => {
  const { credential } = await c.req.json().catch(() => ({}))

  if (!credential) {
    return c.json({ error: 'Google 認証情報 (credential) がありません' }, 400)
  }

  return AuthController.googleLogin(c, credential)
})

// ログイン中のユーザー情報取得
authRoutes.get('/me', authCheck, (c) => AuthController.getMe(c))

// ログアウト
authRoutes.post('/logout', (c) => AuthController.logout(c))

export default authRoutes