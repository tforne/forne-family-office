page 50166 "Tenant Incident Attachment API"
{
    PageType = API;
    Caption = 'Tenant Incident Attachment API';
    APIPublisher = 'onedata';
    APIGroup = 'tenantportal';
    APIVersion = 'v1.0';
    EntityName = 'tenantIncidentAttachment';
    EntitySetName = 'tenantIncidentAttachments';
    SourceTable = "Document Attachment";
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
                field(tableId; Rec."Table ID")
                {
                    Caption = 'Table ID';
                    Editable = false;
                }
                field(no; Rec."No.")
                {
                    Caption = 'No.';
                    Editable = false;
                }
                field(lineNo; Rec."Line No.")
                {
                    Caption = 'Line No.';
                    Editable = false;
                }
                field(fileName; Rec."File Name")
                {
                    Caption = 'File Name';
                    Editable = false;
                }
                field(fileExtension; Rec."File Extension")
                {
                    Caption = 'File Extension';
                    Editable = false;
                }
                field(attachedDate; Rec."Attached Date")
                {
                    Caption = 'Attached Date';
                    Editable = false;
                }
                field(userId; Rec."User ID")
                {
                    Caption = 'User ID';
                    Editable = false;
                }
                field(documentFlowPurchase; Rec."Document Flow Purchase")
                {
                    Caption = 'Document Flow Purchase';
                    Editable = false;
                }
                field(documentFlowSales; Rec."Document Flow Sales")
                {
                    Caption = 'Document Flow Sales';
                    Editable = false;
                }
                field(documentReferenceId; Rec."Document Reference ID")
                {
                    Caption = 'Document Reference ID';
                    Editable = false;
                }
            }
        }
    }
}
