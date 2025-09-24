import { 
  Dataset,
  evaluateMockDataset, 
  generateMockCitation, 
  logMockDecision 
} from "@/components/data";
import { getDoiDetail, searchDois } from "@/src/infrastructure/datacite-client";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

export async function POST(request: Request) {
  const { messages } = await request.json();

  const stream = streamText({
    model: openai("gpt-4o-mini"),
    system: `\
      You are a helpful dataset discovery and evaluation assistant for scientists and researchers.
      - your role is to help users define their research data needs, search for relevant datasets, evaluate compatibility, and generate citations
      - be conversational and helpful, focusing on understanding the user's research context
      - your responses are concise and natural
      - you do not ever use lists, tables, or bullet points; instead, you provide flowing, conversational responses
      - when helping with dataset discovery, consider metadata completeness, licensing, format compatibility, and timeliness
      - for evaluations you would always need metadata first.
      - always provide actionable recommendations based on the user's specific research needs
    `,
    messages,
    maxSteps: 5,
    tools: {
      fetchDoi: {
        description: "Fetch DataCite DOI details and map to the local Dataset shape",
        parameters: z.object({
          doi: z.string().describe("DOI string or DataCite id to fetch, e.g. 10.1234/zenodo.12345"),
        }),
        execute: async function ({ doi }) {
          // small delay for UX parity with other tools
          await new Promise((resolve) => setTimeout(resolve, 600));
          try {
            const result = await getDoiDetail(doi);
            return result;
          } catch (err: any) {
            return { error: String(err?.message || err) };
          }
        },
      },
      searchDatasets: {
        description:
          "Search for open datasets based on keywords, license constraints, and date filters to find relevant research data",
        parameters: z.object({
          keywords: z
            .array(z.string())
            .describe(
              "Research keywords to search for in dataset titles, descriptions, and metadata"
            ),
          licenseFilter: z
            .string()
            .optional()
            .describe(
              "License constraint (e.g., CC-BY, MIT, Public Domain, Open Data Commons)"
            ),
          dateRange: z
            .object({
              startDate: z
                .string()
                .optional()
                .describe(
                  "Earliest publication date to include (YYYY-MM-DD format)"
                ),
              endDate: z
                .string()
                .optional()
                .describe(
                  "Latest publication date to include (YYYY-MM-DD format)"
                ),
            })
            .optional()
            .describe("Date range filter for dataset publication dates"),
        }),
        execute: async function ({ keywords, licenseFilter, dateRange }) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          try {
            // Construct search query from keywords
            const query = keywords.join(' ');
            
            // Prepare search options
            const options: { page?: number; size?: number; license?: string; resourceType?: string } = {
              page: 1,
              size: 10,
            };
            
            // Add license filter if provided
            if (licenseFilter) {
              options.license = licenseFilter;
            }
            
            // Search using DataCite API
            const datasets = await searchDois(query, options);
            
            // Apply date range filtering if specified (post-processing since DataCite API doesn't directly support date ranges)
            if (dateRange && (dateRange.startDate || dateRange.endDate)) {
              return datasets.filter((dataset: Dataset) => {
                const pubDate = new Date(dataset.metadata.publicationDate);
                const startDate = dateRange.startDate ? new Date(dateRange.startDate) : new Date('1900-01-01');
                const endDate = dateRange.endDate ? new Date(dateRange.endDate) : new Date();
                
                return pubDate >= startDate && pubDate <= endDate;
              });
            }
            
            return datasets;
          } catch (error) {
            console.error('Dataset search failed:', error);
            // Return empty array on error to prevent tool failure
            return [];
          }
        },
      },
      fetchMetadata: {
        description:
          "Fetch detailed metadata for a specific dataset including authors, license, format, and technical details",
        parameters: z.object({
          datasetId: z.string().describe("Dataset ID (DOI) to fetch metadata for"),
        }),
        execute: async function ({ datasetId }) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          try {
            const result = await getDoiDetail(datasetId);
            return result;
          } catch (err: any) {
            return { error: String(err?.message || err) };
          }
        },
      },
      evaluateDataset: {
        description:
          "Evaluate dataset compatibility against user requirements including format, license, and date constraints",
        parameters: z.object({
          datasetId: z.string().describe("Dataset ID to evaluate"),
          userRequirements: z
            .object({
              formatConstraints: z
                .array(z.string())
                .optional()
                .describe("Required data formats (e.g., CSV, JSON, Parquet)"),
              licenseConstraints: z
                .array(z.string())
                .optional()
                .describe("Acceptable licenses (e.g., CC-BY, Public Domain)"),
              dateRange: z
                .object({
                  startDate: z.string().optional(),
                  endDate: z.string().optional(),
                })
                .optional()
                .describe("Required date range for dataset publication"),
            })
            .describe("User requirements to evaluate against"),
        }),
        execute: async function ({ datasetId, userRequirements }) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          const evaluation = evaluateMockDataset(datasetId, userRequirements);
          return evaluation;
        },
      },
      generateCitation: {
        description:
          "Generate academic citation for a dataset in specified format (APA or CSL)",
        parameters: z.object({
          datasetId: z.string().describe("Dataset ID to generate citation for"),
          format: z
            .enum(["APA", "CSL"])
            .default("APA")
            .describe("Citation format to generate"),
        }),
        execute: async function ({ datasetId, format }) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const citation = generateMockCitation(datasetId, format);
          return citation;
        },
      },
      logDecision: {
        description:
          "Log user decision about dataset acceptance or rejection with reasoning for audit trail",
        parameters: z.object({
          datasetId: z.string().describe("Dataset ID being decided on"),
          action: z
            .enum(["accepted", "rejected"])
            .describe("User decision on the dataset"),
          reason: z.string().describe("Reasoning for the decision"),
        }),
        execute: async function ({ datasetId, action, reason }) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const logEntry = logMockDecision(datasetId, action, reason);
          return logEntry;
        },
      },
    },
  });

  return stream.toDataStreamResponse();
}
