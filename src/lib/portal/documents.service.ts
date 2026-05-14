import { env } from "@/lib/config/env";
import { mockDocuments } from "@/lib/mock/data";
import { resolvePortalUserContext } from "./user-context";
import { bcGetForCompany } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { eqFilter, odataQuery, unwrap } from "@/lib/bc/odata";
import type { DocumentDto } from "@/lib/dto/document.dto";
import type { ContractDto } from "@/lib/dto/contract.dto";

type PortalDocumentFileDto = {
  fileName?: string | null;
  contentType?: string | null;
  contentBase64?: string | null;
  hasAttachment?: boolean | null;
};

type PortalDocumentFileResult = {
  bytes: Uint8Array;
  fileName: string;
  contentType: string;
};

function sortDocumentsByIssueDateDesc(documents: DocumentDto[]) {
  return [...documents].sort((left, right) => {
    const leftDate = Date.parse(left.issueDate || "");
    const rightDate = Date.parse(right.issueDate || "");

    if (Number.isNaN(leftDate) && Number.isNaN(rightDate)) return 0;
    if (Number.isNaN(leftDate)) return 1;
    if (Number.isNaN(rightDate)) return -1;

    return rightDate - leftDate;
  });
}

function canDownloadDocument(document: DocumentDto) {
  return document.hasAttachment && document.downloadAllowed !== false;
}

export async function getDocuments(): Promise<DocumentDto[]> {
  if (env.useMockApi) return mockDocuments;
  const user = await resolvePortalUserContext();
  const company = { companyId: user.bcCompanyId, companyName: user.bcCompanyName };
  const contractsPayload = await bcGetForCompany<{ value?: ContractDto[] }>(
    company,
    bcEndpoints.contracts,
    odataQuery({
      filter: eqFilter("customerNo", user.customerNo),
      orderBy: "contractNo desc"
    })
  );
  const contracts = unwrap(contractsPayload);
  const sourceNos = Array.from(
    new Set(
      [
        user.customerNo,
        ...contracts.flatMap((contract) => [contract.contractNo, contract.fixedRealEstateNo])
      ].filter((value): value is string => Boolean(value?.trim()))
    )
  );
  const payload = await bcGetForCompany<{ value?: DocumentDto[] }>(company, bcEndpoints.documents);
  return sortDocumentsByIssueDateDesc(Array.from(
    new Map(
      unwrap(payload)
        .filter((document) => {
          const sourceNo = document.sourceNo?.trim();
          return Boolean(sourceNo && sourceNos.includes(sourceNo));
        })
        .map((document) => [document.id || document.no, document])
    ).values()
  ));
}

export async function getDocumentById(id: string): Promise<DocumentDto | undefined> {
  const documents = await getDocuments();
  return documents.find((document) => document.id === id || document.no === id);
}

export async function getDocumentFile(document: DocumentDto): Promise<PortalDocumentFileResult> {
  if (!document.id?.trim()) {
    throw new Error("El documento no tiene identificador para resolver la descarga.");
  }

  if (!canDownloadDocument(document)) {
    throw new Error("La descarga de este documento no está permitida.");
  }

  if (env.useMockApi) {
    const fileName = document.attachmentFileName?.trim() || `${document.no || document.id}.txt`;
    return {
      bytes: Buffer.from(`Contenido de prueba para ${document.description || document.no || document.id}.`, "utf-8"),
      fileName,
      contentType: "text/plain; charset=utf-8"
    };
  }

  const user = await resolvePortalUserContext();
  const payload = await bcGetForCompany<PortalDocumentFileDto>(
    { companyId: user.bcCompanyId, companyName: user.bcCompanyName },
    `${bcEndpoints.documentFiles}(${document.id})`
  );

  if (!payload?.hasAttachment) {
    throw new Error("Business Central indica que este documento no tiene adjunto descargable.");
  }

  const contentBase64 = payload.contentBase64?.trim();
  if (!contentBase64) {
    throw new Error("Business Central no ha devuelto contenido para este documento.");
  }

  return {
    bytes: Buffer.from(contentBase64, "base64"),
    fileName: payload.fileName?.trim() || document.attachmentFileName?.trim() || `${document.no || document.id}`,
    contentType: payload.contentType?.trim() || "application/octet-stream"
  };
}
