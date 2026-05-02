import type { MeDto } from "@/lib/dto/me.dto";
export const mockMe: MeDto = {
  userId: "external-demo-user",
  email: "tenant@example.com",
  customerNo: "C0001",
  customerName: "Cliente Demo",
  paymentMethods: ["Transferencia bancaria", "Domiciliación"],
  portalEnabled: true,
  bcCompanyId: "demo-company-id",
  bcCompanyName: "Demo"
};
