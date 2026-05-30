import { useEffect } from 'react';
import { API_URL } from '../config';

export function usePushNotification() {
  useEffect(() => {
    const userStr = localStorage.getItem('serviq_user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    if (!user._id) return;

    const subscribeToPush = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });

          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;

          const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
          if (!publicVapidKey) return;

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });

          await fetch(`${API_URL}/api/notifications/subscribe`, {
            method: 'POST',
            body: JSON.stringify({
              userId: user._id,
              subscription: subscription
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.error('Push registration error:', error);
        }
      }
    };

    subscribeToPush();
  }, []);
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
