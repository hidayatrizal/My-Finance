export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser ini tidak mendukung notifikasi.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function sendLocalNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  // Coba gunakan service worker jika tersedia agar lebih native di mobile
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration) {
        registration.showNotification(title, {
          icon: '/icon.svg',
          badge: '/icon.svg',
          ...options,
        });
        return;
      }
    } catch (error) {
      console.error('Service worker notification failed', error);
    }
  }

  // Fallback ke Notification biasa
  new Notification(title, {
    icon: '/icon.svg',
    ...options,
  });
}

// Fungsi untuk menjadwalkan pengecekan notifikasi
export function setupNotificationScheduler() {
  const checkAndNotify = () => {
    const isEnabled = localStorage.getItem('notifications_enabled') === 'true';
    if (!isEnabled || Notification.permission !== 'granted') return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const dateKey = now.toISOString().split('T')[0];

    // Cek apakah notifikasi pagi sudah dikirim hari ini
    if (hours >= 8 && hours < 12) {
      const morningKey = `notif_morning_${dateKey}`;
      if (!localStorage.getItem(morningKey)) {
        sendLocalNotification('Selamat Pagi! ☀️', {
          body: 'Yukk kejar target mu hari ini.',
        });
        localStorage.setItem(morningKey, 'true');
      }
    }

    // Cek notifikasi siang (12:15 ke atas, batas sampai jam 15)
    if ((hours === 12 && minutes >= 15) || (hours > 12 && hours < 15)) {
      const noonKey = `notif_noon_${dateKey}`;
      if (!localStorage.getItem(noonKey)) {
        sendLocalNotification('Istirahat Dulu 🍽️', {
          body: 'Jangan lupa sholat & makan siang Bosss',
        });
        localStorage.setItem(noonKey, 'true');
      }
    }

    // Cek notifikasi malam (rekap)
    if (hours >= 20 && hours < 22) {
      const eveningKey = `notif_evening_${dateKey}`;
      if (!localStorage.getItem(eveningKey)) {
        sendLocalNotification('Sudah Rekap Keuangan? 📊', {
          body: 'Jangan lupa untuk rekap keuangan mu hari ini.',
        });
        localStorage.setItem(eveningKey, 'true');
      }
    }

    // Cek notifikasi istirahat
    if (hours >= 22 || hours < 4) {
      const nightKey = `notif_night_${dateKey}`;
      if (!localStorage.getItem(nightKey)) {
        sendLocalNotification('Waktunya Istirahat 🌙', {
          body: 'Jangan lupa istirahat yaa, sayangi dirimu.',
        });
        localStorage.setItem(nightKey, 'true');
      }
    }
  };

  // Cek setiap menit
  checkAndNotify();
  const intervalId = setInterval(checkAndNotify, 60000);
  return () => clearInterval(intervalId);
}
