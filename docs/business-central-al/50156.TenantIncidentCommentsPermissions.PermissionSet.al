permissionset 50156 "TENANT INCIDENT COMMENT"
{
    Assignable = true;
    Caption = 'Tenant Incident Comment API';

    Permissions =
        tabledata "OD Tenant Incident Comment" = R,
        table "OD Tenant Incident Comment" = X,
        page "Tenant Incident Comment API" = X;
}
