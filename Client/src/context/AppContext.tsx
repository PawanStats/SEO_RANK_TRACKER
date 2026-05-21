import axios from "axios";
import type { AxiosInstance } from "axios";
import {createContext, useContext, useState, useEffect} from "react";

interface User {
    id: string;
    name: string;
    email: string;
    plan: string;
    analysisCount: number;
}

interface AppContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    api: AxiosInstance;
    login: (email: string, password: string) => Promise<{success: boolean; message: string}>;
    register: (name: string, email: string, password: string) => Promise<{success: boolean; message: string}>;
    logout: () => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({children}: {children: React.ReactNode}) {
    const[ user, setUser] = useState<User | null>(null);
    const[ token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const[ loading, setLoading] = useState<boolean>(!!localStorage.getItem("token"));

   // Axios instance with base URL and auth header
    const api = axios.create({
        baseURL: BACKEND_URL,
    })

    //update axios headers when token changes
    api.interceptors.request.use((config)=>{
        const token = localStorage.getItem("token");
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    })

    const loadUser = async () => {
        try {
            const {data} = await api.get("/api/auth/user");
            if(data.success){
                setUser(data.user);
            }
        }catch (error) {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
        }       
        setLoading(false);    
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        if(token && !user) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [user]);

    const login = async (email: string, password: string) => {
        try {
            const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {email, password});
            if(res.data.success){
                setToken(res.data.token);
                setUser(res.data.user);
                localStorage.setItem("token", res.data.token);
                setLoading(false);
                return {success: true, message: res.data.message};
            }
            setLoading(false);
            return {success: false, message: res.data.message};
        }catch (error: any) {
            setLoading(false);
            return {success: false, message: error.response?.data?.message || "Login failed"};        
        }
    }


    const register = async (name: string, email: string, password: string) => {
        try {
            const res = await axios.post(`${BACKEND_URL}/api/auth/register`, {name, email, password});
            if(res.data.success){
                setToken(res.data.token);
                setUser(res.data.user);
                localStorage.setItem("token", res.data.token);
                setLoading(false);
                return {success: true, message: res.data.message};
            }
            setLoading(false);
            return {success: false, message: res.data.message};
        }catch (error: any) {
            setLoading(false);
            return {success: false, message: error.response?.data?.message || "Registration failed"};
        }
    }
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
    }   

    const value = {user, token, loading, api, login, register, logout};


    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export function useApp(){
    const context = useContext(AppContext);
    if(!context) throw new Error("useApp must be used within an AppProvider");
    return context;

}

