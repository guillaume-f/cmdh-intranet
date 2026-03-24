// middleware/auth.js
// Middleware JSON Server pour simuler l'authentification JWT
const jwt = require('jsonwebtoken')

const SECRET = 'intranet-dev-secret'

module.exports = (req, res, next) => {
  // Route login : POST /auth/login
  if (req.method === 'POST' && req.path === '/auth/login') {
    const { email, password } = req.body
    const db = req.app.db

    const user = db.get('users').find({ email, password, active: true }).value()

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: '8h' }
    )

    const { password: _pwd, ...userWithoutPassword } = user
    return res.json({ token, user: userWithoutPassword })
  }

  // Route mot de passe oublié : POST /auth/forgot-password
  if (req.method === 'POST' && req.path === '/auth/forgot-password') {
    const { email } = req.body
    const db = req.app.db
    const user = db.get('users').find({ email }).value()

    // On répond toujours OK pour ne pas révéler si l'email existe
    if (user) {
      const resetToken = Math.random().toString(36).substring(2)
      db.get('passwordResets').push({
        id: resetToken,
        userId: user.id,
        email,
        createdAt: new Date().toISOString(),
        used: false
      }).write()
      console.log(`[DEV] Reset token pour ${email}: ${resetToken}`)
    }

    return res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' })
  }

  // Route reset password : POST /auth/reset-password
  if (req.method === 'POST' && req.path === '/auth/reset-password') {
    const { token, newPassword } = req.body
    const db = req.app.db
    const reset = db.get('passwordResets').find({ id: token, used: false }).value()

    if (!reset) {
      return res.status(400).json({ message: 'Lien invalide ou expiré' })
    }

    db.get('users').find({ id: reset.userId }).assign({ password: newPassword }).write()
    db.get('passwordResets').find({ id: token }).assign({ used: true }).write()

    return res.json({ message: 'Mot de passe mis à jour avec succès' })
  }

  // Routes protégées : vérifier le token JWT
  const publicRoutes = [
    { method: 'POST', path: '/auth/login' },
    { method: 'POST', path: '/auth/forgot-password' },
    { method: 'POST', path: '/auth/reset-password' },
  ]

  const isPublic = publicRoutes.some(r => r.method === req.method && req.path.startsWith(r.path))
  if (isPublic) return next()

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' })
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Token invalide ou expiré' })
  }
}
