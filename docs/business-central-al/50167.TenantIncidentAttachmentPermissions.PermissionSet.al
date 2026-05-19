permissionset 50167 "TENANT INCIDENT ATTACH"
{
    Assignable = true;
    Caption = 'Tenant Incident Attachment API';

    Permissions =
        tabledata "Tenant Incident Attachment" = RI,
        table "Tenant Incident Attachment" = X,
        page "Tenant Incident Attachment API" = X;
}
