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
                // Verificar se o token contém informações de administrador
                // Por enquanto, vamos usar uma verificação simples baseada no token
                // Em um sistema real, isso seria verificado na API

                // Simular verificação de admin (pode ser expandido posteriormente)
                const tokenData = JSON.parse(atob(token.split('.')[1] || '{}'));
                const isUserAdmin = tokenData.role === 'admin' || tokenData.is_admin === true;

                setIsAdmin(isUserAdmin);
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