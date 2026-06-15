import { describe, expect, it } from "vitest";
import {
  detectServiceRecommendationCategory,
  matchStakeholdersForRecommendation
} from "@/lib/portal/service-recommendation.service";
import type { PortalStakeholder } from "@/lib/portal/stakeholders.types";

const stakeholders: PortalStakeholder[] = [
  {
    entryNo: 1,
    propertyNo: "PROP-001",
    stakeholderNo: "STK-001",
    stakeholderName: "Clean BCN",
    category: "Cleaning",
    serviceTitle: "Premium Cleaning",
    portalDescription: "Premium apartment cleaning",
    aiDescription: "Cleaning service for this property",
    availableForAI: true,
    priorityScore: 90,
    defaultForCategory: true
  },
  {
    entryNo: 2,
    propertyNo: "PROP-001",
    stakeholderNo: "STK-002",
    stakeholderName: "Digi Fiber",
    category: "Internet",
    serviceTitle: "Fiber Internet",
    portalDescription: "High speed internet",
    aiDescription: "Internet provider for this property",
    availableForAI: true,
    priorityScore: 80
  },
  {
    entryNo: 3,
    propertyNo: "PROP-001",
    stakeholderNo: "STK-003",
    stakeholderName: "Seguros Forné",
    category: "Insurance",
    serviceTitle: "Insurance Support",
    portalDescription: "Coverage guidance",
    aiDescription: "Insurance guidance",
    availableForAI: false,
    priorityScore: 99
  }
];

describe("service-recommendation.service", () => {
  it("detects a supported recommendation category from the user message", () => {
    const result = detectServiceRecommendationCategory("Necesito internet para el piso");

    expect(result.category).toBe("Internet");
    expect(result.matchedSignals).toContain("internet");
  });

  it("matches only AI-visible stakeholders for the requested category", () => {
    const result = matchStakeholdersForRecommendation("Hay alguien para limpieza", stakeholders);

    expect(result.requestedCategory).toBe("Cleaning");
    expect(result.matchedStakeholders).toHaveLength(1);
    expect(result.matchedStakeholders[0]?.stakeholderName).toBe("Clean BCN");
  });

  it("avoids recommending unavailable stakeholders", () => {
    const result = matchStakeholdersForRecommendation("Hay algun seguro", stakeholders);

    expect(result.requestedCategory).toBe("Insurance");
    expect(result.matchedStakeholders).toHaveLength(0);
  });
});
