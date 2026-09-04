import React from 'react';

// 1. Define the custom rotation keyframes
// The final rotation is changed from 360deg to 1800deg (5 full rotations).
const FIVE_ROTATIONS_KEYFRAMES = `
@keyframes custom-spinner-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(1800deg); } /* 5 x 360 degrees */
}
`;

// 2. Define the custom style for the aggressive timing
// This cubic-bezier forces the majority of the movement (the 1800deg) into the middle of the duration.
const AGGRESSIVE_EASING = 'cubic-bezier(0.8, 0.2, 0.2, 0.8)';
const ANIMATION_DURATION = '1.4s'; // A slightly longer duration helps visually track the multiple spins.

const Loading = () => {
    // The primary color from the image (a deep teal/green)
    const primaryColor = 'hsl(165, 59%, 30%)';

    const spinnerStyle = {
        // Animation runs for 2.5 seconds, using the aggressive timing, and repeats infinitely.
        animation: `custom-spinner-rotate ${ANIMATION_DURATION} ${AGGRESSIVE_EASING} infinite`,
    };

    return (
        <div className="flex items-center justify-center h-screen">
            {/* Inject keyframes (Ensure these are globally available in your actual project setup) */}
            <style>
                {FIVE_ROTATIONS_KEYFRAMES}
            </style>

            <div
                className="relative w-10 h-10" // Spinner size
                style={spinnerStyle}
            >
                {/* Top-left quarter circle */}
                <div
                    className="absolute top-0 left-0 w-1/2 h-1/2 rounded-tl-full"
                    style={{ backgroundColor: primaryColor }}
                ></div>

                {/* Bottom-right quarter circle */}
                <div
                    className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-br-full"
                    style={{ backgroundColor: primaryColor }}
                ></div>
            </div>
        </div>
    );
};

export default Loading;