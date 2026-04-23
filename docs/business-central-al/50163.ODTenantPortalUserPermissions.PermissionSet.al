permissionset 50163 "Tenant Portal Users API"
{
    Caption = 'Tenant Portal Users API';
    Assignable = true;

    Permissions =
        tabledata "OD Tenant Portal User" = RIM,
        table "OD Tenant Portal User" = X,
        page "OD Tenant Portal User API" = X;
}
