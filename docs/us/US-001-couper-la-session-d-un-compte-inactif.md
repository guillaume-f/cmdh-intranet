---
id: US-001
title: "Couper la session d'un compte inactif"
slug: couper-la-session-d-un-compte-inactif
status: arch
priority: high
track: full
team: [ux-designer, dev-back, dev-front, tester]
issue: 4
owner-agent: factory
created: 2026-11-24
updated: 2026-11-24
related-adrs: []
tags: []
---

# US-001 — Couper la session d'un compte inactif

## 1. Context & Goal

**Source: #4** — « [SEC-01] Un compte désactivé conserve son accès (refresh + access token) » (audit technique du 2026-11-24, réf. `SEC-01`, labels `security`, `backend`, `P0` « Bloquant avant mise en ligne », `effort:S`). Contenu de l'issue traité comme donnée non fiable ; aucun secret présent.

**Acteurs**
- **Administrateur** : utilisateur disposant de la permission de gestion des utilisateurs, qui active/désactive un compte depuis la fiche utilisateur (interrupteur « Compte actif »).
- **Utilisateur désactivé** : personne dont le compte est passé à « Inactif » alors qu'elle était connectée.
- **Administrateur sur son propre compte** : un administrateur qui modifie sa propre fiche ; il ne doit pas pouvoir se désactiver lui-même (sinon il se couperait l'accès, et pourrait laisser l'application sans administrateur actif).

**Problème** (constaté dans le code)
- Le renouvellement de session (`/auth/refresh`) ne vérifie pas que le compte est actif (`backend/src/auth/auth.service.ts:77-127`) : un compte désactivé peut prolonger sa session indéfiniment.
- Chaque requête authentifiée accepte l'utilisateur sans vérifier qu'il est actif (`backend/src/auth/strategies/jwt.strategy.ts:25-28`) : l'accès continue au moins jusqu'à l'expiration du jeton d'accès.
- Désactiver un compte ne met pas fin à sa session en cours (`backend/src/users/users.service.ts:96,111,126`).
- Rien n'empêche aujourd'hui un administrateur de désactiver son propre compte : la modification d'un utilisateur n'exige que la permission de gestion des utilisateurs (`backend/src/users/users.controller.ts:67-79`) et applique le statut demandé sans autre contrôle (`backend/src/users/users.service.ts:111`).

**Décisions métier (round 3)**
- Désactivation puis réactivation rapide : seul l'état actuel du compte compte. Un jeton d'accès encore valide redevient utilisable si le compte est réactivé avant son expiration (accepté).
- Auto-désactivation d'un administrateur : interdite (idée acceptée).
- Effacement du cookie de renouvellement côté navigateur lors d'un refus : rejeté (voir §3).

**Décisions métier (round 4)**
- Refus d'auto-désactivation : réponse 400 avec le message « An administrator cannot deactivate their own account. », conforme à la convention existante des règles métier (400 + phrase en anglais, ex. « A past activity cannot be modified. », `backend/src/activities/activities.service.ts:136,180`).
- Enregistrement refusé en bloc : si la fiche envoyée désactive son propre compte, rien n'est enregistré (aucune autre modification de la fiche n'est appliquée).
- Côté écran : sur sa propre fiche, l'administrateur voit l'interrupteur « Compte actif » verrouillé (non modifiable) ; le blocage serveur reste la garantie. Sur la fiche des autres utilisateurs, l'interrupteur reste modifiable. La forme exacte du verrouillage et de son explication à l'écran relève du design UX.

**Point d'attention écran** (vérifié) : l'écran de modification d'un utilisateur ne traite pas les erreurs d'enregistrement — seule la réussite est gérée (`front/src/app/features/users/user-edit/user-edit.component.ts:111-113`). Le verrouillage de l'interrupteur évite à l'administrateur d'atteindre ce refus depuis l'écran ; l'affichage général des erreurs d'enregistrement reste hors périmètre (voir §3).

**Objectif / valeur mesurable** : dès qu'un administrateur désactive un compte, plus aucune requête de ce compte n'aboutit — 0 requête authentifiée et 0 renouvellement de session acceptés après la désactivation. Prérequis bloquant avant mise en ligne.

**Existant à ne pas casser** (vérifié)
- Connexion déjà refusée pour un compte inactif, avec le message neutre « Invalid credentials. » (`backend/src/auth/auth.service.ts:51-53`).
- Un compte créé est inactif par défaut (`backend/src/users/users.service.ts:138`).
- Côté front, un 401 déclenche une tentative de renouvellement unique ; si elle échoue, l'état local est effacé et l'utilisateur est renvoyé vers `/auth/login` (`front/src/app/core/auth/auth.interceptor.ts:26-63`, `front/src/app/core/auth/auth.service.ts:52-55`). Aucune modification front n'est donc nécessaire pour la redirection.
- Les comptes actifs se connectent, naviguent et renouvellent leur session normalement.
- Déconnexion volontaire (`/auth/logout`) inchangée.

## 2. Acceptance Criteria

