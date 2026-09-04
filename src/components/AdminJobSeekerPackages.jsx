import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "sonner";
import { Trash2, Edit, Power, Plus, X } from "lucide-react";
import CustomSelect from "./CustomSelect";
import DataTable from "./DataTable";

const AdminJobSeekerPackages = () => {
    const { backendUrl } = useContext(AppContext);
    const [packages, setPackages] = useState([]);
    const [filteredPackages, setFilteredPackages] = useState([]);

    const [selectedStatus, setSelectedStatus] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        currency: "USD",
        jobsToApply: "",
        wishlistJobs: "0",
        followCompanies: "0",
        companyInJobs: false,
        companyInformation: false,
        support: "Limited",
        packageType: "Standard",
        features: "",
        displayOrder: "0"
    });

    const getPackages = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/packages/job-seeker`);
            if (data.success) {
                setPackages(data.packages);
                setFilteredPackages(data.packages);
            }
        } catch (error) {
            console.error("Error fetching job seeker packages:", error);
            toast.error("Failed to fetch job seeker packages");
        }
    };

    useEffect(() => {
        getPackages();
    }, []);

    useEffect(() => {
        let filtered = [...packages];

        if (selectedStatus === "active") filtered = filtered.filter(p => p.isActive);
        if (selectedStatus === "inactive") filtered = filtered.filter(p => !p.isActive);

        if (sortOrder === "newest") filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (sortOrder === "oldest") filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        if (sortOrder === "price-low") filtered.sort((a, b) => a.price - b.price);
        if (sortOrder === "price-high") filtered.sort((a, b) => b.price - a.price);
        if (sortOrder === "a-z") filtered.sort((a, b) => a.name.localeCompare(b.name));
        if (sortOrder === "z-a") filtered.sort((a, b) => b.name.localeCompare(a.name));

        setFilteredPackages(filtered);
        setCurrentPage(1);
    }, [selectedStatus, sortOrder, packages]);

    const totalPackages = packages.length;
    const activePackages = packages.filter(p => p.isActive).length;
    const inactivePackages = totalPackages - activePackages;

    const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPackages = filteredPackages.slice(startIndex, endIndex);
    const startItem = filteredPackages.length === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(endIndex, filteredPackages.length);

    const openCreateModal = () => {
        setEditingPackage(null);
        setFormData({
            name: "",
            price: "",
            currency: "USD",
            jobsToApply: "",
            wishlistJobs: "0",
            followCompanies: "0",
            companyInJobs: false,
            companyInformation: false,
            support: "Limited",
            packageType: "Standard",
            features: "",
            displayOrder: "0"
        });
        setIsModalOpen(true);
    };

    const openEditModal = (pkg) => {
        setEditingPackage(pkg);
        setFormData({
            name: pkg.name,
            price: pkg.price.toString(),
            currency: pkg.currency,
            jobsToApply: pkg.jobsToApply.toString(),
            wishlistJobs: (pkg.wishlistJobs || 0).toString(),
            followCompanies: (pkg.followCompanies || 0).toString(),
            companyInJobs: pkg.companyInJobs || false,
            companyInformation: pkg.companyInformation || false,
            support: pkg.support || "Limited",
            packageType: pkg.packageType || "Standard",
            features: pkg.features.join("\n"),
            displayOrder: pkg.displayOrder.toString()
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            name: formData.name,
            price: formData.packageType === "Free" ? 0 : parseFloat(formData.price),
            currency: formData.currency,
            jobsToApply: parseInt(formData.jobsToApply),
            wishlistJobs: parseInt(formData.wishlistJobs),
            followCompanies: parseInt(formData.followCompanies),
            companyInJobs: formData.companyInJobs,
            companyInformation: formData.companyInformation,
            support: formData.support,
            packageType: formData.packageType,
            features: formData.features.split("\n").filter(f => f.trim()),
            displayOrder: parseInt(formData.displayOrder)
        };

        try {
            if (editingPackage) {
                const { data } = await axios.patch(`${backendUrl}/api/admin/packages/job-seeker/${editingPackage._id}`, payload);
                if (data.success) {
                    toast.success(data.message);
                    await getPackages();
                    setIsModalOpen(false);
                }
            } else {
                const { data } = await axios.post(`${backendUrl}/api/admin/packages/job-seeker`, payload);
                if (data.success) {
                    toast.success(data.message);
                    await getPackages();
                    setIsModalOpen(false);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Operation failed");
        }
    };

    const deletePackage = async (id, name) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const { data } = await axios.delete(`${backendUrl}/api/admin/packages/job-seeker/${id}`);
            if (data.success) {
                toast.success(data.message);
                await getPackages();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Delete failed");
        }
    };

    const toggleStatus = async (id) => {
        try {
            const { data } = await axios.patch(`${backendUrl}/api/admin/packages/job-seeker/${id}/toggle-status`);
            if (data.success) {
                toast.success(data.message);
                await getPackages();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Operation failed");
        }
    };

    return (
        <div className="rounded-xl w-full min-h-screen border border-gray-200 p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800">
                    Manage Job Seeker Packages
                </h1>
                <button onClick={openCreateModal} className="primary-btn">
                    <Plus size={20} />
                    Create Package
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border border-blue-200">
                    <p className="text-gray-600 font-medium">Total Packages</p>
                    <h2 className="text-3xl font-bold text-blue-600 mt-1">{totalPackages}</h2>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
                    <p className="text-gray-600 font-medium">Active Packages</p>
                    <h2 className="text-3xl font-bold text-green-600 mt-1">{activePackages}</h2>
                </div>
                <div className="p-6 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border border-red-200">
                    <p className="text-gray-600 font-medium">Inactive Packages</p>
                    <h2 className="text-3xl font-bold text-red-600 mt-1">{inactivePackages}</h2>
                </div>
            </div>

            <div className="mb-6 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2">
                    <CustomSelect value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </CustomSelect>

                    <CustomSelect value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="a-z">A-Z</option>
                        <option value="z-a">Z-A</option>
                    </CustomSelect>
                </div>
            </div>

            <DataTable
                columns={[
                    { header: 'Package Name', key: 'name', className: 'font-semibold text-gray-800' },
                    { header: 'Price', render: (pkg) => `${pkg.currency} ${pkg.price.toLocaleString()}` },
                    {
                        header: 'Jobs to Apply',
                        headerClassName: 'text-center',
                        className: 'text-center',
                        render: (pkg) => (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{pkg.jobsToApply}</span>
                        ),
                    },
                    {
                        header: 'Features',
                        headerClassName: 'text-center',
                        className: 'text-center',
                        render: (pkg) => (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">{pkg.features.length}</span>
                        ),
                    },
                    {
                        header: 'Status',
                        headerClassName: 'text-center',
                        className: 'text-center',
                        render: (pkg) => (
                            <span className={`px-3 py-1 text-xs rounded-full font-semibold ${pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {pkg.isActive ? 'Active' : 'Inactive'}
                            </span>
                        ),
                    },
                    {
                        header: 'Actions',
                        headerClassName: 'text-center',
                        className: 'text-center',
                        render: (pkg) => (
                            <div className="flex justify-center items-center gap-4">
                                <button onClick={() => openEditModal(pkg)} className="cursor-pointer text-blue-500 hover:text-blue-700 transition" title="Edit">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => deletePackage(pkg._id, pkg.name)} className="cursor-pointer text-red-500 hover:text-red-700 transition" title="Delete">
                                    <Trash2 size={18} />
                                </button>
                                <button onClick={() => toggleStatus(pkg._id)} className={`cursor-pointer transition ${pkg.isActive ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'}`} title={pkg.isActive ? 'Deactivate' : 'Activate'}>
                                    <Power size={18} />
                                </button>
                            </div>
                        ),
                    },
                ]}
                data={currentPackages}
                loading={false}
                emptyMessage="No job seeker packages found."
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={itemsPerPage}
                onPageSizeChange={setItemsPerPage}
                startItem={startItem}
                endItem={endItem}
                totalItems={filteredPackages.length}
            />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingPackage ? "Edit Job Seeker Package" : "Create New Job Seeker Package"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Package Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price {formData.packageType !== "Free" && <span className="text-red-500">*</span>}
                                        {formData.packageType === "Free" && <span className="text-xs text-gray-500 ml-2">(Auto-set to 0)</span>}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.packageType === "Free" ? "0" : formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        min="0"
                                        step="0.01"
                                        disabled={formData.packageType === "Free"}
                                        required={formData.packageType !== "Free"}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                    <CustomSelect
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (EUR)</option>
                                        <option value="GBP">GBP (GBP)</option>
                                        <option value="PKR">PKR (Rs)</option>
                                        <option value="INR">INR (Rs)</option>
                                        <option value="AED">AED (AED)</option>
                                    </CustomSelect>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Jobs to Apply <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.jobsToApply}
                                        onChange={(e) => setFormData({ ...formData, jobsToApply: e.target.value })}
                                        placeholder="Number of jobs to apply"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Wishlist Jobs</label>
                                    <input
                                        type="number"
                                        value={formData.wishlistJobs}
                                        onChange={(e) => setFormData({ ...formData, wishlistJobs: e.target.value })}
                                        placeholder="Number of wishlist jobs"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Follow Companies</label>
                                    <input
                                        type="number"
                                        value={formData.followCompanies}
                                        onChange={(e) => setFormData({ ...formData, followCompanies: e.target.value })}
                                        placeholder="Number of companies to follow"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.displayOrder}
                                        onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                                        placeholder="Enter Display Order"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Support</label>
                                    <CustomSelect
                                        value={formData.support}
                                        onChange={(e) => setFormData({ ...formData, support: e.target.value })}
                                    >
                                        <option value="Limited">Limited</option>
                                        <option value="Full">Full</option>
                                    </CustomSelect>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Package Type</label>
                                    <CustomSelect
                                        value={formData.packageType}
                                        onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                                    >
                                        <option value="Free">Free</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Premium">Premium</option>
                                    </CustomSelect>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Package Features</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.companyInJobs}
                                            onChange={(e) => setFormData({ ...formData, companyInJobs: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Company in Jobs</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.companyInformation}
                                            onChange={(e) => setFormData({ ...formData, companyInformation: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Company Information</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Additional Features (one per line)
                                </label>
                                <textarea
                                    value={formData.features}
                                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    rows={5}
                                    placeholder="Feature 1\nFeature 2\nFeature 3"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-[var(--primary-color)] text-white rounded-md hover:opacity-90 transition"
                                >
                                    {editingPackage ? "Update Package" : "Create Package"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminJobSeekerPackages;
