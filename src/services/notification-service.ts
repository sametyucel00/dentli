import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type NotificationIntent =
  | 'routine_reminder'
  | 'appointment_reminder'
  | 'care_item_due'
  | 'dental_check_reminder';

export type NotificationRequest = {
  id: string;
  profileId: string | null;
  intent: NotificationIntent;
  title: string;
  body: string;
  scheduledFor: string;
};

export interface NotificationService {
  initialize(): Promise<void>;
  requestPermissions(): Promise<boolean>;
  schedule(request: NotificationRequest): Promise<void>;
  cancel(notificationId: string): Promise<void>;
  cancelByPrefix(prefix: string): Promise<void>;
  cancelAll(): Promise<void>;
  listScheduled(): Promise<NotificationRequest[]>;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NativeNotificationService implements NotificationService {
  private scheduled = new Map<string, NotificationRequest>();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    if (Platform.OS !== 'web') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    this.initialized = true;
  }

  async requestPermissions() {
    if (Platform.OS === 'web') {
      return true;
    }

    const permissions = await Notifications.requestPermissionsAsync();
    return permissions.granted || permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  }

  async schedule(request: NotificationRequest) {
    if (new Date(request.scheduledFor).getTime() <= Date.now()) {
      await this.cancel(request.id);
      return;
    }

    await this.cancel(request.id);
    this.scheduled.set(request.id, request);

    if (Platform.OS === 'web') {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: request.title,
        body: request.body,
        sound: 'default',
        data: {
          appNotificationId: request.id,
          intent: request.intent,
          profileId: request.profileId,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(request.scheduledFor),
      },
    });
  }

  async cancel(notificationId: string) {
    this.scheduled.delete(notificationId);

    if (Platform.OS === 'web') {
      return;
    }

    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const matchingIds = scheduledNotifications
      .filter((item) => item.content.data?.appNotificationId === notificationId)
      .map((item) => item.identifier);

    for (const identifier of matchingIds) {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    }
  }

  async cancelByPrefix(prefix: string) {
    for (const [id] of this.scheduled) {
      if (id.startsWith(prefix)) {
        this.scheduled.delete(id);
      }
    }

    if (Platform.OS === 'web') {
      return;
    }

    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const matchingIds = scheduledNotifications
      .filter((item) => {
        const appNotificationId = item.content.data?.appNotificationId;
        return typeof appNotificationId === 'string' && appNotificationId.startsWith(prefix);
      })
      .map((item) => item.identifier);

    for (const identifier of matchingIds) {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    }
  }

  async cancelAll() {
    this.scheduled.clear();

    if (Platform.OS === 'web') {
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async listScheduled() {
    if (Platform.OS === 'web') {
      return [...this.scheduled.values()];
    }

    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    return scheduledNotifications.flatMap((item) => {
      const appNotificationId = item.content.data?.appNotificationId;
      const intent = item.content.data?.intent;
      const profileId = item.content.data?.profileId;
      const triggerDate =
        item.trigger && 'date' in item.trigger ? item.trigger.date : null;

      if (
        typeof appNotificationId !== 'string' ||
        typeof intent !== 'string' ||
        typeof triggerDate !== 'number'
      ) {
        return [];
      }

      return [
        {
          id: appNotificationId,
          profileId: typeof profileId === 'string' ? profileId : null,
          intent: intent as NotificationIntent,
          title: item.content.title ?? '',
          body: item.content.body ?? '',
          scheduledFor: new Date(triggerDate).toISOString(),
        } satisfies NotificationRequest,
      ];
    });
  }
}

export const notificationService = new NativeNotificationService();