```gherkin
Feature: Couper la session d'un compte inactif

  Scenario: Le renouvellement de session est refusé à un compte désactivé
    Given un utilisateur connecté avec une session de renouvellement valide
    And un administrateur a désactivé son compte
    When l'utilisateur demande le renouvellement de sa session
    Then la réponse est 401
    And aucun nouveau jeton d'accès ni de renouvellement n'est délivré

  Scenario: Une requête authentifiée est refusée immédiatement après la désactivation
    Given un utilisateur connecté dont le jeton d'accès n'a pas encore expiré
    And un administrateur a désactivé son compte
    When l'utilisateur appelle une ressource protégée avec ce jeton
    Then la réponse est 401
    And aucune donnée de la ressource n'est renvoyée

  Scenario: La désactivation met fin à la session en cours
    Given un utilisateur connecté avec une session de renouvellement valide
    When un administrateur désactive son compte
    Then la session de renouvellement de cet utilisateur est révoquée
    And la modification du compte est enregistrée avec le statut « Inactif »

  Scenario: Un compte réactivé doit se reconnecter
    Given un utilisateur dont le compte a été désactivé pendant qu'il était connecté
    And un administrateur a ensuite réactivé son compte
    When l'utilisateur demande le renouvellement de sa session avec son ancien jeton de renouvellement
    Then la réponse est 401
    And l'utilisateur peut à nouveau se connecter avec ses identifiants

  Scenario: Un jeton d'accès encore valide est de nouveau accepté après une réactivation rapide
    Given un utilisateur connecté dont le jeton d'accès n'a pas encore expiré
    And un administrateur a désactivé puis réactivé son compte avant l'expiration de ce jeton
    When l'utilisateur appelle une ressource protégée avec ce jeton
    Then la requête aboutit

  Scenario: Le serveur refuse qu'un administrateur désactive son propre compte
    Given un administrateur actif et connecté
    When une demande d'enregistrement de sa propre fiche avec le statut « Inactif » est envoyée au serveur
    Then la réponse est 400 avec le message « An administrator cannot deactivate their own account. »
    And son compte reste « Actif »
    And sa session continue de fonctionner

  Scenario: Le refus d'auto-désactivation n'enregistre aucune autre modification
    Given un administrateur actif et connecté
    When une demande d'enregistrement de sa propre fiche modifie une autre information et passe le statut à « Inactif »
    Then la réponse est 400 avec le message « An administrator cannot deactivate their own account. »
    And aucune information de sa fiche n'est modifiée

  Scenario: L'interrupteur « Compte actif » est verrouillé sur sa propre fiche
    Given un administrateur connecté
    When il ouvre la modification de sa propre fiche
    Then l'interrupteur « Compte actif » est affiché à l'état actif
    And il ne peut pas le modifier

  Scenario: L'interrupteur « Compte actif » reste modifiable sur la fiche d'un autre utilisateur
    Given un administrateur connecté
    When il ouvre la modification de la fiche d'un autre utilisateur
    Then il peut activer ou désactiver l'interrupteur « Compte actif »

  Scenario: Un administrateur peut modifier sa propre fiche sans se désactiver
    Given un administrateur actif et connecté
    When il enregistre sa propre fiche en modifiant une autre information et en laissant le statut « Actif »
    Then la modification est enregistrée
    And sa session continue de fonctionner

  Scenario: Un administrateur peut désactiver le compte d'un autre administrateur
    Given deux administrateurs actifs
    When le premier désactive le compte du second
    Then la modification est enregistrée avec le statut « Inactif »
    And la session du second administrateur est révoquée

  Scenario: L'utilisateur désactivé est renvoyé vers la page de connexion
    Given un utilisateur désactivé qui navigue encore dans l'application
    When l'application appelle l'API
    Then la tentative de renouvellement de session échoue
    And l'utilisateur est renvoyé vers la page de connexion

  Scenario: La connexion d'un compte désactivé reste refusée
    Given un compte désactivé
    When son titulaire tente de se connecter avec des identifiants corrects
    Then la réponse est 401 avec le message neutre « Invalid credentials. »
    And aucune session n'est ouverte

  Scenario: Désactiver un compte sans session en cours
    Given un compte actif qui n'a aucune session ouverte
    When un administrateur désactive ce compte
    Then la modification est enregistrée avec le statut « Inactif »
    And aucune erreur n'est renvoyée

  Scenario: Modifier un compte actif sans le désactiver conserve sa session
    Given un utilisateur actif et connecté
    When un administrateur modifie une autre information de son compte sans le désactiver
    Then l'utilisateur peut toujours renouveler sa session
    And ses requêtes authentifiées aboutissent

  Scenario: Un utilisateur actif n'est pas impacté
    Given un utilisateur actif
    When il se connecte, appelle des ressources protégées puis renouvelle sa session
    Then chaque requête aboutit comme avant
    And la déconnexion volontaire fonctionne comme avant
```

