import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface CategoryContextType {
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  return (
    <CategoryContext.Provider value={{ selectedCategoryId, setSelectedCategoryId }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};