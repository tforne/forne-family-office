import { env } from "@/lib/config/env";
import { mockContractLines } from "@/lib/mock/data";
import { bcGetForCompany } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { eqFilter, odataQuery, orFilters, unwrap } from "@/lib/bc/odata";
import { resolvePortalUserContext } from "./user-context";
import type { ContractDto } from "@/lib/dto/contract.dto";
import type { ContractLineDto } from "@/lib/dto/contract-line.dto";

function getString(record: Record<string, unknown>, ...fields: string[]) {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === "string" && value.trim()) return value;
  }

  return "";
}

function getNumber(record: Record<string, unknown>, ...fields: string[]) {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }

  return null;
}

function normalizeContractLine(line: Partial<ContractLineDto>): ContractLineDto {
  const record = line as Record<string, unknown>;

  return {
    ...record,
    id: String(
      getString(record, "id", "systemId", "guid") ||
        getString(record, "contractNo", "documentNo", "no") ||
        `${getString(record, "description", "lineDescription", "concept", "detail")}-${getNumber(record, "lineNo", "lineNumber") ?? ""}`
    ),
    contractId: getString(record, "contractId", "parentId") || null,
    contractNo: getString(record, "contractNo", "documentNo", "agreementNo", "no", "parentNo") || null,
    lineNo: getNumber(record, "lineNo", "lineNumber", "sequenceNo"),
    description: getString(record, "description", "lineDescription", "concept", "detail") || null,
    quantity: getNumber(record, "quantity", "qty"),
    unitPrice: getNumber(record, "unitPrice", "price", "directUnitCost"),
    amount: getNumber(record, "amount", "lineAmount", "netAmount"),
    amountIncludingVat: getNumber(record, "amountIncludingVat", "grossAmount", "totalAmount"),
    currencyCode: getString(record, "currencyCode", "currency") || null
  };
}

function sortByLineNo(lines: ContractLineDto[]) {
  return [...lines].sort((left, right) => (left.lineNo ?? Number.MAX_SAFE_INTEGER) - (right.lineNo ?? Number.MAX_SAFE_INTEGER));
}

function matchesContract(line: ContractLineDto, contract: ContractDto) {
  const record = line as Record<string, unknown>;
  const lineValues = new Set(
    [
      getString(record, "contractNo", "documentNo", "agreementNo", "no", "parentNo"),
      getString(record, "contractId", "parentId"),
      getString(record, "customerNo", "billToCustomerNo"),
      getString(record, "fixedRealEstateNo", "freNo", "realEstateNo")
    ]
      .map((value) => value.trim())
      .filter(Boolean)
  );

  const contractValues = [
    contract.contractNo,
    contract.id,
    contract.customerNo,
    contract.fixedRealEstateNo
  ]
    .map((value) => value?.trim() || "")
    .filter(Boolean);

  return contractValues.some((value) => lineValues.has(value));
}

async function fetchContractLinesForCompany(query?: string) {
  const user = await resolvePortalUserContext();
  const payload = await bcGetForCompany<{ value?: Partial<ContractLineDto>[] }>(
    { companyId: user.bcCompanyId, companyName: user.bcCompanyName },
    env.bcContractLinesEndpoint || bcEndpoints.contractLines,
    query
  );

  return unwrap(payload).map(normalizeContractLine);
}

export async function getContractLines(contract?: ContractDto): Promise<ContractLineDto[]> {
  if (!contract?.contractNo) return [];

  if (env.useMockApi) {
    return sortByLineNo(mockContractLines.filter((line) => line.contractNo === contract.contractNo));
  }

  const candidateFilters = [
    contract.contractNo ? eqFilter("contractNo", contract.contractNo) : "",
    contract.id ? eqFilter("contractId", contract.id) : "",
    contract.contractNo ? eqFilter("documentNo", contract.contractNo) : "",
    contract.contractNo ? eqFilter("no", contract.contractNo) : "",
    contract.customerNo ? eqFilter("customerNo", contract.customerNo) : "",
    contract.fixedRealEstateNo ? eqFilter("fixedRealEstateNo", contract.fixedRealEstateNo) : "",
    contract.fixedRealEstateNo ? eqFilter("freNo", contract.fixedRealEstateNo) : ""
  ].filter(Boolean);

  const filteredQueries = [
    candidateFilters.length
      ? odataQuery({
          filter: orFilters(...candidateFilters),
          orderBy: "lineNo asc",
          top: 200
        })
      : "",
    contract.contractNo
      ? odataQuery({
          filter: eqFilter("contractNo", contract.contractNo),
          top: 200
        })
      : "",
    contract.id
      ? odataQuery({
          filter: eqFilter("contractId", contract.id),
          top: 200
        })
      : ""
  ].filter(Boolean);

  for (const query of filteredQueries) {
    try {
      const lines = sortByLineNo(await fetchContractLinesForCompany(query));
      if (lines.length > 0) return lines;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (
        message.includes("404") ||
        message.includes("Could not find a property named") ||
        message.includes("BadRequest")
      ) {
        continue;
      }
      throw error;
    }
  }

  try {
    const lines = await fetchContractLinesForCompany(
      odataQuery({
        top: 300
      })
    );

    return sortByLineNo(lines.filter((line) => matchesContract(line, contract)));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (
      message.includes("404") ||
      message.includes("Could not find a property named") ||
      message.includes("BadRequest")
    ) {
      return [];
    }
    throw error;
  }
}