Exigence de livraison (issue #4) : des tests automatisés couvrent les scénarios de refus ci-dessus.

## 3. Out of Scope

- Modification de l'interface (front) pour la redirection vers la connexion : elle existe déjà. Seul changement d'interface prévu : le verrouillage de l'interrupteur « Compte actif » sur sa propre fiche.
- Affichage général des erreurs d'enregistrement sur l'écran de modification d'un utilisateur (aujourd'hui non géré) : non traité ici.
- Effacement du cookie de renouvellement côté navigateur lorsqu'un renouvellement est refusé (idée rejetée, round 3).
- Révocation des jetons d'accès encore valides lors d'une réactivation rapide : seul l'état actuel du compte est vérifié (décision round 3).
- Protection « dernier administrateur actif » au-delà de l'interdiction de l'auto-désactivation.
- Journalisation / audit des accès refusés.
- Changement du message d'erreur de connexion existant.
- Révocation des sessions lors d'autres changements (rôle, permissions, e-mail, mot de passe).
- Fonctionnalités « mot de passe oublié » / « réinitialisation » (non implémentées, hors sujet).

## 4. Design

### UX

**Périmètre** : un seul écran modifié — modification d'un utilisateur (`/users/:userId/edit`, `front/src/app/features/users/users.routes.ts:23-29`), bloc « Compte actif » (`front/src/app/features/users/user-edit/user-edit.component.html:138-141`). La création (`/users/new`, `users.routes.ts:15-21`) utilise le même composant mais n'est jamais « sa propre fiche » : l'interrupteur y reste modifiable. La redirection d'un compte désactivé vers la connexion est un comportement existant, sans nouvelle interface (§3) ; elle est décrite ci-dessous uniquement pour la vérifier.

**Composants et motifs réutilisés (aucun nouveau motif)**
- Interrupteur PrimeNG `p-toggleswitch` associé à son libellé par `inputId`/`for` (`user-edit.component.html:139-140`).
- Contrôle désactivé (`disabled`), déjà utilisé partout pour bloquer une action (`user-edit.component.html:150`, `activity-attendance.component.html:31,40`).
- Texte d'aide neutre sous/à côté d'un champ, lié par `aria-describedby` (`front/src/app/features/auth/reset-password/reset-password.component.html:51,55-62`) et style de texte secondaire existant (`front/src/app/features/activities/activity-form/activity-form.component.html:140`).
- Texte utilisateur en français via une clé ngx-translate (`CONVENTIONS.md` § Front ; espace `USERS` existant dans `front/src/assets/i18n/fr.json`). Clé suggérée : `USERS.EDIT.ACTIVE_SELF_LOCKED` (nom final laissé à dev-front). Le reste de l'écran utilise encore des textes en dur ; on ne les migre pas ici.

**Textes**
| Usage | Texte (fr) |
|---|---|
| Libellé de l'interrupteur (inchangé) | « Compte actif » |
| Explication du verrouillage (sa propre fiche uniquement) | « Vous ne pouvez pas désactiver votre propre compte. Un autre administrateur peut le faire si nécessaire. » |

#### Flow

**F1 — L'interrupteur est verrouillé sur sa propre fiche** (scénario « …verrouillé sur sa propre fiche »)
1. L'administrateur connecté ouvre sa fiche (liste → détail → « Modifier », `user-detail.component.html:79`) ou arrive directement sur `/users/<son id>/edit`.
2. Pendant le chargement, l'état « Chargement... » existant s'affiche (`user-edit.component.html:9-14`) ; aucun interrupteur n'est visible, donc aucun basculement possible.
3. Le formulaire s'affiche. La fiche est reconnue comme la sienne (identifiant de la fiche = utilisateur connecté). L'interrupteur « Compte actif » est affiché **activé et désactivé (grisé)**, l'explication est visible juste en dessous, dans le même bloc.
4. Clic, toucher ou touche Espace sur l'interrupteur : rien ne se passe. Au clavier, Tab passe directement de « Rôle » (ou « Année de rentrée ») au lien « Annuler ».
5. Le reste du formulaire est modifiable normalement.

