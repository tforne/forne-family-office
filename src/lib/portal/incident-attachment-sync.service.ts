import { bcPostForCompany } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { env } from "@/lib/config/env";
import { resolvePortalUserContext } from "./user-context";

export type IncidentAttachmentInput = {
  fileName: string;
  contentType: string;
  bytes: Uint8Array;
};

export type IncidentAttachmentSyncResult = {
  uploadedCount: number;
  fileNames: string[];
};

type BusinessCentralIncidentAttachmentPayload = {
  requestId: string;
  fileName: string;
  contentType: string;
  contentBase64: string;
};

function cleanFileName(value: string) {
  const trimmed = value.trim();
  return trimmed.replace(/[/\\?%*:|"<>]/g, "-") || "adjunto";
}

export async function syncIncidentRequestAttachments(
  requestId: string,
  files: IncidentAttachmentInput[]
): Promise<IncidentAttachmentSyncResult> {
  if (!files.length) {
    return { uploadedCount: 0, fileNames: [] };
  }

  if (!requestId.trim()) {
    throw new Error("La petición creada no tiene identificador para sincronizar adjuntos.");
  }

  if (env.useMockApi) {
    return {
      uploadedCount: files.length,
      fileNames: files.map((file) => cleanFileName(file.fileName))
    };
  }

  const user = await resolvePortalUserContext();

  for (const file of files) {
    const payload: BusinessCentralIncidentAttachmentPayload = {
      requestId: requestId.trim(),
      fileName: cleanFileName(file.fileName),
      contentType: file.contentType.trim() || "application/octet-stream",
      contentBase64: Buffer.from(file.bytes).toString("base64")
    };

    await bcPostForCompany(
      { companyId: user.bcCompanyId, companyName: user.bcCompanyName },
      bcEndpoints.incidentRequestAttachments,
      payload
    );
  }

  return {
    uploadedCount: files.length,
    fileNames: files.map((file) => cleanFileName(file.fileName))
  };
}
