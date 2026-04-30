permissionset 50167 "TENANT INCIDENT ATTACH"
{
    Assignable = true;
    Caption = 'Tenant Incident Attachment API';

    Permissions =
        tabledata "Document Attachment" = R,
        table "Document Attachment" = X,
        page "Tenant Incident Attachment API" = X;
}
