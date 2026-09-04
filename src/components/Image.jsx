import { openImage } from "../portals/ImagePortalManager";

const Img = ({ src, w, h, style, onClick, willOpen = false }) => (
    <img
        src={src}
        alt={src}
        width={w}
        height={h}
        onClick={willOpen ? () => openImage(src) : onClick}
        loading="lazy"
        decoding="async"
        className={`${style} ${willOpen ? "cursor-pointer" : ""}`}
    />
);

export default Img;