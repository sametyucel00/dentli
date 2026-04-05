import {
  buildInsightItems,
  getToothbrushDaysLeft,
} from '@/src/features/insights/insights-engine';
import { ProfileAnalytics } from '@/src/features/profile/model';
import {
  buildMonthlyCompletion,
  buildWeeklyHeatmap,
  buildYearlyCompletion,
  createHygieneActionMap,
  getExpectedDailyActionKeys,
  getStartOfYear,
} from '@/src/features/profile/analytics';
import { hygieneEventsRepository, routineSettingsRepository } from '@/src/repositories';

function getStartOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

class ProfileService {
  async loadAnalytics(profileId: string, locale: string): Promise<ProfileAnalytics> {
    const today = new Date();
    const startOfToday = getStartOfDay(today);
    const tomorrow = addDays(startOfToday, 1);
    const startOfYear = getStartOfYear(today);

    const [routineSettings, yearEvents, todayEvents, lastFlossEvent] = await Promise.all([
      routineSettingsRepository.getByProfileId(profileId),
      hygieneEventsRepository.listByDateRange(
        profileId,
        startOfYear.toISOString(),
        tomorrow.toISOString(),
      ),
      hygieneEventsRepository.listByDateRange(
        profileId,
        startOfToday.toISOString(),
        tomorrow.toISOString(),
      ),
      hygieneEventsRepository.getLatestByType(profileId, 'floss'),
    ]);

    const expectedActionKeys = getExpectedDailyActionKeys(routineSettings);
    const eventMap = createHygieneActionMap(yearEvents);

    return {
      weeklyHeatmap: buildWeeklyHeatmap(
        eventMap,
        expectedActionKeys,
        locale,
        today,
      ),
      monthlyCompletion: buildMonthlyCompletion(eventMap, routineSettings, today),
      yearlyCompletion: buildYearlyCompletion(
        eventMap,
        expectedActionKeys,
        locale,
        today,
      ),
      insights: buildInsightItems({
        todayEvents,
        routineSettings,
        lastFlossEvent,
        toothbrushDaysLeft: getToothbrushDaysLeft(routineSettings),
      }),
    };
  }
}

export const profileService = new ProfileService();
