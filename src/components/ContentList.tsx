import { useContext, useState } from "react";
import { DataContext } from "../DataContext";
import {
  arKeyOrder,
  vrKeyOrder,
  arSubKeyOrder,
  vrSubKeyOrder,
} from "../constants";
import { LazyLoadImage } from "react-lazy-load-image-component";
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
  } = context;

  const getIdsForKeys = (
    data: { [key: string]: any },
    keys: string[],
    subKeyOrder: any,
    keyOrder: string[]
  ): number[] => {
    return keys.flatMap(key => {
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
        const mainKey = Object.keys(subKeyOrder).find(mainKey => subKeyOrder[mainKey].includes(key));
        if (mainKey && data[mainKey] && data[mainKey][key] && Array.isArray(data[mainKey][key])) {
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
      arIds = arKeyOrder.flatMap(key => getIdsForKeys(analysisResults, [key], arSubKeyOrder, arKeyOrder));
    } else {
      arIds = getIdsForKeys(analysisResults, selectedArKeys, arSubKeyOrder, arKeyOrder);
    }

    let vrIds: number[];
    if (selectedVrKeys.length === 0) {
      vrIds = vrKeyOrder.flatMap(key => getIdsForKeys(visualRepresentations, [key], vrSubKeyOrder, vrKeyOrder));
    } else {
      vrIds = getIdsForKeys(visualRepresentations, selectedVrKeys, vrSubKeyOrder, vrKeyOrder);
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

  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-8">
        {visualRepresentations !== null && analysisResults !== null
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
              return (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <LazyLoadImage
                    alt={`thumbnail-${index}`}
                    effect="blur"
                    src={thumbnail}
                    className="w-full h-auto object-cover cursor-pointer"
                    onClick={() => setSelectedImage(thumbnail)}
                  />
                  <div className="p-2">
                    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                      {id}
                    </span>
                    <span className="inline-block">
                      {vrCategories.map((category, i) => (
                        <span
                          key={i}
                          className="inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 cursor-pointer"
                          onClick={() => handleVrLabelClick(category)}
                        >
                          {category}
                        </span>
                      ))}
                    </span>
                    <span className="inline-block">
                      {arCategories.map((category, i) => (
                        <span
                          key={i}
                          className="inline-block bg-green-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 cursor-pointer"
                          onClick={() => handleArLabelClick(category)}
                        >
                          {category}
                        </span>
                      ))}
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
            className="max-w-full max-h-full"
          />
        </div>
      )}
    </div>
  );
};

export default ContentList;
