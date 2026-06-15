import { describe, expect, it } from "vitest";
import {
  buildStakeholdersAIContext,
  buildStakeholderReferenceCandidates,
  getPortalStakeholders,
  isMissingBusinessCentralEndpointError,
  normalizePortalStakeholders
} from "@/lib/portal/stakeholders.service";
import { env } from "@/lib/config/env";
import * as bcClient from "@/lib/bc/client";
import * as userContext from "@/lib/portal/user-context";
import { vi } from "vitest";

describe("stakeholders.service", () => {
  it("normalizes, sanitizes and sorts stakeholders by priority and title", () => {
    const result = normalizePortalStakeholders([
      {
        entryNo: 2,
        propertyNo: "PROP-001",
        stakeholderNo: "STK-2",
        stakeholderName: "Proveedor B",
        category: "Mantenimiento",
        serviceTitle: "<b>Zeta</b>",
        portalDescription: "  Reparaciones <script>x</script> urgentes  ",
        whatsappNo: "+34 611-22-33-44",
        bookingUrl: "https://proveedor-b.example.com",
        availableForAI: true,
        priorityScore: 10
      },
      {
        entryNo: 1,
        propertyNo: "PROP-001",
        stakeholderNo: "STK-1",
        stakeholderName: "Proveedor A",
        category: "Limpieza",
        serviceTitle: "Alfa",
        portalDescription: "Limpieza",
        whatsappNo: "(+34) 600 11 22 33",
        bookingUrl: "javascript:alert(1)",
        availableForAI: false,
        priorityScore: 50
      }
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].serviceTitle).toBe("Alfa");
    expect(result[0].whatsappNo).toBe("34600112233");
    expect(result[0].whatsappHref).toBe("https://wa.me/34600112233");
    expect(result[0].bookingUrl).toBeUndefined();
    expect(result[1].portalDescription).not.toContain("<script>");
  });

  it("deduplicates obvious duplicates", () => {
    const result = normalizePortalStakeholders([
      {
        propertyNo: "PROP-001",
        stakeholderNo: "STK-1",
        stakeholderName: "Proveedor A",
        category: "Limpieza",
        serviceTitle: "Limpieza premium"
      },
      {
        propertyNo: "PROP-001",
        stakeholderNo: "STK-9",
        stakeholderName: "Proveedor A",
        category: "Limpieza",
        serviceTitle: "Limpieza premium"
      }
    ]);

    expect(result).toHaveLength(1);
  });

  it("keeps portal-visible stakeholders even when BC returns a minimal record", () => {
    const result = normalizePortalStakeholders([
      {
        entryNo: 1,
        propertyNo: "AFI-19-00024",
        stakeholderNo: "SH-26-00006",
        stakeholderCategory: "Undefined",
        active: true,
        portalVisible: true,
        availableForAI: true
      }
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].propertyNo).toBe("AFI-19-00024");
    expect(result[0].stakeholderName).toBe("SH-26-00006");
    expect(result[0].serviceTitle).toBe("SH-26-00006");
  });

  it("builds AI context using only AI-available services", () => {
    const context = buildStakeholdersAIContext([
      {
        entryNo: 1,
        propertyNo: "PROP-001",
        stakeholderNo: "STK-1",
        stakeholderName: "Clean BCN",
        category: "Limpieza",
        serviceTitle: "Limpieza premium",
        portalDescription: "Servicio visible",
        availableForAI: true
      },
      {
        entryNo: 2,
        propertyNo: "PROP-001",
        stakeholderNo: "STK-2",
        stakeholderName: "Seguros Forné",
        category: "Seguro",
        serviceTitle: "Orientación de siniestros",
        portalDescription: "No debe entrar",
        availableForAI: false
      }
    ]);

    expect(context).toContain("AVAILABLE PROPERTY SERVICES:");
    expect(context).toContain("Service: Limpieza premium");
    expect(context).not.toContain("Orientación de siniestros");
  });

  it("recognizes missing Business Central endpoint errors", () => {
    const missingEndpointMessage =
      "Business Central error 404 (https://api.businesscentral.dynamics.com/.../portalStakeholdersRich?$filter=propertyNo%20eq%20'AFI-19-00024'): {\"error\":{\"code\":\"BadRequest_NotFound\",\"message\":\"No HTTP resource was found that matches the request URI\"}}";

    expect(isMissingBusinessCentralEndpointError(missingEndpointMessage, "portalStakeholdersRich")).toBe(true);
    expect(isMissingBusinessCentralEndpointError("Business Central error 401 (url): Unauthorized", "portalStakeholdersRich")).toBe(
      false
    );
  });

  it("builds distinct stakeholder reference candidates preserving useful alternatives", () => {
    const references = buildStakeholderReferenceCandidates([
      " PROP-001 ",
      "FRE-900",
      "PROP-001",
      "",
      null,
      "FRE-900",
      "ASSET-12"
    ]);

    expect(references).toEqual(["PROP-001", "FRE-900", "ASSET-12"]);
  });

  it("falls back to an unfiltered fetch and filters locally when BC field filters do not match", async () => {
    vi.spyOn(userContext, "resolvePortalUserContext").mockResolvedValue({
      bcCompanyId: "company-1",
      bcCompanyName: "Test Company",
      customerNo: "CUST-1",
      customerName: "Cliente",
      contactNo: "CONTACT-1",
      profileNo: "PROFILE-1",
      profileDescription: "Perfil",
      email: "tenant@example.com",
      displayName: "Tenant"
    });

    const bcSpy = vi
      .spyOn(bcClient, "bcGetForCompany")
      .mockRejectedValueOnce(new Error("Business Central error 400 (url): Could not find a property named 'propertyNo'"))
      .mockRejectedValueOnce(new Error("Business Central error 400 (url): Could not find a property named 'fixedRealEstateNo'"))
      .mockRejectedValueOnce(new Error("Business Central error 400 (url): Could not find a property named 'assetNo'"))
      .mockRejectedValueOnce(new Error("Business Central error 400 (url): Could not find a property named 'freNo'"))
      .mockRejectedValueOnce(new Error("Business Central error 400 (url): Could not find a property named 'no'"))
      .mockResolvedValueOnce({
        value: [
          {
            propertyNo: "AFI-19-00024",
            stakeholderNo: "SH-26-00006",
            stakeholderCategory: "Undefined",
            active: true,
            portalVisible: true,
            availableForAI: true
          },
          {
            propertyNo: "OTHER-1",
            stakeholderNo: "SH-00-00001",
            active: true,
            portalVisible: true
          }
        ]
      });

    const previousMockSetting = env.useMockApi;
    (env as { useMockApi: boolean }).useMockApi = false;

    const result = await getPortalStakeholders("AFI-19-00024");

    expect(result).toHaveLength(1);
    expect(result[0].propertyNo).toBe("AFI-19-00024");
    expect(result[0].stakeholderNo).toBe("SH-26-00006");
    expect(bcSpy).toHaveBeenCalledTimes(6);

    (env as { useMockApi: boolean }).useMockApi = previousMockSetting;
  });
});
