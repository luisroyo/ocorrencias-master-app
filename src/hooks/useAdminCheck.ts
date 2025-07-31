import { useState, useEffect } from 'react';

export const useAdminCheck = (token: string | null) => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!token) {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                // Por enquanto, permitir acesso para todos os usuários logados
                // TODO: Implementar verificação real de admin na API
                console.log('Token recebido:', token);
                setIsAdmin(true); // Temporariamente permitir acesso
            } catch (error) {
                console.error('Erro ao verificar status de administrador:', error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, [token]);

    return { isAdmin, loading };
}; 