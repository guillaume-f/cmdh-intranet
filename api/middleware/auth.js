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

const ACTIVITY_DETAIL_ROUTE_REGEX = /^\/api\/activities\/([^/]+)$/
const ACTIVITY_PARTICIPANTS_ROUTE_REGEX = /^\/api\/activities\/([^/]+)\/participants$/
const PARTICIPANT_REGISTRATION_DELETE_ROUTE_REGEX = /^\/api\/activities\/([^/]+)\/participants\/([^/]+)$/
const BULK_ADD_PARTICIPANTS_ROUTE_REGEX = /^\/api\/activities\/([^/]+)\/participants\/bulk-add$/
const REGISTER_ROUTE_REGEX = /^\/api\/activities\/([^/]+)\/register$/
const UNREGISTER_ROUTE_REGEX = /^\/api\/activities\/([^/]+)\/unregister$/
const ATTENDANCE_VALIDATION_ROUTE_REGEX = /^\/api\/activities\/([^/]+)\/participants\/([^/]+)\/(validate|invalidate)$/
const USER_VALIDATED_ACTIVITIES_ROUTE_REGEX = /^\/api\/users\/([^/]+)\/validated-activities$/

function permissionDenied(res, permission) {
  return res.status(403).json({ message: `Permission manquante : ${permission}` })
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  return authHeader.split(' ')[1]
}

function verifyToken(token) {
  return jwt.verify(token, SECRET)
}

function buildActivityResponse(activity, registration) {
  return {
    ...activity,
    requiresRegistration: activity.requiresRegistration !== false,
    requiresAttendanceValidation: activity.requiresAttendanceValidation !== false,
    isRegistered: !!registration,
    registeredAt: registration ? registration.registeredAt : null,
  }
}

function buildValidatedActivityList(db, userId) {
  const attendanceValidations = db
    .get('attendanceValidations')
    .filter({ userId, isPresent: true })
    .value()

  const activities = attendanceValidations
    .map((validation) => {
      const activity = db.get('activities').find({ id: validation.activityId }).value()
      if (!activity) {
        return null
      }

      return {
        activityId: activity.id,
        title: activity.title,
        datetime: activity.datetime,
        points: Number(activity.points) || 0,
      }
    })
    .filter(Boolean)
    .sort((left, right) => new Date(right.datetime).getTime() - new Date(left.datetime).getTime())

  const totalPoints = activities.reduce((sum, activity) => sum + activity.points, 0)

  return {
    items: activities,
    totalPoints,
  }
}

function findActivityOr404(db, activityId, res) {
  const activity = db.get('activities').find({ id: activityId }).value()
  if (!activity) {
    res.status(404).json({ message: 'Activité introuvable' })
    return null
  }
  return activity
}

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

