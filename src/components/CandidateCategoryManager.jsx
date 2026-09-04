import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "sonner";
import { Plus, Trash2, Search, Upload, Download, Check, Edit, FileSpreadsheet } from "lucide-react";
import slugify from "slugify";
import * as XLSX from "xlsx";
import DataTable from "./DataTable";

/**
 * CandidateCategoryManager – simple admin UI to manage candidate categories.
 * Features: list, search, add, delete, bulk import categories.
 */
const CandidateCategoryManager = () => {
  const { backendUrl } = useContext(AppContext);

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/candidate-categories`);
      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error(data.message || "Failed to fetch categories");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/candidate-categories`, {
        name,
        slug: slugify(name, { lower: true }),
      });
      if (data.success) {
        toast.success(`Category "${name}" added`);
        setNewCategory("");
        fetchCategories();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/admin/candidate-categories/${id}`);
      if (data.success) {
        toast.success(data.message);
        fetchCategories();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Handle Excel file upload and parsing
  const handleExcelImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    setImporting(true);
    setImportResults(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const parsedCategories = parseExcelData(jsonData);

          if (parsedCategories.length === 0) {
            toast.error("No valid category data found in the Excel file");
            setImporting(false);
            return;
          }

          const response = await axios.post(
            `${backendUrl}/api/admin/candidate-categories/bulk-import`,
            { categories: parsedCategories }
          );

          if (response.data.success) {
            setImportResults(response.data.results);
            toast.success(response.data.message);
            fetchCategories();
          } else {
            toast.error(response.data.error || "Import failed");
          }
        } catch (parseError) {
          console.error("Excel parsing error:", parseError);
          toast.error("Error parsing Excel file. Please check the format.");
        } finally {
          setImporting(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("File reading error:", error);
      toast.error("Error reading the file");
      setImporting(false);
    }

    // Clear input
    event.target.value = "";
  };

  // Parse Excel data into categories format
  const parseExcelData = (jsonData) => {
    const categories = [];
    const startRow =
      jsonData.length > 0 &&
        typeof jsonData[0][0] === "string" &&
        jsonData[0][0].toLowerCase().includes("name")
        ? 1
        : 0;

    for (let i = startRow; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;
      const name = row[0]?.toString().trim();
      if (!name) continue;
      categories.push({ name, slug: slugify(name, { lower: true }) });
    }
    return categories;
  };

  // Download template
  const downloadTemplate = () => {
    const templateData = [["Name"]];
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
    worksheet["!cols"] = [{ width: 30 }];
    XLSX.writeFile(workbook, "candidate_categories_template.xlsx");
    toast.success("Template downloaded successfully!");
  };

  const exportData = () => {
    const data = [["Name"]];
    categories.forEach((c) => {
      data.push([c.name]);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
    worksheet["!cols"] = [{ width: 30 }];
    XLSX.writeFile(workbook, "candidate_categories_export.xlsx");
    toast.success("Data exported successfully!");
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Category Manager</h1>
      </div>

      {/* Add New */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Add New Category</h3>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name..."
          />
          <button
            onClick={handleAddCategory}
            className="primary-btn flex whitespace-nowrap items-center gap-2 justify-center sm:w-auto"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Excel Import Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Import from Excel</h3>
        <span className="text-gray-600 text-sm mb-4 block">
          Upload an Excel file to bulk import categories. Each row should contain a "Name" column.
        </span>

        <div className="flex flex-wrap gap-3 my-4">
          <button onClick={downloadTemplate} className="primary-btn">
            <Download className="w-4 h-4" />
            Download Template
          </button>

          <button onClick={exportData} className="bg-white text-[var(--primary-color)] px-4 !py-2 rounded-3xl hover:bg-[var(--primary-color)] hover:!text-white transition-colors !flex items-center gap-2 !mb-0 !border !border-[var(--primary-color)]">
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
          <div className="flex items-center gap-3 p-3 bg-[var(--accent-color)] rounded-lg border border-[var(--primary-color)]">
            <div className="w-5 h-5 border-2 border-[var(--primary-color)]/20 border-t-[var(--primary-color)] rounded-full animate-spin"></div>
            <span className="text-[var(--primary-color)]">Processing Excel file...</span>
          </div>
        )}

        {importResults && (
          <div className="p-4 bg-[var(--accent-color)] rounded-lg border border-[var(--primary-color)]">
            <h4 className="font-semibold text-[var(--primary-color)] mb-2">Import Results:</h4>
            <div className="space-y-1 text-sm">
              <div className="text-green-700 flex items-center gap-2">
                <Check /> Created: {importResults.created}
              </div>
              {importResults.skipped !== undefined && (
                <div className="text-blue-700 flex items-center gap-2">
                  <Edit /> Skipped: {importResults.skipped}
                </div>
              )}
              {importResults.errors && importResults.errors.length > 0 && (
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

            {/* Search & Stats */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="relative w-full sm:max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search categories..."
                        className="!pl-10"
                    />
                </div>
                <div className="text-sm text-gray-500">{categories.length} categories total</div>
            </div>

            <DataTable
                columns={[
                    { header: 'Category', key: 'name', className: 'capitalize font-medium text-gray-900' },
                    {
                        header: 'Actions',
                        headerClassName: 'text-center',
                        className: 'text-center',
                        render: (cat) => (
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    onClick={() => handleDeleteCategory(cat._id, cat.name)}
                                    className="p-2 rounded-full hover:bg-red-50 transition-colors"
                                    title={`Delete category "${cat.name}"`}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                        ),
                    },
                ]}
                data={filteredCategories}
                loading={loading}
                loadingMessage="Loading categories..."
                emptyMessage="No categories found."
            />
    </div>
  );
};

export default CandidateCategoryManager;
