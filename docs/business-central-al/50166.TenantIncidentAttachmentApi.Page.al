page 50166 "Tenant Incident Attachment API"
{
    PageType = API;
    Caption = 'Tenant Incident Attachment API';
    APIPublisher = 'onedata';
    APIGroup = 'tenantportal';
    APIVersion = 'v1.0';
    EntityName = 'tenantIncidentAttachment';
    EntitySetName = 'tenantIncidentRequestAttachments';
    SourceTable = "Tenant Incident Attachment";
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
                field(requestId; Rec."Request Id")
                {
                    Caption = 'Request Id';
                }
                field(fileName; Rec."File Name")
                {
                    Caption = 'File Name';
                }
                field(contentType; Rec."Content Type")
                {
                    Caption = 'Content Type';
                }
                field(contentBase64; Rec."Content Base64")
                {
                    Caption = 'Content Base64';
                }
            }
        }
    }
}
