'use client';
// sanity-fix
// sanity-fix: Minimal stub for XpPopup to make @parel/core independent of web app
'use client';
import React from 'react';
export function XpPopup({ onComplete }) {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (onComplete)
                onComplete();
        }, 1600);
        return () => clearTimeout(timer);
    }, [onComplete]);
    return null; // No-op component
}