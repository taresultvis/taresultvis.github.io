import * as d3 from 'd3';


export const vrKeyOrder: string[] = [
    "Table/Matrix",
    "Image",
    "Diagram",
    "Chart",
    "Other",
]

export const vrSubkeyToKey: any = {
    //"Table/Matrix": "Table/Matrix",
    "Table": "Table/Matrix",
    "Matrix": "Table/Matrix",
    "Heatmap": "Table/Matrix",
    //"Image": "Image",
    "Photo": "Image",
    "Screenshot": "Image",
    "Sketch": "Image",
    "Illustration": "Image",
    //"Diagram": "Diagram",
    "Block diagram": "Diagram",
    "Flow diagram": "Diagram",
    "Network diagram": "Diagram",
    "Onion diagram": "Diagram",
    "Venn diagram": "Diagram",
    "Timeline diagram": "Diagram",
    "Other diagram": "Diagram",
    //"Chart": "Chart",
    "Bar chart": "Chart",
    "Grouped bar chart": "Chart",
    "Stacked bar chart": "Chart",
    "Diverging bar chart": "Chart",
    "Bar chart with range": "Chart",
    "Box plot": "Chart",
    "Dot plot with range": "Chart",
    "Line chart": "Chart",
    "Line chart with range": "Chart",
    "Other chart": "Chart",
    //"Other": "Other"
}

export const vrSubKeyOrder: any = {
    "Table/Matrix": [
        "Table",
        "Matrix",
        "Heatmap"
    ],
    "Image": [
        "Photo",
        "Screenshot",
        "Sketch",
        "Illustration"
    ],
    "Diagram": [
        "Block diagram",
        "Flow diagram",
        "Network diagram",
        "Onion diagram",
        "Venn diagram",
        "Timeline diagram",
        "Other diagram",
    ],
    "Chart": [
        "Bar chart",
        "Grouped bar chart",
        "Stacked bar chart",
        "Diverging bar chart",
        "Bar chart with range",
        "Box plot",
        "Dot plot with range",
        "Line chart",
        "Line chart with range",
        "Other chart"
    ]
    ,
    "Other": ["Other"]
}

export const arKeyOrder: string[] = [
    "Theme",
    "Concept",
    "Quantitative",
    "Other"
]

export const arSubkeyToKey: any = {
    "Taxonomy": "Theme",
    "Definition": "Theme",
    "Frequency": "Theme",
    "Other theme": "Theme",
    "Self-reported": "Quantitative",
    "Measurement": "Quantitative",
    "Other quantitative": "Quantitative",
    "Model/Framework": "Concept",
    "Design insight": "Concept",
    "Other concept": "Concept",
    "Other": "Other"
}

export const arSubKeyOrder: any = {
    "Theme": [
        "Taxonomy",
        "Definition",
        "Frequency",
        "Example",
        "Other theme"
    ],
    "Taxonomy": ["Taxonomy"],
    "Definition": ["Definition"],
    "Frequency": ["Frequency"],
    "Other theme": ["Other theme"],
    "Quantitative": [
        "Self-reported",
        "Measurement",
        "Other quantitative"
    ],
    "Self-reported": ["Self-reported"],
    "Measurement": ["Measurement"],
    "Other quantitative": ["Other quantitative"],
    "Concept": [
        "Model/Framework",
        "Design insight",
        "Other concept"
    ],
    "Model/Framework": ["Model/Framework"],
    "Design insight": ["Design insight"],
    "Other concept": ["Other concept"],
    "Other": ["Other"]
}


const vrDomain = vrKeyOrder.filter(key => key !== "Other");
const vrColorRange = [d3.schemeTableau10[1], d3.schemeTableau10[3], d3.schemeTableau10[5], d3.schemeTableau10[7]];
const vrScale = d3.scaleOrdinal<string>().domain(vrDomain).range(vrColorRange);

export const vrColorScale = (key: string): string => {
    return vrScale(key);
};

