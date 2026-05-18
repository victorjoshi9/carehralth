importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC3hwKOXK9oNU_7VjNg951Tr_Ry5vA4SfA",
  authDomain: "divyamhospital-e6511.firebaseapp.com",
  projectId: "divyamhospital-e6511",
  storageBucket: "divyamhospital-e6511.firebasestorage.app",
  messagingSenderId: "611257127952",
  appId: "1:611257127952:web:1f9e9fa4902c65841a6695"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
