import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AppDataSource } from './datasource';

dotenv.config();

const ROLES = [
  {
    id: 'candidate',
    label: 'Candidat',
    permissions: ['activity:read'],
  },
  {
    id: 'member',
    label: 'Membre',
    permissions: [
      'activity:read',
      'registration:create',
      'registration:read',
      'registration:delete',
    ],
  },
  {
    id: 'encoder',
    label: 'Encodeur',
    permissions: [
      'activity:read',
      'activity:create',
      'activity:edit',
      'activity:delete',
      'activity:publish',
      'registration:create',
      'registration:read',
      'registration:delete',
      'attendance:validate',
    ],
  },
  {
    id: 'admin',
    label: 'Administrateur',
    permissions: [
      'activity:read',
      'activity:create',
      'activity:edit',
      'activity:delete',
      'activity:publish',
      'registration:create',
      'registration:read',
      'registration:delete',
      'attendance:validate',
      'user:manage',
    ],
  },
];

const USERS = [
  { email: 'admin@intranet.be', password: 'admin123', firstName: 'Sophie', lastName: 'Dumont', roleId: 'admin', extraPermissions: [], deniedPermissions: [], active: true, niss: '12345678901', entryYear: 2010 },
  { email: 'encoder@intranet.be', password: 'encoder123', firstName: 'Marc', lastName: 'Lefevreeee', roleId: 'encoder', extraPermissions: [], deniedPermissions: [], active: true, niss: '12345678902', entryYear: 2012 },
  { email: 'member@intranet.be', password: 'member123', firstName: 'Julie', lastName: 'Martin', roleId: 'member', extraPermissions: [], deniedPermissions: [], active: true, niss: '12345678903', entryYear: 2015 },
  { email: 'candidate@intranet.be', password: 'candidate123', firstName: 'Thomas', lastName: 'Bernard', roleId: 'candidate', extraPermissions: [], deniedPermissions: [], active: true, niss: '12345678904', entryYear: null },
  { email: 'julie.special@intranet.be', password: 'special123', firstName: 'Julie', lastName: 'Spéciale', roleId: 'member', extraPermissions: ['activity:create'], deniedPermissions: [], active: true, niss: '12345678905', entryYear: 2018 },
  { email: 'encoder.limite@intranet.be', password: 'limite123', firstName: 'Paul', lastName: 'Limité', roleId: 'encoder', extraPermissions: [], deniedPermissions: ['activity:delete', 'activity:publish'], active: true, niss: '12345678906', entryYear: 2011 },
  { email: 'jpd@gmail.com', password: 'changeMe123!', firstName: 'Jean Paul', lastName: 'Doe', roleId: 'member', extraPermissions: [], deniedPermissions: [], active: true, niss: '12345678910', entryYear: 2020 },
];

const ACTIVITIES = [
  { title: 'Voeux de la Procession', description: "Messieurs, chers Compagnons,\nEmmanuel Godefroy, Président de l'ASBL Procession du Car d'Or ainsi que les membres de l'Organe d'Administration ont le plaisir de vous convier ainsi que vos proches aux Vœux de la Procession qui se dérouleront le 22 janvier à 19H00 au Théâtre du Manège à Mons.\nLe port de la Chemise de la Compagnie est souhaité", datetime: new Date('2026-01-22T18:00:00.000Z'), points: 0, location: "Théâtre du Manège", status: 'published', requiresAttendanceValidation: false, requiresRegistration: false },
  { title: 'Soirée des Dragon Boys', description: "Messieurs, chers Compagnons,\nNous avons reçu une invitation bien sympathique d'un groupe de Montois.", datetime: new Date('2026-01-23T18:00:00.000Z'), points: 0, location: 'Stade Charles-Tondreau', status: 'published', requiresAttendanceValidation: false, requiresRegistration: false },
  { title: "Apéro des Acteurs", description: "Messieurs, chers Compagnons,\nCe 25 janvier 2026, à partir de 11h00, les acteurs vous invitent à un apéro.", datetime: new Date('2026-01-25T10:00:00.000Z'), points: 0, location: "O'quai", status: 'published', requiresAttendanceValidation: false, requiresRegistration: false },
  { title: "Assemblée générale ordinaire", description: "Messieurs,\nChers Compagnons,\nNous vous invitons à participer à la première Assemblée générale de la Compagnie.", datetime: new Date('2026-01-30T19:00:00.000Z'), points: 3, location: 'Foyer Sainte-Waudru - Mons', status: 'draft', requiresAttendanceValidation: true, requiresRegistration: false },
  { title: 'Frameries fête sa Patronne - Procession de Frameries', description: "La Compagnie Montoise des Hallebardiers est invitée à participer à la Procession de Frameries le 14 mai prochain.", datetime: new Date('2026-05-14T05:00:00.000Z'), points: 3, location: 'Foyer Sainte-Waudru - Mons', status: 'published', requiresAttendanceValidation: true, requiresRegistration: true },
  { title: 'Messe de Pâques à la gériatrie', description: "Le 28 mars prochain se déroulera la Messe de Pâques à la gériatrie.", datetime: new Date('2026-03-28T13:30:00.000Z'), points: 1, location: 'Chemin de la Cure d\'Air, Mons', status: 'published', requiresAttendanceValidation: true, requiresRegistration: true },
];

async function seed(dataSource: DataSource) {
  const roleRepo = dataSource.getRepository('roles');
  const userRepo = dataSource.getRepository('users');
  const activityRepo = dataSource.getRepository('activities');

  console.log('Seeding roles...');
  for (const role of ROLES) {
    const exists = await roleRepo.findOneBy({ id: role.id });
    if (!exists) {
      await roleRepo.save(roleRepo.create(role));
      console.log(`  + role: ${role.id}`);
    }
  }

  console.log('Seeding users...');
  for (const user of USERS) {
    const exists = await userRepo.findOneBy({ email: user.email });
    if (!exists) {
      const hashed = await bcrypt.hash(user.password, 10);
      const role = await roleRepo.findOneBy({ id: user.roleId });
      await userRepo.save(
        userRepo.create({
          email: user.email,
          password: hashed,
          firstName: user.firstName,
          lastName: user.lastName,
          role,
          extraPermissions: user.extraPermissions,
          deniedPermissions: user.deniedPermissions,
          active: user.active,
          niss: user.niss,
          entryYear: user.entryYear,
        }),
      );
      console.log(`  + user: ${user.email}`);
    }
  }

  console.log('Seeding activities...');
  for (const activity of ACTIVITIES) {
    const exists = await activityRepo.findOneBy({ title: activity.title });
    if (!exists) {
      await activityRepo.save(activityRepo.create(activity));
      console.log(`  + activity: ${activity.title}`);
    }
  }

  console.log('Seed complete.');
}

AppDataSource.initialize()
  .then(async (dataSource) => {
    await seed(dataSource);
    await dataSource.destroy();
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
