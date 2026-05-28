import { Injectable } from '@nestjs/common';
import { ActivityDto } from './activity.dto';

@Injectable()
export class ActivitiesService {
  findAll(): ActivityDto[] {
    // Données mockées extraites de db.json
    return [
      {
        id: 'a1',
        title: "Voeux de la Procession",
        description: "Messieurs, chers Compagnons,\nEmmanuel Godefroy, Président de l'ASBL Procession du Car d'Or ainsi que les membres de l'Organe d'Administration ont le plaisir de vous convier ainsi que vos proches aux Vœux de la Procession qui se dérouleront le 22 janvier à 19H00 au Théâtre du Manège à Mons.\nLe port de la Chemise de la Compagnie est souhaité",
        datetime: new Date('2026-01-22T18:00:00.000Z'),
        points: 0,
        location: "Théâtre du Manège",
        status: "published",
        createdBy: "u2",
        createdAt: new Date('2025-08-01T10:00:00Z'),
        isRegistered: false,
        registeredAt: null,
        requiresAttendanceValidation: false,
        requiresRegistration: false
      },
      {
        id: 'a2',
        title: 'Soirée des Dragon Boys',
        description:
          "Messieurs, chers Compagnons,\nNous avons reçu une invitation bien sympathique d'un groupe de Montois dont la renommée grandit, Doudou après Doudou, Les Dragon Boys\nNous sommes conviés à leur soirée annuelle qui se tiendra le 23 janvier 2026 au Stade Tondreau, Avenue du Tir à Mons.\nBloquez cette date dans vos agendas si l'idée de passer boire une pinte ou deux (ou plus si affinité) vous titille.",
        datetime: new Date('2026-01-23T18:00:00.000Z'),
        points: 0,
        location: "Stade Charles-Tondreau",
        status: "published",
        createdBy: "u2",
        createdAt: new Date('2025-08-10T14:00:00Z'),
        isRegistered: true,
        registeredAt: new Date('2025-08-05T10:00:00Z'),
        requiresAttendanceValidation: false,
        requiresRegistration: false
      },
      {
        id: 'a3',
        title: "Apéro des Acteurs",
        description: "Messieurs, chers Compagnons,\nCe 25 janvier 2026, à partir de 11h00, les acteurs vous invitent à un apéro, devenu traditionnel.\nCelui-ci se déroulera à la Brasserie O'Quai, Place Léopold, 9 à Mons",
        datetime: new Date('2026-01-25T10:00:00.000Z'),
        points: 0,
        location: "O'quai",
        status: "published",
        createdBy: "u1",
        createdAt: new Date('2025-09-01T09:00:00Z'),
        isRegistered: false,
        registeredAt: null,
        requiresAttendanceValidation: false,
        requiresRegistration: false
      },
      {
        id: 'a4',
        title: "Assemblée générale ordinaire",
        description: "Messieurs,\nChers Compagnons,\nNous vous invitons à participer à le première Assemblée générale de la Compagnie de l'année 2026.\nCelle-ci se tiendra le vendredi 30 janvier dès 20H00 au Foyer Sainte-Waudru.\nL'ordre du jour complet et détaillé vous sera communiqué ultérieurement.\nEn espérant vous y voir très nombreux.",
        datetime: new Date('2026-01-30T19:00:00.000Z'),
        points: 3,
        location: "Foyer Sainte-Waudru - Mons",
        status: "draft",
        createdBy: "u2",
        createdAt: new Date('2025-09-15T11:00:00Z'),
        isRegistered: true,
        registeredAt: new Date('2025-08-05T10:00:00Z'),
        requiresAttendanceValidation: true,
        requiresRegistration: false
      }
      // Ajoute d'autres activités ici si besoin
    ];
  }
}
