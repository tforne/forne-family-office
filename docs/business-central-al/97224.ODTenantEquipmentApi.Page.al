page 97224 "OD Tenant Equipment API"
{
    PageType = API;
    Caption = 'Tenant Equipment API';
    APIPublisher = 'onedata';
    APIGroup = 'tenantportal';
    APIVersion = 'v1.0';
    EntityName = 'tenantEquipment';
    EntitySetName = 'tenantEquipments';
    SourceTable = "FRE Equipment";
    ODataKeyFields = SystemId;
    Editable = false;
    InsertAllowed = false;
    ModifyAllowed = false;
    DeleteAllowed = false;
    Permissions =
        tabledata "FRE Equipment" = R;

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field(id; Rec.SystemId)
                {
                    Caption = 'Id';
                }
                field(freNo; Rec."FRE No.")
                {
                    Caption = 'FRE No.';
                }
                field(lineNo; Rec."Line No.")
                {
                    Caption = 'Line No.';
                }
                field(quantity; Rec.Quantity)
                {
                    Caption = 'Quantity';
                }
                field(description; Rec.Description)
                {
                    Caption = 'Description';
                }
                field(serialNo; Rec."Serial No.")
                {
                    Caption = 'Serial No.';
                }
                field(modelNo; Rec."Model No.")
                {
                    Caption = 'Model No.';
                }
                field(acquisitionDate; Rec."Acquisition Date")
                {
                    Caption = 'Acquisition Date';
                }
                field(acquisitionCost; Rec."Acquisition Cost")
                {
                    Caption = 'Acquisition Cost';
                }
                field(equipmentWarrantyPeriod; Rec."Equipment Warranty Period")
                {
                    Caption = 'Equipment Warranty Period';
                }
                field(needMaintenance; Rec."Need Maintenance?")
                {
                    Caption = 'Need Maintenance?';
                }
                field(maintenanceContractNo; Rec."Maintenance Contract No.")
                {
                    Caption = 'Maintenance Contract No.';
                }
            }
        }
    }
}
