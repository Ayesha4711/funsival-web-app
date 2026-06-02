importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyCB2zskpU2qWhVmMHnUGCUutN0i5RNZYKQ",
  authDomain: "funsival-dev.firebaseapp.com",
  projectId: "funsival-dev",
  storageBucket: "funsival-dev.firebasestorage.app",
  messagingSenderId: "274300639700",
  appId: "1:274300639700:web:7e85432c8b16b7fba9de41",
});

const messaging = firebase.messaging();

// Handle background / app-closed push notifications
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification ?? {};
  self.registration.showNotification(title ?? "New message", {
    body: body ?? "",
    icon: icon ?? "/favicon.png",
    data: payload.data ?? {},
  });
});
