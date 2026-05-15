// middleware/auth.js
// Middleware JSON Server — authentification JWT + système de permissions
//
// Modèle :
//   • Chaque rôle a des permissions par défaut (défini dans db.json > roles)
//   • Chaque user peut avoir extraPermissions[] et deniedPermissions[]
//   • Permissions effectives = (rôle + extra) - denied
//   • Le token JWT contient les permissions calculées → pas de re-fetch nécessaire

const jwt = require('jsonwebtoken')

const SECRET = 'intranet-dev-secret'

// ---------------------------------------------------------------------------
// Calcul des permissions effectives d'un utilisateur
// ---------------------------------------------------------------------------
function resolvePermissions(user, db) {
  const role = db.get('roles').find({ id: user.role }).value()
  const rolePermissions = role ? role.permissions : []

  const extra = user.extraPermissions || []
  const denied = user.deniedPermissions || []

  // Union rôle + extra, puis on retire les denied
  const merged = [...new Set([...rolePermissions, ...extra])]
  return merged.filter(p => !denied.includes(p))
}

// ---------------------------------------------------------------------------
// Vérification d'une permission sur req.user (injecté après auth)
// ---------------------------------------------------------------------------
function hasPermission(req, permission) {
  return Array.isArray(req.user?.permissions) && req.user.permissions.includes(permission)
}

function ensureAttendanceValidationsCollection(db) {
  if (!Array.isArray(db.get('attendanceValidations').value())) {
    db.set('attendanceValidations', []).write()
  }
}

// ---------------------------------------------------------------------------
// Routes publiques (pas de token requis)
// ---------------------------------------------------------------------------
const PUBLIC_ROUTES = [
  { method: 'POST', path: '/auth/login' },
  { method: 'POST', path: '/auth/forgot-password' },
  { method: 'POST', path: '/auth/reset-password' },
]

function isPublicRoute(method, path) {
  return PUBLIC_ROUTES.some(r => r.method === method && path.includes(r.path))
}

// ---------------------------------------------------------------------------
// Garde-fous sur les routes JSON Server selon les permissions
// Les routes /api/* sont gérées par JSON Server, mais on peut les intercepter
// ici pour ajouter des contrôles fins.
// ---------------------------------------------------------------------------
function checkRoutePermission(req, res) {
  const path = req.path  // ex: /api/activities, /api/registrations/r1
  const method = req.method

  const isRegisterRoute = /^\/api\/activities\/[^/]+\/register$/.test(path)
  const isUnregisterRoute = /^\/api\/activities\/[^/]+\/unregister$/.test(path)
  const isAttendanceValidationRoute = /^\/api\/activities\/[^/]+\/participants\/[^/]+\/(validate|invalidate)$/.test(path)

  // --- Activités ---
  if (path.startsWith('/api/activities')) {
    if (method === 'GET' && !hasPermission(req, 'activity:read')) {
      return res.status(403).json({ message: 'Permission manquante : activity:read' })
    }
    if (isRegisterRoute && method === 'POST' && !hasPermission(req, 'registration:create')) {
      return res.status(403).json({ message: 'Permission manquante : registration:create' })
    }
    if (isUnregisterRoute && method === 'POST' && !hasPermission(req, 'registration:delete')) {
      return res.status(403).json({ message: 'Permission manquante : registration:delete' })
    }
    if (isAttendanceValidationRoute && method === 'POST' && !hasPermission(req, 'attendance:validate')) {
      return res.status(403).json({ message: 'Permission manquante : attendance:validate' })
    }
    if (method === 'POST' && !isRegisterRoute && !isUnregisterRoute && !isAttendanceValidationRoute && !hasPermission(req, 'activity:create')) {
      return res.status(403).json({ message: 'Permission manquante : activity:create' })
    }
    if (method === 'PATCH' || method === 'PUT') {
      if (!hasPermission(req, 'activity:edit')) {
        return res.status(403).json({ message: 'Permission manquante : activity:edit' })
      }
      // Publication : changer status vers "published" nécessite activity:publish
      if (req.body?.status === 'published' && !hasPermission(req, 'activity:publish')) {
        return res.status(403).json({ message: 'Permission manquante : activity:publish' })
      }
    }
    if (method === 'DELETE' && !hasPermission(req, 'activity:delete')) {
      return res.status(403).json({ message: 'Permission manquante : activity:delete' })
    }
  }

  // --- Inscriptions ---
  if (path.startsWith('/api/registrations')) {
    if (method === 'GET' && !hasPermission(req, 'registration:read')) {
      // Cas spécial : un user peut toujours lire SES propres inscriptions
      // (filtré par ?userId= dans la query)
      const isOwnQuery = req.query.userId === req.user.id
      if (!isOwnQuery) {
        return res.status(403).json({ message: 'Permission manquante : registration:read' })
      }
    }
    if (method === 'POST' && !hasPermission(req, 'registration:create')) {
      return res.status(403).json({ message: 'Permission manquante : registration:create' })
    }
    if (method === 'DELETE' && !hasPermission(req, 'registration:delete')) {
      return res.status(403).json({ message: 'Permission manquante : registration:delete' })
    }
  }

  // --- Utilisateurs ---
  if (path.startsWith('/api/users')) {
    const isSelf = path === `/api/users/${req.user.id}`

    if (!isSelf && !hasPermission(req, 'user:manage')) {
      return res.status(403).json({ message: 'Permission manquante : user:manage' })
    }
    // Même soi-même ne peut pas changer son propre rôle ou ses permissions
    if (isSelf && (method === 'PATCH' || method === 'PUT')) {
      const forbidden = ['role', 'extraPermissions', 'deniedPermissions', 'active']
      const attempted = forbidden.filter(f => req.body?.[f] !== undefined)
      if (attempted.length > 0) {
        return res.status(403).json({
          message: `Vous ne pouvez pas modifier : ${attempted.join(', ')}`
        })
      }
    }
  }

  return null // Pas d'erreur → on continue
}

