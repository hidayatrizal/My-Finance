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

  new Notification(title, {
    icon: '/icon.svg',
    ...options,
  });
}

// Menjadwalkan notifikasi menggunakan Notification Triggers API (jika didukung)
// API ini memungkinkan notifikasi muncul bahkan saat aplikasi ditutup di Android
export async function scheduleBackgroundNotifications() {
  if (!('serviceWorker' in navigator)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Cek dukungan Notification Triggers API
    // @ts-ignore
    if ('showTrigger' in Notification.prototype) {
      
      const scheduleForTime = async (tag: string, title: string, body: string, hour: number, minute: number) => {
        const now = new Date();
        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
        
        // Jika waktu hari ini sudah lewat, jadwalkan untuk besok
        if (target.getTime() <= now.getTime()) {
          target.setDate(target.getDate() + 1);
        }
        
        // @ts-ignore
        const trigger = new TimestampTrigger(target.getTime());
        
        await registration.showNotification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: tag, // Tag berguna agar notifikasi tidak menumpuk
          // @ts-ignore
          showTrigger: trigger
        });
      };

      await scheduleForTime('morning_notif', 'Selamat Pagi! ☀️', 'Yukk kejar target mu hari ini.', 8, 0);
      await scheduleForTime('noon_notif', 'Istirahat Dulu 🍽️', 'Jangan lupa sholat & makan siang Bosss', 12, 15);
      await scheduleForTime('evening_notif', 'Sudah Rekap Keuangan? 📊', 'Jangan lupa untuk rekap keuangan mu hari ini.', 20, 0);
      await scheduleForTime('night_notif', 'Waktunya Istirahat 🌙', 'Jangan lupa istirahat yaa, sayangi dirimu.', 22, 0);
      
      return true; // Berhasil dijadwalkan di background
    }
    return false; // Tidak didukung
  } catch (error) {
    console.error('Error scheduling background notifications', error);
    return false;
  }
}

// Fungsi fallback untuk menjadwalkan pengecekan saat aplikasi terbuka
export function setupNotificationScheduler() {
  const checkAndNotify = () => {
    const isEnabled = localStorage.getItem('notifications_enabled') === 'true';
    if (!isEnabled || Notification.permission !== 'granted') return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const dateKey = now.toISOString().split('T')[0];

    if (hours >= 8 && hours < 12) {
      const morningKey = `notif_morning_${dateKey}`;
      if (!localStorage.getItem(morningKey)) {
        sendLocalNotification('Selamat Pagi! ☀️', {
          body: 'Yukk kejar target mu hari ini.',
        });
        localStorage.setItem(morningKey, 'true');
      }
    }

    if ((hours === 12 && minutes >= 15) || (hours > 12 && hours < 15)) {
      const noonKey = `notif_noon_${dateKey}`;
      if (!localStorage.getItem(noonKey)) {
        sendLocalNotification('Istirahat Dulu 🍽️', {
          body: 'Jangan lupa sholat & makan siang Bosss',
        });
        localStorage.setItem(noonKey, 'true');
      }
    }

    if (hours >= 20 && hours < 22) {
      const eveningKey = `notif_evening_${dateKey}`;
      if (!localStorage.getItem(eveningKey)) {
        sendLocalNotification('Sudah Rekap Keuangan? 📊', {
          body: 'Jangan lupa untuk rekap keuangan mu hari ini.',
        });
        localStorage.setItem(eveningKey, 'true');
      }
    }

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

  // Jalankan jadwal background sekali setiap kali scheduler dipanggil 
  // (untuk refresh trigger jadwal besoknya jika didukung)
  if (localStorage.getItem('notifications_enabled') === 'true') {
    scheduleBackgroundNotifications();
  }

  checkAndNotify();
  const intervalId = setInterval(checkAndNotify, 60000);
  return () => clearInterval(intervalId);
}
