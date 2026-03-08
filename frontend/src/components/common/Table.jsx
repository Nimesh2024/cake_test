import React from 'react';

const Table = ({ headers, children }) => {
    return (
        <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-bottom border-gray-200 dark:border-gray-800">
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {children}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
