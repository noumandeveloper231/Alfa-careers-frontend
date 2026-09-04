import React, { useEffect, useState } from 'react'

const AnimatedText = () => {
    const animatedTexts = ["Talents", "Dream Job"];
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);

            setTimeout(() => {
                setCurrentTextIndex((prevIndex) =>
                    prevIndex === animatedTexts.length - 1 ? 0 : prevIndex + 1
                );
                setIsAnimating(false);
            }, 400); // Half of the animation duration
        }, 2500); // Change every 2 seconds

        return () => clearInterval(interval);
    }, []);
    return (
        <span className={`text-[var(--primary-color)] inline-block transition-all duration-500 ease-in-out transform ${isAnimating
            ? 'opacity-0 scale-125'
            : 'opacity-100 scale-100'
            }`}>
            {animatedTexts[currentTextIndex]}
        </span>
    )
}

export default AnimatedText