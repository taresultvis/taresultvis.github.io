import { createContext } from "react";

export interface DataContextProps {
  analysisResults: any;
  visualRepresentations: any;
  selectedArKeys: string[];
  selectedVrKeys: string[];
  setSelectedArKeys: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedVrKeys: React.Dispatch<React.SetStateAction<string[]>>;
  thumbnails: string[];
  figureInfo: any;
  selectedYears: string[];
  setSelectedYears: React.Dispatch<React.SetStateAction<string[]>>;
}

export const DataContext = createContext<DataContextProps | undefined>(
  undefined
);
