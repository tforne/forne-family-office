page 97221 "OD Tenant Portal Asset API"
{
    PageType = API;
    Caption = 'Tenant Portal Asset API';
    APIPublisher = 'onedata';
    APIGroup = 'tenantportal';
    APIVersion = 'v1.0';
    EntityName = 'tenantAsset';
    EntitySetName = 'tenantAssets';
    SourceTable = "Fixed Real Estate";
    DelayedInsert = true;
    ODataKeyFields = SystemId;
    Editable = false;
    InsertAllowed = false;
    ModifyAllowed = false;
    DeleteAllowed = false;
    SourceTableView = where(Type = const(Activo));
    Permissions =
        tabledata "Fixed Real Estate" = R,
        tabledata "Real Estate Comment Line" = r,
        tabledata "FRE Superficies" = r,
        tabledata "REF Related Contactos" = r;

    layout
    {
        area(content)
        {
            repeater(General)
            {
                field(id; Rec.SystemId)
                {
                    Caption = 'Id';
                }
                field(number; Rec."No.")
                {
                    Caption = 'Number';
                }
                field(description; Rec.Description)
                {
                    Caption = 'Description';
                }
                field(description2; Rec."Description 2")
                {
                    Caption = 'Description 2';
                }
                field(type; Rec.Type)
                {
                    Caption = 'Type';
                }
                field(assetType; Rec."Asset Type")
                {
                    Caption = 'Asset Type';
                }
                field(status; Rec.Status)
                {
                    Caption = 'Status';
                }

                field(propertyNo; Rec."Property No.")
                {
                    Caption = 'Property No.';
                }
                field(propertyDescription; Rec."Property Description")
                {
                    Caption = 'Property Description';
                }

                field(address; Rec.Address)
                {
                    Caption = 'Address';
                }
                field(address2; Rec."Address 2")
                {
                    Caption = 'Address 2';
                }
                field(city; Rec.City)
                {
                    Caption = 'City';
                }
                field(postCode; Rec."Post Code")
                {
                    Caption = 'Post Code';
                }
                field(county; Rec.County)
                {
                    Caption = 'County';
                }
                field(countryRegionCode; Rec."Country/Region Code")
                {
                    Caption = 'Country/Region Code';
                }
                field(streetName; Rec."Street Name")
                {
                    Caption = 'Street Name';
                }
                field(streetNumber; Rec."Number On Street")
                {
                    Caption = 'Street Number';
                }
                field(floor; Rec."Location Height Floor")
                {
                    Caption = 'Floor';
                }
                field(composedAddress; Rec."Composse Address")
                {
                    Caption = 'Composed Address';
                }
                field(googleUrl; Rec."Google URL")
                {
                    Caption = 'Google URL';
                }

                field(yearOfConstruction; Rec."Year of construction")
                {
                    Caption = 'Year of Construction';
                }
                field(builtAreaM2; BuiltAreaM2Value)
                {
                    Caption = 'Built Area M2';
                }
                field(commercialDescription; CommercialDescriptionTxt)
                {
                    Caption = 'Commercial Description';
                }

                field(cadastralReference; Rec."Cadastral reference")
                {
                    Caption = 'Cadastral Reference';
                }
                field(cadastralUrl; Rec."URL Sede electrónica catastro")
                {
                    Caption = 'Cadastral URL';
                }
                field(cadastralAssetValue; Rec."Val. Catastral Activo")
                {
                    Caption = 'Cadastral Asset Value';
                }
                field(cadastralConstructionValue; Rec."Val. Castastral Const. Activo")
                {
                    Caption = 'Cadastral Construction Value';
                }
                field(totalCadastralAssetValue; Rec."Total Val. Catastral Activo")
                {
                    Caption = 'Total Cadastral Asset Value';
                }
                field(totalCadastralConstructionValue; Rec."Total Val. Castas. Const. Act.")
                {
                    Caption = 'Total Cadastral Construction Value';
                }
                field(ownerName; OwnerNameTxt)
                {
                    Caption = 'Owner Name';
                }

                field(lastRentalPrice; Rec."Last Rental Price")
                {
                    Caption = 'Last Rental Price';
                }
                field(minimumRentalPrice; Rec."Minimum Rental Price")
                {
                    Caption = 'Minimum Rental Price';
                }
                field(lastContractPrice; LastContractPriceValue)
                {
                    Caption = 'Last Contract Price';
                }
                field(referencePriceMin; ReferencePriceMinValue)
                {
                    Caption = 'Reference Price Min.';
                }
                field(referencePriceMax; ReferencePriceMaxValue)
                {
                    Caption = 'Reference Price Max.';
                }
                field(salesPrice; Rec."Sales price")
                {
                    Caption = 'Sales Price';
                }
                field(minimumSalesPrice; Rec."Minimum Sales Price")
                {
                    Caption = 'Minimum Sales Price';
                }

                field(managed; Rec.Managed)
                {
                    Caption = 'Managed';
                }
                field(acquired; Rec.Acquired)
                {
                    Caption = 'Acquired';
                }
                field(blocked; Rec.Blocked)
                {
                    Caption = 'Blocked';
                }
                field(underMaintenance; Rec."Under Maintenance")
                {
                    Caption = 'Under Maintenance';
                }
                field(insured; InsuredValue)
                {
                    Caption = 'Insured';
                }
                field(hasComments; HasCommentsValue)
                {
                    Caption = 'Has Comments';
                }

                field(image; Rec.Image)
                {
                    Caption = 'Image';
                }

                field(lastDateModified; Rec."Last Date Modified")
                {
                    Caption = 'Last Date Modified';
                }
            }
        }
    }

    trigger OnAfterGetRecord()
    begin
        Rec.CalcFields(
            Insured,
            Comment,
            "Superficie construida",
            "Last Reference Price Min.",
            "Last Reference Price Max.",
            "Last Price Contract",
            "Owner Name");

        CommercialDescriptionTxt := Rec.GetFREDescription();
        BuiltAreaM2Value := Rec."Superficie construida";
        ReferencePriceMinValue := Rec."Last Reference Price Min.";
        ReferencePriceMaxValue := Rec."Last Reference Price Max.";
        LastContractPriceValue := Rec."Last Price Contract";
        OwnerNameTxt := Format(Rec."Owner Name");
        InsuredValue := Rec.Insured;
        HasCommentsValue := Rec.Comment;
    end;

    var
        CommercialDescriptionTxt: Text;
        BuiltAreaM2Value: Decimal;
        ReferencePriceMinValue: Decimal;
        ReferencePriceMaxValue: Decimal;
        LastContractPriceValue: Decimal;
        OwnerNameTxt: Text;
        InsuredValue: Boolean;
        HasCommentsValue: Boolean;
}
