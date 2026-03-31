import React, { createContext, useState, useEffect, useCallback } from 'react';
import API_BASE_URL from '../config';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const userId = localStorage.getItem("userId");
            if (userId) {
                const response = await fetch(`${API_BASE_URL}/api/extras/${userId}`, {
                    credentials: 'include',
                });
                if (!response.ok) {
                    localStorage.removeItem("userId");
                    setUser(null);
                    return;
                }
                const data = await response.json();
                setUser(data);
            }
        } catch (error) {
            console.error("Error fetching user data: ", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const logout = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (e) {
            // ignore
        }
        localStorage.removeItem('userId');
        setUser(null);
    };

    const refreshUser = () => {
        fetchUser();
    };

    return (
        <UserContext.Provider value={{ user, setUser, loading, logout, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};
