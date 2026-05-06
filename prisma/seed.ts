import { PrismaClient, UserRole, RiskLevel, CaseStatus, FollowUpStatus, ServiceType, CallStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { PrismaNeon } from '@prisma/adapter-neon'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log('Seeding database...')

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10)

  // ─── Users ────────────────────────────────────────────────────────────────
  const users = [
    { id: 'u1', name: 'Maria Rossi', email: 'maria.rossi@crisislink.it', role: UserRole.operator },
    { id: 'u2', name: 'Luca Bianchi', email: 'luca.bianchi@crisislink.it', role: UserRole.operator },
    { id: 'u3', name: 'Anna Ferrari', email: 'anna.ferrari@crisislink.it', role: UserRole.coordinator },
    { id: 'u4', name: 'Dr. Paolo Ricci', email: 'paolo.ricci@crisislink.it', role: UserRole.supervisor },
    { id: 'u5', name: 'Admin Sistema', email: 'admin@crisislink.it', role: UserRole.admin },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { name: user.name, email: user.email, role: user.role, password: hashedPassword },
      create: { id: user.id, name: user.name, email: user.email, role: user.role, password: hashedPassword },
    })
  }
  console.log('✓ Users seeded')

  // ─── Cases ────────────────────────────────────────────────────────────────
  const now = Date.now()

  const cases = [
    {
      id: 'case-001',
      createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 12 * 60 * 1000),
      status: CaseStatus.open,
      operatorId: 'u1',
      ageRange: '25-34',
      gender: 'Femmina',
      region: 'Lombardia',
      municipality: 'Milano',
      primaryReason: 'Ideazione suicidaria',
      contextualElements: ['Isolamento sociale', 'Perdita lavorativa', 'Conflitti familiari'],
      riskLevel: RiskLevel.high,
      cssrsData: {
        ideation: { passive: true, activeNoIntent: true, activeNoMethod: false, activePlanNoIntent: false, activePlanIntent: false },
        behavior: { preparatoryBehavior: false, abortedAttempt: false, interruptedAttempt: false, actualAttempt: false, nonSuicidalSelfInjury: true },
        intensity: { frequency: 3, duration: 2, controllability: 3, deterrents: 4, reasons: 3 },
        riskLevel: 'high',
        notes: 'Paziente presenta ideazione suicidaria passiva con storia di autolesionismo. Rete di supporto debole.',
      },
      interventionTypes: ['Ascolto attivo', 'Psicoeducazione', 'Piano di sicurezza'],
      referrals: ['CSM Milano Centro', 'Pronto Soccorso Policlinico'],
      followUpRequired: true,
      followUpDate: new Date(now + 2 * 24 * 60 * 60 * 1000),
      notes: 'Paziente collaborativa. Ha accettato piano di sicurezza e si è impegnata a contattare il CSM entro 48 ore.',
      outcome: 'Riferita a servizi',
    },
    {
      id: 'case-002',
      createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 5 * 60 * 1000),
      status: CaseStatus.open,
      operatorId: 'u2',
      ageRange: '45-54',
      gender: 'Maschio',
      region: 'Piemonte',
      municipality: 'Torino',
      primaryReason: 'Crisi depressiva acuta',
      contextualElements: ['Lutto recente', 'Dipendenza da alcol'],
      riskLevel: RiskLevel.moderate,
      cssrsData: {
        ideation: { passive: true, activeNoIntent: false, activeNoMethod: false, activePlanNoIntent: false, activePlanIntent: false },
        behavior: { preparatoryBehavior: false, abortedAttempt: false, interruptedAttempt: false, actualAttempt: false, nonSuicidalSelfInjury: false },
        intensity: { frequency: 2, duration: 1, controllability: 4, deterrents: 5, reasons: 4 },
        riskLevel: 'moderate',
        notes: 'Depressione reattiva post-lutto. Consumo alcolico aumentato nelle ultime settimane.',
      },
      interventionTypes: ['Ascolto attivo', 'Supporto emotivo', 'Informazioni su servizi'],
      referrals: ['Ser.T Torino Nord', 'Associazione Lutto Insieme'],
      followUpRequired: true,
      followUpDate: new Date(now + 5 * 24 * 60 * 60 * 1000),
      notes: 'Utente ha parlato apertamente della perdita del padre. Accetta aiuto.',
      outcome: 'Supporto fornito - riferito',
    },
    {
      id: 'case-003',
      createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 4 * 24 * 60 * 60 * 1000),
      status: CaseStatus.follow_up,
      operatorId: 'u1',
      ageRange: '18-24',
      gender: 'Non binario',
      region: 'Veneto',
      municipality: 'Venezia',
      primaryReason: 'Violenza domestica',
      contextualElements: ['Violenza domestica', 'Difficoltà economiche', 'Figli minori'],
      riskLevel: RiskLevel.critical,
      cssrsData: {
        ideation: { passive: true, activeNoIntent: true, activeNoMethod: true, activePlanNoIntent: false, activePlanIntent: false },
        behavior: { preparatoryBehavior: true, abortedAttempt: true, interruptedAttempt: false, actualAttempt: false, nonSuicidalSelfInjury: true },
        intensity: { frequency: 5, duration: 4, controllability: 2, deterrents: 3, reasons: 2 },
        riskLevel: 'critical',
        notes: 'Situazione ad alto rischio. Presenza di bambini in casa. Tentativo interrotto riportato 2 settimane fa.',
      },
      interventionTypes: ['Gestione crisi', 'Attivazione emergenza', 'Piano di sicurezza', 'Supporto emotivo'],
      referrals: ['Carabinieri - 112', 'Casa Rifugio Venezia', 'Pronto Soccorso'],
      followUpRequired: true,
      followUpDate: new Date(now - 1 * 24 * 60 * 60 * 1000),
      notes: 'CASO CRITICO: Attivato intervento di emergenza. Carabinieri inviati. Bambini in sicurezza.',
      outcome: 'Emergenza attivata',
    },
    {
      id: 'case-004',
      createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 6 * 24 * 60 * 60 * 1000),
      status: CaseStatus.closed,
      operatorId: 'u2',
      ageRange: '65+',
      gender: 'Maschio',
      region: 'Toscana',
      municipality: 'Firenze',
      primaryReason: 'Solitudine e isolamento',
      contextualElements: ['Solitudine cronica', 'Problemi di salute', 'Perdita coniuge'],
      riskLevel: RiskLevel.low,
      cssrsData: {
        ideation: { passive: true, activeNoIntent: false, activeNoMethod: false, activePlanNoIntent: false, activePlanIntent: false },
        behavior: { preparatoryBehavior: false, abortedAttempt: false, interruptedAttempt: false, actualAttempt: false, nonSuicidalSelfInjury: false },
        intensity: { frequency: 1, duration: 1, controllability: 5, deterrents: 5, reasons: 5 },
        riskLevel: 'low',
        notes: 'Anziano solo, ideazione passiva lieve. Buona compliance, rete di supporto presente.',
      },
      interventionTypes: ['Ascolto attivo', 'Supporto emotivo', 'Risorse comunitarie'],
      referrals: ['Volontariato Seniore Firenze', 'Centro Anziani Oltrarno'],
      followUpRequired: false,
      notes: 'Signore molto collaborativo. Messo in contatto con associazione di volontariato.',
      outcome: 'Chiuso - riferito a servizi comunitari',
    },
    {
      id: 'case-005',
      createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
      status: CaseStatus.escalated,
      operatorId: 'u1',
      ageRange: '35-44',
      gender: 'Femmina',
      region: 'Sicilia',
      municipality: 'Palermo',
      primaryReason: 'Tentativo di suicidio in corso',
      contextualElements: ['Tentativo in corso', 'Farmaci assunti', 'Sola in casa'],
      riskLevel: RiskLevel.critical,
      cssrsData: {
        ideation: { passive: true, activeNoIntent: true, activeNoMethod: true, activePlanNoIntent: true, activePlanIntent: true },
        behavior: { preparatoryBehavior: true, abortedAttempt: false, interruptedAttempt: false, actualAttempt: true, nonSuicidalSelfInjury: false },
        intensity: { frequency: 5, duration: 5, controllability: 1, deterrents: 1, reasons: 1 },
        riskLevel: 'critical',
        notes: 'EMERGENZA: Tentativo in corso. Ha assunto farmaci 20 min fa. 118 attivato.',
      },
      interventionTypes: ['Attivazione emergenza 118', 'Gestione crisi', 'Mantenimento linea aperta'],
      referrals: ['118 - Palermo', 'Pronto Soccorso Villa Sofia'],
      followUpRequired: true,
      followUpDate: new Date(now + 1 * 24 * 60 * 60 * 1000),
      notes: "ESCALATION: Supervisore Dr. Ricci coinvolto. 118 dispatched. Linea mantenuta fino all'arrivo soccorsi.",
      outcome: 'Emergenza 118 attivata',
    },
    {
      id: 'case-006',
      createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 9 * 24 * 60 * 60 * 1000),
      status: CaseStatus.closed,
      operatorId: 'u2',
      ageRange: '25-34',
      gender: 'Maschio',
      region: 'Emilia-Romagna',
      municipality: 'Bologna',
      primaryReason: 'Ansia grave e attacchi di panico',
      contextualElements: ['Stress lavorativo', 'Insonnia cronica'],
      riskLevel: RiskLevel.low,
      cssrsData: {
        ideation: { passive: false, activeNoIntent: false, activeNoMethod: false, activePlanNoIntent: false, activePlanIntent: false },
        behavior: { preparatoryBehavior: false, abortedAttempt: false, interruptedAttempt: false, actualAttempt: false, nonSuicidalSelfInjury: false },
        intensity: { frequency: 0, duration: 0, controllability: 0, deterrents: 0, reasons: 0 },
        riskLevel: 'low',
        notes: 'Nessuna ideazione suicidaria presente. Ansia severa.',
      },
      interventionTypes: ['Psicoeducazione', 'Tecniche di respirazione', 'Grounding'],
      referrals: ['Psicologo privato', 'CSM Bologna Sud'],
      followUpRequired: false,
      notes: 'Utente stabilizzato con tecniche di grounding. Consigliato percorso psicologico.',
      outcome: 'Stabilizzato - riferito',
    },
    {
      id: 'case-007',
      createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
      status: CaseStatus.follow_up,
      operatorId: 'u1',
      ageRange: '15-17',
      gender: 'Femmina',
      region: 'Lazio',
      municipality: 'Roma',
      primaryReason: 'Autolesionismo adolescenziale',
      contextualElements: ['Bullismo scolastico', 'Conflitti con genitori', 'Isolamento sociale'],
      riskLevel: RiskLevel.high,
      cssrsData: {
        ideation: { passive: true, activeNoIntent: true, activeNoMethod: false, activePlanNoIntent: false, activePlanIntent: false },
        behavior: { preparatoryBehavior: false, abortedAttempt: false, interruptedAttempt: false, actualAttempt: false, nonSuicidalSelfInjury: true },
        intensity: { frequency: 4, duration: 3, controllability: 2, deterrents: 4, reasons: 3 },
        riskLevel: 'high',
        notes: 'Minorenne. Autolesionismo presente (tagli). Coinvolti genitori. Necessario iter NPI.',
      },
      interventionTypes: ['Ascolto attivo', 'Coinvolgimento genitori', 'Piano di sicurezza'],
      referrals: ['NPI Ospedale Bambino Gesù', 'Consultorio Adolescenti Roma'],
      followUpRequired: true,
      followUpDate: new Date(now + 3 * 24 * 60 * 60 * 1000),
      notes: 'Minorenne. Genitori informati e coinvolti. Appuntamento NPI fissato per giovedì.',
      outcome: 'Riferita a NPI - genitori coinvolti',
    },
    {
      id: 'case-008',
      createdAt: new Date(now - 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 13 * 24 * 60 * 60 * 1000),
      status: CaseStatus.closed,
      operatorId: 'u2',
      ageRange: '35-44',
      gender: 'Maschio',
      region: 'Campania',
      municipality: 'Napoli',
      primaryReason: 'Dipendenza e crisi esistenziale',
      contextualElements: ['Dipendenza da sostanze', 'Problemi legali', 'Perdita famiglia'],
      riskLevel: RiskLevel.moderate,
      cssrsData: {
        ideation: { passive: true, activeNoIntent: true, activeNoMethod: false, activePlanNoIntent: false, activePlanIntent: false },
        behavior: { preparatoryBehavior: false, abortedAttempt: false, interruptedAttempt: false, actualAttempt: false, nonSuicidalSelfInjury: false },
        intensity: { frequency: 3, duration: 2, controllability: 3, deterrents: 4, reasons: 3 },
        riskLevel: 'moderate',
        notes: 'Dipendenza da cocaina. Motivato al cambiamento. Famiglia allontanata.',
      },
      interventionTypes: ['Motivational interviewing', 'Informazioni Ser.T'],
      referrals: ['Ser.T Napoli Est', 'Comunità Terapeutica Don Bosco'],
      followUpRequired: false,
      notes: 'Utente motivato. Ha accettato di contattare il Ser.T. Chiusura positiva.',
      outcome: 'Chiuso - riferito Ser.T',
    },
    {
      id: 'case-009',
      createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
      status: CaseStatus.follow_up,
      operatorId: 'u1',
      ageRange: '55-64',
      gender: 'Femmina',
      region: 'Puglia',
      municipality: 'Bari',
      primaryReason: 'Disturbo bipolare scompensato',
      contextualElements: ['Interruzione farmaci', 'Episodio maniacale'],
      riskLevel: RiskLevel.high,
      cssrsData: {
        ideation: { passive: false, activeNoIntent: false, activeNoMethod: false, activePlanNoIntent: false, activePlanIntent: false },
        behavior: { preparatoryBehavior: false, abortedAttempt: false, interruptedAttempt: false, actualAttempt: false, nonSuicidalSelfInjury: false },
        intensity: { frequency: 0, duration: 0, controllability: 0, deterrents: 0, reasons: 0 },
        riskLevel: 'high',
        notes: 'Fase maniacale. Ha interrotto Litio da 10 giorni. Rischio comportamentale elevato.',
      },
      interventionTypes: ["Psicoeducazione", "Contatto psichiatria d'urgenza"],
      referrals: ['Psichiatria Policlinico Bari', 'CSM Bari 2'],
      followUpRequired: true,
      followUpDate: new Date(now + 1 * 24 * 60 * 60 * 1000),
      notes: 'Contattato psichiatra di riferimento. Visita urgente programmata per domani.',
      outcome: 'Riferita psichiatria urgenza',
    },
    {
      id: 'case-010',
      createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
      status: CaseStatus.closed,
      operatorId: 'u2',
      ageRange: '45-54',
      gender: 'Femmina',
      region: 'Liguria',
      municipality: 'Genova',
      primaryReason: 'Burnout e esaurimento',
      contextualElements: ['Burnout lavorativo', 'Caregiver stress'],
      riskLevel: RiskLevel.low,
      cssrsData: {
        ideation: { passive: false, activeNoIntent: false, activeNoMethod: false, activePlanNoIntent: false, activePlanIntent: false },
        behavior: { preparatoryBehavior: false, abortedAttempt: false, interruptedAttempt: false, actualAttempt: false, nonSuicidalSelfInjury: false },
        intensity: { frequency: 0, duration: 0, controllability: 0, deterrents: 0, reasons: 0 },
        riskLevel: 'low',
        notes: 'Nessuna ideazione. Esaurimento da caregiver. Necessita supporto.',
      },
      interventionTypes: ['Supporto emotivo', 'Psicoeducazione burnout', 'Risorse supporto'],
      referrals: ['Sportello Caregiver Genova', 'Psicologo ASL 3'],
      followUpRequired: false,
      notes: 'Paziente sollevata dal colloquio. Informata su risorse locali.',
      outcome: 'Chiuso - supporto fornito',
    },
    {
      id: 'case-011',
      createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 2 * 60 * 60 * 1000),
      status: CaseStatus.open,
      operatorId: 'u2',
      ageRange: '18-24',
      gender: 'Maschio',
      region: 'Trentino-Alto Adige',
      municipality: 'Trento',
      primaryReason: 'Prima crisi psicotica',
      contextualElements: ['Sintomi psicotici', 'Uso di cannabis', 'Nessun supporto familiare'],
      riskLevel: RiskLevel.high,
      cssrsData: {
        ideation: { passive: true, activeNoIntent: true, activeNoMethod: false, activePlanNoIntent: false, activePlanIntent: false },
        behavior: { preparatoryBehavior: false, abortedAttempt: false, interruptedAttempt: false, actualAttempt: false, nonSuicidalSelfInjury: false },
        intensity: { frequency: 3, duration: 2, controllability: 2, deterrents: 4, reasons: 4 },
        riskLevel: 'high',
        notes: 'Prima crisi psicotica. Voci uditive. Uso cannabis quotidiano. Solo in appartamento.',
      },
      interventionTypes: ['Ascolto attivo', 'Psicoeducazione', 'Attivazione psichiatria'],
      referrals: ['Psichiatria Urgenza Trento', 'CSM Trento'],
      followUpRequired: true,
      followUpDate: new Date(now + 24 * 60 * 60 * 1000),
      notes: 'Giovane spaventato. Collaborante. Psichiatria di urgenza allertata.',
      outcome: 'Riferito psichiatria',
    },
    {
      id: 'case-012',
      createdAt: new Date(now - 12 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 11 * 24 * 60 * 60 * 1000),
      status: CaseStatus.closed,
      operatorId: 'u1',
      ageRange: '55-64',
      gender: 'Maschio',
      region: 'Umbria',
      municipality: 'Perugia',
      primaryReason: 'Trauma recente e PTSD',
      contextualElements: ['Trauma incidente stradale', 'Flashback', 'Insonnia'],
      riskLevel: RiskLevel.moderate,
      cssrsData: {
        ideation: { passive: true, activeNoIntent: false, activeNoMethod: false, activePlanNoIntent: false, activePlanIntent: false },
        behavior: { preparatoryBehavior: false, abortedAttempt: false, interruptedAttempt: false, actualAttempt: false, nonSuicidalSelfInjury: false },
        intensity: { frequency: 2, duration: 1, controllability: 4, deterrents: 5, reasons: 5 },
        riskLevel: 'moderate',
        notes: 'PTSD post-incidente. Ideazione passiva. Motivato a guarire.',
      },
      interventionTypes: ['Psicoeducazione PTSD', 'Tecniche di stabilizzazione'],
      referrals: ['Centro PTSD Perugia', 'Psicologo specialista trauma'],
      followUpRequired: false,
      notes: 'Paziente consapevole del disturbo. Riferito a specialista PTSD.',
      outcome: 'Chiuso - riferito specialista',
    },
  ]

  for (const c of cases) {
    const { cssrsData, ...rest } = c
    await prisma.case.upsert({
      where: { id: c.id },
      update: { ...rest, cssrsData: cssrsData as any },
      create: { ...rest, cssrsData: cssrsData as any },
    })
  }
  console.log('✓ Cases seeded')

  // ─── Follow-ups ───────────────────────────────────────────────────────────
  const followUps = [
    {
      id: 'fu-001',
      caseId: 'case-001',
      callerId: 'CL-2024-0891',
      scheduledDate: new Date(now + 2 * 24 * 60 * 60 * 1000),
      status: FollowUpStatus.pending,
      priority: RiskLevel.high,
      operatorId: 'u1',
      notes: 'Verificare contatto CSM e piano di sicurezza. Controllare stato emotivo.',
    },
    {
      id: 'fu-002',
      caseId: 'case-003',
      callerId: 'CL-2024-0445',
      scheduledDate: new Date(now - 1 * 24 * 60 * 60 * 1000),
      status: FollowUpStatus.overdue,
      priority: RiskLevel.critical,
      operatorId: 'u1',
      notes: 'URGENTE: Verificare situazione sicurezza. Caso violenza domestica con bambini.',
    },
    {
      id: 'fu-003',
      caseId: 'case-005',
      callerId: 'CL-2024-0332',
      scheduledDate: new Date(now + 1 * 24 * 60 * 60 * 1000),
      status: FollowUpStatus.pending,
      priority: RiskLevel.critical,
      operatorId: 'u1',
      notes: 'Follow-up post-tentativo. Verificare dimissioni e piano post-ospedaliero.',
    },
    {
      id: 'fu-004',
      caseId: 'case-002',
      callerId: 'Anonimo-0221',
      scheduledDate: new Date(now + 5 * 24 * 60 * 60 * 1000),
      status: FollowUpStatus.pending,
      priority: RiskLevel.moderate,
      operatorId: 'u2',
      notes: 'Verificare contatto Ser.T e stato emotivo generale.',
    },
    {
      id: 'fu-005',
      caseId: 'case-007',
      callerId: 'CL-2024-0667',
      scheduledDate: new Date(now + 3 * 24 * 60 * 60 * 1000),
      status: FollowUpStatus.pending,
      priority: RiskLevel.high,
      operatorId: 'u1',
      notes: 'Verificare appuntamento NPI e coinvolgimento genitori.',
    },
    {
      id: 'fu-006',
      caseId: 'case-009',
      callerId: 'CL-2024-0778',
      scheduledDate: new Date(now + 1 * 24 * 60 * 60 * 1000),
      status: FollowUpStatus.pending,
      priority: RiskLevel.high,
      operatorId: 'u1',
      notes: 'Verificare visita psichiatrica urgente e ripresa farmacoterapia.',
    },
    {
      id: 'fu-007',
      caseId: 'case-011',
      callerId: 'CL-2024-0934',
      scheduledDate: new Date(now + 24 * 60 * 60 * 1000),
      status: FollowUpStatus.pending,
      priority: RiskLevel.high,
      operatorId: 'u2',
      notes: 'Verificare accesso psichiatria urgenza e stato clinico.',
    },
    {
      id: 'fu-008',
      caseId: 'case-008',
      callerId: 'CL-2024-0556',
      scheduledDate: new Date(now - 7 * 24 * 60 * 60 * 1000),
      completedDate: new Date(now - 6 * 24 * 60 * 60 * 1000),
      status: FollowUpStatus.completed,
      priority: RiskLevel.moderate,
      operatorId: 'u2',
      notes: 'Follow-up completato. Utente ha contattato Ser.T.',
      outcome: 'Utente ha iniziato percorso Ser.T. Condizioni stabili.',
    },
  ]

  for (const fu of followUps) {
    await prisma.followUp.upsert({
      where: { id: fu.id },
      update: fu,
      create: fu,
    })
  }
  console.log('✓ Follow-ups seeded')

  // ─── Services ─────────────────────────────────────────────────────────────
  const services = [
    { id: 'svc-001', name: 'CSM Milano Centro - Centro di Salute Mentale', type: ServiceType.cmhc, municipality: 'Milano', province: 'MI', postalCode: '20121', address: 'Via Ponzio 33, Milano', phone: '02 55183400', email: 'csm.centro@asst-santipaolocarlo.it', hours: 'Lun-Ven 8:00-18:00', available24h: false },
    { id: 'svc-002', name: 'Pronto Soccorso Policlinico di Milano', type: ServiceType.hospital, municipality: 'Milano', province: 'MI', postalCode: '20122', address: 'Via Francesco Sforza 35, Milano', phone: '02 55031', hours: '24/7', available24h: true },
    { id: 'svc-003', name: 'Ser.T Torino Nord - Servizio Tossicodipendenze', type: ServiceType.social, municipality: 'Torino', province: 'TO', postalCode: '10147', address: 'Via Gottardo 30, Torino', phone: '011 4327711', email: 'sert.nord@aslto2.piemonte.it', hours: 'Lun-Ven 8:30-17:30', available24h: false },
    { id: 'svc-004', name: 'Casa Rifugio Venezia - Protezione Violenza', type: ServiceType.social, municipality: 'Venezia', province: 'VE', postalCode: '30121', address: 'Cannaregio 4267, Venezia (indirizzo riservato)', phone: '041 2750384', email: 'casarifugio@comune.venezia.it', hours: '24/7', available24h: true },
    { id: 'svc-005', name: 'Psichiatria di Urgenza - Ospedale Villa Sofia Palermo', type: ServiceType.hospital, municipality: 'Palermo', province: 'PA', postalCode: '90146', address: 'Piazza Salerno 1, Palermo', phone: '091 7809111', hours: '24/7', available24h: true },
    { id: 'svc-006', name: 'NPI - Neuropsichiatria Infantile Bambino Gesù Roma', type: ServiceType.hospital, municipality: 'Roma', province: 'RM', postalCode: '00165', address: "Piazza di Sant'Onofrio 4, Roma", phone: '06 68592111', email: 'npi@opbg.net', hours: 'Lun-Ven 8:00-17:00', available24h: false },
    { id: 'svc-007', name: 'CSM Bologna Sud - Centro di Salute Mentale', type: ServiceType.cmhc, municipality: 'Bologna', province: 'BO', postalCode: '40139', address: 'Via Altura 3, Bologna', phone: '051 6584711', email: 'csm.sud@ausl.bologna.it', hours: 'Lun-Ven 8:00-19:00, Sab 8:00-13:00', available24h: false },
    { id: 'svc-008', name: 'Ser.T Napoli Est', type: ServiceType.social, municipality: 'Napoli', province: 'NA', postalCode: '80147', address: 'Via Argine 604, Napoli', phone: '081 5966345', hours: 'Lun-Ven 8:00-14:00', available24h: false },
    { id: 'svc-009', name: 'Psichiatria Urgenza - Policlinico Bari', type: ServiceType.hospital, municipality: 'Bari', province: 'BA', postalCode: '70124', address: 'Piazza Giulio Cesare 11, Bari', phone: '080 5591111', hours: '24/7', available24h: true },
    { id: 'svc-010', name: 'Centro PTSD Perugia - Psicologia Clinica', type: ServiceType.cmhc, municipality: 'Perugia', province: 'PG', postalCode: '06129', address: 'Via Enrico Dal Pozzo, Perugia', phone: '075 5784521', email: 'ptsd@uslumbria1.it', hours: 'Lun-Ven 9:00-17:00', available24h: false },
    { id: 'svc-011', name: 'Carabinieri - Pronto Intervento', type: ServiceType.police, municipality: 'Nazionale', province: 'NAZ', postalCode: '00000', address: 'Servizio Nazionale', phone: '112', hours: '24/7', available24h: true },
    { id: 'svc-012', name: '118 - Emergenza Sanitaria', type: ServiceType.emergency, municipality: 'Nazionale', province: 'NAZ', postalCode: '00000', address: 'Servizio Nazionale', phone: '118', hours: '24/7', available24h: true },
    { id: 'svc-013', name: 'Sportello Caregiver - ASL 3 Genova', type: ServiceType.social, municipality: 'Genova', province: 'GE', postalCode: '16129', address: 'Via Bertani 4, Genova', phone: '010 8491234', email: 'caregiver@asl3.liguria.it', hours: 'Lun, Mer, Ven 9:00-12:00', available24h: false },
    { id: 'svc-014', name: 'CSM Trento - Centro di Salute Mentale', type: ServiceType.cmhc, municipality: 'Trento', province: 'TN', postalCode: '38122', address: 'Via Oreste Perutz 3, Trento', phone: '0461 904500', email: 'csm@apss.tn.it', hours: 'Lun-Ven 8:00-18:00', available24h: false },
    { id: 'svc-015', name: "Centro Anziani Oltrarno - Firenze", type: ServiceType.social, municipality: 'Firenze', province: 'FI', postalCode: '50125', address: "Via de' Serragli 99, Firenze", phone: '055 2342150', email: 'anziani.oltrarno@comune.fi.it', hours: 'Lun-Ven 9:00-13:00, 15:00-18:00', available24h: false },
    { id: 'svc-016', name: 'Pronto Soccorso Ospedale Molinette Torino', type: ServiceType.emergency, municipality: 'Torino', province: 'TO', postalCode: '10126', address: 'Corso Bramante 88, Torino', phone: '011 6331633', hours: '24/7', available24h: true },
    { id: 'svc-017', name: 'Comunità Terapeutica Don Bosco - Napoli', type: ServiceType.other, municipality: 'Napoli', province: 'NA', postalCode: '80137', address: 'Via Don Bosco 12, Napoli', phone: '081 7614503', email: 'comunita@donbosconapoli.it', hours: 'Lun-Ven 9:00-17:00', available24h: false },
    { id: 'svc-018', name: 'Consultorio Adolescenti Roma - ASL RM1', type: ServiceType.cmhc, municipality: 'Roma', province: 'RM', postalCode: '00198', address: 'Via Tagliamento 32, Roma', phone: '06 83060523', email: 'consultorio.adolescenti@aslroma1.it', hours: 'Lun-Ven 8:30-12:30, Mar e Gio 14:30-17:30', available24h: false },
    { id: 'svc-019', name: 'CSM Bari 2 - Salute Mentale Adulti', type: ServiceType.cmhc, municipality: 'Bari', province: 'BA', postalCode: '70126', address: 'Via Amendola 267, Bari', phone: '080 5042765', email: 'csm2@asl.bari.it', hours: 'Lun-Ven 8:00-20:00', available24h: false },
    { id: 'svc-020', name: 'Volontariato Seniore Firenze', type: ServiceType.other, municipality: 'Firenze', province: 'FI', postalCode: '50122', address: 'Via del Proconsolo 10, Firenze', phone: '055 2340111', email: 'info@volontariatoseniorefirenze.it', hours: 'Lun-Sab 9:00-17:00', available24h: false },
  ]

  for (const svc of services) {
    await prisma.service.upsert({
      where: { id: svc.id },
      update: svc,
      create: svc,
    })
  }
  console.log('✓ Services seeded')

  // ─── Sample Calls ─────────────────────────────────────────────────────────
  const sampleCalls = [
    { id: 'c001', callerId: 'CL-2024-0891', callerAnonymous: false, startTime: new Date(now - 12 * 60 * 1000), status: CallStatus.active, operatorId: 'u1', riskLevel: RiskLevel.high, caseId: 'case-001' },
    { id: 'c002', callerId: 'Anonimo', callerAnonymous: true, startTime: new Date(now - 5 * 60 * 1000), status: CallStatus.active, operatorId: 'u2', riskLevel: RiskLevel.moderate, caseId: 'case-002' },
    { id: 'c003', callerId: 'CL-2024-0445', callerAnonymous: false, startTime: new Date(now - 3 * 60 * 1000), status: CallStatus.on_hold, operatorId: 'u1', riskLevel: RiskLevel.critical },
    { id: 'c004', callerId: 'Anonimo', callerAnonymous: true, startTime: new Date(now - 1 * 60 * 1000), status: CallStatus.incoming },
    { id: 'c005', callerId: 'CL-2024-0332', callerAnonymous: false, startTime: new Date(now - 30 * 1000), status: CallStatus.incoming },
  ]

  for (const call of sampleCalls) {
    await prisma.call.upsert({
      where: { id: call.id },
      update: call,
      create: call,
    })
  }
  console.log('✓ Calls seeded')

  // ─── Audit Logs ───────────────────────────────────────────────────────────
  const auditLogs = [
    { id: 'audit-001', caseId: 'case-001', userId: 'u1', userName: 'Maria Rossi', action: 'Aggiornamento note', details: 'Note di colloquio aggiornate', createdAt: new Date(now - 12 * 60 * 1000) },
    { id: 'audit-002', caseId: 'case-001', userId: 'u1', userName: 'Maria Rossi', action: 'Creazione caso', details: 'Caso creato durante chiamata in entrata', createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000) },
    { id: 'audit-003', caseId: 'case-001', userId: 'u1', userName: 'Maria Rossi', action: 'Valutazione C-SSRS', details: 'Scala C-SSRS completata - rischio ALTO', createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000) },
    { id: 'audit-004', caseId: 'case-001', userId: 'u1', userName: 'Maria Rossi', action: 'Follow-up programmato', details: 'Follow-up programmato per +48h', createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000) },
    { id: 'audit-005', caseId: 'case-001', userId: 'u4', userName: 'Dr. Paolo Ricci', action: 'Revisione supervisore', details: 'Caso revisionato dal supervisore. Confermata gestione.', createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000) },
  ]

  for (const log of auditLogs) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: log,
      create: log,
    })
  }
  console.log('✓ Audit logs seeded')

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
