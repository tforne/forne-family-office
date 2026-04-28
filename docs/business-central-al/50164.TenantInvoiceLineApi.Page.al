page 50164 "Tenant Invoice Line API"
{
    PageType = API;
    Caption = 'Tenant Invoice Line API';
    APIPublisher = 'onedata';
    APIGroup = 'tenantportal';
    APIVersion = 'v1.0';
    EntityName = 'tenantInvoiceLine';
    EntitySetName = 'tenantInvoiceLines';
    SourceTable = "Sales Invoice Line";
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
                field(invoiceId; Rec.SystemId)
                {
                    Caption = 'Invoice Id';
                    Editable = false;
                }
                field(invoiceNo; Rec."Document No.")
                {
                    Caption = 'Invoice No.';
                    Editable = false;
                }
                field(documentNo; Rec."Document No.")
                {
                    Caption = 'Document No.';
                    Editable = false;
                }
                field(lineNo; Rec."Line No.")
                {
                    Caption = 'Line No.';
                    Editable = false;
                }
                field(itemNo; Rec."No.")
                {
                    Caption = 'No.';
                    Editable = false;
                }
                field(description; Rec.Description)
                {
                    Caption = 'Description';
                    Editable = false;
                }
                field(quantity; Rec.Quantity)
                {
                    Caption = 'Quantity';
                    Editable = false;
                }
                field(unitPrice; Rec."Unit Price")
                {
                    Caption = 'Unit Price';
                    Editable = false;
                }
                field(amount; Rec.Amount)
                {
                    Caption = 'Amount';
                    Editable = false;
                }
                field(amountIncludingVat; Rec."Amount Including VAT")
                {
                    Caption = 'Amount Including VAT';
                    Editable = false;
                }
                field(vatPercent; Rec."VAT %")
                {
                    Caption = 'VAT %';
                    Editable = false;
                }
            }
        }
    }
}
