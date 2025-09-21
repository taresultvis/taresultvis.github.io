import { useContext } from "react";
import { DataContext } from "../DataContext";
import {
  instructionTexts,
  arInstructionTexts,
  vrInstructionTexts,
  arColorScale,
  vrIconScale,
  vrSubkeyToKey,
  arKeyOrder,
} from "../constants";

const Instruction = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("Instruction must be used within a DataProvider");
  }
  const { selectedArKeys, selectedVrKeys } = context;
  return (
    <div className="instruction-container px-2 py-0.5 w-full h-48 flex flex-col gap-0.5 overflow-y-scroll">
      <div>
        <ul>
          {instructionTexts.map((text, index) => (
            <li className="text-sm" key={index}>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <h2 className="font-bold">Contents</h2>
      <ul>
        {arInstructionTexts(selectedArKeys).map((text, index) => {
          const parts = text.split(": ");
          const arKey = parts[0];
          const description = parts.slice(1).join(": ");
          const color = arKeyOrder.includes(arKey)
            ? arColorScale(arKey)
            : arColorScale(selectedArKeys[0]);
          return (
            <li className="text-sm flex items-start" key={index}>
              <span
                className="w-3 h-3 rounded-full inline-block mr-2 mt-1 flex-shrink-0"
                style={{ backgroundColor: color }}
              ></span>
              <span>
                <strong>{arKey}:</strong> {description}
              </span>
            </li>
          );
        })}
      </ul>

      <h2 className="font-bold">Visual Representations</h2>
      <ul>
        {vrInstructionTexts(selectedVrKeys).map((text, index) => {
          const parts = text.split(": ");
          const vrKey = parts[0];
          const description = parts.slice(1).join(": ");
          const iconClass = vrIconScale(vrSubkeyToKey[vrKey] || vrKey);
          return (
            <li className="text-sm flex items-start" key={index}>
              <i
                className={`fa ${iconClass} w-4 text-center mr-2 mt-1 flex-shrink-0`}
              ></i>
              <span>
                <strong>{vrKey}:</strong> {description}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Instruction;