// ---------------------------------------------------------------------------
// Middleware principal
// ---------------------------------------------------------------------------
module.exports = (req, res, next) => {
  const db = req.app.db
  ensureAttendanceValidationsCollection(db)

  // --- POST /auth/login ---
  if (req.method === 'POST' && req.path === '/auth/login') {
    const { email, password } = req.body
    const user = db.get('users').find({ email, password, active: true }).value()

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }

    const permissions = resolvePermissions(user, db)

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions,   // ← permissions effectives dans le token
      },
      SECRET,
      { expiresIn: '8h' }
    )

    const { password: _pwd, ...userWithoutPassword } = user

    return res.json({
      token,
      user: {
        ...userWithoutPassword,
        permissions,   // ← aussi renvoyé en clair pour le front
      }
    })
  }

  // --- POST /auth/forgot-password ---
  if (req.method === 'POST' && req.path === '/auth/forgot-password') {
    const { email } = req.body
    const user = db.get('users').find({ email }).value()

    if (user) {
      const resetToken = Math.random().toString(36).substring(2)
      db.get('passwordResets').push({
        id: resetToken,
        userId: user.id,
        email,
        createdAt: new Date().toISOString(),
        used: false,
      }).write()
      console.log(`\n[DEV] 🔑 Reset token pour ${email} : ${resetToken}\n`)
    }

    return res.json({
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
    })
  }

  // --- POST /auth/reset-password ---
  if (req.method === 'POST' && req.path === '/auth/reset-password') {
    const { token, newPassword } = req.body
    const reset = db.get('passwordResets').find({ id: token, used: false }).value()

    if (!reset) {
      return res.status(400).json({ message: 'Lien invalide ou expiré' })
    }

    db.get('users').find({ id: reset.userId }).assign({ password: newPassword }).write()
    db.get('passwordResets').find({ id: token }).assign({ used: true }).write()

    return res.json({ message: 'Mot de passe mis à jour avec succès' })
  }

  // --- GET /auth/me — recharge les permissions depuis la DB (utile si modifiées) ---
  if (req.method === 'GET' && req.path === '/auth/me') {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant' })
    }
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], SECRET)
      const user = db.get('users').find({ id: decoded.id, active: true }).value()
      if (!user) return res.status(401).json({ message: 'Utilisateur introuvable' })

      const permissions = resolvePermissions(user, db)
      const { password: _pwd, ...userWithoutPassword } = user
      return res.json({ ...userWithoutPassword, permissions })
    } catch {
      return res.status(401).json({ message: 'Token invalide ou expiré' })
    }
  }

  // --- Routes publiques ---
  if (isPublicRoute(req.method, req.path)) return next()

  // --- Vérification JWT pour toutes les autres routes ---
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' })
  }

  let decoded
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], SECRET)
  } catch {
    return res.status(401).json({ message: 'Token invalide ou expiré' })
  }

  req.user = decoded  // { id, email, role, permissions[] }

  // --- Contrôle des permissions sur les routes /api/* ---
  const permError = checkRoutePermission(req, res)
  if (permError) return  // La réponse d'erreur a déjà été envoyée

  // --- GET /api/activities ---
  // Renvoie la liste des activités enrichie avec l'état d'inscription
  // de l'utilisateur connecté.
  if (req.method === 'GET' && req.path === '/api/activities') {
    const activities = db.get('activities').value()
    const userRegistrations = db
      .get('registrations')
      .filter({ userId: req.user.id })
      .value()

    const registrationsByActivityId = new Map(
      userRegistrations.map((registration) => [registration.activityId, registration])
    )

    const enrichedActivities = activities.map((activity) => {
      const registration = registrationsByActivityId.get(activity.id)
      return {
        ...activity,
        isRegistered: !!registration,
        registeredAt: registration ? registration.registeredAt : null,
      }
    })

    return res.json(enrichedActivities)
  }

  // --- GET /api/activities/:id ---
  // Renvoie l'activité avec l'état d'inscription de l'utilisateur connecté.
  const activityDetailMatch = req.path.match(/^\/api\/activities\/([^/]+)$/)
  if (req.method === 'GET' && activityDetailMatch) {
    const activityId = activityDetailMatch[1]

    const activity = db.get('activities').find({ id: activityId }).value()
    if (!activity) {
      return res.status(404).json({ message: 'Activité introuvable' })
    }

    const registration = db
      .get('registrations')
      .find({ activityId, userId: req.user.id })
      .value()

    return res.json({
      ...activity,
      isRegistered: !!registration,
      registeredAt: registration ? registration.registeredAt : null,
    })
  }

  // --- GET /api/activities/:id/participants ---
  // Renvoie la liste des membres inscrits à une activité.
  const activityParticipantsMatch = req.path.match(/^\/api\/activities\/([^/]+)\/participants$/)
  if (req.method === 'GET' && activityParticipantsMatch) {
    const activityId = activityParticipantsMatch[1]

    const activity = db.get('activities').find({ id: activityId }).value()
    if (!activity) {
      return res.status(404).json({ message: 'Activité introuvable' })
    }

    const registrations = db
      .get('registrations')
      .filter({ activityId })
      .value()

    const presenceByUserId = new Map(
      db
        .get('attendanceValidations')
        .filter({ activityId })
        .value()
        .map((validation) => [validation.userId, validation])
    )

    const participants = registrations
      .map((registration) => {
        const user = db.get('users').find({ id: registration.userId }).value()
        if (!user) {
          return null
        }

        return {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          isPresent: presenceByUserId.has(user.id) ? presenceByUserId.get(user.id).isPresent : null,
          presenceValidatedAt: presenceByUserId.has(user.id)
            ? presenceByUserId.get(user.id).validatedAt
            : null,
        }
      })
      .filter(Boolean)

    return res.json(participants)
  }

  // --- POST /api/activities/:id/register ---
  const registerMatch = req.path.match(/^\/api\/activities\/([^/]+)\/register$/)
  if (req.method === 'POST' && registerMatch) {
    const activityId = registerMatch[1]

    const activity = db.get('activities').find({ id: activityId }).value()
    if (!activity) {
      return res.status(404).json({ message: 'Activité introuvable' })
    }

    const existingRegistration = db
      .get('registrations')
      .find({ activityId, userId: req.user.id })
      .value()

    if (existingRegistration) {
      return res.status(409).json({
        message: 'Vous êtes déjà inscrit à cette activité',
        registration: existingRegistration,
      })
    }

    const registration = {
      id: `r${Date.now()}`,
      activityId,
      userId: req.user.id,
      registeredAt: new Date().toISOString(),
      status: 'confirmed',
    }

    db.get('registrations').push(registration).write()

    return res.status(201).json({
      message: 'Inscription confirmée',
      registration,
    })
  }

  // --- POST /api/activities/:id/participants/:userId/validate|invalidate ---
  const attendanceValidationMatch = req.path.match(/^\/api\/activities\/([^/]+)\/participants\/([^/]+)\/(validate|invalidate)$/)
  if (req.method === 'POST' && attendanceValidationMatch) {
    const activityId = attendanceValidationMatch[1]
    const userId = attendanceValidationMatch[2]
    const action = attendanceValidationMatch[3]
    const isPresent = action === 'validate'

    const activity = db.get('activities').find({ id: activityId }).value()
    if (!activity) {
      return res.status(404).json({ message: 'Activité introuvable' })
    }

    const user = db.get('users').find({ id: userId }).value()
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' })
    }

    const registration = db
      .get('registrations')
      .find({ activityId, userId })
      .value()

    if (!registration) {
      return res.status(400).json({
        message: 'Impossible de valider la présence d\'un utilisateur non inscrit',
      })
    }

    const validatedAt = new Date().toISOString()
    const existingValidation = db
      .get('attendanceValidations')
      .find({ activityId, userId })
      .value()

    if (existingValidation) {
      db
        .get('attendanceValidations')
        .find({ id: existingValidation.id })
        .assign({
          isPresent,
          validatedAt,
          validatedBy: req.user.id,
        })
        .write()
    } else {
      db
        .get('attendanceValidations')
        .push({
          id: `av${Date.now()}`,
          activityId,
          userId,
          isPresent,
          validatedAt,
          validatedBy: req.user.id,
        })
        .write()
    }

    return res.json({
      message: isPresent ? 'Présence validée' : 'Absence validée',
      activityId,
      userId,
      isPresent,
      validatedAt,
    })
  }

  // --- POST /api/activities/:id/unregister ---
  const unregisterMatch = req.path.match(/^\/api\/activities\/([^/]+)\/unregister$/)
  if (req.method === 'POST' && unregisterMatch) {
    const activityId = unregisterMatch[1]

    const registration = db
      .get('registrations')
      .find({ activityId, userId: req.user.id })
      .value()

    if (!registration) {
      return res.status(404).json({ message: 'Aucune inscription trouvée pour cette activité' })
    }

    db.get('registrations').remove({ id: registration.id }).write()

    return res.json({
      message: 'Désinscription effectuée',
      activityId,
      userId: req.user.id,
    })
  }

  next()
}