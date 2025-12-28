import React, { createContext, useState } from 'react';

export const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favoriteItems, setFavoriteItems] = useState([]);

  // Toggle favorite: add if not present, remove if present
  const toggleFavorite = (pet) => {
    const petId = pet._id || pet.id;
    const exists = favoriteItems.some(item => (item._id || item.id) === petId);
    if (exists) {
      setFavoriteItems(favoriteItems.filter(item => (item._id || item.id) !== petId));
    } else {
      setFavoriteItems([...favoriteItems, pet]);
    }
  };

  const addToFavorites = (pet) => {
    const petId = pet._id || pet.id;
    const exists = favoriteItems.some(item => (item._id || item.id) === petId);
    if (!exists) {
      setFavoriteItems([...favoriteItems, pet]);
    }
  };

  const removeFromFavorites = (petId) => {
    setFavoriteItems(favoriteItems.filter(item => (item._id || item.id) !== petId));
  };

  const clearFavorites = () => {
    setFavoriteItems([]);
  };

  return (
    <FavoritesContext.Provider value={{
      favoriteItems,
      addToFavorites,
      removeFromFavorites,
      clearFavorites,
      toggleFavorite
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}
