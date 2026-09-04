import React, { useContext } from "react";
import { PaymentContext } from "../context/PaymentContext";
import { Check, ExternalLink, Clock, XCircle, AlertCircle } from "lucide-react";

const StatusBadge = ({ status }) => {
  const config = {
    active: { bg: "bg-green-100", text: "text-green-700", icon: Check, label: "Active" },
    pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "Pending" },
    failed: { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Failed" },
    cancelled: { bg: "bg-gray-100", text: "text-gray-600", icon: XCircle, label: "Cancelled" },
    expired: { bg: "bg-orange-100", text: "text-orange-700", icon: AlertCircle, label: "Expired" },
  };

  const { bg, text, icon: Icon, label } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

const SubscriptionHistory = ({ compact = false }) => {
  const { subscriptionHistory, loading } = useContext(PaymentContext);

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    PKR: "Rs",
    INR: "₹",
    AED: "AED",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-[var(--primary-color)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!subscriptionHistory || subscriptionHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No subscriptions yet</p>
        <p className="text-sm text-gray-400 mt-1">Your subscription history will appear here</p>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {subscriptionHistory.slice(0, 3).map((sub) => {
          const snapshot = sub.packageSnapshot || {};
          const currencySymbol = currencySymbols[sub.currency] || sub.currency;

          return (
            <div key={sub._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{snapshot.name}</p>
                <p className="text-xs text-gray-500">{formatDate(sub.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-800">{currencySymbol}{sub.amount}</span>
                <StatusBadge status={sub.status} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptionHistory.map((sub) => {
        const snapshot = sub.packageSnapshot || {};
        const currencySymbol = currencySymbols[sub.currency] || sub.currency;

        return (
          <div key={sub._id} className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-800">{snapshot.name}</h4>
                    <StatusBadge status={sub.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {sub.type === "recurring" ? "Auto-renew" : "One-time"} • {snapshot.duration} {snapshot.durationUnit}(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">
                    {currencySymbol}{sub.amount}
                  </p>
                  <p className="text-xs text-gray-400">{sub.currency}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">Invoice #</p>
                  <p className="text-sm text-gray-700 font-mono">{sub.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">Purchased</p>
                  <p className="text-sm text-gray-700">{formatDate(sub.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">Start Date</p>
                  <p className="text-sm text-gray-700">{formatDate(sub.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">Plan Type</p>
                  <p className="text-sm text-gray-700 capitalize">{sub.type === "recurring" ? "Auto-renew" : "One-time"}</p>
                </div>
              </div>

              {sub.packageSnapshot?.features?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 uppercase font-medium mb-1">Included Features</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sub.packageSnapshot.features.slice(0, 4).map((feat, idx) => (
                      <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {feat}
                      </span>
                    ))}
                    {sub.packageSnapshot.features.length > 4 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        +{sub.packageSnapshot.features.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                {sub.stripeInvoiceUrl && (
                  <a
                    href={sub.stripeInvoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary-color)] hover:underline"
                  >
                    <ExternalLink size={14} />
                    View Invoice
                  </a>
                )}
                {sub.receiptUrl && (
                  <a
                    href={sub.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800"
                  >
                    <ExternalLink size={14} />
                    Download Receipt
                  </a>
                )}
                {sub.paymentMethod?.last4 && (
                  <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    •••• {sub.paymentMethod.last4}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SubscriptionHistory;