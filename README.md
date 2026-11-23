# cmdh-intranet

Intranet de la **Compagnie Montoise des Hallebardiers** (CMDH).

## 1. Contexte

La CMDH est une organisation qui participe à divers évènements (prestations). Elle compte une centaine de membres.
Son évènement principal, et le plus important, est la **Ducasse de Mons**.

Aujourd'hui, l'objectif est de centraliser dans un intranet :
- l'agenda des prestations de la compagnie ;
- les inscriptions des membres à ces prestations ;
- les présences réelles et les points qui en découlent.

## 2. Objectif

Encoder les prestations auxquelles la compagnie participe, permettre aux membres de s'y inscrire, valider leur présence et comptabiliser des points.

**Enjeu principal** : chaque année, les **40 membres ayant le plus de points** peuvent porter le costume à la Ducasse de Mons. Le comptage des points doit donc être fiable, traçable et incontestable.

## 3. Acteurs

| Acteur | Description | Droits |
|--------|-------------|--------|
| **Candidat** | Personne qui aspire à entrer dans la compagnie | Se connecter, mot de passe oublié / réinitialisation, consulter les activités, modifier son profil. Ne s'inscrit pas aux activités. |
| **Membre** | Membre de la compagnie (~100) | Droits du candidat + s'inscrire / se désinscrire aux activités, consulter ses points. |
| **Membre du CA** (admin) | Conseil d'administration, prend les décisions | Droits du membre + CRUD activités, CRUD membres, inscription d'un membre par un tiers, validation des présences. |
| **Président** | Préside le CA | Mêmes droits qu'un membre du CA. |

Il n'y a pas d'auto-inscription : **seul un admin (CA) crée les comptes**.

## 4. Fonctionnalités

### 4.1 Authentification
- Connexion (login).
- Mot de passe oublié : envoi d'un e-mail avec lien de réinitialisation.
- Réinitialisation du mot de passe via ce lien.

### 4.2 Profil
- Champs modifiables par l'utilisateur : **e-mail, téléphone, NISS**.
- **Année d'entrée** : non modifiable par l'utilisateur, encodée par l'admin qui crée le compte.

### 4.3 Gestion des membres (CA)
- Créer, consulter, modifier, supprimer un membre ou un candidat.
- Attribuer le rôle (candidat, membre, CA, président) et l'année d'entrée.

### 4.4 Activités (CA)
- Créer, consulter, modifier, supprimer une activité.
- Une activité a notamment : titre, description, date/heure, lieu, **nombre de points**.
- Deux options indépendantes par activité :
  - **Inscription requise** : sinon, l'activité est présente uniquement à titre de rappel (pas d'inscription possible).
  - **Validation des présences requise** : sinon, aucune présence n'est validée (donc aucun point attribué).
- Une activité **passée** (date/heure atteinte) ne peut plus être modifiée ni supprimée.
- Tous les utilisateurs connectés (candidats inclus) consultent les activités.

### 4.5 Inscriptions
- Uniquement pour les activités avec inscription requise.
- Un membre s'inscrit ou se désinscrit lui-même **jusqu'à la date/heure de l'évènement** (date limite = date de l'évènement).
- Un admin peut inscrire / désinscrire un membre.
- Pas de limite de places ni de liste d'attente.

### 4.6 Validation des présences (CA)
- Uniquement pour les activités avec validation des présences requise.
- Après l'activité, un admin indique pour chaque membre s'il était présent.
- Un membre **non inscrit** peut aussi être validé présent.
- La validation est tracée (qui a validé, quand).

### 4.7 Comptabilisation des points
- Chaque activité vaut un **nombre fixe de points**, attribué à chaque membre dont la présence est validée.
- Comptage **par année civile** (remise à zéro au 1er janvier).
- Classement annuel des membres par points ; les 40 premiers sont éligibles au costume de la Ducasse.
- **Égalité au 40e rang** : priorité au membre le plus ancien (année d'entrée la plus petite).

## 5. Hors périmètre

- Notifications e-mail autres que « mot de passe oublié » (nouvelle activité, rappels…).
- Auto-inscription des utilisateurs.
- Limite de places, liste d'attente.
- Points variables par membre (rôle tenu, durée…).

## 6. Points d'attention pour les choix techniques

- **Données personnelles (RGPD)** : le NISS est un identifiant national sensible → chiffrement au repos, accès restreint, jamais dans les logs, base légale et durée de conservation à définir.
- **Traçabilité des points** : l'attribution du costume dépend du classement → historiser qui a validé quelle présence. Une activité passée étant figée, ses points le sont aussi.
- **Égalité au 40e rang** : départage par année d'entrée ; si l'égalité persiste (même année), règle à définir par le CA.
- **Rôles et permissions** : modèle à rôles (candidat, membre, CA, président) ; le président a aujourd'hui les mêmes droits que le CA, mais le modèle doit permettre de les différencier.
- **Volume** : ~100 utilisateurs, quelques dizaines d'activités par an → pas de contrainte de charge particulière.
- **E-mail transactionnel** : nécessaire uniquement pour la réinitialisation de mot de passe.
- **Langue** : interface en français.
- **Usage mobile** : inscriptions et consultation probablement faites depuis un smartphone → interface responsive.

Architecture et stack actuelles : [docs/codebase/](docs/codebase/).
