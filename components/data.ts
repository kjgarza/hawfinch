// Dataset Discovery Data Models

export interface DatasetNeed {
  id: string;
  researchQuestion: string;
  requiredVariables: string[];
  formatConstraints: string[];
  licenseConstraints: string[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
  createdAt: string;
}

export interface Dataset {
  id: string;
  title: string;
  description: string;
  url: string;
  repository: 'DataCite' | 're3data';
  metadata: DatasetMetadata;
  evaluationResult?: EvaluationResult;
}

export interface DatasetMetadata {
  authors?: string[];
  publicationDate: string;
  license?: string;
  format?: string[];
  size?: string;
  doi?: string;
  keywords?: string[];
  version?: string;
}

export interface EvaluationResult {
  id: string;
  datasetId: string;
  metadataComplete: boolean;
  licenseCompatible: boolean;
  formatCompatible: boolean;
  timeliness: boolean;
  overallScore: number;
  notes: string;
  evaluatedAt: string;
}

export interface DecisionLog {
  id: string;
  datasetId: string;
  action: 'accepted' | 'rejected';
  reason: string;
  timestamp: string;
}

export interface Citation {
  id: string;
  datasetId: string;
  format: 'APA' | 'CSL';
  text: string;
  generatedAt: string;
}

// Mock Data
export const MOCK_DATASETS: Dataset[] = [
  {
    id: "ds-001",
    title: "Global Climate Change Indicators Dataset",
    description:
      "Comprehensive dataset containing temperature, precipitation, and atmospheric CO2 measurements from 1880-2023.",
    url: "https://doi.org/10.5194/essd-2023-climate",
    repository: "DataCite",
    metadata: {
      authors: ["Dr. Sarah Johnson", "Dr. Michael Chen", "Dr. Elena Rodriguez"],
      publicationDate: "2024-03-15",
      license: "CC-BY-4.0",
      format: ["CSV", "NetCDF", "JSON"],
      size: "2.3 GB",
      doi: "10.5194/essd-2023-climate",
      keywords: [
        "climate change",
        "temperature",
        "precipitation",
        "atmospheric CO2",
      ],
      version: "v2.1",
    },
  },
  {
    id: "ds-007",
    title: "North America Climate Change Indicators Dataset",
    description:
      "Comprehensive dataset containing temperature, precipitation, and atmospheric CO2 measurements from 1990-2023.",
    url: "https://doi.org/10.5194/essd-1999-climate",
    repository: "re3data",
    metadata: {
      authors: ["Dr. Elena Rodriguez"],
      publicationDate: "2024-03-15",
      license: "CC-BY-4.0",
      format: ["CSV", "JSON"],
      size: "3 GB",
      doi: "10.5194/essd-1999-climate",
      keywords: [
        "climate change",
        "atmospheric CO2",
      ],
      version: "v7.1",
    },
  },
  {
    id: "ds-002",
    title: "Human Genomic Variants Database",
    description:
      "Large-scale collection of human genetic variants with associated phenotypic data from population studies.",
    url: "https://genomics.example.org/variants/v3",
    repository: "re3data",
    metadata: {
      authors: ["Genomics Consortium"],
      publicationDate: "2024-01-22",
      license: "Open Data Commons",
      format: ["VCF", "TSV", "Parquet"],
      size: "8.7 TB",
      keywords: ["genomics", "variants", "population genetics", "phenotypes"],
      version: "v3.0",
    },
  },
  {
    id: "ds-003",
    title: "Urban Air Quality Monitoring Data",
    description:
      "Real-time air quality measurements from sensors across 50 major cities worldwide, 2020-2024.",
    url: "https://urbandata.gov/air-quality",
    repository: "DataCite",
    metadata: {
      authors: ["Urban Environmental Monitoring Initiative"],
      publicationDate: "2024-02-10",
      license: "Public Domain",
      format: ["CSV", "JSON", "XML"],
      size: "450 MB",
      doi: "10.5067/urban-air-quality-2024",
      keywords: ["air quality", "urban environment", "sensors", "pollution"],
      version: "v1.2",
    },
  },
];


export interface TrackingInformation {
  orderId: string;
  progress: 'Shipped' | 'Out for Delivery' | 'Delivered';
  description: string;
}

// Helper Functions
export const getMockDatasets = (keywords: string[], licenseFilter?: string, dateRange?: any): Dataset[] => {
  return MOCK_DATASETS.filter(dataset => {
    // Filter by keywords
    const keywordMatch = keywords.some(keyword => 
      dataset.title.toLowerCase().includes(keyword.toLowerCase()) ||
      dataset.description.toLowerCase().includes(keyword.toLowerCase()) ||
      dataset.metadata.keywords?.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    // Filter by license if specified
    const licenseMatch = !licenseFilter || 
      dataset.metadata.license?.toLowerCase().includes(licenseFilter.toLowerCase());
    
    // Filter by date range if specified
    const dateMatch = !dateRange || 
      new Date(dataset.metadata.publicationDate) >= new Date(dateRange.startDate || '1900-01-01');
    
    return keywordMatch && licenseMatch && dateMatch;
  });
};

export const getMockMetadata = (datasetId: string): DatasetMetadata | null => {
  const dataset = MOCK_DATASETS.find(ds => ds.id === datasetId);
  return dataset ? dataset.metadata : null;
};

export const evaluateMockDataset = (datasetId: string, requirements: any): EvaluationResult => {
  const dataset = MOCK_DATASETS.find(ds => ds.id === datasetId);
  if (!dataset) {
    throw new Error(`Dataset ${datasetId} not found`);
  }

  // Check metadata completeness - since rightsList, keywords, formats are optional
  const metadataComplete = !!(dataset.metadata.authors && dataset.metadata.authors.length > 0 && 
                          dataset.metadata.publicationDate !== '');
  
  const licenseCompatible = !requirements.licenseConstraints || 
                           !dataset.metadata.license ||
                           requirements.licenseConstraints.some((license: string) =>
                             dataset.metadata.license?.toLowerCase().includes(license.toLowerCase())
                           );
  
  const formatCompatible = !requirements.formatConstraints ||
                          !dataset.metadata.format ||
                          requirements.formatConstraints.some((format: string) =>
                            dataset.metadata.format && dataset.metadata.format.includes(format)
                          );
  
  const timeliness = !requirements.dateRange ||
                    new Date(dataset.metadata.publicationDate) >= new Date(requirements.dateRange.startDate || '1900-01-01');

  const overallScore = [metadataComplete, licenseCompatible, formatCompatible, timeliness]
                        .filter(Boolean).length / 4;

  return {
    id: `eval-${datasetId}`,
    datasetId,
    metadataComplete,
    licenseCompatible,
    formatCompatible,
    timeliness,
    overallScore,
    notes: `Dataset evaluation completed. Score: ${Math.round(overallScore * 100)}%. ${
      overallScore >= 0.8 ? "Highly recommended for your research." :
      overallScore >= 0.6 ? "Good match with some limitations." :
      "May not fully meet your requirements."
    }`,
    evaluatedAt: new Date().toISOString()
  };
};

export const generateMockCitation = (datasetId: string, format: 'APA' | 'CSL'): Citation => {
  const dataset = MOCK_DATASETS.find(ds => ds.id === datasetId);
  if (!dataset) {
    throw new Error(`Dataset ${datasetId} not found`);
  }

  const authors = dataset.metadata.authors && dataset.metadata.authors.length > 0
    ? dataset.metadata.authors.join(', ')
    : 'Unknown Author';
  const year = new Date(dataset.metadata.publicationDate).getFullYear();
  
  const apaText = `${authors} (${year}). ${dataset.title}. ${dataset.repository}. ${dataset.metadata.doi ? `https://doi.org/${dataset.metadata.doi}` : dataset.url}`;
  
  const text = format === 'APA' ? apaText : apaText; // For now, both formats are similar

  return {
    id: `cite-${datasetId}`,
    datasetId,
    format,
    text,
    generatedAt: new Date().toISOString()
  };
};

export const logMockDecision = (datasetId: string, action: 'accepted' | 'rejected', reason: string): DecisionLog => {
  return {
    id: `log-${datasetId}-${Date.now()}`,
    datasetId,
    action,
    reason,
    timestamp: new Date().toISOString()
  };
};
