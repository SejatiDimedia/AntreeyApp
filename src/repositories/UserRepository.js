import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  getDocs,
  deleteDoc
} from 'firebase/firestore';

const USERS_COLLECTION = 'users';

export const UserRepository = {
  /**
   * Create or update a user profile
   */
  async saveUserProfile(userId, data) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const payload = {
        id: userId,
        ...data,
        cancelCount: data.cancelCount || 0,
        createdAt: data.createdAt || new Date().toISOString()
      };
      // Ensures name, email, and role are present in data
      await setDoc(userRef, payload, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  },

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  async getAllUsers() {
    try {
      const snapshot = await getDocs(collection(db, USERS_COLLECTION));
      return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  async getCustomersByBusiness(businessId) {
    try {
      const membersSnapshot = await getDocs(collection(db, `businesses/${businessId}/customers`));
      const bookingByCustomer = new Map();
      const customerIds = membersSnapshot.docs.map((item) => item.id);

      const bookingsSnapshot = await getDocs(collection(db, `businesses/${businessId}/bookings`));

      bookingsSnapshot.forEach((item) => {
        const data = item.data();
        if (!data?.customerId) return;
        bookingByCustomer.set(data.customerId, (bookingByCustomer.get(data.customerId) || 0) + 1);
      });

      const users = await Promise.all(
        customerIds.map(async (customerId) => {
          const userSnap = await getDoc(doc(db, USERS_COLLECTION, customerId));
          if (!userSnap.exists()) return null;
          return {
            id: userSnap.id,
            ...userSnap.data(),
            bookings: bookingByCustomer.get(customerId) || 0
          };
        })
      );

      return users.filter(Boolean);
    } catch (error) {
      console.error('Error getting customers by business:', error);
      throw error;
    }
  },

  async getCustomerMembershipMap(businessId) {
    try {
      const membersSnapshot = await getDocs(collection(db, `businesses/${businessId}/customers`));
      const map = new Map();
      membersSnapshot.forEach((item) => {
        map.set(item.id, { id: item.id, ...item.data() });
      });
      return map;
    } catch (error) {
      console.error('Error getting customer membership map:', error);
      throw error;
    }
  },

  async getCustomersByBusinessIds(businessIds = []) {
    try {
      if (!Array.isArray(businessIds) || businessIds.length === 0) return [];

      const customerIdSet = new Set();
      await Promise.all(
        businessIds.map(async (businessId) => {
          const membersSnapshot = await getDocs(collection(db, `businesses/${businessId}/customers`));
          membersSnapshot.forEach((item) => customerIdSet.add(item.id));
        })
      );

      const customerIds = Array.from(customerIdSet);
      const users = await Promise.all(
        customerIds.map(async (customerId) => {
          const userSnap = await getDoc(doc(db, USERS_COLLECTION, customerId));
          if (!userSnap.exists()) return null;
          return { id: userSnap.id, ...userSnap.data() };
        })
      );

      return users.filter(Boolean);
    } catch (error) {
      console.error('Error getting customers by business ids:', error);
      throw error;
    }
  },

  async assignCustomerToBusiness(businessId, customerId, assignedBy) {
    try {
      const customerRef = doc(db, `businesses/${businessId}/customers`, customerId);
      await setDoc(customerRef, {
        customerId,
        assignedBy: assignedBy || null,
        assignedAt: new Date().toISOString()
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error assigning customer to business:', error);
      throw error;
    }
  },

  async getCustomerBusinessMemberships(customerId, ownerBusinessIds = []) {
    try {
      const memberships = await Promise.all(
        ownerBusinessIds.map(async (businessId) => {
          const snap = await getDoc(doc(db, `businesses/${businessId}/customers`, customerId));
          return snap.exists() ? businessId : null;
        })
      );
      return memberships.filter(Boolean);
    } catch (error) {
      console.error('Error getting customer business memberships:', error);
      throw error;
    }
  },

  async removeCustomerFromBusiness(businessId, customerId) {
    try {
      await deleteDoc(doc(db, `businesses/${businessId}/customers`, customerId));
      return { success: true };
    } catch (error) {
      console.error('Error removing customer from business:', error);
      throw error;
    }
  },

  async updateUserRole(userId, role) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, { role });
      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  async updateUserProfile(userId, data) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, data);
      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  async deleteUser(userId) {
    try {
      await deleteDoc(doc(db, USERS_COLLECTION, userId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};
