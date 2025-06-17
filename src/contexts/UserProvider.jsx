import { createContext, useContext, useEffect, useState } from "react";
import { useAxios } from "./AxiosProvider";
import { useNavigate } from "react-router";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
});

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const [profileImage, setProfileImage] = useState("");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const myaxios = useAxios();
  const navigate = useNavigate();

  // Funzione per recuperare l'immagine dal backend
  const fetchProfileImageFromBackend = async () => {
    try {
      const res = await myaxios.get("/profile/image"); // Backend restituisce JSON con imageUrl
      if (res.data && res.data.imageUrl) {
        setProfileImage(res.data.imageUrl);
        // È una buona idea aggiornare l'oggetto utente nel localStorage con questo URL
        // per evitare future chiamate non necessarie.
        if (user) { // Assicurati che 'user' esista prima di provare ad aggiornarlo
          const updatedUser = { ...user, profileImage: res.data.imageUrl };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } else {
        console.warn("Backend non ha restituito un imageUrl valido per il profilo.");
        setProfileImage(""); // Nessuna immagine
      }
    } catch (error) {
      console.error("Errore durante il recupero dell'immagine del profilo dal backend:", error);
      setProfileImage(""); // Fallback in caso di errore
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Quando l'utente viene caricato, imposta subito la profileImage se esiste
        if (parsedUser.profileImage) {
          setProfileImage(parsedUser.profileImage);
        } else {
          // Se l'utente esiste ma non ha un'immagine di profilo, prova a recuperarla
          fetchProfileImageFromBackend();
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setUser(undefined);
        setProfileImage(""); // Resetta anche l'immagine in caso di errore
      }
    }
    setIsLoadingUser(false);
  }, []);

  // Questo useEffect ora gestisce il recupero dell'immagine ogni volta che 'user' cambia
  useEffect(() => {
      if (user) {
          // Se user.profileImage è già presente, usalo.
          // Altrimenti, prova a fetcharlo dal backend.
          if (user.profileImage) {
              setProfileImage(user.profileImage);
          } else {
              fetchProfileImageFromBackend();
          }
      } else {
          setProfileImage(""); // Pulisci se non c'è utente
      }
  }, [user]); // Dipende dall'oggetto user


  // --- MODIFICA CHIAVE QUI ---
  const profileImageUpdate = async (file) => {
    const formData = new FormData();
    // Il backend si aspetta il campo 'image'
    formData.append("image", file); 

    try {
      // Usa POST all'endpoint /profile/image come definito nel backend
      const res = await myaxios.post("/profile/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Risposta backend upload immagine:", res.data);

      // Il backend restituisce 'user' aggiornato e 'imageUrl'
      if (res.data.user && res.data.user.profileImage) { 
        const newImageUrl = res.data.user.profileImage;
        setProfileImage(newImageUrl); // Aggiorna lo stato con l'URL GCS persistente
        
        // Aggiorna anche l'oggetto user nello stato e localStorage con tutti i dati aggiornati
        const updatedUser = { ...user, ...res.data.user }; 
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        return { success: true, message: "Immagine profilo aggiornata!", imageUrl: newImageUrl };
      } else {
        throw new Error("Il backend non ha restituito l'URL dell'immagine aggiornato nell'oggetto user.");
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento dell'immagine:", error);
      return { success: false, message: error.response?.data?.message || "Errore upload immagine." };
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const res = await myaxios.put("/profile/update", profileData);

      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return {
        success: true,
        message: res.data.message || "Profilo aggiornato con successo",
        user: updatedUser,
      };
    } catch (error) {
      console.error("Errore durante l'aggiornamento del profilo:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Errore durante l'aggiornamento del profilo",
      };
    }
  };

  const updateUserPassword = async (passwordData) => {
    try {
      const res = await myaxios.put("/profile/password", passwordData);
      return {
        success: true,
        message: res.data.message || "Password aggiornata con successo",
      };
    } catch (error) {
      console.error("Errore durante l'aggiornamento della password:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Errore durante l'aggiornamento della password",
      };
    }
  };

  const handlePostLoginRedirect = (loggedInUser) => {
    const redirectPathRaw = localStorage.getItem("redirectAfterLogin");
    if (redirectPathRaw) {
      try {
        const parsedPath = JSON.parse(redirectPathRaw);
        localStorage.removeItem("redirectAfterLogin");
        navigate(parsedPath.pathname + parsedPath.search, { replace: true });
        return;
      } catch (e) {
        console.error("Errore nel parsing del redirectAfterLogin:", e);
      }
    }

    if (loggedInUser.role === "STAFF") {
      navigate("/validate-ticket", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  const handleLogin = async (data) => {
    try {
      const result = await myaxios.post("/login", data);
      localStorage.setItem("token", result.data.jwt);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      setUser(result.data.user);
      // L'useEffect sopra gestirà l'impostazione di profileImage dopo setUser
      handlePostLoginRedirect(result.data.user);
    } catch (error) {
      console.log("Error during login:", error);
      return error.response?.data?.message || "Login failed";
    }
  };

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
      console.log(
        "handleGoogleLogin - signInWithPopup completato con successo!"
      );
      console.log("handleGoogleLogin - Risultato signInWithPopup:", result);

      const idToken = await result.user.getIdToken();
      console.log("handleGoogleLogin - ID Token ottenuto.");

      console.log("handleGoogleLogin - Chiamando il backend /google-login...");
      const res = await myaxios.post("/google-login", { idToken });
      console.log("handleGoogleLogin - Risposta backend ricevuta.");

      localStorage.setItem("token", res.data.jwt);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const loggedInUser = res.data.user;
      setUser(loggedInUser);
      // L'useEffect sopra gestirà l'impostazione di profileImage dopo setUser
      console.log("handleGoogleLogin - Utente impostato nello stato locale.");

      handlePostLoginRedirect(loggedInUser);
    } catch (error) {
      console.error("handleGoogleLogin - Errore catturato:", error);
      if (error.code) {
        console.error(
          "handleGoogleLogin - Codice errore Firebase:",
          error.code
        );
      }
    } finally {
      console.log("handleGoogleLogin - Blocco finally eseguito.");
      setIsLoggingIn(false);
      console.log("handleGoogleLogin - isLoggingIn impostato su false.");
    }
    console.log("handleGoogleLogin - FINE FUNZIONE");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("redirectAfterLogin");
    setUser(undefined);
    setProfileImage(""); // Pulisci l'immagine del profilo al logout
    navigate("/login");
  };

  const handleRegister = async (data) => {
    try {
      const result = await myaxios.post("/register", data);
      localStorage.setItem("token", result.data.jwt);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      setUser(result.data.user);
      navigate("/login");
    } catch (error) {
      console.log("Error during registration:", error);
      return error.response?.data?.message || "Registration failed";
    }
  };

  const requestPasswordRecovery = async (email) => {
    try {
      const res = await myaxios.post("/request-password-recovery", { email });
      return {
        success: true,
        message: res.data.message,
        recoveryToken: res.data.recoveryToken,
      };
    } catch (error) {
      console.error("Errore durante richiesta recupero password:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Errore durante la richiesta di recupero",
      };
    }
  };

  const updatePassword = async ({
    email,
    recoveryCode,
    newPassword,
    newPasswordConfirmation,
  }) => {
    try {
      const res = await myaxios.post("/update-password", {
        email,
        recoveryCode,
        newPassword,
        newPasswordConfirmation,
      });
      return {
        success: true,
        message: res.data.message,
      };
    } catch (error) {
      console.error("Errore durante aggiornamento password:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Errore durante l'aggiornamento della password",
      };
    }
  };

  const togglePushNotifications = async (newValue) => {
    try {
      await myaxios.patch("/profile/notifications-toggle", {
        allowNotifications: newValue,
      });
      const updatedUser = { ...user, allowNotifications: newValue };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      console.error("Errore durante l'aggiornamento delle notifiche:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Errore durante l'aggiornamento delle notifiche",
      };
    }
  };

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
        togglePushNotifications,
      }}
    >
      {children}
    </userContext.Provider>
  );
};

export default UserProvider;

export function useUser() {
  return useContext(userContext);
}