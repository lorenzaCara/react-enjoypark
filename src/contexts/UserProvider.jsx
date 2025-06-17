import { createContext, useContext, useEffect, useState } from "react";
import { useAxios } from "./AxiosProvider";
import { useNavigate } from "react-router";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

const userContext = createContext({
  user: undefined,
  handleLogin: (data) => null,
  handleGoogleLogin: (response) => null,
  profileImage: undefined, // Questo stato è ancora utile per la visualizzazione reattiva
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
  const [profileImage, setProfileImage] = useState(""); // Questo stato conterrà l'URL GCS
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const myaxios = useAxios();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Quando l'utente viene caricato, imposta subito la profileImage se esiste
        if (parsedUser.profileImage) {
          setProfileImage(parsedUser.profileImage);
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setUser(undefined);
        setProfileImage(""); // Resetta anche l'immagine in caso di errore
      }
    }
    setIsLoadingUser(false);
  }, []);

  const profileImageUpdate = async (file) => {
    const formData = new FormData();
    formData.append("profileImage", file); // Assicurati che il nome del campo corrisponda a quello che il backend si aspetta

    try {
      // Endpoint di esempio, adatta a quello che usi nel backend
      // Se il tuo backend non ha un endpoint con userId nei params, puoi rimuoverlo
      const res = await myaxios.put(`/profile/update-image/${user.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Risposta backend upload immagine:", res.data);

      if (res.data.user && res.data.user.profileImage) {
        const newImageUrl = res.data.user.profileImage;
        setProfileImage(newImageUrl);
        const updatedUser = { ...user, profileImage: newImageUrl };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return { success: true, message: "Immagine profilo aggiornata!", imageUrl: newImageUrl };
      } else {
        throw new Error("Il backend non ha restituito l'URL dell'immagine aggiornato.");
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento dell'immagine:", error);
      return { success: false, message: error.response?.data?.message || "Errore upload immagine." };
    }
  };

  // La funzione getProfileImage è stata rimossa, poiché l'URL è gestito tramite lo stato 'user'.

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

  // L'useEffect che chiamava getProfileImage è stato rimosso.

  const handlePostLoginRedirect = (loggedInUser) => {
    const redirectPathRaw = localStorage.getItem("redirectAfterLogin");
    if (redirectPathRaw) {
      try {
        const parsedPath = JSON.parse(redirectPathRaw);
        localStorage.removeItem("redirectAfterLogin"); // Pulisci dopo aver letto
        navigate(parsedPath.pathname + parsedPath.search, { replace: true });
        return; // Reindirizzato con successo
      } catch (e) {
        console.error("Errore nel parsing del redirectAfterLogin:", e); // Fallback alla logica di reindirizzamento normale se il parsing fallisce
      }
    } // Logica di reindirizzamento predefinita se non c'è redirectAfterLogin o se il parsing fallisce

    if (loggedInUser.role === "STAFF") {
      navigate("/validate-ticket", { replace: true }); // Reindirizza staff a validate-ticket
    } else {
      navigate("/", { replace: true }); // Reindirizza altri utenti alla home
    }
  };

  const handleLogin = async (data) => {
    try {
      const result = await myaxios.post("/login", data);
      localStorage.setItem("token", result.data.jwt);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      setUser(result.data.user);
      // Imposta profileImage anche qui dopo il login, se presente nell'oggetto user
      if (result.data.user.profileImage) {
          setProfileImage(result.data.user.profileImage);
      }

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
      // Imposta profileImage anche qui dopo il login con Google
      if (loggedInUser.profileImage) {
          setProfileImage(loggedInUser.profileImage);
      }
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