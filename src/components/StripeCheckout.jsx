import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Loader2 } from "lucide-react";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

const PaymentForm = ({ clientSecret, packageInfo, type, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const { backendUrl } = useContext(AppContext);

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    PKR: "Rs",
    INR: "₹",
    AED: "AED",
  };

  const currencySymbol = currencySymbols[packageInfo.currency] || packageInfo.currency;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (type === "one-time") {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${import.meta.env.VITE_FRONTEND_URL}/dashboard/package`,
          },
          redirect: "if_required",
        });

        if (error) {
          setErrorMessage(error.message);
          toast.error(error.message);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
          toast.success("Payment successful!");
          onSuccess();
        }
      } else {
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${import.meta.env.VITE_FRONTEND_URL}/dashboard/package`,
          },
          redirect: "if_required",
        });

        if (error) {
          setErrorMessage(error.message);
          toast.error(error.message);
        } else {
          toast.success("Payment method saved! Setting up auto-renew...");
          onSuccess();
        }
      }
    } catch (err) {
      setErrorMessage(err.message);
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 text-sm">Package</span>
          <span className="font-semibold text-gray-800">{packageInfo.name}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 text-sm">Type</span>
          <span className="font-medium text-gray-800">
            {type === "one-time" ? "One-time Payment" : "Auto-renew"}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-gray-700 font-medium">Total</span>
          <span className="text-2xl font-bold text-[var(--primary-color)]">
            {currencySymbol}{packageInfo.price}
          </span>
        </div>
        {type === "recurring" && (
          <p className="text-xs text-gray-500 mt-2">
            You will be charged {currencySymbol}{packageInfo.price} every billing cycle. Cancel anytime.
          </p>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 primary-btn flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>Pay {currencySymbol}{packageInfo.price}</>
          )}
        </button>
      </div>
    </form>
  );
};

const StripeCheckout = ({ clientSecret, packageInfo, type, onSuccess, onCancel }) => {
  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "var(--primary-color)",
      colorBackground: "#ffffff",
      colorText: "#1a1a1a",
      colorDanger: "#dc2626",
      fontFamily: "inherit",
      borderRadius: "8px",
      spacingUnit: "4px",
    },
    rules: {
      ".Input": {
        border: "1px solid #d1d5db",
        boxShadow: "none",
        padding: "10px 12px",
      },
      ".Input:focus": {
        border: "1px solid var(--primary-color)",
        boxShadow: "0 0 0 2px rgba(var(--primary-color-rgb, 59, 130, 246), 0.2)",
      },
      ".Label": {
        fontSize: "14px",
        fontWeight: "500",
        color: "#374151",
      },
      ".Tab": {
        border: "1px solid #d1d5db",
        boxShadow: "none",
      },
      ".Tab:hover": {
        boxShadow: "none",
      },
      ".Tab--selected": {
        border: "1px solid var(--primary-color)",
        boxShadow: "0 0 0 2px rgba(var(--primary-color-rgb, 59, 130, 246), 0.2)",
      },
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        clientSecret={clientSecret}
        packageInfo={packageInfo}
        type={type}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default StripeCheckout;