page 50168 "Tenant Asset Attribute API"
{
    PageType = API;
    Caption = 'Tenant Asset Attribute API';
    APIPublisher = 'onedata';
    APIGroup = 'tenantportal';
    APIVersion = 'v1.0';
    EntityName = 'tenantAssetAttribute';
    EntitySetName = 'tenantAssetAttributes';
    SourceTable = "FRE Attribute Value Mapping" temporary;
    SourceTableView = where("Table ID" = const(96000));
    DelayedInsert = false;
    InsertAllowed = false;
    ModifyAllowed = false;
    DeleteAllowed = false;
    ODataKeyFields = SystemId;
    Editable = false;
    Permissions =
        tabledata "FRE Attribute" = R,
        tabledata "FRE Attribute Value" = R,
        tabledata "FRE Attribute Value Mapping" = R,
        tabledata "Fixed Real Estate" = R;

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
                field(realEstateNo; Rec."No.")
                {
                    Caption = 'Real Estate No.';
                    Editable = false;
                }
                field(attributeId; Rec."FRE Attribute ID")
                {
                    Caption = 'Attribute ID';
                    Editable = false;
                }
                field(attributeValueId; Rec."FRE Attribute Value ID")
                {
                    Caption = 'Attribute Value ID';
                    Editable = false;
                }
                field(attributeName; AttributeNameTxt)
                {
                    Caption = 'Attribute Name';
                    Editable = false;
                }
                field(attributeType; AttributeTypeTxt)
                {
                    Caption = 'Attribute Type';
                    Editable = false;
                }
                field(value; AttributeValueTxt)
                {
                    Caption = 'Value';
                    Editable = false;
                }
                field(unitOfMeasure; UnitOfMeasureTxt)
                {
                    Caption = 'Unit of Measure';
                    Editable = false;
                }
                field(comment; Rec.Comment)
                {
                    Caption = 'Comment';
                    Editable = false;
                }
            }
        }
    }

    trigger OnAfterGetRecord()
    var
        FREAttribute: Record "FRE Attribute";
        FREAttributeValue: Record "FRE Attribute Value";
    begin
        Clear(AttributeNameTxt);
        Clear(AttributeTypeTxt);
        Clear(AttributeValueTxt);
        Clear(UnitOfMeasureTxt);

        if FREAttribute.Get(Rec."FRE Attribute ID") then begin
            AttributeNameTxt := FREAttribute.Name;
            AttributeTypeTxt := Format(FREAttribute.Type);
            UnitOfMeasureTxt := FREAttribute."Unit of Measure";
        end;

        if FREAttributeValue.Get(Rec."FRE Attribute ID", Rec."FRE Attribute Value ID") then
            AttributeValueTxt := FREAttributeValue.GetValueInCurrentLanguageWithoutUnitOfMeasure();
    end;

    var
        AttributeNameTxt: Text[250];
        AttributeTypeTxt: Text[100];
        AttributeValueTxt: Text[250];
        UnitOfMeasureTxt: Text[50];

    procedure LoadAttributes(FRENo: Code[20])
    var
        FREAttributeValueMapping: Record "FRE Attribute Value Mapping";
        TempFREAttributeValue: Record "FRE Attribute Value" temporary;
        FREAttributeValue: Record "FRE Attribute Value";
    begin
        RelatedRecordCode := FRENo;
        FREAttributeValueMapping.SETRANGE("Table ID",DATABASE::"Fixed Real Estate");
        FREAttributeValueMapping.SETRANGE("No.",FRENo);
        IF FREAttributeValueMapping.FINDSET THEN
          REPEAT
            TempFREAttributeValue."Attribute ID" := FREAttributeValueMapping."FRE Attribute ID";
            // TempFREAttributeValue."Attribute Name" := FREAttributeValueMapping.
            TempFREAttributeValue.Comment := FREAttributeValueMapping.Comment;
            if FREAttributeValue.GET(FREAttributeValueMapping."FRE Attribute ID",FREAttributeValueMapping."FRE Attribute Value ID") then
                TempFREAttributeValue.TRANSFERFIELDS(FREAttributeValue);
            
            TempFREAttributeValue.INSERT;
          UNTIL FREAttributeValueMapping.NEXT = 0;

        rec.PopulateFREAttributeValueSelection(TempFREAttributeValue);
    end;

}
