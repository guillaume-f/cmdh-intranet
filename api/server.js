// server.js — Lance JSON Server avec le middleware auth
const jsonServer = require('json-server')
const path = require('path')
const authMiddleware = require('./middleware/auth')

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)

// Expose db sur req.app pour le middleware
server.use((req, res, next) => {
  req.app.db = router.db
  next()
})

server.use(authMiddleware)
server.use('/api', router)

const PORT = 3000
server.listen(PORT, () => {
  console.log(`\n🚀 Fake API démarrée sur http://localhost:${PORT}/api`)
  console.log(`\nComptes de test :`)
  console.log(`  admin     → admin@intranet.be / admin123`)
  console.log(`  encoder   → encoder@intranet.be / encoder123`)
  console.log(`  member    → member@intranet.be / member123`)
  console.log(`  candidate → candidate@intranet.be / candidate123\n`)
})
