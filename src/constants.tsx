import * as d3 from 'd3';


export const vrKeyOrder: string[] = [
    "Table/Matrix",
    "Image",
    "Diagram",
    "Chart",
    "Other",
]

export const vrSubkeyToKey: any = {
    "Table/Matrix": "Table/Matrix",
    "Table": "Table/Matrix",
    "Matrix": "Table/Matrix",
    "Heatmap": "Table/Matrix",
    "Image": "Image",
    "Photo": "Image",
    "Screenshot": "Image",
    "Sketch": "Image",
    "Illustration": "Image",
    "Diagram": "Diagram",
    "Block diagram": "Diagram",
    "Flow diagram": "Diagram",
    "Network diagram": "Diagram",
    "Onion diagram": "Diagram",
    "Venn diagram": "Diagram",
    "Timeline diagram": "Diagram",
    "Other diagram": "Diagram",
    "Chart": "Chart",
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
    "Other": "Other"
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
    "Quantitative",
    "Concept",
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
    "Future work": "Concept",
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
        "Future work",
        "Other concept"
    ],
    "Model/Framework": ["Model/Framework"],
    "Design insight": ["Design insight"],
    "Future work": ["Future work"],
    "Other concept": ["Other concept"],
    "Other": ["Other"]
}


const vrDomain = vrKeyOrder.filter(key => key !== "Other");
const vrColorRange = [d3.schemeTableau10[1], d3.schemeTableau10[3], d3.schemeTableau10[5], d3.schemeTableau10[7]];
const vrScale = d3.scaleOrdinal<string>().domain(vrDomain).range(vrColorRange);

export const vrColorScale = (key: string): string => {
    if (key.includes("Other")) {
        return d3.schemeTableau10[9];
    }
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

const arDomain = arKeyOrder.filter(key => key !== "Other");
const arColorRange = [d3.schemeTableau10[0], d3.schemeTableau10[1], d3.schemeTableau10[2], d3.schemeTableau10[3]];
const arScale = d3.scaleOrdinal<string>().domain(arDomain).range(arColorRange);

export const arColorScale = (key: string): string => {
    if (key.includes("Other")) {
        return d3.schemeTableau10[9];
    }
    return arScale(key);
};


export const getProportionalColor = (currentVal: number, maxVal: number) => {
    const logScale = d3.scaleLog().domain([1, maxVal + 1]).range([0, 1]);
    const quantizeScale = d3.scaleQuantize<string>().domain([0, 1]).range(d3.schemeTableau10);
    return quantizeScale(logScale(currentVal + 1));
}



export const instructionText = ""

export const explanationText = [
    ""
]