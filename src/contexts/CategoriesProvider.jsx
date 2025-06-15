import { createContext, useContext, useEffect, useState } from "react";
import { useAxios } from "./AxiosProvider";

const CategoriesContext = createContext();

const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const myaxios = useAxios();
  // get all categories
  /* const getCategories = async () => {
    setCategoriesLoading(true);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/categories`);
    if (response.ok) {
      const data = await response.json();
      setCategories(data);
    }
    setCategoriesLoading(false);
  }; */

  
  
  // get all categories on mount
  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await myaxios.get('/categories');
        console.log("Categorie ricevute:", response.data);
        setCategories(response.data);
      } catch (error) {
        
      } finally {
        setCategoriesLoading(false);
      }
    }
    getCategories();
  }, []);

  /* useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await myaxios.get('/categories');
        let categoriesData = response.data;
  
        // Verifica se "Uncategorized" è già presente
        const uncategorizedExists = categoriesData.some(
          (category) => category.name === "Uncategorized"
        );
  
        if (!uncategorizedExists) {
          // Aggiungi "Uncategorized" se non presente
          categoriesData = [
            { id: 'uncategorized', name: 'Uncategorized' },
            ...categoriesData,
          ];
        }
  
        setCategories(categoriesData);
      } catch (error) {
        console.error("Errore nel recuperare le categorie:", error);
      }
    };
  
    getCategories();
  }, []); */

  // create a new category
  const createCategory = async (category) => {
    try {
      const response = await myaxios.post('/categories', category);
      setCategories((prev) => [...prev, response.data]);
      return response;  
    } catch (error) {
      console.error("Errore durante la creazione della categoria:", error);
      throw error;  // Propaga l'errore per una gestione più avanzata
    }
  };

  // update a category
  const updateCategory = async (category) => {
    // find the actual category
    const actualCategory = categories.find((c) => c.id === category.id);
    // optimistic update
    setCategories(categories.map((c) => (c.id === category.id ? category : c)));
    // update the category in the database
    /* const response = await fetch(
      `${import.meta.env.VITE_API_URL}/categories/${category.id}`,
      {
        method: "PUT",
        body: JSON.stringify(category),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      // revert the optimistic update
      setCategories(
        categories.map((c) => (c.id === category.id ? actualCategory : c))
      );
    } */
    try {
      const response = await myaxios.put(`/categories/${category.id}`, category);
      return response;
    } catch (error) {
      console.error("Errore durante l'aggiornamento della categoria:", error);
      throw error;  // Propaga l'errore per una gestione più avanzata
    }
  };

  // delete a category
  const deleteCategory = async (id) => {
    // find the actual category
    const actualCategoryIndex = categories.findIndex((c) => c.id === id);
    const actualCategory = categories[actualCategoryIndex];
    // optimistic update
    setCategories(categories.filter((c) => c.id !== id));
    // delete the category in the database
    /* const response = await fetch(
      `${import.meta.env.VITE_API_URL}/categories/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      // revert the optimistic update
      setCategories((prev) =>
        prev.splice(actualCategoryIndex, 0, actualCategory)
      );
    } */
      try {
        const response = await myaxios.delete(`/categories/${id}`);
    
        if (!response.status === 200) {
          setCategories((prev) =>
            prev.splice(actualCategoryIndex, 0, actualCategory)
          );
        }
      } catch (error) {
        setCategories((prev) =>
          prev.splice(actualCategoryIndex, 0, actualCategory)
        );
        console.error("Errore nella cancellazione della categoria:", error);
      }
  };

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        categoriesLoading,
        createCategory,
        updateCategory,
        deleteCategory,
        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export default CategoriesProvider;

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
};
