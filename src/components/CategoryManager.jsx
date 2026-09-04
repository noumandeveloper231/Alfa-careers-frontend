import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { Plus, Trash2, Tag, FolderPlus, Upload, FileSpreadsheet, Download, Search, Check, Edit } from 'lucide-react';
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { categoryIconOptions, getCategoryIcon } from "../utils/categoryIcons";
import slugify from "slugify";
import DataTable from './DataTable';

import { ChevronDown } from "lucide-react";

const IconSelect = ({ value, onChange, className }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption =
        categoryIconOptions.find((option) => option.value === value) ||
        categoryIconOptions[0];

    return (
        <div
            ref={dropdownRef}
            className={`relative text-sm ${className || ""}`}
        >
            {/* SELECT BUTTON */}
            <div
                onClick={() => setOpen(!open)}
                className="capitalize w-full flex items-center justify-between px-6 py-2.5 border border-gray-300 rounded-md cursor-pointer"
            >
                <span className="flex items-center gap-2 truncate">
                    {React.createElement(selectedOption.icon, {
                        size: 18,
                        className: "text-[var(--primary-color)]",
                    })}
                    <span className={value ? "text-gray-800" : "text-gray-700"}>
                        {selectedOption.label}
                    </span>
                </span>

                <ChevronDown
                    size={18}
                    className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""
                        }`}
                />
            </div>

            {/* DROPDOWN */}
            {open && (
                <div className="absolute z-999 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-60 overflow-y-auto">
                    {categoryIconOptions.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setOpen(false);
                            }}
                            className={`
                flex items-center gap-3 px-4 py-2.5 cursor-pointer
                ${option.value === value
                                    ? "bg-[var(--accent-color)] text-[var(--primary-color)]"
                                    : "text-gray-700 hover:bg-[var(--accent-color)] hover:text-[var(--primary-color)]"
                                }
              `}
                        >
                            {React.createElement(option.icon, {
                                size: 18,
                            })}
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CategoryManager = () => {
    const { backendUrl } = useContext(AppContext);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [newSub, setNewSub] = useState({});
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importResults, setImportResults] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [newCategoryIcon, setNewCategoryIcon] = useState("Tag");
    const [iconSelections, setIconSelections] = useState({});

    // Fetch categories
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(backendUrl + "/api/admin/categories");
            if (data.success) {
                setCategories(data.categories);
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            TbContrast2Off.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleIconUpdate = async (categoryId) => {
        const icon = iconSelections[categoryId];
        try {
            const { data } = await axios.patch(backendUrl + `/api/admin/categories/${categoryId}`, { icon });
            if (data.success) {
                toast.success("Icon updated successfully");
                fetchCategories();
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to update icon");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        setIconSelections(() => {
            const map = {};
            categories.forEach(cat => {
                map[cat._id] = cat.icon || "Tag";
            });
            return map;
        });
    }, [categories]);

    console.log('categories', categories);

    const totalSubcategories = categories.reduce((total, cat) => total + (cat.subcategories?.length || 0), 0);

    const filteredCategories = categories.filter((cat) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        const nameMatch = cat.name.toLowerCase().includes(term);
        const subMatch = cat.subcategories?.some((sub) => sub.toLowerCase().includes(term));
        return nameMatch || subMatch;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage) || 1);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCategories = filteredCategories.slice(startIndex, endIndex);
    const startItem = filteredCategories.length === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(endIndex, filteredCategories.length);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);


    // Add category
    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            const { data } = await axios.post(backendUrl + "/api/admin/categories", { name: newCategory, icon: newCategoryIcon, slug: slugify(newCategory, { lower: true }) });
            if (data.success) {
                toast.success(data.message);
                setNewCategory("");
                setNewCategoryIcon("Tag");
                fetchCategories();
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Add subcategory
    const handleAddSubcategory = async (categoryId) => {
        const subName = newSub[categoryId];
        if (!subName || !subName.trim()) return;
        try {
            const { data } = await axios.post(backendUrl + `/api/admin/categories/${categoryId}/subcategories`, { subcategory: subName });
            if (data.success) {
                toast.success(data.message)
                setNewSub({ ...newSub, [categoryId]: "" });
                fetchCategories();
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Delete subcategory
    const handleDeleteSub = async (categoryId, subcategory) => {
        try {
            const { data } = await axios.post(
                backendUrl + `/api/admin/categories/${categoryId}/subcategories/remove`,
                { subcategory } // send subcategory in request body
            );
            if (data.success) {
                toast.success(data.message)
                fetchCategories(); // refresh categories after deletion
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Delete entire category
    const handleDeleteCategory = async (categoryId, categoryName) => {
        if (window.confirm(`Are you sure you want to delete the category "${categoryName}" and all its subcategories?`)) {
            try {
                await axios.delete(backendUrl + `/api/admin/categories/${categoryId}`);
                toast.success(`Category "${categoryName}" deleted successfully`);
                fetchCategories(); // refresh categories after deletion
            } catch (err) {
                console.error(err);
                toast.error('Failed to delete category');
            }
        }
    };

    // Handle Excel file upload and parsing
    const handleExcelImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a valid Excel file (.xlsx or .xls)');
            return;
        }

        setImporting(true);
        setImportResults(null);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    // Get the first worksheet
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];

                    // Convert to JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    // Parse the data
                    const parsedCategories = parseExcelData(jsonData);

                    if (parsedCategories.length === 0) {
                        toast.error('No valid category data found in the Excel file');
                        setImporting(false);
                        return;
                    }

                    // Send to backend
                    const response = await axios.post(
                        backendUrl + '/api/admin/categories/bulk-import',
                        { categories: parsedCategories }
                    );

                    if (response.data.success) {
                        setImportResults(response.data.results);
                        toast.success(response.data.message);
                        fetchCategories(); // Refresh the categories list
                    } else {
                        toast.error(response.data.error || 'Import failed');
                    }
                } catch (parseError) {
                    console.error('Excel parsing error:', parseError);
                    toast.error('Error parsing Excel file. Please check the format.');
                } finally {
                    setImporting(false);
                }
            };

            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('File reading error:', error);
            toast.error('Error reading the file');
            setImporting(false);
        }

        // Clear the input
        event.target.value = '';
    };

    // Parse Excel data into categories format
    const parseExcelData = (jsonData) => {
        const categories = [];

        // Skip header row if it exists
        const startRow = jsonData.length > 0 &&
            (typeof jsonData[0][0] === 'string' && jsonData[0][0].toLowerCase().includes('name')) ? 1 : 0;

        for (let i = startRow; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            const name = row[0]?.toString().trim();
            const icon = row[1]?.toString().trim() || "Tag";
            const subcategoriesStr = row[2]?.toString().trim() || "";

            if (!name) continue;

            // Split subcategories by comma
            const subcategories = subcategoriesStr
                ? subcategoriesStr.split(',').map(s => s.trim()).filter(Boolean)
                : [];

            categories.push({
                name,
                icon,
                subcategories,
                slug: slugify(name, { lower: true })
            });
        }

        return categories;
    };


    // Download Excel template
    const downloadTemplate = () => {
        const templateData = [
            ['Name', 'Icon', 'Subcategories']
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');

        worksheet['!cols'] = [
            { width: 25 },
            { width: 20 },
            { width: 60 }
        ];

        XLSX.writeFile(workbook, 'categories_template.xlsx');
        toast.success('Template downloaded successfully!');
    };

    const exportData = () => {
        const data = [
            ['Name', 'Icon', 'Subcategories']
        ];
        categories.forEach(cat => {
            data.push([
                cat.name,
                cat.icon || 'Tag',
                cat.subcategories ? cat.subcategories.join(', ') : ''
            ]);
        });
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');

        worksheet['!cols'] = [
            { width: 25 },
            { width: 20 },
            { width: 60 }
        ];

        XLSX.writeFile(workbook, 'categories_export.xlsx');
        toast.success('Data exported successfully!');
    };


    return (
        <div className="">
            <div className="">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Manager</h1>
                </div>

                {/* Add New Category */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Add New Category</h3>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 rounded-lg justify-between">
                        <div className="flex-1 flex gap-3">
                            <input
                                type="text"
                                value={newCategory}
                                placeholder="Enter category name..."
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 items-center">
                            <IconSelect value={newCategoryIcon} onChange={setNewCategoryIcon} className="flex-1" />
                        </div>
                        <button
                            onClick={handleAddCategory}
                            className="primary-btn"
                        >
                            <Plus className="w-4 h-4" />
                            Add Category
                        </button>
                    </div>

                </div>

                {/* Excel Import Section */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Import from Excel</h3>
                    <span className="text-gray-600 text-sm mb-4">
                        Upload an Excel file to bulk import categories and subcategories.
                        The file should have two columns: "Category Name" and "Subcategory Name".
                    </span>

                    <div className="flex flex-wrap gap-3 my-4">
                        <button
                            onClick={downloadTemplate}
                            className="primary-btn"
                        >
                            <Download className="w-4 h-4" />
                            Download Template
                        </button>

                        <button
                            onClick={exportData}
                            className="bg-white text-[var(--primary-color)] px-4 !py-2 rounded-3xl hover:bg-[var(--primary-color)] hover:!text-white transition-colors !flex items-center gap-2 !mb-0 !border !border-[var(--primary-color)]"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Export Data
                        </button>

                        <label className="bg-white text-[var(--primary-color)] px-4 !py-2 rounded-3xl hover:bg-[var(--primary-color)] hover:!text-white transition-colors !flex items-center gap-2 cursor-pointer !mb-0 !border !border-[var(--primary-color)]">
                            <Upload className="w-4 h-4" />
                            {importing ? 'Importing...' : 'Import Excel File'}
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleExcelImport}
                                disabled={importing}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {importing && (
                        <div className="flex items-center gap-3 p-3 bg-[var(--accent-color)] rounded-lg border border-[var(--accent-color)]">
                            <div className="w-5 h-5 border-2 border-[var(--primary-color)]/20 border-t-[var(--primary-color)] rounded-full animate-spin"></div>
                            <span className="text-[var(--primary-color)]">Processing Excel file...</span>
                        </div>
                    )}

                    {importResults && (
                        <div className="p-4 bg-[var(--accent-color)] rounded-lg border border-[var(--primary-color)]">
                            <h4 className="font-semibold text-[var(--primary-color)] mb-2">Import Results:</h4>
                            <div className="space-y-1 text-sm">
                                <div className="text-green-700 flex items-center gap-2">
                                    <Check /> Created: {importResults.created} categories
                                </div>
                                <div className="text-blue-700 flex items-center gap-2">
                                    <Edit /> Updated: {importResults.updated} categories
                                </div>
                                {importResults.errors.length > 0 && (
                                    <div className="text-red-700">
                                        ❌ Errors: {importResults.errors.length}
                                        <details className="mt-2">
                                            <summary className="cursor-pointer font-medium">View Errors</summary>
                                            <ul className="mt-2 space-y-1 pl-4">
                                                {importResults.errors.map((error, index) => (
                                                    <li key={index} className="text-xs">{error}</li>
                                                ))}
                                            </ul>
                                        </details>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Category Overview */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
                            <p className="text-gray-500 text-sm font-medium">Total Categories</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{categories.length}</p>
                        </div>
                        <div className="p-5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border border-blue-200">
                            <p className="text-gray-500 text-sm font-medium">Total Subcategories</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{totalSubcategories}</p>
                        </div>
                        <div className="p-5 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg border border-purple-200">
                            <p className="text-gray-500 text-sm font-medium">Last Import</p>
                            <p className="text-base font-semibold text-purple-600 mt-2">
                                {importResults
                                    ? `+${importResults.created} created / ${importResults.updated} updated`
                                    : "No imports yet"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Categories Table */}
                <div className="">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="relative w-full md:max-w-md">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search categories or subcategories..."
                                className="!pl-10"
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={[
                            { header: 'Category' },
                            { header: 'Subcategories' },
                            { header: 'Highlights' },
                            { header: 'Actions', headerClassName: 'text-center' },
                        ]}
                        data={currentCategories}
                        rowKey="_id"
                        loading={loading}
                        loadingMessage="Loading categories..."
                        emptyMessage="No categories match your search."
                        emptyIcon={() => <Tag className="w-10 h-10 text-gray-400" />}
                        renderRow={(cat) => (
                            <>
                                <tr className="border-t border-gray-200 hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                                {React.createElement(getCategoryIcon(cat.icon), { size: 22 })}
                                            </span>
                                            <div>
                                                <p className="capitalize font-semibold text-gray-900">{cat.name}</p>
                                                <p className="text-sm text-gray-500">{cat._id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full font-medium">
                                            {cat.subcategories.length} total
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {cat.subcategories.slice(0, 3).map((sub) => (
                                                <span key={sub} className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{sub}</span>
                                            ))}
                                            {cat.subcategories.length > 3 && (
                                                <span className="px-3 py-1 rounded-full text-xs bg-gray-200 text-gray-600">+{cat.subcategories.length - 3} more</span>
                                            )}
                                            {cat.subcategories.length === 0 && (
                                                <span className="text-sm text-gray-400">No subcategories yet</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button onClick={() => handleDeleteCategory(cat._id, cat.name)} className="p-2 rounded-full hover:bg-red-50 transition-colors" title={`Delete category "${cat.name}"`}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="bg-gray-50/60 border-t border-gray-200">
                                    <td colSpan={4} className="px-6 py-4">
                                        <div className="space-y-3">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Manage Subcategories</p>
                                            <div className="flex flex-wrap gap-2">
                                                {cat.subcategories.length > 0 ? (
                                                    cat.subcategories.map((sub) => (
                                                        <span key={sub} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-sm text-gray-700">
                                                            {sub}
                                                            <button onClick={() => handleDeleteSub(cat._id, sub)} className="text-red-500 hover:text-red-700" title="Remove subcategory">
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-400">No subcategories created yet.</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                                <div className="flex flex-1 gap-2 items-center">
                                                    <IconSelect value={iconSelections[cat._id] || cat.icon || "Tag"} onChange={(selectedValue) => setIconSelections({ ...iconSelections, [cat._id]: selectedValue })} className="flex-1" />
                                                    <button onClick={() => handleIconUpdate(cat._id)} className="secondary-btn">Save Icon</button>
                                                </div>
                                                <input type="text" value={newSub[cat._id] || ""} placeholder="Add new subcategory..." className="flex-1" onChange={(e) => setNewSub({ ...newSub, [cat._id]: e.target.value })} />
                                                <button onClick={() => handleAddSubcategory(cat._id)} className="primary-btn flex items-center gap-2">
                                                    <Plus className="w-4 h-4" />
                                                    Add Subcategory
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </>
                        )}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        pageSize={itemsPerPage}
                        onPageSizeChange={setItemsPerPage}
                        pageSizeOptions={[10, 25, 50, 100]}
                        startItem={startItem}
                        endItem={endItem}
                        totalItems={filteredCategories.length}
                    />
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;
