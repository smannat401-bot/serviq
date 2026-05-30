const webpush = require('web-push');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@serviq.test',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const sendNotificationToUser = async (user, payload) => {
  if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
    return;
  }

  const pushPayload = JSON.stringify(payload);

  const notifications = user.pushSubscriptions.map((subscription) => {
    return webpush.sendNotification(subscription, pushPayload)
      .catch(error => {
        if (error.statusCode === 404 || error.statusCode === 410) {
          console.log('Subscription has expired or is no longer valid');
          // Ideally, we should remove it from user.pushSubscriptions here, but simple setup for now
        } else {
          console.error('Error sending push notification:', error);
        }
      });
  });

  await Promise.allSettled(notifications);
};

module.exports = {
  webpush,
  sendNotificationToUser
};
