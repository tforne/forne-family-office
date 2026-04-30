permissionset 50169 "TENANT ASSET ATTR"
{
    Assignable = true;
    Caption = 'Tenant Asset Attribute API';

    Permissions =
        tabledata "FRE Attribute" = R,
        tabledata "FRE Attribute Value" = R,
        tabledata "FRE Attribute Value Mapping" = R,
        tabledata "Fixed Real Estate" = R,
        table "FRE Attribute" = X,
        table "FRE Attribute Value" = X,
        table "FRE Attribute Value Mapping" = X,
        table "Fixed Real Estate" = X,
        page "Tenant Asset Attribute API" = X;
}
