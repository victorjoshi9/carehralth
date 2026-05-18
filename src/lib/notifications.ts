import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";
import { supabase } from "./supabase";

export const requestNotificationPermission = async (userId: string) => {
  try {
    if (!messaging) return;
    
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BF2R2T2A4XG3B2X8X7X6X5X4X3X2X1X0A" // Placeholder, in real apps users provide this
      });
      
      if (token) {
        // Update user preference in Supabase
        await supabase
          .from('profiles')
          .update({ fcm_token: token, notifications_enabled: true })
          .eq('id', userId);
        
        return token;
      }
    }
  } catch (error) {
    console.error("Notification permission error:", error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
