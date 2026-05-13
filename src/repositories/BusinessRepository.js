import { db } from '../config/firebase';
import { 
  collection, 
  collectionGroup,
  doc, 
  getDoc, 
  addDoc,
  setDoc,
  getDocs,
  query,
  where,
  limit,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

const BUSINESSES_COLLECTION = 'businesses';
const isPermissionDenied = (error) => error?.code === 'permission-denied';

export const BusinessRepository = {
  /**
   * Get business profile by ID
   */
  async getBusiness(businessId) {
    try {
      const docRef = doc(db, BUSINESSES_COLLECTION, businessId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      if (!isPermissionDenied(error)) {
        console.error('Error getting business:', error);
      }
      throw error;
    }
  },

  /**
   * Get first public business (for customer-app fallback)
   */
  async getFirstPublicBusiness() {
    try {
      const businessesRef = collection(db, BUSINESSES_COLLECTION);
      const q = query(businessesRef, where('isPublic', '==', true), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const first = snapshot.docs[0];
      return { id: first.id, ...first.data() };
    } catch (error) {
      if (!isPermissionDenied(error)) {
        console.error('Error getting first public business:', error);
      }
      throw error;
    }
  },

  async getFirstBusiness() {
    try {
      const businessesRef = collection(db, BUSINESSES_COLLECTION);
      const q = query(businessesRef, limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const first = snapshot.docs[0];
      return { id: first.id, ...first.data() };
    } catch (error) {
      if (!isPermissionDenied(error)) {
        console.error('Error getting first business:', error);
      }
      throw error;
    }
  },

  async getBusinessesForCustomer(customerUid) {
    try {
      if (!customerUid) return [];
      const q = query(
        collectionGroup(db, 'customers'),
        where('customerId', '==', customerUid)
      );
      const membershipSnapshot = await getDocs(q);
      if (membershipSnapshot.empty) return [];

      const businessIds = membershipSnapshot.docs
        .map((memberDoc) => memberDoc.ref.parent.parent?.id)
        .filter(Boolean);

      const uniqueIds = Array.from(new Set(businessIds));
      const businesses = await Promise.all(uniqueIds.map((id) => this.getBusiness(id)));
      return businesses.filter(Boolean);
    } catch (error) {
      if (!isPermissionDenied(error)) {
        console.error('Error getting businesses for customer:', error);
      }
      throw error;
    }
  },

  async getBusinessesForMember(userId) {
    try {
      if (!userId) return [];
      const q = query(
        collectionGroup(db, 'members'),
        where('userId', '==', userId)
      );
      const membershipSnapshot = await getDocs(q);
      if (membershipSnapshot.empty) return [];

      const businessIds = membershipSnapshot.docs
        .map((memberDoc) => memberDoc.ref.parent.parent?.id)
        .filter(Boolean);

      const uniqueIds = Array.from(new Set(businessIds));
      const businesses = await Promise.all(uniqueIds.map((id) => this.getBusiness(id)));
      return businesses.filter(Boolean);
    } catch (error) {
      if (!isPermissionDenied(error)) {
        console.error('Error getting businesses for member:', error);
      }
      throw error;
    }
  },

  /**
   * Get all services for a business
   */
  async getServices(businessId) {
    try {
      const servicesRef = collection(db, `${BUSINESSES_COLLECTION}/${businessId}/services`);
      const snapshot = await getDocs(servicesRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      if (!isPermissionDenied(error)) {
        console.error('Error getting services:', error);
      }
      throw error;
    }
  },

  /**
   * Get all staff for a business
   */
  async getStaff(businessId) {
    try {
      const staffRef = collection(db, `${BUSINESSES_COLLECTION}/${businessId}/staff`);
      const snapshot = await getDocs(staffRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting staff:', error);
      throw error;
    }
  },

  async getResources(businessId) {
    try {
      const resourcesRef = collection(db, `${BUSINESSES_COLLECTION}/${businessId}/resources`);
      const snapshot = await getDocs(resourcesRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting resources:', error);
      throw error;
    }
  },

  /**
   * Create a new business
   */
  async createBusiness(businessData) {
    try {
      const docRef = await addDoc(collection(db, BUSINESSES_COLLECTION), businessData);
      return { id: docRef.id, ...businessData };
    } catch (error) {
      console.error('Error creating business:', error);
      throw error;
    }
  },

  /**
   * Add a service to a business
   */
  async addService(businessId, serviceData) {
    try {
      const docRef = await addDoc(collection(db, `${BUSINESSES_COLLECTION}/${businessId}/services`), serviceData);
      return { id: docRef.id, ...serviceData };
    } catch (error) {
      console.error('Error adding service:', error);
      throw error;
    }
  },

  /**
   * Add a staff member to a business
   */
  async addStaff(businessId, staffData) {
    try {
      const docRef = await addDoc(collection(db, `${BUSINESSES_COLLECTION}/${businessId}/staff`), staffData);
      return { id: docRef.id, ...staffData };
    } catch (error) {
      console.error('Error adding staff:', error);
      throw error;
    }
  },

  async upsertBusinessMember(businessId, userId, memberData = {}) {
    try {
      if (!businessId || !userId) return { success: false };
      const memberRef = doc(db, `${BUSINESSES_COLLECTION}/${businessId}/members`, userId);
      await setDoc(memberRef, {
        userId,
        status: 'active',
        roleInBusiness: 'staff',
        updatedAt: new Date().toISOString(),
        ...memberData
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error upserting business member:', error);
      throw error;
    }
  },

  async addResource(businessId, resourceData) {
    try {
      const docRef = await addDoc(collection(db, `${BUSINESSES_COLLECTION}/${businessId}/resources`), resourceData);
      return { id: docRef.id, ...resourceData };
    } catch (error) {
      console.error('Error adding resource:', error);
      throw error;
    }
  },

  /**
   * Update a service in a business
   */
  async updateService(businessId, serviceId, serviceData) {
    try {
      const serviceRef = doc(db, `${BUSINESSES_COLLECTION}/${businessId}/services`, serviceId);
      await updateDoc(serviceRef, serviceData);
      return { id: serviceId, ...serviceData };
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  /**
   * Delete a service from a business
   */
  async deleteService(businessId, serviceId) {
    try {
      const serviceRef = doc(db, `${BUSINESSES_COLLECTION}/${businessId}/services`, serviceId);
      await deleteDoc(serviceRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  },

  /**
   * Update a staff member in a business
   */
  async updateStaff(businessId, staffId, staffData) {
    try {
      const staffRef = doc(db, `${BUSINESSES_COLLECTION}/${businessId}/staff`, staffId);
      await updateDoc(staffRef, staffData);
      return { id: staffId, ...staffData };
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  },

  async updateResource(businessId, resourceId, resourceData) {
    try {
      const resourceRef = doc(db, `${BUSINESSES_COLLECTION}/${businessId}/resources`, resourceId);
      await updateDoc(resourceRef, resourceData);
      return { id: resourceId, ...resourceData };
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  },

  /**
   * Delete a staff member from a business
   */
  async deleteStaff(businessId, staffId) {
    try {
      const staffRef = doc(db, `${BUSINESSES_COLLECTION}/${businessId}/staff`, staffId);
      await deleteDoc(staffRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting staff:', error);
      throw error;
    }
  }
  ,
  async deleteResource(businessId, resourceId) {
    try {
      const resourceRef = doc(db, `${BUSINESSES_COLLECTION}/${businessId}/resources`, resourceId);
      await deleteDoc(resourceRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  },

  async updateBusinessProfile(businessId, data) {
    try {
      const businessRef = doc(db, BUSINESSES_COLLECTION, businessId);
      await updateDoc(businessRef, data);
      return { success: true };
    } catch (error) {
      console.error('Error updating business profile:', error);
      throw error;
    }
  }
};
