table 50150 "Tenant Incident Request"
{
    Caption = 'Tenant Incident Request';
    DataClassification = CustomerContent;

    fields
    {
        field(1; "Entry No."; Integer)
        {
            Caption = 'Entry No.';
            AutoIncrement = true;
            DataClassification = SystemMetadata;
        }
        field(2; "Request Id"; Guid)
        {
            Caption = 'Request Id';
            DataClassification = SystemMetadata;
        }
        field(10; "Incident Date"; Date)
        {
            Caption = 'Incident Date';
            DataClassification = CustomerContent;
        }
        field(20; Title; Text[120])
        {
            Caption = 'Title';
            DataClassification = CustomerContent;
        }
        field(30; Description; Text[2048])
        {
            Caption = 'Description';
            DataClassification = CustomerContent;
        }
        field(40; "Case Type"; Text[30])
        {
            Caption = 'Case Type';
            DataClassification = CustomerContent;
        }
        field(50; Priority; Text[30])
        {
            Caption = 'Priority';
            DataClassification = CustomerContent;
        }
        field(60; "Contract No."; Code[20])
        {
            Caption = 'Contract No.';
            DataClassification = CustomerContent;
        }
        field(70; "Fixed Real Estate No."; Code[20])
        {
            Caption = 'Fixed Real Estate No.';
            DataClassification = CustomerContent;
        }
        field(80; "Ref. Description"; Text[120])
        {
            Caption = 'Ref. Description';
            DataClassification = CustomerContent;
        }
        field(90; "Contact Name"; Text[100])
        {
            Caption = 'Contact Name';
            DataClassification = EndUserIdentifiableInformation;
        }
        field(100; "Contact Phone No."; Text[30])
        {
            Caption = 'Contact Phone No.';
            DataClassification = EndUserIdentifiableInformation;
        }
        field(110; "Contact Email"; Text[100])
        {
            Caption = 'Contact Email';
            DataClassification = EndUserIdentifiableInformation;
        }
        field(120; "Portal User Email"; Text[100])
        {
            Caption = 'Portal User Email';
            DataClassification = EndUserIdentifiableInformation;
        }
        field(130; "Source"; Code[20])
        {
            Caption = 'Source';
            DataClassification = CustomerContent;
        }
        field(140; Status; Enum "Tenant Incident Request Status")
        {
            Caption = 'Status';
            DataClassification = CustomerContent;
        }
        field(150; "Created Incident No."; Code[20])
        {
            Caption = 'Created Incident No.';
            DataClassification = CustomerContent;
        }
        field(160; "Error Message"; Text[2048])
        {
            Caption = 'Error Message';
            DataClassification = CustomerContent;
        }
        field(170; "Created At"; DateTime)
        {
            Caption = 'Created At';
            DataClassification = SystemMetadata;
        }
        field(180; "Processed At"; DateTime)
        {
            Caption = 'Processed At';
            DataClassification = SystemMetadata;
        }
    }

    keys
    {
        key(PK; "Entry No.")
        {
            Clustered = true;
        }
        key(RequestId; "Request Id")
        {
        }
        key(Status; Status, "Created At")
        {
        }
        key(ContactEmail; "Contact Email", "Created At")
        {
        }
    }

    trigger OnInsert()
    begin
        if IsNullGuid("Request Id") then
            "Request Id" := CreateGuid();

        if "Incident Date" = 0D then
            "Incident Date" := Today();

        if "Source" = '' then
            "Source" := 'PORTAL';

        if "Created At" = 0DT then
            "Created At" := CurrentDateTime();
    end;
}
