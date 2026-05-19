type PortalPageContextPayload = {
  pageTitle?: string;
  pageSummary?: string;
  pageEyebrow?: string;
  visibleFacts?: Array<{
    label: string;
    value: string;
    helper?: string;
  }>;
  visibleSections?: Array<{
    title: string;
    summary: string;
  }>;
  visibleUpdates?: Array<{
    date?: string;
    text: string;
  }>;
};

export default function PortalPageContext({ payload }: { payload: PortalPageContextPayload }) {
  return (
    <script
      id="portal-page-context"
      type="application/json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }}
    />
  );
}
