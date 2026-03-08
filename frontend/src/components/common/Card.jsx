import React from 'react';

const Card = ({ children, title, description, badge, footer, className = '' }) => {
    return (
        <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 transition-all hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-none ${className}`}>
            {(title || badge) && (
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        {title && <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>}
                        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
                    </div>
                    {badge && <div>{badge}</div>}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
            {footer && (
                <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
