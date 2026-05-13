import { db } from '../config/firebase';
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc
} from 'firebase/firestore';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const NotificationRepository = {
  async createBusinessNotification(businessId, payload = {}) {
    if (!businessId) return { success: false };
    try {
      const ref = await addDoc(collection(db, `businesses/${businessId}/${NOTIFICATIONS_COLLECTION}`), {
        title: payload.title || 'Notification',
        message: payload.message || '',
        type: payload.type || 'general',
        bookingId: payload.bookingId || '',
        date: payload.date || '',
        read: false,
        createdAt: new Date().toISOString(),
        actorId: payload.actorId || '',
        actorName: payload.actorName || ''
      });
      return { id: ref.id, success: true };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  subscribeToBusinessNotifications(businessId, callback) {
    if (!businessId) return () => {};
    const q = query(
      collection(db, `businesses/${businessId}/${NOTIFICATIONS_COLLECTION}`),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, (error) => {
      console.error('Error listening to notifications:', error);
      callback([]);
    });
  },

  async markAsRead(businessId, notificationId) {
    if (!businessId || !notificationId) return { success: false };
    await updateDoc(doc(db, `businesses/${businessId}/${NOTIFICATIONS_COLLECTION}`, notificationId), {
      read: true,
      readAt: new Date().toISOString()
    });
    return { success: true };
  }
};
