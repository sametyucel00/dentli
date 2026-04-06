export type EntityId = string;
export type ISODateString = string;
export type SupportedLanguage = 'en' | 'tr';
export type ThemeMode = 'system' | 'light' | 'dark';
export type AppPlan = 'free' | 'pro';
export type AppBootstrapStatus = 'idle' | 'loading' | 'ready' | 'error';
export type MonetizationProductId = 'dentli_pro_lifetime';
export type PremiumFeatureKey =
  | 'tooth_map_full'
  | 'dentist_mode'
  | 'pdf_export'
  | 'analytics_advanced'
  | 'multi_profile';

export type Profile = {
  id: EntityId;
  firstName: string;
  lastName: string;
  preferredLanguage: SupportedLanguage;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type RoutineSettings = {
  id: EntityId;
  profileId: EntityId;
  brushingFrequencyPerDay: number;
  flossingEnabled: boolean;
  mouthwashEnabled: boolean;
  remindersEnabled: boolean;
  reminderTime: string | null;
  toothbrushReplacementIntervalDays: number;
  toothbrushLastReplacedAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type HygieneEventType = 'brush' | 'floss' | 'mouthwash' | 'rinse';
export type DailyActionKey =
  | 'morning_brush'
  | 'night_brush'
  | 'floss'
  | 'mouthwash';

export type HygieneEvent = {
  id: EntityId;
  profileId: EntityId;
  eventType: HygieneEventType;
  actionKey: DailyActionKey | null;
  occurredAt: ISODateString;
  durationSeconds: number | null;
  notes: string | null;
};

export type SymptomType =
  | 'pain'
  | 'bleeding'
  | 'sensitivity'
  | 'swelling'
  | 'bad_breath';

export type SymptomEvent = {
  id: EntityId;
  profileId: EntityId;
  symptomType: SymptomType;
  severity: number | null;
  toothNumber: number | null;
  notes: string | null;
  occurredAt: ISODateString;
};

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export type Appointment = {
  id: EntityId;
  profileId: EntityId;
  title: string;
  providerName: string | null;
  startsAt: ISODateString;
  endsAt: ISODateString | null;
  location: string | null;
  notes: string | null;
  status: AppointmentStatus;
  reminderEnabled: boolean;
  reminderMinutesBefore: number | null;
  reminderNotificationId: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type CareItemStatus = 'todo' | 'active' | 'done' | 'archived';
export type CareItemCategory = 'habit' | 'treatment' | 'medication' | 'note';
export type CareItemType =
  | 'toothbrush'
  | 'toothpaste'
  | 'floss'
  | 'mouthwash'
  | 'interdental_brush'
  | 'water_flosser'
  | 'other';

export type CareItem = {
  id: EntityId;
  profileId: EntityId;
  title: string;
  description: string | null;
  category: CareItemCategory;
  itemType: CareItemType;
  status: CareItemStatus;
  trackingEnabled: boolean;
  replacementCycleDays: number | null;
  lastReplacedAt: ISODateString | null;
  dueAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type ToothStatus =
  | 'healthy'
  | 'cavity'
  | 'filling'
  | 'root_canal'
  | 'implant'
  | 'crown'
  | 'cracked'
  | 'sensitivity'
  | 'missing';

export type ToothCurrentStatus = {
  id: EntityId;
  profileId: EntityId;
  toothNumber: number;
  status: ToothStatus;
  note: string | null;
  recordedAt: ISODateString;
  updatedAt: ISODateString;
};

export type ToothStatusHistory = {
  id: EntityId;
  profileId: EntityId;
  toothNumber: number;
  status: ToothStatus;
  note: string | null;
  recordedAt: ISODateString;
  source: string | null;
};

export type EntitlementRecord = {
  productId: MonetizationProductId;
  plan: AppPlan;
  status: 'active' | 'inactive';
  purchasedAt: ISODateString | null;
  restoredAt: ISODateString | null;
  source: string | null;
  updatedAt: ISODateString;
};

export type EntitlementSnapshot = {
  plan: AppPlan;
  activeProductIds: MonetizationProductId[];
  purchasedAt: ISODateString | null;
  restoredAt: ISODateString | null;
  source: string | null;
};

export type CacheEntry<T> = {
  data: T;
  updatedAt: ISODateString;
};

export type AppCacheState = {
  profiles: CacheEntry<Profile[]> | null;
  routineSettingsByProfileId: Record<EntityId, CacheEntry<RoutineSettings> | undefined>;
  hygieneEventsByProfileId: Record<EntityId, CacheEntry<HygieneEvent[]> | undefined>;
  symptomEventsByProfileId: Record<EntityId, CacheEntry<SymptomEvent[]> | undefined>;
  appointmentsByProfileId: Record<EntityId, CacheEntry<Appointment[]> | undefined>;
  careItemsByProfileId: Record<EntityId, CacheEntry<CareItem[]> | undefined>;
  toothCurrentStatusByProfileId: Record<EntityId, CacheEntry<ToothCurrentStatus[]> | undefined>;
};

export type AppBootstrapData = {
  profiles: Profile[];
  selectedProfileId: EntityId | null;
  routineSettings: RoutineSettings | null;
  appointments: Appointment[];
  careItems: CareItem[];
  toothCurrentStatuses: ToothCurrentStatus[];
  entitlements: EntitlementSnapshot;
};
