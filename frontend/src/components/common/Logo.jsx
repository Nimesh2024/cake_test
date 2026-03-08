import React from 'react';
import newLogo from '../../assets/new_logo.png';

const Logo = ({ className = '', showText = true, size = 'md', textClassName = '' }) => {
    const sizeClasses = {
        sm: 'h-8',
        md: 'h-10',
        lg: 'h-24',
        xl: 'h-32'
    };

    const textSizeClasses = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-4xl',
        xl: 'text-5xl'
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`relative ${sizeClasses[size] || sizeClasses.md} aspect-square`}>
                <img
                    src={newLogo}
                    alt="Nirosha Sweet House Logo"
                    className="h-full w-full object-contain transition-transform duration-500 hover:scale-110"
                />
            </div>
            {showText && (
                <h1 className={`font-black tracking-tight bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent ${textSizeClasses[size] || textSizeClasses.md} ${textClassName}`}>
                    Nirosha Sweet House
                </h1>
            )}
        </div>
    );
};

export default Logo;
