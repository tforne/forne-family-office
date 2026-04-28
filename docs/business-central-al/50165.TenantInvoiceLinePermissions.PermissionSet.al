permissionset 50165 "OD Tenant Invoice Lines"
{
    Assignable = true;
    Caption = 'OD Tenant Invoice Lines';

    Permissions =
        tabledata "Sales Invoice Line" = R;
}
