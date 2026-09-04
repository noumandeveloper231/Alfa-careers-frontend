import { createPortal } from 'react-dom';
import { useContext, useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import Img from '../components/Image';
import { AppContext } from '../context/AppContext';

let showImageFn;

export const openImage = (src) => {
    if (showImageFn) showImageFn(src);
};

const ImagePortalManager = () => {
    const [imageSrc, setImageSrc] = useState(null);
    const { backendUrl } = useContext(AppContext);

    useEffect(() => {
        showImageFn = setImageSrc;
        return () => {
            showImageFn = null;
        };
    }, []);

    if (!imageSrc) return null;

    return createPortal(
        <div
            className="fixed top-0 left-0 w-full h-screen flex items-center justify-center backdrop-blur-sm bg-black/70 z-9999"
            onClick={() => setImageSrc(null)}
        >
            <div className='z-51 absolute flex justify-end items-center px-6 top-0 left-0 w-full py-4 bg-black/30 gap-4'>
                <a href={`${backendUrl}/download?url=${encodeURIComponent(imageSrc)}`}>
                    <Download
                        className="cursor-pointer text-gray-300"
                        size={24}
                    />
                </a>
                <X
                    className="cursor-pointer text-gray-300"
                    size={24}
                    onClick={() => setImageSrc(null)}
                />
            </div>
            <div
                className="relative h-full w-[80%]"
                onClick={(e) => e.stopPropagation()}

            >
                <Img style={"h-full w-full rounded object-contain"} src={imageSrc} />
            </div>
        </div>,
        document.body
    );
};

export default ImagePortalManager;
