import PushNotification from "react-native-push-notification";

export function configureNotifications() {
  PushNotification.configure({
    onNotification: () => {},
    requestPermissions: true,
  });

  PushNotification.createChannel(
    {
      channelId: "bloom-reminders",
      channelName: "Bloom Reminders",
    },
    () => {}
  );
}

export function schedulePeriodReminder(date: Date) {
  PushNotification.localNotificationSchedule({
    channelId: "bloom-reminders",
    message: "Your period may be starting soon. Take gentle care today.",
    date,
    allowWhileIdle: true,
  });
}

export function scheduleFertilityReminder(date: Date) {
  PushNotification.localNotificationSchedule({
    channelId: "bloom-reminders",
    message: "Your fertility window is coming up.",
    date,
    allowWhileIdle: true,
  });
}
