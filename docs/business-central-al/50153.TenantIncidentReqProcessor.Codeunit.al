codeunit 50153 "Tenant Incident Req. Processor"
{
    // Optional future processor. The current portal flow only inserts a staging
    // request so a Business Central workflow can email the tenant.
    procedure Process(var Request: Record "Tenant Incident Request")
    var
        CreatedIncidentNo: Code[20];
    begin
        ValidateRequest(Request);

        Request.Status := Request.Status::Processing;
        Request."Error Message" := '';
        Request.Modify(true);

        if not TryCreateIncident(Request, CreatedIncidentNo) then begin
            Request.Status := Request.Status::Error;
            Request."Error Message" := CopyStr(GetLastErrorText(), 1, MaxStrLen(Request."Error Message"));
            Request."Processed At" := CurrentDateTime();
            Request.Modify(true);
            Error(Request."Error Message");
        end;

        Request.Status := Request.Status::Created;
        Request."Created Incident No." := CreatedIncidentNo;
        Request."Processed At" := CurrentDateTime();
        Request.Modify(true);
    end;

    local procedure ValidateRequest(Request: Record "Tenant Incident Request")
    begin
        Request.TestField(Title);
        Request.TestField(Description);
        Request.TestField("Contact Email");

        if Request."Case Type" = '' then
            Request."Case Type" := 'Problem';

        if Request.Priority = '' then
            Request.Priority := 'Normal';
    end;

    [TryFunction]
    local procedure TryCreateIncident(Request: Record "Tenant Incident Request"; var CreatedIncidentNo: Code[20])
    begin
        CreateIncidentFromRequest(Request, CreatedIncidentNo);
    end;

    local procedure CreateIncidentFromRequest(Request: Record "Tenant Incident Request"; var CreatedIncidentNo: Code[20])
    var
        IsHandled: Boolean;
    begin
        OnCreateIncidentFromPortalRequest(Request, CreatedIncidentNo, IsHandled);

        if not IsHandled then
            Error('No incident creation handler is subscribed for portal request %1.', Request."Entry No.");
    end;

    [IntegrationEvent(false, false)]
    local procedure OnCreateIncidentFromPortalRequest(Request: Record "Tenant Incident Request"; var CreatedIncidentNo: Code[20]; var IsHandled: Boolean)
    begin
    end;
}