function buildNextUserId(db) {
  const users = db.get('users').value() || []
  const maxId = users.reduce((max, user) => {
    const match = typeof user.id === 'string' ? user.id.match(/^u(\d+)$/) : null
    if (!match) {
      return max
    }
    const value = Number(match[1])
    return Number.isNaN(value) ? max : Math.max(max, value)
  }, 0)

  return `u${maxId + 1}`
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
  const isBulkAddParticipantsRoute = /^\/api\/activities\/[^/]+\/participants\/bulk-add$/.test(path)
  const isParticipantRegistrationDeleteRoute = /^\/api\/activities\/[^/]+\/participants\/[^/]+$/.test(path)

  // --- Activités ---
  if (path.startsWith('/api/activities')) {
    if (method === 'GET' && !hasPermission(req, 'activity:read')) {
      return permissionDenied(res, 'activity:read')
    }
    if (isRegisterRoute && method === 'POST' && !hasPermission(req, 'registration:create')) {
      return permissionDenied(res, 'registration:create')
    }
    if (isUnregisterRoute && method === 'POST' && !hasPermission(req, 'registration:delete')) {
      return permissionDenied(res, 'registration:delete')
    }
    if (isAttendanceValidationRoute && method === 'POST' && !hasPermission(req, 'attendance:validate')) {
      return permissionDenied(res, 'attendance:validate')
    }
    if (method === 'POST' && !isRegisterRoute && !isUnregisterRoute && !isAttendanceValidationRoute && !isBulkAddParticipantsRoute && !hasPermission(req, 'activity:create')) {
      return permissionDenied(res, 'activity:create')
    }
    if (method === 'PATCH' || method === 'PUT') {
      if (!hasPermission(req, 'activity:edit')) {
        return permissionDenied(res, 'activity:edit')
      }
      // Publication : changer status vers "published" nécessite activity:publish
      if (req.body?.status === 'published' && !hasPermission(req, 'activity:publish')) {
        return permissionDenied(res, 'activity:publish')
      }
    }
    if (method === 'DELETE') {
      if (isParticipantRegistrationDeleteRoute && !hasPermission(req, 'registration:delete')) {
        return permissionDenied(res, 'registration:delete')
      }
      if (!isParticipantRegistrationDeleteRoute && !hasPermission(req, 'activity:delete')) {
        return permissionDenied(res, 'activity:delete')
      }
    }
  }

  // --- Inscriptions ---
  if (path.startsWith('/api/registrations')) {
    if (method === 'GET' && !hasPermission(req, 'registration:read')) {
      // Cas spécial : un user peut toujours lire SES propres inscriptions
      // (filtré par ?userId= dans la query)
      const isOwnQuery = req.query.userId === req.user.id
      if (!isOwnQuery) {
        return permissionDenied(res, 'registration:read')
      }
    }
    if (method === 'POST' && !hasPermission(req, 'registration:create')) {
      return permissionDenied(res, 'registration:create')
    }
    if (method === 'DELETE' && !hasPermission(req, 'registration:delete')) {
      return permissionDenied(res, 'registration:delete')
    }
  }

  // --- Utilisateurs ---
  if (path.startsWith('/api/users')) {
    const isSelf = path === `/api/users/${req.user.id}`

    if ((method === 'PATCH' || method === 'PUT') && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Seul un administrateur peut modifier un utilisateur' })
    }

    if (!isSelf && !hasPermission(req, 'user:manage')) {
      return permissionDenied(res, 'user:manage')
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
    const token = getBearerToken(req)
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' })
    }
    try {
      const decoded = verifyToken(token)
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
  const token = getBearerToken(req)
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' })
  }

  let decoded
  try {
    decoded = verifyToken(token)
  } catch {
    return res.status(401).json({ message: 'Token invalide ou expiré' })
  }

  req.user = decoded  // { id, email, role, permissions[] }

  if (req.method === 'POST' && req.path === '/api/activities' && req.body?.requiresAttendanceValidation === undefined) {
    req.body.requiresAttendanceValidation = true
  }
  if (req.method === 'POST' && req.path === '/api/activities' && req.body?.requiresRegistration === undefined) {
    req.body.requiresRegistration = true
  }

  // --- Contrôle des permissions sur les routes /api/* ---
  const permError = checkRoutePermission(req, res)
  if (permError) return  // La réponse d'erreur a déjà été envoyée

  // --- POST /api/users ---
  // Création d'un utilisateur avec valeurs par défaut.
  if (req.method === 'POST' && req.path === '/api/users') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Seul un administrateur peut créer un utilisateur' })
    }

    const { firstName, lastName, email, niss, role, active } = req.body || {}

    if (!firstName || !lastName || !email || !niss || !role) {
      return res.status(400).json({ message: 'Les champs firstName, lastName, email, niss et role sont obligatoires' })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const normalizedNiss = String(niss).trim()
    const normalizedRole = String(role).trim()

    const roleExists = !!db.get('roles').find({ id: normalizedRole }).value()
    if (!roleExists) {
      return res.status(400).json({ message: 'Rôle invalide' })
    }

    const emailExists = !!db.get('users').find((user) => String(user.email || '').toLowerCase() === normalizedEmail).value()
    if (emailExists) {
      return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà' })
    }

    const nissExists = !!db.get('users').find({ niss: normalizedNiss }).value()
    if (nissExists) {
      return res.status(409).json({ message: 'Un utilisateur avec ce NISS existe déjà' })
    }

    const createdUser = {
      id: buildNextUserId(db),
      email: normalizedEmail,
      password: 'changeMe123!',
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      role: normalizedRole,
      extraPermissions: [],
      deniedPermissions: [],
      active: typeof active === 'boolean' ? active : true,
      niss: normalizedNiss,
    }

    db.get('users').push(createdUser).write()

    const permissions = resolvePermissions(createdUser, db)
    const { password: _pwd, ...userWithoutPassword } = createdUser

    return res.status(201).json({
      ...userWithoutPassword,
      permissions,
    })
  }

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
      return buildActivityResponse(activity, registration)
    })

    return res.json(enrichedActivities)
  }

  // --- GET /api/activities/:id ---
  // Renvoie l'activité avec l'état d'inscription de l'utilisateur connecté.
  const activityDetailMatch = req.path.match(ACTIVITY_DETAIL_ROUTE_REGEX)
  if (req.method === 'GET' && activityDetailMatch) {
    const activityId = activityDetailMatch[1]

    const activity = findActivityOr404(db, activityId, res)
    if (!activity) return

    const registration = db
      .get('registrations')
      .find({ activityId, userId: req.user.id })
      .value()

    return res.json(buildActivityResponse(activity, registration))
  }

  // --- GET /api/activities/:id/participants ---
  // Renvoie la liste des membres inscrits à une activité.
  const activityParticipantsMatch = req.path.match(ACTIVITY_PARTICIPANTS_ROUTE_REGEX)
  if (req.method === 'GET' && activityParticipantsMatch) {
    const activityId = activityParticipantsMatch[1]

    const activity = findActivityOr404(db, activityId, res)
    if (!activity) return

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

  // --- GET /api/users/:id/validated-activities ---
  // Renvoie les activités validées d'un utilisateur avec le total des points.
  const userValidatedActivitiesMatch = req.path.match(USER_VALIDATED_ACTIVITIES_ROUTE_REGEX)
  if (req.method === 'GET' && userValidatedActivitiesMatch) {
    const userId = userValidatedActivitiesMatch[1]

    const user = db.get('users').find({ id: userId }).value()
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' })
    }

    return res.json(buildValidatedActivityList(db, userId))
  }

  // --- POST /api/activities/:id/register ---
  const registerMatch = req.path.match(REGISTER_ROUTE_REGEX)
  if (req.method === 'POST' && registerMatch) {
    const activityId = registerMatch[1]

    const activity = findActivityOr404(db, activityId, res)
    if (!activity) return

    if (activity.requiresRegistration === false) {
      return res.status(400).json({ message: 'Les inscriptions ne sont pas requises pour cette activité' })
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

  // --- POST /api/activities/:id/participants/bulk-add ---
  // Inscrit des utilisateurs et les marque comme présents en une seule opération.
  const bulkAddMatch = req.path.match(BULK_ADD_PARTICIPANTS_ROUTE_REGEX)
  if (req.method === 'POST' && bulkAddMatch) {
    if (!hasPermission(req, 'attendance:validate')) {
      return permissionDenied(res, 'attendance:validate')
    }

    const activityId = bulkAddMatch[1]

    const activity = findActivityOr404(db, activityId, res)
    if (!activity) return

    const userIds = req.body?.userIds
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'userIds doit être un tableau non vide' })
    }

    const validatedAt = new Date().toISOString()
    const results = []

    for (const userId of userIds) {
      const user = db.get('users').find({ id: userId }).value()
      if (!user) continue

      // Créer l'inscription si elle n'existe pas encore
      const existingRegistration = db.get('registrations').find({ activityId, userId }).value()
      if (!existingRegistration) {
        db.get('registrations').push({
          id: `r${Date.now()}-${userId}`,
          activityId,
          userId,
          registeredAt: validatedAt,
          status: 'confirmed',
        }).write()
      }

      // Créer ou mettre à jour la validation de présence (présent)
      const existingValidation = db.get('attendanceValidations').find({ activityId, userId }).value()
      if (existingValidation) {
        db.get('attendanceValidations').find({ id: existingValidation.id }).assign({
          isPresent: true,
          validatedAt,
          validatedBy: req.user.id,
        }).write()
      } else {
        db.get('attendanceValidations').push({
          id: `av${Date.now()}-${userId}`,
          activityId,
          userId,
          isPresent: true,
          validatedAt,
          validatedBy: req.user.id,
        }).write()
      }

      results.push(userId)
    }

    return res.status(201).json({
      message: `${results.length} participant(s) ajouté(s) et marqué(s) présent(s)`,
      addedUserIds: results,
    })
  }

  // --- POST /api/activities/:id/participants/:userId/validate|invalidate ---
  const attendanceValidationMatch = req.path.match(ATTENDANCE_VALIDATION_ROUTE_REGEX)
  if (req.method === 'POST' && attendanceValidationMatch) {
    const activityId = attendanceValidationMatch[1]
    const userId = attendanceValidationMatch[2]
    const action = attendanceValidationMatch[3]
    const isPresent = action === 'validate'

    const activity = findActivityOr404(db, activityId, res)
    if (!activity) return

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

  // --- DELETE /api/activities/:id/participants/:userId ---
  // Supprime l'inscription et la participation associée.
  const participantDeleteMatch = req.path.match(PARTICIPANT_REGISTRATION_DELETE_ROUTE_REGEX)
  if (req.method === 'DELETE' && participantDeleteMatch) {
    const activityId = participantDeleteMatch[1]
    const userId = participantDeleteMatch[2]

    const activity = findActivityOr404(db, activityId, res)
    if (!activity) return

    const registration = db
      .get('registrations')
      .find({ activityId, userId })
      .value()

    if (!registration) {
      return res.status(404).json({ message: 'Aucune inscription trouvée pour cet utilisateur' })
    }

    db.get('registrations').remove({ id: registration.id }).write()
    db.get('attendanceValidations').remove({ activityId, userId }).write()

    return res.json({
      message: 'Inscription supprimée',
      activityId,
      userId,
    })
  }

  // --- POST /api/activities/:id/unregister ---
  const unregisterMatch = req.path.match(UNREGISTER_ROUTE_REGEX)
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