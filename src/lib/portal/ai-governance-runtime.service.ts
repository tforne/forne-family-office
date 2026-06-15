import type { PortalAction, PortalOperationalRouting } from "@/lib/portal/chat-assistant";
import type { GovernedPortalRuntimeAction, PortalAgentRuntimeResolution } from "@/lib/portal/ai-agent-runtime.service";

function actionFromRouting(routing: PortalOperationalRouting | undefined): GovernedPortalRuntimeAction | null {
  if (!routing) return null;

  switch (routing.destination) {
    case "incident_detail":
    case "incidents":
      return "view_incident";
    case "invoices":
      return "view_invoice";
    case "contracts":
      return "view_contract";
    case "documents":
      return "view_documents";
    case "support":
      return "contact_support";
    default:
      return null;
  }
}

export function mapPortalActionToGovernedAction(action: PortalAction): GovernedPortalRuntimeAction | null {
  switch (action.type) {
    case "create_incident":
    case "create_anyway":
      return "create_incident";
    case "append_comment":
      return "append_comment";
    case "attach_photo":
      return "add_attachment";
    case "view_incident":
      return "view_incident";
    case "view_invoice":
      return "view_invoice";
    case "view_contract":
      return "view_contract";
    case "view_documents":
      return "view_documents";
    case "contact_support":
      return "contact_support";
    case "follow_operational_route":
      return actionFromRouting(action.payload as PortalOperationalRouting | undefined);
    default:
      return null;
  }
}

export function filterPortalActionsByRuntime(actions: PortalAction[], runtime: PortalAgentRuntimeResolution): PortalAction[] {
  if (actions.length === 0) return actions;

  const allowed = new Set(runtime.allowedActions);
  return actions.filter((action) => {
    const governedAction = mapPortalActionToGovernedAction(action);
    if (!governedAction) {
      return runtime.resolutionSource !== "local_fallback" || runtime.governanceMode !== "unsafe";
    }

    return allowed.has(governedAction);
  });
}
