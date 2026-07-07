import Dexie, { type Table } from 'dexie';
import { DB_NAME } from '@/config/db-config';
import type {
  Achievement,
  AchievementRule,
  AuditLog,
  Category,
  Habit,
  HabitReminder,
  HabitTag,
  HabitTemplate,
  Log,
  Member,
  Tag,
  TimerProfile,
  TimerSession,
  UserAchievement,
} from '@/domain/entities';
import { registerSchema } from './migrations';

class HabitTrackerDB extends Dexie {
  members!: Table<Member, string>;
  habits!: Table<Habit, string>;
  logs!: Table<Log, string>;
  categories!: Table<Category, string>;
  tags!: Table<Tag, string>;
  habitTags!: Table<HabitTag, [string, string]>;
  reminders!: Table<HabitReminder, string>;
  timerSessions!: Table<TimerSession, string>;
  timerProfiles!: Table<TimerProfile, string>;
  templates!: Table<HabitTemplate, string>;
  achievements!: Table<Achievement, string>;
  achievementRules!: Table<AchievementRule, string>;
  userAchievements!: Table<UserAchievement, string>;
  auditLogs!: Table<AuditLog, string>;

  constructor() {
    super(DB_NAME);
    registerSchema(this);
  }
}

export const db = new HabitTrackerDB();
