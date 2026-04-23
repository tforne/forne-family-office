enum 50160 "Tenant Portal Invitation Status"
{
    Extensible = true;
    Caption = 'Tenant Portal Invitation Status';

    value(0; None)
    {
        Caption = 'None';
    }
    value(1; Pending)
    {
        Caption = 'Pending';
    }
    value(2; Sent)
    {
        Caption = 'Sent';
    }
    value(3; Accepted)
    {
        Caption = 'Accepted';
    }
    value(4; Expired)
    {
        Caption = 'Expired';
    }
    value(5; Failed)
    {
        Caption = 'Failed';
    }
    value(6; Revoked)
    {
        Caption = 'Revoked';
    }
}
