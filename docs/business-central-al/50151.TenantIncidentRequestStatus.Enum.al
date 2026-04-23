enum 50151 "Tenant Incident Request Status"
{
    Extensible = true;

    value(0; New)
    {
        Caption = 'New';
    }
    value(1; Processing)
    {
        Caption = 'Processing';
    }
    value(2; Created)
    {
        Caption = 'Created';
    }
    value(3; Error)
    {
        Caption = 'Error';
    }
}
