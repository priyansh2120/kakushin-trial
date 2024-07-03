import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = localStorage.getItem("userId");
                if (userId) {
                    const response = await fetch(`http://localhost:5000/api/extras/${userId}`);
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    const data = await response.json();
                    setUser(data);
                }
            } catch (error) {
                setError(error.message);
                console.error("Error fetching user data: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);


    return (
        <UserContext.Provider value={{ user, loading, error }}>
            {children}
        </UserContext.Provider>
    );
};
