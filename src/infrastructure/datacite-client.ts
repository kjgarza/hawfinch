import { Dataset, DatasetMetadata } from "@/components/data";

const DATACITE_BASE = process.env.DATACITE_BASE_URL || "https://api.datacite.org";
const DEFAULT_PAGE_SIZE = 10;

function mapDoiToDataset(item: any): Dataset {
  const attrs = item.attributes || {};
  const metadata = mapAttributesToMetadata(attrs);

  return {
    id: item.id || attrs.doi || `${attrs.prefix}/${attrs.suffix}`,
    title: (attrs.titles && attrs.titles[0] && attrs.titles[0].title) || attrs.title || "",
    description: (attrs.descriptions && attrs.descriptions[0] && attrs.descriptions[0].description) || attrs.abstract || "",
    url: attrs.url || (attrs.identifiers && attrs.identifiers[0] && attrs.identifiers[0].identifier) || "",
    repository: "DataCite",
    metadata,
  };
}

function mapAttributesToMetadata(attrs: any): DatasetMetadata {
  const authors = (attrs.creators || []).map((c: any) => c.name || `${c.givenName || ""} ${c.familyName || ""}`);
  const publicationDate = attrs.publicationYear ? `${attrs.publicationYear}-01-01` : (attrs.dates && attrs.dates[0] && attrs.dates[0].date) || new Date().toISOString();
  const license = (attrs.rightsList && attrs.rightsList[0] && attrs.rightsList[0].rights) || attrs.license || "";
  const format = attrs.formats || (attrs.formats && Array.isArray(attrs.formats) ? attrs.formats : []);
  const size = attrs.sizes && attrs.sizes.length > 0 ? attrs.sizes.join(', ') : attrs.size || "";
  const doi = attrs.doi || (attrs.identifiers && attrs.identifiers.find((i: any) => i.identifierType === 'DOI')?.identifier) || undefined;
  const keywords = (attrs.subjects || []).map((s: any) => s.subject || s);
  const version = attrs.version || attrs.schemaVersion || undefined;

  return {
    authors,
    publicationDate,
    license,
    format: Array.isArray(format) ? format : [format].filter(Boolean),
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
