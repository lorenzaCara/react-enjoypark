import { createContext, useContext, useEffect, useState } => "react"
import { useAxios } from "./AxiosProvider"
import { useNavigate } from "react-router"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "@/lib/firebase"

const userContext = createContext({
  user: undefined,
  handleLogin: (data) => null,
  handleGoogleLogin: (response) => null,
  profileImage: undefined,
  profileImageUpdate: (file) => null,
  updateUserProfile: (data) => null,
  updateUserPassword: (data) => null,
  handleLogout: () => null,
  handleRegister: (data) => null,
  updatePassword: (data) => null,
  requestPasswordRecovery: (email) => null,
  isLoadingUser: false,
})

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(undefined)
  const [profileImage, setProfileImage] = useState("")
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const myaxios = useAxios()
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error)
        setUser(undefined)
      }
    }
    setIsLoadingUser(false)
  }, [])

  const profileImageUpdate = async (file) => {
    const formData = new FormData()
    formData.append("image", file)
    const res = await myaxios.post("/profile/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob",
    })
    setProfileImage(URL.createObjectURL(res.data))
  }

  const getProfileImage = async () => {
    try {
      const res = await myaxios.get("/profile/image", {
        responseType: "blob",
      })
      setProfileImage(URL.createObjectURL(res.data))
    } catch (error) {
      console.error("Errore durante il recupero dell'immagine:", error)
    }
  }

  // Nuova funzione per aggiornare i dati del profilo
  const updateUserProfile = async (profileData) => {
    try {
      const res = await myaxios.put("/profile/update", profileData)

      // Aggiorna l'utente nel state e nel localStorage
      const updatedUser = { ...user, ...profileData }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))

      return {
        success: true,
        message: res.data.message || "Profilo aggiornato con successo",
        user: updatedUser,
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento del profilo:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Errore durante l'aggiornamento del profilo",
      }
    }
  }

  // Nuova funzione per aggiornare la password dall'area profilo
  const updateUserPassword = async (passwordData) => {
    try {
      const res = await myaxios.put("/profile/password", passwordData)
      return {
        success: true,
        message: res.data.message || "Password aggiornata con successo",
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento della password:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Errore durante l'aggiornamento della password",
      }
    }
  }

  useEffect(() => {
    if (user) {
      getProfileImage()
    }
  }, [user])

  // Funzione helper per la logica di reindirizzamento condivisa
  const handlePostLoginRedirect = (loggedInUser) => {
    const redirectPathRaw = localStorage.getItem("redirectAfterLogin");
    if (redirectPathRaw) {
      try {
        const parsedPath = JSON.parse(redirectPathRaw);
        localStorage.removeItem("redirectAfterLogin"); // Pulisci dopo aver letto
        navigate(parsedPath.pathname + parsedPath.search, { replace: true });
        return; // Reindirizzato con successo
      } catch (e) {
        console.error("Errore nel parsing del redirectAfterLogin:", e);
        // Fallback alla logica di reindirizzamento normale se il parsing fallisce
      }
    }

    // Logica di reindirizzamento predefinita se non c'è redirectAfterLogin o se il parsing fallisce
    if (loggedInUser.role === "STAFF") {
      navigate("/validate-ticket", { replace: true }); // Reindirizza staff a validate-ticket
    } else {
      navigate("/", { replace: true }); // Reindirizza altri utenti alla home
    }
  };


  const handleLogin = async (data) => {
    try {
      const result = await myaxios.post("/login", data)
      localStorage.setItem("token", result.data.jwt)
      localStorage.setItem("user", JSON.stringify(result.data.user))
      setUser(result.data.user)

      // Chiama la funzione helper per la logica di reindirizzamento
      handlePostLoginRedirect(result.data.user);

    } catch (error) {
      console.log("Error during login:", error)
      return error.response?.data?.message || "Login failed"
    }
  }

  const handleGoogleLogin = async () => {
    console.log("handleGoogleLogin - INIZIO");
    if (isLoggingIn) {
      console.log("handleGoogleLogin - Login già in corso, esco.");
      return;
    }

    setIsLoggingIn(true);
    console.log("handleGoogleLogin - isLoggingIn impostato su true.");

    const provider = new GoogleAuthProvider();

    try {
      console.log("handleGoogleLogin - Chiamando signInWithPopup...");
      const result = await signInWithPopup(auth, provider);
      console.log("handleGoogleLogin - signInWithPopup completato con successo!");
      console.log("handleGoogleLogin - Risultato signInWithPopup:", result);

      const idToken = await result.user.getIdToken();
      console.log("handleGoogleLogin - ID Token ottenuto.");

      console.log("handleGoogleLogin - Chiamando il backend /google-login...");
      const res = await myaxios.post("/google-login", { idToken });
      console.log("handleGoogleLogin - Risposta backend ricevuta.");

      localStorage.setItem("token", res.data.jwt);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const loggedInUser = res.data.user; // Salva l'utente prima di impostarlo
      setUser(loggedInUser); // Imposta l'utente nello stato
      console.log("handleGoogleLogin - Utente impostato nello stato locale.");

      // Chiama la funzione helper per la logica di reindirizzamento
      handlePostLoginRedirect(loggedInUser);

    } catch (error) {
      console.error("handleGoogleLogin - Errore catturato:", error);
      if (error.code) {
          console.error("handleGoogleLogin - Codice errore Firebase:", error.code);
      }

    } finally {
      console.log("handleGoogleLogin - Blocco finally eseguito.");
      setIsLoggingIn(false);
      console.log("handleGoogleLogin - isLoggingIn impostato su false.");
    }
    console.log("handleGoogleLogin - FINE FUNZIONE");
  }



  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    // Rimuovi anche la chiave di reindirizzamento al logout per pulizia
    localStorage.removeItem("redirectAfterLogin"); 
    setUser(undefined)
    setProfileImage("")
    navigate("/login")
  }

  const handleRegister = async (data) => {
    try {
      const result = await myaxios.post("/register", data)
      localStorage.setItem("token", result.data.jwt)
      localStorage.setItem("user", JSON.stringify(result.data.user))
      setUser(result.data.user)
      navigate("/login")
    } catch (error) {
      console.log("Error during registration:", error)
      return error.response?.data?.message || "Registration failed"
    }
  }

  const requestPasswordRecovery = async (email) => {
    try {
      const res = await myaxios.post("/request-password-recovery", { email })
      return {
        success: true,
        message: res.data.message,
        recoveryToken: res.data.recoveryToken,
      }
    } catch (error) {
      console.error("Errore durante richiesta recupero password:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Errore durante la richiesta di recupero",
      }
    }
  }

  const updatePassword = async ({ email, recoveryCode, newPassword, newPasswordConfirmation }) => {
    try {
      const res = await myaxios.post("/update-password", {
        email,
        recoveryCode,
        newPassword,
        newPasswordConfirmation,
      })
      return {
        success: true,
        message: res.data.message,
      }
    } catch (error) {
      console.error("Errore durante aggiornamento password:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Errore durante l'aggiornamento della password",
      }
    }
  }
  
  const togglePushNotifications = async (newValue) => {
    try {
      // Chiamata API per aggiornare allowNotifications
      await myaxios.patch("/profile/notifications-toggle", { allowNotifications: newValue })
  
      // Aggiorna lo stato locale user e localStorage
      const updatedUser = { ...user, allowNotifications: newValue }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
  
      return { success: true }
    } catch (error) {
      console.error("Errore durante l'aggiornamento delle notifiche:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Errore durante l'aggiornamento delle notifiche",
      }
    }
  }
  

  return (
    <userContext.Provider
      value={{
        user,
        handleLogin,
        handleGoogleLogin,
        profileImage,
        profileImageUpdate,
        updateUserProfile,
        updateUserPassword,
        handleLogout,
        handleRegister,
        updatePassword,
        requestPasswordRecovery,
        isLoadingUser,
        togglePushNotifications
      }}
    >
      {children}
    </userContext.Provider>
  )
}

export default UserProvider

export function useUser() {
  return useContext(userContext)
}