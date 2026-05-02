page 97103 "Tenant Portal Config API"
{
    PageType = API;
    Caption = 'Tenant Portal Configuration API';
    APIPublisher = 'onedata';
    APIGroup = 'tenantportal';
    APIVersion = 'v1.0';
    EntityName = 'tenantPortalConfiguration';
    EntitySetName = 'tenantPortalConfigurations';
    SourceTable = "Tenant Portal Configuration";
    DelayedInsert = true;
    InsertAllowed = true;
    ModifyAllowed = true;
    DeleteAllowed = false;
    ODataKeyFields = SystemId;

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field(id; Rec.SystemId)
                {
                    Caption = 'Id';
                    Editable = false;
                }
                field(code; Rec."Code")
                {
                    Caption = 'Code';
                }
                field(description; Rec.Description)
                {
                    Caption = 'Description';
                }
                field(portalUrl; Rec."Portal URL")
                {
                    Caption = 'Portal URL';
                }
                field(enabled; Rec.Enabled)
                {
                    Caption = 'Enabled';
                }
            }
        }
    }
}
