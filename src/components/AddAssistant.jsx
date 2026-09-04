import React, { useContext, useState } from "react";
import { MdAssistant } from "react-icons/md";
import { toast } from "sonner";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FileText,
  UserCheck,
  Users,
  UserCircle,
  ClipboardCheck,
  Check,
  Building,
  Server,
} from "lucide-react";
import { AppContext } from "../context/AppContext";

const AddAssistant = () => {
  const { backendUrl } = useContext(AppContext)
  const [email, setEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: "blog",
      label: "Blog Manager",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      id: "emp-profile-req",
      label: "Employee Profile Requests",
      icon: <UserCircle className="w-6 h-6" />,
    },
    {
      id: "employee",
      label: "Employee Manager",
      icon: <Users className="w-6 h-6" />,
    },
    {
      id: "user",
      label: "User Manager",
      icon: <UserCheck className="w-6 h-6" />,
    },
    {
      id: "emp-approval-req",
      label: "Employee Approval Requests",
      icon: <ClipboardCheck className="w-6 h-6" />,
    },
    {
      id: "job-requests",
      label: "Job Requests",
      icon: <Building className="w-6 h-6" />,
    },
    {
      id: "cat-manager",
      label: "Category Manager",
      icon: <Server className="w-6 h-6" />,
    },
  ];

  const handleRoleToggle = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || selectedRoles.length === 0) {
      return toast.warn("Please provide email and select at least one role!");
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/add-assistant`,
        { email, roles: selectedRoles },
        // { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        setEmail("");
        setSelectedRoles([]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-full min-h-screen">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <MdAssistant size={28} className="text-[var(--primary-color)]" />
        Add Assistant
      </h1>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8 max-w-5xl">
        {/* Email Input */}
        <div>
          <label>
            Assistant Email
          </label>
          <input
            type="email"
            placeholder="Enter assistant's email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Role Selection */}
        <div>
          <label>
            Select Roles
          </label>
          <div className="grid sm:grid-cols-2 gap-8">
            {roles.map((role) => {
              const selected = selectedRoles.includes(role.id);
              return (
                <motion.div
                  key={role.id}
                  onClick={() => handleRoleToggle(role.id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full relative cursor-pointer p-6 rounded-2xl transition-all duration-300 border-2 border-gray-300 flex items-center justify-between ${selected
                    ? "ring-4 ring-white/30 "
                    : ""
                    }`}
                >
                  {/* Gradient Layer */}
                  <div
                    className={`absolute inset-0 bg-gray-50 rounded-2xl`}
                  ></div>

                  {/* Content */}
                  <div className="relative flex items-center gap-4 text-gray-600 z-10">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                      {role.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{role.label}</h4>
                      <span className="text-sm opacity-80">
                        Manage {role.label.toLowerCase()} tasks
                      </span>
                    </div>
                  </div>

                  {/* Floating Tick */}
                  {selected && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-3 -right-3 bg-white text-[var(--primary-color)]/80 border-4 border-[var(--primary-color)]/80 rounded-full w-8 h-8 flex items-center justify-center shadow-md z-999"
                    >
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`primary-btn ${loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-[var(--primary-color)]/90 hover:bg-[var(--primary-color)]"
              }`}
          >
            {loading ? "Adding..." : "Add Assistant"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAssistant;
