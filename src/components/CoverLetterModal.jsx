import React from 'react';
import { MdCancel } from 'react-icons/md';
import { toast } from 'sonner';

const CoverLetterModal = ({
  isOpen,
  onClose,
  coverLetter,
  setCoverLetter,
  onApply
}) => {
  if (!isOpen) return null;


  return (
    <div data-aos="fade-up" data-aos-duration='500' className="fixed top-0 backdrop-blur-sm left-0 w-full h-screen flex items-center z-100 justify-center">
      <div className="w-[500px] relative bg-white shadow-2xl rounded-lg p-8">
        <span className="absolute top-4 right-4 cursor-pointer">
          <MdCancel onClick={onClose} />
        </span>
        <h1>
          Briefly Explain Your Self
        </h1>
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          name="coverLetter"
          className="w-full h-[50%] rounded-2xl resize-none p-4 border shadow-lg my-10"
          placeholder="Enter Your Brief Interest In the Job..."
          id="coverLetter"
        />
        <button onClick={onApply}>
          Apply
        </button>
      </div>
    </div>
  );
};

export default CoverLetterModal;