export const vrIconScale = d3.scaleOrdinal<string>()
    .domain(vrKeyOrder)
    .range([
        // fontawsome tabel
        "fa-table",
        // fontawsome image
        "fa-image",
        // fontawsome diagram
        "fa-project-diagram",
        // fontawsome chart
        "fa-chart-bar",
        // fontawsome question
        "fa-minus-square",
    ]);

const arDomain = arKeyOrder
const arColorRange = [d3.schemeTableau10[0], d3.schemeTableau10[1], d3.schemeTableau10[2], d3.schemeTableau10[3]];
const arScale = d3.scaleOrdinal<string>().domain(arDomain).range(arColorRange);

export const arColorScale = (key: string): string => {
    return arScale(key);
};


export const getProportionalColor = (currentVal: number, maxVal: number) => {
    const logScale = d3.scaleLog().domain([1, maxVal + 1]).range([0, 1]);
    const quantizeScale = d3.scaleQuantize<string>().domain([0, 1]).range(d3.schemeTableau10);
    return quantizeScale(logScale(currentVal + 1));
}



export const instructionTexts = [
    "In this work, we categorized visual representations of thematic analysis results in CHI papers from 2012 to 2025 with the Thematic Analysis Visual Representation Framework consists of two taxonomies: (1) a taxonomy of the represented content and (2) a taxonomy of visual representation type.",
]

const arDefaultTexts = [
    "Theme: Recurring patterns of meaning organized from qualitative data.",
    "Concept: Novel conceptual artifacts developed based on the results of a thematic analysis.",
    "Quantitative: Quantitative results derived from or reported alongside the thematic analysis.",
    "Other: Analysis results that do not fit into the other three categories."
]

const arThemeTexts = [
    "Taxonomy: The hierarchical structure of themes and their subthemes",
    "Definition: The definition of each theme, subtheme, or code.",
    "Frequency: Indicates how frequently each theme was reported from the data sources.",
    "Example: Textual (e.g., quote) or graphical examples to illustrate each theme.",
    "Other theme: Any other visual representations related to themes."
]

const arQuantitativeTexts = [
    "Self-reported: Self-reported scores from experiments, such as SUS.",
    "Measurement: Objectively measured scores from experiments, such as F1 scores.",
    "Other quantitative: Any other visual representations related to quantitative data."
]
const arConceptTexts = [
    "Model/Framework: Novel conceptual structures (e.g., framework, model).",
    "Design insight: Actionable insights for future design, such as design considerations or implications.",
    "Other concept: Any other visual representations related to concepts."
]
const arOtherTexts = [
    "Other: Analysis results that do not fit into the other three categories."
]

export const arInstructionTexts = (arSelectedKeys: string[]) => {
    if(arSelectedKeys.length === 0) {
        return arDefaultTexts;
    } else {
        if(arSelectedKeys.includes("Theme")) {
            return arThemeTexts;
        }
        else if(arSelectedKeys.includes("Quantitative")) {
            return arQuantitativeTexts;
        }
        else if(arSelectedKeys.includes("Concept")) {
            return arConceptTexts;
        }
        else if (arSelectedKeys.includes("Other")) {
            return arOtherTexts;
        }
        else {
            let parentKey: string = arSubkeyToKey[arSelectedKeys[0]];
            // arSubKeyOrder[parentKey] 에서 현재 arSelectedKeys[0]의 index를 알아내기
            let index = arSubKeyOrder[parentKey].indexOf(arSelectedKeys[0]);
            if(index === -1) {
                return [];
            }
            else {
                if(parentKey === "Theme") {
                    return [arThemeTexts[index]];
                }
                else if(parentKey === "Quantitative") {
                    return [arQuantitativeTexts[index]];
                }
                else if(parentKey === "Concept") {
                    return [arConceptTexts[index]];
                }
                else if(parentKey === "Other") {
                    return [arOtherTexts[0]];
                }
                else {
                    return [];
                }
            }
        }
    }

}

const vrDefaultTexts = [
    "Table/Matrix: Visual representations composed of rows and columns.",
    "Image: Visual representations that captures a scene or concept.",
    "Diagram: Schematic visual representations that provide an overview of how things are interrelated.",
    "Chart: Visual representations that map quantitative data to visual elements (e.g., a bar, a point).",
    "Other: Any other visual representations that do not fit into the other categories."
]

