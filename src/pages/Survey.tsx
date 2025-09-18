import { useState, useEffect } from "react";
import "../App.css";
import Matrix from "../components/Matrix";
import ContentList from "../components/ContentList";
import Timeseries from "../components/Timeseries";
import * as d3 from "d3";
import { DataContext } from "../DataContext";
import type { DataContextProps } from "../DataContext";
import Instruction from "../components/Instruction";

function Survey() {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [visualRepresentations, setVisualRepresentations] = useState(null);
  const [selectedArKeys, setSelectedArKeys] = useState<string[]>([]);
  const [selectedVrKeys, setSelectedVrKeys] = useState<string[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [figureInfo, setFigureInfo] = useState<d3.DSVRowArray<string> | null>(
    null as d3.DSVRowArray<string> | null
  );
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const analysisResultKeysResponse = await fetch(
          "/analysis_result_keys.json"
        );
        const analysisResultKeysData = await analysisResultKeysResponse.json();
        setAnalysisResults(analysisResultKeysData);

        const representationKeysResponse = await fetch(
          "/representation_keys.json"
        );
        const representationKeysData = await representationKeysResponse.json();
        setVisualRepresentations(representationKeysData);

        const figureInfoResponse = await fetch("/figureInfo.tsv");
        const figureInfoText = await figureInfoResponse.text();
        const figureInfoData = d3.tsvParse(figureInfoText);
        setFigureInfo(figureInfoData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Fetch thumbnails.json from public and set thumbnails
    fetch("/thumbnails.json")
      .then((res) => res.json())
      .then((urls: string[]) => setThumbnails(urls))
      .catch(() => setThumbnails([]));

    fetchData();
  }, []);

  let filteredThumbnails = thumbnails;
  if (figureInfo && selectedYears.length > 0) {
    const filteredIds = (figureInfo as any[])
      .filter((d) => selectedYears.includes(d.Year))
      .map((d) => d.id);
    filteredThumbnails = thumbnails.filter((thumbnail) => {
      const id = thumbnail.split("/").pop()?.split(".")[0] || "0";
      return filteredIds.includes(id);
    });
  }

  const contextValue: DataContextProps = {
    analysisResults,
    visualRepresentations,
    selectedArKeys,
    selectedVrKeys,
    setSelectedArKeys,
    setSelectedVrKeys,
    thumbnails: filteredThumbnails,
    figureInfo,
    selectedYears,
    setSelectedYears,
  };

  return (
    <DataContext.Provider value={contextValue}>
      <div className="w-full h-full grid grid-cols-4 p-1 gap-2">
        <div className="col-span-1 grid grid-rows-7 border rounded">
          <div className="w-full row-span-2">
            <Timeseries />
          </div>
          <div className="w-full row-span-5 relative">
            <Matrix />
          </div>
        </div>
        <div className="col-span-3 grid grid-rows-7 gap-1">
          <div className="w-full row-span-2 border rounded">
            <Instruction />
          </div>
          <div className="w-full row-span-5 relative border rounded">
            <ContentList />
          </div>
        </div>
      </div>
    </DataContext.Provider>
  );
}

export default Survey;
