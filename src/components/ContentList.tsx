import { useContext, useState } from "react";
import { DataContext } from "../DataContext";
import {
  arKeyOrder,
  vrKeyOrder,
  arSubKeyOrder,
  vrSubKeyOrder,
  arColorScale,
  vrIconScale,
} from "../constants";
import "react-lazy-load-image-component/src/effects/blur.css";

const ContentList = () => {
  const context = useContext(DataContext);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!context) {
    return <div>Loading...</div>;
  }

  const {
    analysisResults,
    visualRepresentations,
    selectedArKeys,
    selectedVrKeys,
    setSelectedArKeys,
    setSelectedVrKeys,
    thumbnails,
    figureInfo,
    setSelectedYears,
  } = context;

  const getIdsForKeys = (
    data: { [key: string]: any },
    keys: string[],
    subKeyOrder: any,
    keyOrder: string[]
  ): number[] => {
    return keys.flatMap((key) => {
      if (keyOrder.includes(key)) {
        const subKeys = subKeyOrder[key];
        if (subKeys && data[key]) {
          return subKeys.flatMap((subKey: string) =>
            data[key][subKey] && Array.isArray(data[key][subKey])
              ? data[key][subKey]
              : []
          );
        }
      }
      const mainKey = Object.keys(subKeyOrder).find((mainKey) =>
        subKeyOrder[mainKey].includes(key)
      );
      if (
        mainKey &&
        data[mainKey] &&
        data[mainKey][key] &&
        Array.isArray(data[mainKey][key])
      ) {
        return data[mainKey][key];
      }
      return [];
    });
  };

  const findCategory = (
    data: { [key: string]: any },
    id: number,
    keyOrder: string[],
    subKeyOrder: any
  ): string[] => {
    let keys: string[] = [];
    for (const key of keyOrder) {
      const subKeys = subKeyOrder[key];
      if (subKeys) {
        for (const subKey of subKeys) {
          if (
            data[key] &&
            data[key][subKey] &&
            data[key][subKey].includes(id)
          ) {
            keys.push(`${key} > ${subKey}`);
          }
        }
      } else {
        if (data[key] && data[key].includes(id)) {
          keys.push(key);
        }
      }
    }
    return keys;
  };
  // // console.log(selectedArKeys, selectedVrKeys)
  let visibleThumbnails: string[] = [];

  if (selectedArKeys.length === 0 && selectedVrKeys.length === 0) {
    visibleThumbnails = thumbnails;
  } else {
    let arIds: number[];
    if (selectedArKeys.length === 0) {
      arIds = arKeyOrder.flatMap((key) =>
        getIdsForKeys(analysisResults, [key], arSubKeyOrder, arKeyOrder)
      );
    } else {
      arIds = getIdsForKeys(
        analysisResults,
        selectedArKeys,
        arSubKeyOrder,
        arKeyOrder
      );
    }

    let vrIds: number[];
    if (selectedVrKeys.length === 0) {
      vrIds = vrKeyOrder.flatMap((key) =>
        getIdsForKeys(visualRepresentations, [key], vrSubKeyOrder, vrKeyOrder)
      );
    } else {
      vrIds = getIdsForKeys(
        visualRepresentations,
        selectedVrKeys,
        vrSubKeyOrder,
        vrKeyOrder
      );
    }
    // console.log(arIds, vrIds)
    const intersection = arIds.filter((id) => vrIds.includes(id));
    // console.log(intersection)
    const uniqueIntersection = [...new Set(intersection)];
    // console.log(uniqueIntersection)
    visibleThumbnails = thumbnails.filter((thumbnail) => {
      const id = parseInt(thumbnail.split("/").pop()?.split(".")[0] || "0");
      return uniqueIntersection.includes(id);
    });
    // console.log(visibleThumbnails)
  }

  const handleVrLabelClick = (vrCategory: string) => {
    const mainCategory = vrCategory.split(" > ")[1];
    setSelectedVrKeys(mainCategory ? [mainCategory] : []);
  };

  const handleArLabelClick = (arCategory: string) => {
    const mainCategory = arCategory.split(" > ")[1];
    setSelectedArKeys(mainCategory ? [mainCategory] : []);
  };

  const handleYearClick = (year: string) => {
    setSelectedYears((prevYears: string[]) => {
      if (prevYears.includes(year)) {
        return prevYears.filter((y) => y !== year);
      } else {
        return [...prevYears, year];
      }
    });
  };

  function getTextColorForBackground(hexColor: string) {
    if (!hexColor) return "#000";
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000" : "#fff";
  }

  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 p-2">
        {visualRepresentations !== null &&
        analysisResults !== null &&
        figureInfo !== null
          ? visibleThumbnails.map((thumbnail, index) => {
              const id = parseInt(
                thumbnail.split("/").pop()?.split(".")[0] || "0"
              );
              const vrCategories = findCategory(
                visualRepresentations,
                id,
                vrKeyOrder,
                vrSubKeyOrder
              );
              const arCategories = findCategory(
                analysisResults,
                id,
                arKeyOrder,
                arSubKeyOrder
              );

              // from figureInfo, find year, url of the figure
              // console.log(figureInfo);
              const figure = (figureInfo as any[]).find(
                (f) => parseInt(f.id) === id
              );
              // console.log(figure)
              //const title = figure ? figure.Paper : "Unknown";
              const year = figure ? figure.Year : "Unknown";
              const url = figure ? figure.URL : "";

              // console.log(vrCategories, arCategories);
              return (
                <div
                  key={index}
                  className="w-full h-full rounded-lg overflow-hidden justify-items-center bg-gray-200 border border-gray-200"
                >
                  <img
                    alt={`thumbnail-${index}`}
                    loading="lazy"
                    src={thumbnail}
                    className="w-full h-32 object-cover object-center cursor-pointer"
                    onClick={() => setSelectedImage(thumbnail)}
                  />
                  <div className="p-2">
                    <div className="flex flex-wrap items-center mb-2">
                      <span
                        className="inline-flex items-center rounded-full bg-gray-300 px-2 py-1 text-xs font-semibold text-gray-800 mr-2 mb-1 cursor-pointer"
                      >
                        {id}
                      </span>
                      <span
                        className="inline-flex items-center rounded-full bg-gray-300 px-2 py-1 text-xs font-semibold text-gray-800 mr-2 mb-1 cursor-pointer"
                        onClick={() => handleYearClick(year)}
                      >
                        {year}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-300 px-2 py-1 text-xs font-semibold text-gray-800 mr-2 mb-1">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1.5 text-gray-600 hover:text-gray-800"
                        >
                          <i className="fas fa-book"></i>
                        </a>
                      </span>
                    </div>

                    <span className="inline-block">
                      {vrCategories.map((category, i) => {
                        const parts = category.split(" > ");
                        const parentCategory = parts[0];
                        const childCategory = parts[1];
                        const iconClass = vrIconScale(parentCategory);
                        return (
                          <span
                            key={i}
                            className="inline-flex items-center bg-blue-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2 cursor-pointer"
                            onClick={() => handleVrLabelClick(category)}
                          >
                            <i className={`fa ${iconClass} mr-1`}></i>
                            {childCategory}
                          </span>
                        );
                      })}
                    </span>
                    <span className="inline-block">
                      {arCategories.map((category, i) => {
                        const parentCategory = category.split(" > ")[0];
                        const childCategory = category.split(" > ")[1];
                        const bgColor = arColorScale(parentCategory);
                        const textColor = getTextColorForBackground(bgColor);
                        return (
                          <span
                            key={i}
                            className="inline-block rounded-full px-3 py-1 text-xs font-semibold mr-2 mb-2 cursor-pointer"
                            style={{
                              backgroundColor: bgColor,
                              color: textColor,
                            }}
                            onClick={() => handleArLabelClick(category)}
                          >
                            {childCategory}
                          </span>
                        );
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          : "Loading"}
      </div>
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="enlarged thumbnail"
            className="max-w-full max-h-full cursor-pointer"
            onClick={() => setSelectedImage(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ContentList;
