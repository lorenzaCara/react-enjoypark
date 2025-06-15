import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";

const axiosContext = createContext();

const myaxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Accept': 'application/json'
    }
})

const AxiosProvider = ({children}) => {
    const navigate = useNavigate(); 
    const [ firstLoad, setFirstLoad ] = useState(false);

    useEffect(() => {
        myaxios.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if(token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, error => Promise.reject(error));
        
        myaxios.interceptors.response.use((response) => {
            return response;
        }, error => {
            console.log(error);
            if(error.status === 401) {
                //window.location.href = '/login'; avendo creato un hook e avendo inserito useNavigate nel mio hook adesso posso sostituire questa stringa con navigate
                localStorage.removeItem('token'); //rimuove il token dal localstorage perchè sennò se l'utente prova a fare il login mi crea un loop infinito
                localStorage.removeItem('user'); //rimuove lo user dal localstorage perchè sennò se l'utente prova a fare il login mi crea un loop infinito
                navigate('/login');
            }
            return Promise.reject(error)
        })

        /* return () => {
            myaxios.interceptors.request.eject(requestId);
            myaxios.interceptors.response.eject(responseId);
        } */
       setFirstLoad(true);
    }, [])

  return <axiosContext.Provider value = {myaxios}>
    {firstLoad ? children : null}
  </axiosContext.Provider>
}

export default AxiosProvider;

export const useAxios = () => {
    return useContext(axiosContext);
}