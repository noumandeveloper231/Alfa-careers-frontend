import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";

// Cache for exchange rates with timestamp
const exchangeRateCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const RATE_LIMIT_DELAY = 1000; // 1 second delay between requests
let lastRequestTime = 0;

// Fallback exchange rates (approximate values)
const fallbackRates = {
  USD: { PKR: 280, EUR: 0.85, GBP: 0.73, INR: 83, CAD: 1.25, AUD: 1.35 },
  PKR: { USD: 0.0036, EUR: 0.003, GBP: 0.0026, INR: 0.3, CAD: 0.0045, AUD: 0.0048 },
  EUR: { USD: 1.18, PKR: 330, GBP: 0.86, INR: 98, CAD: 1.47, AUD: 1.59 },
  GBP: { USD: 1.37, PKR: 384, EUR: 1.16, INR: 114, CAD: 1.71, AUD: 1.85 },
  INR: { USD: 0.012, PKR: 3.37, EUR: 0.010, GBP: 0.0088, CAD: 0.015, AUD: 0.016 }
};

const Currency = ({ amount, from }) => {
  const { userData } = useContext(AppContext);
  const [converted, setConverted] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const userCurrency = userData?.currency || "USD";

  // Function to get cached rate or fetch new one
  const getExchangeRate = async (fromCurrency, toCurrency) => {
    const cacheKey = `${fromCurrency}-${toCurrency}`;
    const cached = exchangeRateCache.get(cacheKey);

    // Check if we have valid cached data
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.rate;
    }

    // Rate limiting - ensure we don't make requests too frequently
    const now = Date.now();
    if (now - lastRequestTime < RATE_LIMIT_DELAY) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - (now - lastRequestTime)));
    }

    try {
      lastRequestTime = Date.now();

      const res = await fetch(
        `https://v6.exchangerate-api.com/v6/18ef2ecc4add652d01ec96ce/latest/${fromCurrency}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (res.status === 429) {
        throw new Error('RATE_LIMIT');
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const rate = data?.conversion_rates?.[toCurrency];

      if (rate) {
        // Cache the successful result
        exchangeRateCache.set(cacheKey, {
          rate,
          timestamp: Date.now()
        });
        return rate;
      } else {
        throw new Error('RATE_NOT_FOUND');
      }
    } catch (err) {
      console.warn(`Currency API error for ${cacheKey}:`, err.message);

      // Use fallback rates if API fails
      const fallbackRate = fallbackRates[fromCurrency]?.[toCurrency];
      if (fallbackRate) {
        console.log(`Using fallback rate for ${cacheKey}: ${fallbackRate}`);
        return fallbackRate;
      }

      throw err;
    }
  };

  useEffect(() => {
    const convert = async () => {
      // Reset states
      setIsLoading(true);
      setError(null);

      // If same currency, no conversion needed
      if (from === userCurrency) {
        setConverted(amount);
        setIsLoading(false);
        return;
      }

      try {
        const rate = await getExchangeRate(from, userCurrency);
        setConverted(amount * rate);
        setError(null);
      } catch (err) {
        console.error("Currency conversion failed:", err.message);
        setError(err.message);

        // If all else fails, show original amount with currency
        setConverted(amount);
      } finally {
        setIsLoading(false);
      }
    };

    if (amount && from && userCurrency) {
      convert();
    } else {
      setIsLoading(false);
    }
  }, [amount, from, userCurrency]);

  // Loading state
  if (isLoading) {
    return <span className="text-gray-500">...</span>;
  }

  // Error state - show original amount
  if (error) {
    return (
      <span className="text-gray-600" title={`Conversion error: ${error}`}>
        {amount?.toLocaleString()} {from}
      </span>
    );
  }

  // Success state
  if (converted !== null) {
    return (
      <span>
        {Math.round(converted).toLocaleString()} {userCurrency}
      </span>
    );
  }

  // Fallback
  return <span className="text-gray-500">N/A</span>;
};

export default Currency;
