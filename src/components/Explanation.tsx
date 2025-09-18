import { instructionTexts } from "../constants";

const Explanation = () => {
  return (
    <div className="explanation-container">
      <ul>
        {instructionTexts.map((text, index) => (
          <li key={index}>{text}</li>
        ))}
      </ul>
    </div>
  );
};

export default Explanation;