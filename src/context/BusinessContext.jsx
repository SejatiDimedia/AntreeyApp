import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { BusinessRepository } from '../repositories/BusinessRepository';

const BusinessContext = createContext();
const ACTIVE_BUSINESS_STORAGE_KEY = 'antreey_active_business_id';

export function useBusiness() {
  return useContext(BusinessContext);
}

export function BusinessProvider({ children }) {
  const { currentUser, role } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [activeBusinessId, setActiveBusinessId] = useState('');
  const [loading, setLoading] = useState(true);

  const selectBusiness = (businessId) => {
    setActiveBusinessId(businessId || '');
    if (businessId) {
      const selected = businesses.find((business) => business.id === businessId) || null;
      setActiveBusiness(selected);
    } else {
      setActiveBusiness(null);
    }
    if (businessId) {
      localStorage.setItem(ACTIVE_BUSINESS_STORAGE_KEY, businessId);
    } else {
      localStorage.removeItem(ACTIVE_BUSINESS_STORAGE_KEY);
    }
  };

  useEffect(() => {
    let cancelled = false;

    if (!currentUser) {
      setBusinesses([]);
      setActiveBusiness(null);
      setActiveBusinessId('');
      localStorage.removeItem(ACTIVE_BUSINESS_STORAGE_KEY);
      setLoading(false);
      return;
    }

    // Customer users are not expected to read owner-scoped business queries.
    if (role === 'customer') {
      setBusinesses([]);
      setActiveBusiness(null);
      setActiveBusinessId('');
      setLoading(false);
      return;
    }

    if (role === 'staff') {
      setLoading(true);
      BusinessRepository.getBusinessesForCustomer(currentUser.uid)
        .then((businessList) => {
          if (cancelled) return;
          setBusinesses(businessList);

          if (businessList.length === 0) {
            setActiveBusiness(null);
            setActiveBusinessId('');
            localStorage.removeItem(ACTIVE_BUSINESS_STORAGE_KEY);
            return;
          }

          const persistedId = localStorage.getItem(ACTIVE_BUSINESS_STORAGE_KEY);
          const preferredId = activeBusinessId || persistedId || businessList[0].id;
          const nextActive = businessList.find((business) => business.id === preferredId) || businessList[0];

          setActiveBusiness(nextActive);
          setActiveBusinessId(nextActive.id);
          localStorage.setItem(ACTIVE_BUSINESS_STORAGE_KEY, nextActive.id);
        })
        .catch((error) => {
          if (!cancelled) {
            console.error('Error loading staff businesses:', error);
            setBusinesses([]);
            setActiveBusiness(null);
            setActiveBusinessId('');
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    
    // Query for businesses where the user is the owner
    // According to blueprint: ownerId matches user.uid
    const q = query(
      collection(db, 'businesses'),
      where('ownerId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const businessList = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        setBusinesses(businessList);

        const persistedId = localStorage.getItem(ACTIVE_BUSINESS_STORAGE_KEY);
        const preferredId = activeBusinessId || persistedId || businessList[0].id;
        const nextActive = businessList.find((business) => business.id === preferredId) || businessList[0];

        setActiveBusiness(nextActive);
        if (nextActive?.id !== activeBusinessId) {
          setActiveBusinessId(nextActive.id);
        }
        localStorage.setItem(ACTIVE_BUSINESS_STORAGE_KEY, nextActive.id);
      } else {
        setBusinesses([]);
        setActiveBusiness(null);
        setActiveBusinessId('');
        localStorage.removeItem(ACTIVE_BUSINESS_STORAGE_KEY);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error listening to businesses:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, role]);

  const value = {
    businesses,
    activeBusiness,
    activeBusinessId,
    selectBusiness,
    loading
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}
