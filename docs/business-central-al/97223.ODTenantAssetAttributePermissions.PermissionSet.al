permissionset 97223 "OD TENANT ASSET ATTR"
{
    Assignable = true;
    Caption = 'OD Tenant Asset Attribute API';

    Permissions =
        tabledata "FRE Attribute" = R,
        tabledata "FRE Attribute Value" = R,
        tabledata "FRE Attribute Value Mapping" = R,
        tabledata "Fixed Real Estate" = R,
        table "FRE Attribute" = X,
        table "FRE Attribute Value" = X,
        table "FRE Attribute Value Mapping" = X,
        table "Fixed Real Estate" = X,
        page "OD Tenant Asset Attribute API" = X;
}
