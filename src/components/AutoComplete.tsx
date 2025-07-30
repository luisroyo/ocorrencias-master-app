import React, { useState, useEffect, useRef } from 'react';
import { Input } from './Input';
import { colors } from '../theme/colors';

interface AutoCompleteProps {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    onSelect: (item: any) => void;
    searchFunction: (query: string) => Promise<any[]>;
    displayField: string;
    token?: string;
    style?: React.CSSProperties;
}

export const AutoComplete: React.FC<AutoCompleteProps> = ({
    placeholder,
    value,
    onChange,
    onSelect,
    searchFunction,
    displayField,
    token,
    style
}) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (value.length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        // Debounce para evitar muitas requisições
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const results = await searchFunction(value);
                setSuggestions(results);
                setIsOpen(results.length > 0);
            } catch (error) {
                console.error('Erro na busca:', error);
                setSuggestions([]);
                setIsOpen(false);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, searchFunction]);

    const handleSelect = (item: any) => {
        onChange(item[displayField]);
        onSelect(item);
        setIsOpen(false);
        setSuggestions([]);
    };

    const handleBlur = () => {
        // Delay para permitir clique nos itens
        setTimeout(() => {
            setIsOpen(false);
        }, 200);
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={handleBlur}
                onFocus={() => value.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
                style={{
                    backgroundColor: '#F9F9F9',
                    color: '#333',
                    fontSize: '16px',
                    borderRadius: '10px',
                    padding: '12px 15px',
                    border: '1px solid #E0E0E0',
                    width: '100%',
                    boxSizing: 'border-box',
                    position: 'relative',
                    ...style
                }}
            />

            {loading && (
                <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: colors.mutedText
                }}>
                    🔄
                </div>
            )}

            {isOpen && suggestions.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    {suggestions.map((item, index) => (
                        <div
                            key={item.id || index}
                            onClick={() => handleSelect(item)}
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                borderBottom: index < suggestions.length - 1 ? '1px solid #E0E0E0' : 'none',
                                color: '#333',
                                fontSize: '14px',
                                backgroundColor: '#FFFFFF'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#F5F5F5';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFFFFF';
                            }}
                        >
                            {item[displayField]}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 