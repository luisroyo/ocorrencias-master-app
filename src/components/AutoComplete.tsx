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
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        // Se um item foi selecionado e o valor atual corresponde ao item selecionado, não buscar
        if (selectedItem && value === selectedItem[displayField]) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        // Se o usuário está editando um item já selecionado, verificar se é apenas adição de números
        if (selectedItem && value !== selectedItem[displayField]) {
            const selectedValue = selectedItem[displayField];
            
            // Verificar se o valor atual contém o valor selecionado + números/complementos
            const isAddingNumbers = value.startsWith(selectedValue) && 
                                  (value.length > selectedValue.length) &&
                                  /[0-9,-\s]/.test(value.substring(selectedValue.length));
            
            if (isAddingNumbers) {
                // Usuário está apenas adicionando números ao endereço selecionado
                // Não fazer busca, manter o item selecionado
                setSuggestions([]);
                setIsOpen(false);
                return;
            } else {
                // Usuário está editando o nome do endereço, resetar selectedItem
                setSelectedItem(null);
            }
        }

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
        }, 500); // Aumentei o debounce para 500ms

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, searchFunction, selectedItem, displayField]);

    const handleSelect = (item: any) => {
        setSelectedItem(item);
        onChange(item[displayField]);
        onSelect(item);
        setIsOpen(false);
        setSuggestions([]);
        // Limpar timeout para evitar busca após seleção
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
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
                value={value || ''}
                onChange={(e) => {
                    // Reset selected item when user starts typing again
                    if (selectedItem && e.target.value !== selectedItem[displayField]) {
                        setSelectedItem(null);
                    }
                    onChange(e.target.value);
                }}
                onBlur={handleBlur}
                onFocus={() => (value || '').length >= 2 && suggestions && suggestions.length > 0 && setIsOpen(true)}
                style={{
                    backgroundColor: '#F9F9F9',
                    color: '#333333',
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
                    zIndex: 9999,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    marginTop: '2px'
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