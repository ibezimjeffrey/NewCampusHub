import messaging from '@react-native-firebase/messaging';

// Check for permissions and request permission
const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
};

// Listen for background messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

// Request permission and handle messages
requestUserPermission().then(() => {
  messaging()
    .getToken()
    .then(token => {
      console.log('FCM Token:', token);
    });
});
