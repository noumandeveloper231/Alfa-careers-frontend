import React, { useState } from "react";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Loader2, Check, Star } from "lucide-react";
import { openLoginPortal } from "../portals/LoginPortal";
import StripeCheckout from "./StripeCheckout";

const PackageCheckoutModal = ({ packageInfo, onSuccess, onClose }) => {
  const { backendUrl, isLoggedIn } = useContext(AppContext);
  const [paymentType, setPaymentType] = useState("one-time");
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-xl w-full max-w-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Sign In Required</h3>
            <p className="text-gray-600 mb-6">
              Please sign in to purchase this package and unlock all features.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClose();
                  openLoginPortal();
                }}
                className="flex-1 primary-btn"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (checkoutData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Payment</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <X size={22} />
            </button>
          </div>
          <div className="p-4">
            <StripeCheckout
              clientSecret={checkoutData.clientSecret}
              packageInfo={packageInfo}
              type={paymentType}
              onSuccess={onSuccess}
              onCancel={() => setCheckoutData(null)}
            />
          </div>
        </div>
      </div>
    );
  }

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    PKR: "Rs",
    INR: "₹",
    AED: "AED",
  };
  const currencySymbol = currencySymbols[packageInfo.currency] || packageInfo.currency;

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/payment/create-intent`,
        {
          packageId: packageInfo._id,
          type: paymentType,
        },
        { withCredentials: true }
      );

      if (data.success) {
        setCheckoutData(data);
      } else {
        toast.error(data.message || "Failed to initialize payment");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Payment initialization failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Subscribe to {packageInfo.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
            <X size={22} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block bg-[var(--primary-color)] text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                  {packageInfo.packageType || "Standard"}
                </span>
                <h4 className="text-xl font-bold text-gray-800">{packageInfo.name}</h4>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-gray-500">{currencySymbol}</span>
                  <span className="text-3xl font-bold text-[var(--primary-color)]">{packageInfo.price}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {(packageInfo.features || []).slice(0, 5).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check size={16} className="text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
              {packageInfo.features?.length > 5 && (
                <p className="text-xs text-gray-500">+{packageInfo.features.length - 5} more features</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentType("one-time")}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  paymentType === "one-time"
                    ? "border-[var(--primary-color)] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-gray-800">One-time</div>
                <div className="text-sm text-gray-500">Pay once, lifetime access</div>
              </button>
              <button
                onClick={() => setPaymentType("recurring")}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  paymentType === "recurring"
                    ? "border-[var(--primary-color)] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">Auto-renew</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Popular</span>
                </div>
                <div className="text-sm text-gray-500">Billed every billing cycle</div>
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Subtotal</span>
              <span className="text-gray-800 font-medium">{currencySymbol}{packageInfo.price}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
              <span className="text-gray-800 font-semibold">Total</span>
              <span className="text-2xl font-bold text-[var(--primary-color)]">
                {currencySymbol}{packageInfo.price}
              </span>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full primary-btn flex items-center justify-center gap-2 py-3 text-base"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue to Payment
                <X size={18} />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Secure payment powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageCheckoutModal;