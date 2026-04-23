page 50152 "Tenant Incident Request API"
{
    PageType = API;
    Caption = 'Tenant Incident Request API';
    APIPublisher = 'onedata';
    APIGroup = 'tenantportal';
    APIVersion = 'v1.0';
    EntityName = 'tenantIncidentRequest';
    EntitySetName = 'tenantIncidentRequests';
    SourceTable = "Tenant Incident Request";
    DelayedInsert = true;
    InsertAllowed = true;
    ModifyAllowed = false;
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
                field(entryNo; Rec."Entry No.")
                {
                    Caption = 'Entry No.';
                    Editable = false;
                }
                field(requestId; Rec."Request Id")
                {
                    Caption = 'Request Id';
                    Editable = false;
                }
                field(incidentDate; Rec."Incident Date")
                {
                    Caption = 'Incident Date';
                }
                field(title; Rec.Title)
                {
                    Caption = 'Title';
                }
                field(description; Rec.Description)
                {
                    Caption = 'Description';
                }
                field(caseType; Rec."Case Type")
                {
                    Caption = 'Case Type';
                }
                field(priority; Rec.Priority)
                {
                    Caption = 'Priority';
                }
                field(contractNo; Rec."Contract No.")
                {
                    Caption = 'Contract No.';
                }
                field(fixedRealEstateNo; Rec."Fixed Real Estate No.")
                {
                    Caption = 'Fixed Real Estate No.';
                }
                field(refDescription; Rec."Ref. Description")
                {
                    Caption = 'Ref. Description';
                }
                field(contactName; Rec."Contact Name")
                {
                    Caption = 'Contact Name';
                }
                field(contactPhoneNo; Rec."Contact Phone No.")
                {
                    Caption = 'Contact Phone No.';
                }
                field(contactEmail; Rec."Contact Email")
                {
                    Caption = 'Contact Email';
                }
                field(portalUserEmail; Rec."Portal User Email")
                {
                    Caption = 'Portal User Email';
                }
                field(source; Rec.Source)
                {
                    Caption = 'Source';
                    Editable = false;
                }
                field(status; Rec.Status)
                {
                    Caption = 'Status';
                    Editable = false;
                }
                field(createdIncidentNo; Rec."Created Incident No.")
                {
                    Caption = 'Created Incident No.';
                    Editable = false;
                }
                field(errorMessage; Rec."Error Message")
                {
                    Caption = 'Error Message';
                    Editable = false;
                }
                field(createdAt; Rec."Created At")
                {
                    Caption = 'Created At';
                    Editable = false;
                }
                field(processedAt; Rec."Processed At")
                {
                    Caption = 'Processed At';
                    Editable = false;
                }
            }
        }
    }

    trigger OnInsertRecord(BelowxRec: Boolean): Boolean
    begin
        Rec.Status := Rec.Status::New;
        Rec."Error Message" := '';
        exit(true);
    end;
}