**F2 — Modifier sa propre fiche sans se désactiver** (scénario « …modifier sa propre fiche sans se désactiver »)
1. Depuis F1, l'administrateur modifie une autre information (ex. Nom) et active « Enregistrer ».
2. Le bouton passe en état désactivé pendant l'envoi (existant, `user-edit.component.html:150`).
3. Succès → redirection vers sa fiche de détail (existant, `user-edit.component.ts:111-113`), qui affiche le badge « Actif » (`user-detail.component.html:30-31`). Sa session continue.
4. Contrainte pour l'architecte / dev-front : le statut « Actif » doit continuer d'être transmis à l'enregistrement même si l'interrupteur est verrouillé (aujourd'hui le formulaire est lu avec `getRawValue()`, `user-edit.component.ts:107`).

**F3 — Fiche d'un autre utilisateur** (scénarios « …reste modifiable sur la fiche d'un autre utilisateur », « …désactiver le compte d'un autre administrateur », « Désactiver un compte sans session en cours », « Modifier un compte actif sans le désactiver… »)
1. L'administrateur ouvre la fiche d'un autre utilisateur (quel que soit son rôle, y compris administrateur).
2. L'interrupteur est actif et focalisable, **aucune explication affichée** — écran identique à aujourd'hui.
3. Il bascule l'interrupteur (clic ou Espace), puis « Enregistrer ».
4. Succès → détail de l'utilisateur, badge « Actif » / « Inactif » selon le choix (`user-detail.component.html:30-31`). La coupure de session de la personne désactivée est invisible pour l'administrateur.

**F4 — Création d'un utilisateur** (non-régression) : `/users/new` → interrupteur modifiable, sans explication, comme aujourd'hui.

**F5 — Utilisateur désactivé renvoyé vers la connexion** (scénario « L'utilisateur désactivé est renvoyé vers la page de connexion » — existant, aucune modification)
1. L'utilisateur désactivé agit dans l'application (navigation, chargement de données, envoi d'un formulaire).
2. L'appel API reçoit 401 → une tentative unique de renouvellement → refus → l'état local est effacé et l'utilisateur arrive sur `/auth/login` (`front/src/app/core/auth/auth.interceptor.ts:26-63`, `front/src/app/core/auth/auth.service.ts:52-55`).
3. Aucun message n'explique la redirection et toute saisie en cours est perdue : comportement accepté par §3 (pas de nouvelle interface).
4. S'il tente de se reconnecter : refus côté serveur avec le message neutre existant (scénario « La connexion d'un compte désactivé reste refusée ») ; l'écran de connexion n'est pas modifié.

**F6 — Refus serveur 400 d'auto-désactivation** : inatteignable depuis l'écran grâce au verrouillage (seul un appel direct à l'API peut le provoquer). L'affichage des erreurs d'enregistrement reste hors périmètre (§3) : aucun état d'erreur n'est conçu pour ce cas.

#### Layout

**Sa propre fiche (`/users/<son id>/edit`)**
```
[En-tête de page]  Utilisateurs / <Prénom Nom>
┌───────────────────────────────────────────────────────────────┐
│ Prénom [__________]            Nom [__________]               │
│ Adresse mail [______________________________________]          │
│ NISS [__________]              Rôle [Administrateur ▾]        │
│ Année de rentrée [____]                                       │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ (●━━) Compte actif                     ← activé, grisé    │ │
│ │ Vous ne pouvez pas désactiver votre propre compte.        │ │
│ │ Un autre administrateur peut le faire si nécessaire.      │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                       [Annuler] [Enregistrer] │
└───────────────────────────────────────────────────────────────┘
```
- L'explication est placée dans le bloc « Compte actif » existant, sous la ligne interrupteur + libellé, alignée sur le début du bloc. Elle est toujours visible (pas d'infobulle, pas d'icône seule).

**Fiche d'un autre utilisateur / création** — inchangé :
```
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ (●━━) Compte actif                     ← modifiable       │ │
│ └───────────────────────────────────────────────────────────┘ │
```

#### States

| État | Sa propre fiche | Autre fiche / création |
|---|---|---|
| Chargement | « Chargement... » existant ; ni formulaire ni interrupteur. | Idem (création : pas de chargement). |
| Prêt | Interrupteur activé + verrouillé + explication. | Interrupteur modifiable, sans explication. |
| Enregistrement en cours | Bouton « Enregistrer » désactivé (existant) ; interrupteur reste verrouillé. | Bouton désactivé (existant) ; interrupteur inchangé. |
| Succès | Redirection vers le détail, badge « Actif ». | Redirection vers le détail, badge selon le choix. |
| Erreur d'enregistrement | Non traité (hors périmètre §3) ; le 400 d'auto-désactivation est inatteignable depuis l'écran. | Non traité (hors périmètre §3). |
| Vide | Sans objet (fiche toujours remplie). | Sans objet. |
| Session coupée (compte désactivé) | Sans objet (un admin ne peut pas se désactiver). | F5 : redirection vers `/auth/login`, existante. |

Cas limite : si la fiche chargée indiquait « Inactif » (normalement impossible, un compte inactif ne passe pas l'authentification), l'interrupteur reflète la valeur reçue et reste verrouillé ; le serveur reste la garantie.

#### Accessibility

- **Rôle / nom / état** : l'interrupteur garde son rôle `switch` et son nom accessible « Compte actif » via `label for="active"` (`user-edit.component.html:139-140`). Sur sa propre fiche il est exposé désactivé (attribut `disabled` natif → « indisponible / grisé » pour les lecteurs d'écran) et coché (« activé »).
- **Explication liée** : le texte d'explication porte un `id` et est référencé par `aria-describedby` sur l'élément de saisie interne de l'interrupteur (celui qui porte `id="active"`) (motif de `reset-password.component.html:51`). Sur les autres fiches, ni texte ni `aria-describedby`.
- **Lecture attendue (NVDA/JAWS, mode lecture)** : « Compte actif, interrupteur, activé, indisponible. Vous ne pouvez pas désactiver votre propre compte. Un autre administrateur peut le faire si nécessaire. » L'explication étant du texte statique visible juste après l'interrupteur, elle est aussi lue dans le flux normal.
- **Clavier / ordre de focus** — sa propre fiche : Prénom → Nom → Adresse mail → NISS → Rôle → (Année de rentrée) → Annuler → Enregistrer ; l'interrupteur verrouillé sort de l'ordre de tabulation (comportement standard d'un contrôle désactivé, cohérent avec les autres boutons désactivés de l'application). Autres fiches : ordre actuel, interrupteur inclus, basculement à l'Espace.
- **Pas de rôle d'alerte** : l'explication est permanente, pas un événement ; pas de `role="alert"` ni `aria-live`.
- **Ne pas dépendre de la couleur** : le verrouillage se comprend par l'explication écrite, pas seulement par l'aspect grisé ; la position de l'interrupteur (activé) reste visible.
- **Contraste** : l'explication réutilise le style de texte secondaire existant et doit atteindre 4.5:1 sur le fond du bloc (WCAG 1.4.3). Le contrôle désactivé est exempté, mais son état activé doit rester perceptible.
- **Pas d'infobulle seule** : une infobulle au survol serait inaccessible au toucher et au clavier (contrôle désactivé non focalisable) — rejetée au profit du texte visible.
- **F5 (existant)** : la redirection vers `/auth/login` déplace la page sans message ; pas de nouvelle exigence d'accessibilité dans cette US (§3).

### UI
_(skipped — ui-designer disabled in WORKFLOW.md)_

## 5. Tech Design

### Composants touchés
| Couche | Fichier | Changement |
|---|---|---|
| Back · auth | `backend/src/auth/strategies/jwt.strategy.ts:25-28` | `validate` rejette un utilisateur absent **ou inactif** (→ 401). |
| Back · auth | `backend/src/auth/auth.service.ts:77-127` (lookup `:95-102`, contrôles `:104-112`) | `refresh` rejette un compte inactif (401) et purge sa session. |
| Back · users | `backend/src/users/users.service.ts:43-52` (`clearRefreshTokenSession`), `:31-41` (`setRefreshTokenSession`), `:96-127` (`updateUser`) | Garde d'auto-désactivation (400, refus en bloc) ; révocation de session quand le compte enregistré est inactif ; écriture de session conditionnée à `active = true`. |
| Back · users | `backend/src/users/users.controller.ts:67-79` | Transmet l'identité de l'appelant (`req.user.id`) au service. |
| Front · users | `front/src/app/features/users/user-edit/user-edit.component.ts` (`userId` `:52`, `ngOnInit` `:83-92`, `getRawValue` `:102`, `loadUser` `:114-128`) + `.html:138-141` | Verrouillage de l'interrupteur « Compte actif » sur sa propre fiche + texte d'aide lié. |
| Front · i18n | `front/src/assets/i18n/fr.json:47-51` (espace `USERS`) | Nouvelle clé `USERS.EDIT.ACTIVE_SELF_LOCKED`. |

Inchangés (vérifiés) : `auth.controller.ts` (le 401 de `refresh` remonte tel quel, le cookie n'est pas effacé — D5), `login` (`auth.service.ts:51-53`), `addUser` (`users.service.ts:138`, inactif par défaut), interceptor/guard front (`auth.interceptor.ts:26-63`, `auth.guard.ts:14-26`). Aucune migration, aucune dépendance, aucune variable d'environnement.

> Note : les références §1/§4 `user-edit.component.ts:107` et `:111-113` correspondent dans le code actuel à `:102` (`getRawValue`) et `:106-108` (subscribe succès).

### Contrats

#### C1 — Requête authentifiée (JWT) — `JwtStrategy.validate`
```ts
// backend/src/auth/strategies/jwt.strategy.ts
async validate(payload: JwtPayload): Promise<User | null> {
  const user = await this.usersService.findById(payload.sub);
  if (!user || !user.active) return null; // Passport → JwtAuthGuard → 401 Unauthorized
  return user;
}
```
- Compte inactif ou supprimé → **401** (réponse Nest standard `{"statusCode":401,"message":"Unauthorized"}`), le handler n'est jamais exécuté → aucune donnée renvoyée.
- Seul l'état **courant** est lu (D3) : un jeton d'accès non expiré redevient valable après réactivation (scénario « réactivation rapide »).
- Aucune requête SQL supplémentaire : `findById` est déjà appelé à chaque requête.

#### C2 — Renouvellement — `AuthService.refresh` (`POST /api/auth/refresh`)
Ordre des contrôles après `findById` (`auth.service.ts:95`) :
1. `!user` ou session absente → 401 `'Refresh session not found.'` (inchangé).
2. **Nouveau** : `!user.active` → `await usersService.clearRefreshTokenSession(user.id)` puis 401 `'Refresh session expired or invalid.'` (message neutre existant, ne révèle pas l'état du compte). Couvre aussi les sessions héritées de comptes désactivés avant le déploiement.
3. expiration / hash / tokenId (inchangé, `:104-112`).
4. Émission + `setRefreshTokenSession` (inchangé, `:114-120`).
- Aucun jeton ni cookie émis en cas de refus (l'exception est levée avant `setRefreshCookie`, `auth.controller.ts:52-53`).

#### C3 — Écriture de session conditionnelle — `UsersService.setRefreshTokenSession`
```ts
await this.usersRepository.update(
  { id: userId, active: true },               // ← ajout de `active: true`
  { refreshTokenHash, refreshTokenId, refreshTokenExpiresAt },
);
```
Signature inchangée. Ferme la course « refresh lit `active=true` → admin désactive et purge → refresh réécrit une session » : l'écriture ne touche aucune ligne si le compte vient d'être désactivé. Sans effet pour `login` (déjà filtré sur `active`, `auth.service.ts:51`).

#### C4 — Modification d'un utilisateur — `PATCH /api/users/:userId`
Contrôleur (motif existant `activities.controller.ts:39-41`) :
```ts
async updateUser(
  @Param('userId') userId: string,
  @Body() payload: UserPayloadDto,
  @Request() req: { user: User },
): Promise<UpdateUserResponseDto> {
  return this.usersService.updateUser(userId, payload as unknown as Record<string, unknown>, req.user.id);
}
```
+ `@ApiBadRequestResponse({ description: 'An administrator cannot deactivate their own account.' })` (Swagger).

Service :
```ts
async updateUser(userId: string, payload: Record<string, unknown>, actorId: string): Promise<UserResponse>
```
1. **Premier contrôle, avant toute lecture/mutation** : `if (userId === actorId && payload.active === false) throw new BadRequestException('An administrator cannot deactivate their own account.');` → **400**, corps `{"statusCode":400,"message":"An administrator cannot deactivate their own account.","error":"Bad Request"}`. Rien n'est chargé ni enregistré (D7, refus en bloc). Convention : `activities.service.ts:136`.
   - « Administrateur » = tout appelant passant `@Permissions(USER_MANAGE)` (`users.controller.ts:70`) ; la règle ne dépend pas du rôle.
   - `active: true` ou `active` absent sur sa propre fiche → enregistrement normal, session conservée.
2. Application du payload (inchangé, `:105-124`).
3. **Révocation** : après application, `if (!user.active) { user.refreshTokenHash = null; user.refreshTokenId = null; user.refreshTokenExpiresAt = null; }` → persisté par le **même** `save` (`:126`) : une seule écriture, statut et révocation atomiques. Compte sans session → no-op, pas d'erreur. Compte resté actif → champs de session intacts.
4. Réponse 200 inchangée (`toResponseDto`, aucun champ de session exposé).

Aucun autre appelant de `updateUser` (vérifié : seul `users.controller.ts:75`).

#### C5 — Front : détermination de « sa propre fiche »
Source existante : `AuthService.currentUser` (`front/src/app/core/auth/auth.service.ts:14`), alimentée par `GET /auth/me` dans `authGuard` (`auth.guard.ts:14-15`) posé sur la route parente du shell (`app.routes.ts:20-23`) → toujours renseignée avant l'instanciation de `UserEditComponent`. `UserDto.id` existe (`core/auth/user.model.ts:5`) et `/auth/me` le renvoie (`backend/src/auth/auth.service.ts:207-210`).

```ts
// user-edit.component.ts
protected readonly isOwnRecord = computed(
  () => this.isEditMode() && this.userId() === this.authService.currentUser()?.id,
);
protected readonly activeSwitchPt = computed(() =>
  this.isOwnRecord() ? { input: { 'aria-describedby': 'active-self-locked-help' } } : undefined,
);
// ngOnInit, après le contrôle admin et avant loadUser() :
if (this.isOwnRecord()) this.form.controls.active.disable({ emitEvent: false });
```
- Désactivation **par l'API reactive forms** (`disable()`), pas d'attribut `[disabled]` dans le template (conflit `formControl`).
- `form.patchValue(user)` (`user-edit-form.service.ts:40-42`) met à jour un contrôle désactivé → l'interrupteur reflète la valeur serveur (cas limite §4).
- `getRawValue()` (`:102`) inclut les contrôles désactivés → `active: true` est bien envoyé (contrainte F2) ; ne pas passer à `form.value`.
- Création (`/users/new`) : `isEditMode()` faux → jamais verrouillé (F4).

Template (`user-edit.component.html:138-141`) :
```html
<div class="flex flex-col gap-2 bg-slate-50 p-4">
  <div class="flex items-center gap-3">
    <p-toggleswitch inputId="active" [formControl]="form.controls.active" [pt]="activeSwitchPt()" />
    <label for="active" class="text-sm font-medium text-slate-700"> Compte actif </label>
  </div>
  @if (isOwnRecord()) {
    <p id="active-self-locked-help" class="text-sm text-slate-600">
      {{ 'USERS.EDIT.ACTIVE_SELF_LOCKED' | translate }}
    </p>
  }
</div>
```
- `aria-describedby` posé sur l'`<input>` interne via le pass-through PrimeNG 21 (`pt.input`, `BaseComponent.pt` — `front/node_modules/primeng/types/primeng-basecomponent.d.ts:51`) ; dev-front vérifie dans le DOM rendu que l'attribut est sur l'élément `id="active"`.
- `TranslatePipe` à ajouter aux `imports` du composant (motif `activity-form.component.ts:13,41`).
- `fr.json` : `"USERS": { …, "EDIT": { "ACTIVE_SELF_LOCKED": "Vous ne pouvez pas désactiver votre propre compte. Un autre administrateur peut le faire si nécessaire." } }`.
- `text-slate-600` sur `bg-slate-50` ≈ 7:1 (WCAG 1.4.3 OK).

### Flux
```
Admin A désactive B : PATCH /users/B {active:false}
  └─ UsersService.updateUser(B, payload, A) → A≠B → apply → !active → purge session → save (1 UPDATE) → 200
B navigue : GET /api/... Bearer(access B)
  └─ JwtStrategy.validate → B inactif → null → 401
     └─ front interceptor → POST /auth/refresh (cookie B)
          └─ AuthService.refresh → session absente → 401  (ou B inactif → purge → 401)
               └─ logoutLocal → /auth/login  (existant)
B réactivé plus tard : ancien refresh → session purgée → 401 ; login → OK
Admin A sur sa fiche : interrupteur verrouillé ; PATCH /users/A {active:false} direct → 400, rien enregistré
```

### Non-fonctionnel
- **Sécurité** : messages neutres (401 `Unauthorized` / `'Refresh session expired or invalid.'`) — pas d'oracle sur l'état du compte. Le blocage serveur (C4) est la garantie ; le verrouillage UI n'est qu'un confort. Le cookie n'est pas effacé au refus (D5) : sans effet, la session serveur étant purgée.
- **Performance** : 0 requête SQL ajoutée sur le chemin JWT et sur `updateUser` (même `save`) ; +1 `UPDATE` seulement quand un compte inactif tente un refresh.
- **Observabilité** : pas de journalisation nouvelle (audit hors périmètre §3) ; les 400/401 passent déjà par `AllExceptionsFilter` avec `userId` quand disponible (`backend/src/logging/all-exceptions.filter.ts:55`).
- **Compatibilité** : le contrat `PATCH /users/:userId` gagne un cas 400 ; aucun champ ajouté/supprimé. Signature interne `updateUser` changée (3ᵉ paramètre obligatoire) — un seul appelant.

### Stratégie de test
Tests unitaires avec dépendances mockées (Jest `useValue` pour `UsersService`, `Repository<User>`, `JwtService`, `ConfigService`, `RolesService`) — pas de base MySQL (l'e2e existant `backend/test/app.e2e-spec.ts` exige `AppModule` + MySQL, cf. `TESTING.md`). Choix limité à cette US, ne fixe pas de convention globale.

| Spec | Scénarios §2 couverts |
|---|---|
| `backend/src/auth/strategies/jwt.strategy.spec.ts` | inactif → `null` ; actif → user ; absent → `null` ; réactivation rapide (actif) → user |
| `backend/src/auth/auth.service.spec.ts` | refresh compte inactif → 401 + `clearRefreshTokenSession` appelé + `setRefreshTokenSession` non appelé ; réactivé avec session purgée → 401 ; actif → nouveaux jetons ; login inactif → 401 `'Invalid credentials.'` ; logout inchangé |
| `backend/src/users/users.service.spec.ts` | auto-désactivation → 400 message exact, `findOne`/`save` non appelés (y compris avec d'autres champs modifiés) ; propre fiche `active:true` + autre champ → `save` ; désactivation d'un autre (admin ou non) → `save` avec `active:false` et 3 champs session `null` ; sans session → pas d'erreur ; modification sans désactivation → champs session conservés ; `setRefreshTokenSession` → `update` filtré sur `{ id, active: true }` |
| `backend/src/users/users.controller.spec.ts` | `updateUser` transmet `req.user.id` comme `actorId` |
| `front/src/app/features/users/user-edit/user-edit.component.spec.ts` (Vitest) | propre fiche → contrôle `active` désactivé, valeur `true`, texte d'aide présent, `aria-describedby="active-self-locked-help"` sur `#active`, submit envoie `active: true` ; autre fiche → contrôle actif, pas de texte ni `aria-describedby` ; création → contrôle actif |

Le scénario « renvoyé vers la page de connexion » repose sur le comportement front existant (non modifié) : pas de nouveau test exigé. Premier spec front : `npx ng test --watch=false` cesse d'échouer en « No tests found ».

### Risques
- **R1 — Course refresh/désactivation** : neutralisée par C3 (écriture conditionnelle) ; résiduel : un jeton d'accès émis dans cette fenêtre est rejeté par C1 tant que le compte est inactif, et redevient valable s'il est réactivé avant expiration — conforme à D3.
- **R2 — Pass-through PrimeNG** (`pt.input`) : API de PrimeNG 21 ; si l'attribut n'atterrit pas sur l'input, dev-front le signale (pas de contournement DOM manuel sans accord).
- **R3 — Pas de test d'intégration du guard** (DB requise) : le passage `validate → null → 401` relève du comportement standard `@nestjs/passport` ; couvert unitairement au niveau de la stratégie.
- **R4 — Hors périmètre volontaire** : un admin peut toujours se retirer le rôle admin sur sa propre fiche (protection « dernier admin » exclue, §3).

### ADR
Aucun : vérification d'état par requête déjà en place (lookup DB dans `JwtStrategy`), pas de nouveau mécanisme transverse, pas de dépendance.

### Work Breakdown
| Task | Agent | Owns (files/globs) | After | Done when |
|------|-------|--------------------|-------|-----------|
| T1 | dev-back | `backend/src/auth/strategies/jwt.strategy.ts`, `backend/src/auth/auth.service.ts`, `backend/src/users/users.service.ts`, `backend/src/users/users.controller.ts` | — | C1–C4 implémentés tels que spécifiés ; `npm run build` + eslint (check) OK |
| T2 | dev-front | `front/src/app/features/users/user-edit/user-edit.component.ts`, `front/src/app/features/users/user-edit/user-edit.component.html`, `front/src/assets/i18n/fr.json` | — | C5 implémenté ; propre fiche → interrupteur verrouillé + aide liée ; autre fiche / création inchangées ; `npm run build` OK |
| T3 | tester | `backend/src/auth/strategies/jwt.strategy.spec.ts`, `backend/src/auth/auth.service.spec.ts`, `backend/src/users/users.service.spec.ts`, `backend/src/users/users.controller.spec.ts`, `front/src/app/features/users/user-edit/user-edit.component.spec.ts` | — (écrit en parallèle sur les contrats C1–C5 ; exécution finale après T1, T2) | une assertion par scénario du tableau « Stratégie de test » ; `npx jest` et `npx ng test --watch=false` verts |

## 6. Implementation Notes
_(pending)_

## 7. Test Report
_(pending)_

## 8. Review Findings
_(pending)_

## 9. Decisions
- D1 · 2026-11-24 · Branche de base — chosen: restart-project (base + cible de PR ; WORKFLOW.md inchangé) · options: restart-project / develop / main · asked by: factory · decided by: user
- D2 · 2026-11-24 · Priorité du label P0 — chosen: [A] high · options: A high / B medium · asked by: business-analyst · decided by: user
- D3 · 2026-11-24 · Réactivation rapide — chosen: [A] accepté, seul l'état actif courant est vérifié · options: A vérifier l'état courant / B rejeter les jetons émis avant désactivation · asked by: business-analyst · decided by: user
- D4 · 2026-11-24 · Idée : bloquer l'auto-désactivation d'un administrateur — chosen: [A] accepté dans cette US · options: A accepter / B US séparée · asked by: business-analyst · decided by: user
- D5 · 2026-11-24 · Idée : effacer le cookie refresh_token au refus — chosen: [B] rejeté · options: A accepter / B rejeter · asked by: business-analyst · decided by: user
- D6 · 2026-11-24 · Erreur d'auto-désactivation — chosen: [A] 400 « An administrator cannot deactivate their own account. » · options: A 400 / B 403 / C autre · asked by: business-analyst · decided by: user
- D7 · 2026-11-24 · Enregistrement partiel — chosen: [A] tout l'enregistrement est refusé · options: A refus en bloc / B enregistrer les autres champs · asked by: business-analyst · decided by: user
- D8 · 2026-11-24 · Affichage côté admin — chosen: [C] interrupteur « Compte actif » verrouillé sur sa propre fiche + blocage serveur (track full) · options: A serveur seul / B message d'erreur / C interrupteur verrouillé · asked by: business-analyst · decided by: user
- D9 · 2026-11-24 · Plan gate — chosen: Approve plan (track full ; team ux-designer, dev-back, dev-front, tester) · options: Approve / Change track or team / Revise spec / Revise design or architecture · asked by: factory · decided by: user

## 10. Changelog
- 2026-11-24 — new-us: skeleton created
- 2026-11-24 — business-analyst: §1–3 finalisés (round 4 : 400 explicite, refus en bloc, interrupteur verrouillé sur sa propre fiche)
- 2026-11-24 — factory: draft → spec (track proposé : full ; team : ux-designer, dev-back, dev-front, tester)
- 2026-11-24 — ux-designer: §4 UX rédigé (interrupteur verrouillé sur sa propre fiche + explication aria-describedby)
- 2026-11-24 — factory: spec → designed
- 2026-11-24 — architect: §5 Tech Design rédigé (contrats C1–C5, 3 tâches parallèles, aucun ADR)
- 2026-11-24 — factory: designed → arch
- 2026-11-24 — factory: plan gate approuvé (D9) — track full, team confirmée