const vrTableTexts = [
    "Table: Grids that organize detailed, often text-based, data for precise reading and comparison.",
    "Matrix: Grids that visually summarize data across multiple grouped categories to show relationships.",
    "Heatmap: Matrices that use color intensity to represent the magnitude of values and reveal patterns."
]

const vrImageTexts = [
    "Photo: Images capturing a real-world scene.",
    "Screenshot: Images of content displayed on a computer or mobile device.",
    "Sketch: Images which are rough or unfinished drawings.",
    "Illustration: Graphic images generated using computer design tools."
]

const vrDiagramTexts = [
    "Block diagram: Diagrams which lay out information schematically in blocks without interconnections.",
    "Flow diagram: Diagrams which display processes or sequences and shows the step-by-step progression, typically with blocks and arrows.",
    "Network diagram: Diagrams which show how entities are interconnected in many-to-many relationships with blocks.",
    "Onion diagram: Diagrams which illustrate hierarchical structures in concentric ellipses resembling an onion.",
    "Venn diagram: Diagrams which represent sets using overlapping shapes.",
    "Timeline diagram: Diagrams which represent events on a line representing time.",
    "Other diagram: Diagrams which do not fit into any of the other categories."
]

const vrChartTexts = [
    "Bar chart: Charts that presents categorical data with rectangular bars. The length or height of each bar is proportional to the value.",
    "Grouped bar chart: A type of bar chart that displays multiple sets of data side-by-side, grouped together under categories on the same axis.",
    "Stacked bar chart: A type of chart that visually represents categorical data by displaying bars divided into segments.",
    "Diverging bar chart: A type of bar chart that displays two sets of data extending in opposite directions from a central baseline.",
    "Bar chart with range: A type of chart that displays categorical data as rectangular bars, with the addition of range symbols.",
    "Box plot: A chart displaying the distribution of data with minimum, first quartile, median, third quartile, and maximum.",
    "Dot plot with range: A type of chart that combines individual data points (represented as dots) with range symbols.",
    "Line chart: A type of chart that displays data points connected by straight line segments.",
    "Line chart with range: A type of line chart that displays connected line segments with the addition of range symbols.",
    "Other chart: Charts that do not fit into any of the other categories."
]

const vrOtherTexts = [
    "Other: This subcategory includes visual representations that do not fit into any of the other categories or subcategories."
]

export const vrInstructionTexts = (vrSelectedKeys: string[]) => {
    if(vrSelectedKeys.length === 0) {
        return vrDefaultTexts;
    } else {
        if(vrSelectedKeys.includes("Table/Matrix")) {
            return vrTableTexts;
        }
        else if(vrSelectedKeys.includes("Image")) {
            return vrImageTexts;
        }
        else if(vrSelectedKeys.includes("Diagram")) {
            return vrDiagramTexts;
        }
        else if(vrSelectedKeys.includes("Chart")) {
            return vrChartTexts;
        }
        else if (vrSelectedKeys.includes("Other")) {
            return vrOtherTexts;
        }
        else {
            let parentKey: string = vrSubkeyToKey[vrSelectedKeys[0]];
            // vrSubKeyOrder[parentKey] 에서 현재 vrSelectedKeys[0]의 index를 알아내기
            let index = vrSubKeyOrder[parentKey].indexOf(vrSelectedKeys[0]);
            if(index === -1) {
                return [];
            }
            else {
                if(parentKey === "Table/Matrix") {
                    return [vrTableTexts[index]];
                }
                else if(parentKey === "Image") {
                    return [vrImageTexts[index]];
                }
                else if(parentKey === "Diagram") {
                    return [vrDiagramTexts[index]];
                }
                else if(parentKey === "Chart") {
                    return [vrChartTexts[index]];
                }
                else if(parentKey === "Other") {
                    return [vrOtherTexts[0]];
                }
                else {
                    return [];
                }
            }
        }
    }

}