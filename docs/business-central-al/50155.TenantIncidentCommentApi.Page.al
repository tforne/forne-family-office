page 50155 "Tenant Incident Comment API"
{
    PageType = API;
    Caption = 'Tenant Incident Comment API';
    APIPublisher = 'onedata';
    APIGroup = 'tenantportal';
    APIVersion = 'v1.0';
    EntityName = 'tenantIncidentComment';
    EntitySetName = 'tenantIncidentComments';
    SourceTable = "OD Tenant Incident Comment";
    InsertAllowed = false;
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
                field(incidentId; Rec."Incident Id")
                {
                    Caption = 'Incident Id';
                    Editable = false;
                }
                field(incidentNo; Rec."Incident No.")
                {
                    Caption = 'Incident No.';
                    Editable = false;
                }
                field(commentDate; Rec."Comment Date")
                {
                    Caption = 'Comment Date';
                    Editable = false;
                }
                field(commentText; Rec."Comment Text")
                {
                    Caption = 'Comment Text';
                    Editable = false;
                }
                field(createdBy; Rec."Created By")
                {
                    Caption = 'Created By';
                    Editable = false;
                }
                field(source; Rec.Source)
                {
                    Caption = 'Source';
                    Editable = false;
                }
                field(isPublic; Rec."Is Public")
                {
                    Caption = 'Is Public';
                    Editable = false;
                }
                field(createdAt; Rec."Created At")
                {
                    Caption = 'Created At';
                    Editable = false;
                }
            }
        }
    }
}
