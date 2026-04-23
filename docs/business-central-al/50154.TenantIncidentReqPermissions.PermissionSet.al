permissionset 50154 "TENANT INCIDENT REQ"
{
    Assignable = true;
    Caption = 'Tenant Incident Request API';

    Permissions =
        tabledata "Tenant Incident Request" = RIM,
        table "Tenant Incident Request" = X,
        codeunit "Tenant Incident Req. Processor" = X,
        page "Tenant Incident Request API" = X;
}
