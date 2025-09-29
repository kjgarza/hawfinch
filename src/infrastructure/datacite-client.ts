import { Dataset, DatasetMetadata } from "@/components/data";

const DATACITE_BASE = process.env.DATACITE_BASE_URL || "https://api.datacite.org";
const DEFAULT_PAGE_SIZE = 10;

function mapDoiToDataset(item: any): Dataset {
  const attrs = item.attributes || {};
  const metadata = mapAttributesToMetadata(attrs);

  return {
    id: item.id || attrs.doi || `${attrs.prefix}/${attrs.suffix}`,
    title: ((attrs.titles && attrs.titles[0] && attrs.titles[0].title) || attrs.title || "Untitled Dataset").slice(0, 300),
    description: ((attrs.descriptions && attrs.descriptions[0] && attrs.descriptions[0].description) || attrs.abstract || "No description available").slice(0, 300),
    url: attrs.url || `https://doi.org/${attrs.doi}` || "",
    repository: "DataCite",
    metadata,
  };
}

function mapAttributesToMetadata(attrs: any): DatasetMetadata {
  // Extract authors from creators array
  const authors = (attrs.creators || []).map((c: any) => {
    if (c.name) return c.name;
    if (c.givenName && c.familyName) return `${c.givenName} ${c.familyName}`;
    if (c.givenName) return c.givenName;
    if (c.familyName) return c.familyName;
    return "Unknown Author";
  }).filter(Boolean);

  // Extract publication date - prefer publicationYear, then look for Issued date
  let publicationDate = "";
  if (attrs.publicationYear) {
    publicationDate = `${attrs.publicationYear}-01-01`;
  } else if (attrs.dates && attrs.dates.length > 0) {
    const issuedDate = attrs.dates.find((d: any) => d.dateType === "Issued");
    const createdDate = attrs.dates.find((d: any) => d.dateType === "Created");
    publicationDate = (issuedDate?.date || createdDate?.date || attrs.dates[0]?.date || new Date().toISOString());
  } else {
    publicationDate = new Date().toISOString();
  }

  // Extract license from rightsList - optional field
  const license = attrs.rightsList && attrs.rightsList.length > 0 
    ? attrs.rightsList[0].rights 
    : undefined;

  // Extract format from formats array - optional field
  const format = attrs.formats && attrs.formats.length > 0 
    ? attrs.formats 
    : undefined;

  // Extract size from sizes array - optional field
  const size = attrs.sizes && attrs.sizes.length > 0 
    ? attrs.sizes.join(', ') 
    : undefined;

  // Extract DOI
  const doi = attrs.doi || undefined;

  // Extract keywords from subjects - optional field
  const keywords = attrs.subjects && attrs.subjects.length > 0
    ? attrs.subjects.map((s: any) => s.subject).filter(Boolean)
    : undefined;

  // Extract version - optional field
  const version = attrs.version || undefined;

  return {
    authors: authors.length > 0 ? authors : undefined,
    publicationDate,
    license,
    format,
    size,
    doi,
    keywords,
    version,
  };
}

export async function searchDois(query: string, options?: { page?: number; size?: number; license?: string; resourceType?: string }) {
  const page = options?.page ?? 1;
  const size = options?.size ?? DEFAULT_PAGE_SIZE;

  const params = new URLSearchParams();
  if (query) params.set('query', query);
  params.set('page[number]', String(page));
  params.set('page[size]', String(size));
  if (options?.license) params.set('license', options.license);
  if (options?.resourceType) params.set('resource-type', options.resourceType);

  const url = `${DATACITE_BASE}/dois?${params.toString()}`;

  const res = await fetch(url, { headers: { Accept: 'application/vnd.api+json' } });
  if (!res.ok) throw new Error(`DataCite search failed: ${res.status} ${res.statusText}`);

  const body = await res.json();
  const data = body.data || [];

  return data.map(mapDoiToDataset);
}

export async function getDoiDetail(id: string) {
  // id should be DOI string or DataCite id. The DataCite API supports GET /dois/{id}
  const url = `${DATACITE_BASE}/dois/${encodeURIComponent(id)}`;
  const res = await fetch(url, { headers: { Accept: 'application/vnd.api+json' } });
  console.log('Fetching DOI detail from:', url, 'Status:', res.status);
  if (!res.ok) throw new Error(`DataCite detail fetch failed: ${res.status} ${res.statusText}`);
  const body = await res.json();
  const item = body.data;
  if (!item) return null;
  return mapDoiToDataset(item);
}
