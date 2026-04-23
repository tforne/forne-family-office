page 50162 "OD Tenant Portal User API"
{
    PageType = API;
    Caption = 'OD Tenant Portal User API';
    APIPublisher = 'onedata';
    APIGroup = 'tenantportal';
    APIVersion = 'v1.0';
    EntityName = 'tenantPortalUser';
    EntitySetName = 'tenantPortalUsers';
    SourceTable = "OD Tenant Portal User";
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
                field(entryNo; Rec."Entry No.")
                {
                    Caption = 'Entry No.';
                    Editable = false;
                }
                field(externalUserId; Rec."External User Id")
                {
                    Caption = 'External User Id';
                }
                field(email; Rec.Email)
                {
                    Caption = 'Email';
                }
                field(customerNo; Rec."Customer No.")
                {
                    Caption = 'Customer No.';
                }
                field(portalEnabled; Rec."Portal Enabled")
                {
                    Caption = 'Portal Enabled';
                }
                field(blocked; Rec.Blocked)
                {
                    Caption = 'Blocked';
                }
                field(lastLoginDateTime; Rec."Last Login Date Time")
                {
                    Caption = 'Last Login Date Time';
                }
                field(languageCode; Rec."Language Code")
                {
                    Caption = 'Language Code';
                }
                field(createdAt; Rec."Created At")
                {
                    Caption = 'Created At';
                    Editable = false;
                }
                field(bcCompanyName; Rec."BC Company Name")
                {
                    Caption = 'BC Company Name';
                }
                field(invitationStatus; Rec."Invitation Status")
                {
                    Caption = 'Invitation Status';
                }
                field(invitationSentAt; Rec."Invitation Sent At")
                {
                    Caption = 'Invitation Sent At';
                }
                field(invitationAcceptedAt; Rec."Invitation Accepted At")
                {
                    Caption = 'Invitation Accepted At';
                }
                field(invitationExpiresAt; Rec."Invitation Expires At")
                {
                    Caption = 'Invitation Expires At';
                }
                field(lastInvitationError; Rec."Last Invitation Error")
                {
                    Caption = 'Last Invitation Error';
                }
                field(lastSyncStatus; Rec."Last Sync Status")
                {
                    Caption = 'Last Sync Status';
                }
                field(lastSyncError; Rec."Last Sync Error")
                {
                    Caption = 'Last Sync Error';
                }
                field(updatedAt; Rec."Updated At")
                {
                    Caption = 'Updated At';
                }
                field(updatedBy; Rec."Updated By")
                {
                    Caption = 'Updated By';
                }
            }
        }
    }

    trigger OnModifyRecord(): Boolean
    begin
        Rec."Updated At" := CurrentDateTime();
        exit(true);
    end;
}
