tableextension 50161 "OD Tenant Portal User Ext." extends "OD Tenant Portal User"
{
    fields
    {
        field(50100; "Invitation Status"; Enum "Tenant Portal Invitation Status")
        {
            Caption = 'Invitation Status';
            DataClassification = CustomerContent;
        }
        field(50101; "Invitation Sent At"; DateTime)
        {
            Caption = 'Invitation Sent At';
            DataClassification = SystemMetadata;
        }
        field(50102; "Invitation Accepted At"; DateTime)
        {
            Caption = 'Invitation Accepted At';
            DataClassification = SystemMetadata;
        }
        field(50103; "Invitation Expires At"; DateTime)
        {
            Caption = 'Invitation Expires At';
            DataClassification = SystemMetadata;
        }
        field(50104; "Last Invitation Error"; Text[2048])
        {
            Caption = 'Last Invitation Error';
            DataClassification = CustomerContent;
        }
        field(50105; "Last Sync Status"; Text[30])
        {
            Caption = 'Last Sync Status';
            DataClassification = CustomerContent;
        }
        field(50106; "Last Sync Error"; Text[2048])
        {
            Caption = 'Last Sync Error';
            DataClassification = CustomerContent;
        }
        field(50107; "Updated At"; DateTime)
        {
            Caption = 'Updated At';
            DataClassification = SystemMetadata;
        }
        field(50108; "Updated By"; Text[100])
        {
            Caption = 'Updated By';
            DataClassification = EndUserIdentifiableInformation;
        }
    }
}
