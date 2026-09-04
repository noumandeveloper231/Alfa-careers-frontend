import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Loader } from 'lucide-react';

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item?',
  itemName = 'Hello Guys',
  loading = false,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-9999 flex items-center justify-center p-4">
      <div className='bg-white/80 rounded-2xl shadow-2xl max-w-sm w-full backdrop-blur-sm'>
        <div data-aos-duration="300" className="p-6 pb-0">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <FaTrash className="text-red-500" size={24} />
            </div>
          </div>

          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">{title}</h2>

          <p className="text-gray-600 text-center mb-1">{message}</p>

          {itemName && (
            <p className="text-gray-900 font-semibold text-center text-lg mb-6">"{itemName}"</p>
          )}

        </div>
        <div className="flex p-4 bg-gray-50 rounded-b-2xl gap-3 justify-between">
          <button onClick={onClose} disabled={loading} className="secondary-btn w-full">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full px-6 py-2 justify-center font-medium tracking-wide rounded-full text-white bg-red-500 border-none outline-none cursor-pointer whitespace-nowrap flex items-center gap-2 hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? <Loader className="animate-spin" size={18} /> : <FaTrash size={16} />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
