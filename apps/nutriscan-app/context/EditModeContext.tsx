import React, { createContext, useContext, useState, ReactNode } from "react";

interface EditModeContextType {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditing: false,
  setIsEditing: () => {},
});

export const useEditMode = () => useContext(EditModeContext);

interface EditModeProviderProps {
  children: ReactNode;
}

export const EditModeProvider: React.FC<EditModeProviderProps> = ({ children }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <EditModeContext.Provider value={{ isEditing, setIsEditing }}>
      {children}
    </EditModeContext.Provider>
  );
};
