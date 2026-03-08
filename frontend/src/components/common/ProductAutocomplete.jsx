import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import Input from './Input';
import { Search, Loader2 } from 'lucide-react';

const ProductAutocomplete = ({
    onSelect,
    value,
    onChange,
    placeholder = "Search product...",
    label = "Product Name",
    required = false
}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (search) => {
        if (!search || search.length < 1) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.get('/products', {
                params: { search, status: 'Active' }
            });
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching suggestions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        onChange(e);
        fetchSuggestions(val);
    };

    const handleSelect = (product) => {
        onSelect(product);
        setShowSuggestions(false);
        setSuggestions([]);
        setActiveIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && activeIndex !== -1) {
            e.preventDefault();
            handleSelect(suggestions[activeIndex]);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <Input
                    label={label}
                    name="productName"
                    placeholder={placeholder}
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    required={required}
                    className="w-full"
                    autoComplete="off"
                />
                <div className="absolute right-4 top-[42px] flex items-center gap-2 text-gray-400">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </div>
            </div>

            {showSuggestions && (
                <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl max-h-60 overflow-auto py-2">
                    {suggestions.length > 0 ? (
                        suggestions.map((product, index) => (
                            <li
                                key={product._id}
                                className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${index === activeIndex
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200'
                                    }`}
                                onClick={() => handleSelect(product)}
                            >
                                <div>
                                    <div className="font-semibold">{product.productName}</div>
                                    <div className="text-xs text-gray-500">{product.category?.name || 'Other'}</div>
                                </div>
                                <div className="text-sm font-bold text-primary-500">
                                    Rs. {product.price}
                                </div>
                            </li>
                        ))
                    ) : !loading && (
                        <li className="px-4 py-3 text-sm text-gray-500 text-center">
                            No products found
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default ProductAutocomplete;
