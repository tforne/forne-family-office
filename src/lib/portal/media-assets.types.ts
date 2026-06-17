export type PortalMediaViewerType = "image" | "pdf" | "file";

export interface PortalMediaAsset {
  id: string;
  entryNo?: number;
  title: string;
  filename: string;
  category: string;
  propertyNo: string;
  propertyLabel?: string;
  description?: string;
  aiDescription?: string;
  mediaType?: string;
  contentType?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  visibility?: string;
  status?: string;
  published?: boolean;
  sortOrder?: number;
  validFrom?: string;
  validTo?: string;
  createdAt?: string;
  updatedAt?: string;
  byteSizeLabel?: string;
  viewerType: PortalMediaViewerType;
}

export interface PortalMediaFile {
  id: string;
  mediaAssetId?: string;
  entryNo?: number;
  propertyNo?: string;
  title?: string;
  hasContent?: boolean;
  filename: string;
  contentType: string;
  contentBase64: string;
}
