import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { PaymentContext } from "../../context/PaymentContext";
import axios from "axios";
import { Check, Crown, Clock, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import PackageCheckoutModal from "../../components/PackageCheckoutModal";
import SubscriptionHistory from "../../components/SubscriptionHistory";
import { openLoginPortal } from "../../portals/LoginPortal";

const Package = () => {
  const { backendUrl, userData, isLoggedIn } = useContext(AppContext);
  const { activeSubscription, refreshAll, subscriptionHistory } = useContext(PaymentContext);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const audience = userData?.role === "employee" ? "employee" : "job-seeker";
        const { data } = await axios.get(`${backendUrl}/api/admin/packages/${audience}`);
        if (data.success) {
          const activePackages = data.packages
            .filter(pkg => pkg.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder);
          setPackages(activePackages);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [backendUrl, userData]);

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    PKR: "Rs",
    INR: "₹",
    AED: "AED",
  };

  const getRecommendedIndex = () => {
    if (packages.length === 0) return -1;
    if (packages.length === 1) return 0;
    if (packages.length === 2) return 1;
    return Math.floor(packages.length / 2);
  };

  const buildFeatures = (pkg) => {
    const allFeatures = [];

    if (userData?.role === "employee") {
      allFeatures.push(`${pkg.jobPostings} job posting${pkg.jobPostings !== 1 ? "s" : ""}`);
      if (pkg.featuredJobs > 0) {
        allFeatures.push(`${pkg.featuredJobs} featured job${pkg.featuredJobs !== 1 ? "s" : ""}`);
      }
      if (pkg.candidatesFollow > 0) {
        allFeatures.push(`Follow up to ${pkg.candidatesFollow} candidate${pkg.candidatesFollow !== 1 ? "s" : ""}`);
      }
      if (pkg.candidateAccess) allFeatures.push("Candidate database access");
      if (pkg.inviteCandidates) allFeatures.push("Can invite candidates");
      if (pkg.sendMessages) allFeatures.push("Can send messages");
      if (pkg.printProfiles) allFeatures.push("Can print candidate profiles");
      if (pkg.reviewComment) allFeatures.push("Can review and comment");
      if (pkg.viewCandidateInfo) allFeatures.push("Can view candidate information");
    } else {
      allFeatures.push(`${pkg.jobsToApply} job application${pkg.jobsToApply !== 1 ? "s" : ""}`);
      if (pkg.wishlistJobs > 0) {
        allFeatures.push(`${pkg.wishlistJobs} wishlist job${pkg.wishlistJobs !== 1 ? "s" : ""}`);
      }
      if (pkg.followCompanies > 0) {
        allFeatures.push(`Follow up to ${pkg.followCompanies} compan${pkg.followCompanies !== 1 ? "ies" : "y"}`);
      }
      if (pkg.companyInJobs) allFeatures.push("Company in jobs view");
      if (pkg.companyInformation) allFeatures.push("Company information access");
    }

    allFeatures.push(`${pkg.support} support`);

    if (pkg.features && pkg.features.length > 0) {
      allFeatures.push(...pkg.features);
    }

    return allFeatures;
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleGetStarted = (pkg) => {
    if (!isLoggedIn) {
      openLoginPortal();
      return;
    }
    setSelectedPackage(pkg);
  };

  const handlePurchaseSuccess = () => {
    setSelectedPackage(null);
    refreshAll();
  };

  const recommendedIndex = getRecommendedIndex();
  const currencySymbol = currencySymbols[activeSubscription?.currency] || "$";

  return (
    <div className="rounded-xl w-full min-h-screen border border-gray-200 p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          {userData?.role === "employee" ? "Employer" : "Job Seeker"} Packages
        </h1>
        <p className="text-gray-500 mt-1">Choose the plan that fits your needs</p>
      </div>

      {activeSubscription && activeSubscription.packageSnapshot && (
        <div className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Crown className="text-green-600" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800 text-lg">Your Active Plan</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  <Check size={12} /> Active
                </span>
              </div>
              <p className="text-gray-600">
                You are subscribed to{" "}
                <span className="font-semibold text-gray-800">
                  {activeSubscription.packageSnapshot.name}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Plan Type</p>
              <p className="text-sm font-semibold text-gray-800 capitalize">
                {activeSubscription.type === "recurring" ? "Auto-renew" : "One-time"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Amount Paid</p>
              <p className="text-sm font-semibold text-gray-800">
                {currencySymbol}{activeSubscription.amount}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Purchased On</p>
              <p className="text-sm font-semibold text-gray-800">
                {formatDate(activeSubscription.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Valid From</p>
              <p className="text-sm font-semibold text-gray-800">
                {formatDate(activeSubscription.startDate)}
              </p>
            </div>
          </div>

          {activeSubscription.packageSnapshot.features?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">Included Features</p>
              <div className="flex flex-wrap gap-1.5">
                {activeSubscription.packageSnapshot.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white text-gray-700 px-2.5 py-1 rounded-full border border-green-200"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-[var(--primary-color)] rounded-full animate-spin" />
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No packages available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg, index) => {
            const isRecommended = index === recommendedIndex;
            const isFree = pkg.price === 0;
            const isCurrentPlan = activeSubscription?.packageId?._id?.toString() === pkg._id?.toString() ||
              activeSubscription?.packageId === pkg._id;
            const pkgCurrencySymbol = currencySymbols[pkg.currency] || pkg.currency;
            const allFeatures = buildFeatures(pkg);

            return (
              <div
                key={pkg._id}
                className={`relative rounded-xl border-2 transition-all hover:shadow-lg flex flex-col ${
                  isRecommended
                    ? "border-yellow-400 shadow-md"
                    : isCurrentPlan
                    ? "border-green-400"
                    : "border-gray-200 hover:border-gray-300"
                } bg-white`}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full shadow-sm">
                      Recommended
                    </span>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  <p className="text-[var(--primary-color)] font-bold uppercase text-sm mb-1">
                    {pkg.name}
                  </p>
                  <div className="flex items-baseline gap-1 mb-1">
                    {!isFree && (
                      <span className="text-lg text-gray-500">{pkgCurrencySymbol}</span>
                    )}
                    <span className="text-4xl font-bold text-gray-900">
                      {isFree ? "Free" : pkg.price}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 mb-4">
                    per {pkg.duration} {pkg.durationUnit}(s)
                  </span>

                  <div className="h-px bg-gray-100 mb-4" />

                  <div className="flex-1 space-y-2.5 mb-5 max-h-52 overflow-auto">
                    {allFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check
                          size={16}
                          className={`flex-shrink-0 mt-0.5 ${
                            isRecommended || isCurrentPlan
                              ? "text-[var(--primary-color)]"
                              : "text-green-600"
                          }`}
                        />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {isCurrentPlan ? (
                    <button className="w-full px-4 py-2.5 bg-green-100 text-green-700 rounded-lg font-semibold cursor-default">
                      <Check size={16} className="inline mr-2" />
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleGetStarted(pkg)}
                      className={`w-full px-4 py-2.5 rounded-lg font-semibold transition ${
                        isRecommended
                          ? "primary-btn"
                          : "border-2 border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white"
                      }`}
                    >
                      Get Started
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {subscriptionHistory.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Subscription History</h2>
          <SubscriptionHistory />
        </div>
      )}

      {selectedPackage && (
        <PackageCheckoutModal
          packageInfo={selectedPackage}
          onSuccess={handlePurchaseSuccess}
          onClose={() => setSelectedPackage(null)}
        />
      )}
    </div>
  );
};

export default Package;