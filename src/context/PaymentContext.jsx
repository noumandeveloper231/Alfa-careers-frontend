import { createContext, useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useContext } from "react";
import { AppContext } from "./AppContext";

export const PaymentContext = createContext();

export const PaymentContextProvider = ({ children }) => {
  const { backendUrl, isLoggedIn } = useContext(AppContext);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveSubscription = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/payment/subscription/active`, {
        withCredentials: true,
      });
      if (data.success) {
        setActiveSubscription(data.activeSubscription);
      }
    } catch (error) {
      console.error("Error fetching active subscription:", error);
    }
  }, [backendUrl, isLoggedIn]);

  const fetchSubscriptionHistory = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/payment/subscriptions`, {
        withCredentials: true,
      });
      if (data.success) {
        setSubscriptionHistory(data.subscriptions);
      }
    } catch (error) {
      console.error("Error fetching subscription history:", error);
    }
  }, [backendUrl, isLoggedIn]);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchActiveSubscription(), fetchSubscriptionHistory()]);
    setRefreshing(false);
  }, [fetchActiveSubscription, fetchSubscriptionHistory]);

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      Promise.all([fetchActiveSubscription(), fetchSubscriptionHistory()])
        .finally(() => setLoading(false));
    } else {
      setActiveSubscription(null);
      setSubscriptionHistory([]);
    }
  }, [isLoggedIn, fetchActiveSubscription, fetchSubscriptionHistory]);

  const value = useMemo(() => ({
    activeSubscription,
    subscriptionHistory,
    loading,
    refreshing,
    fetchActiveSubscription,
    fetchSubscriptionHistory,
    refreshAll,
  }), [activeSubscription, subscriptionHistory, loading, refreshing, fetchActiveSubscription, fetchSubscriptionHistory, refreshAll]);

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};