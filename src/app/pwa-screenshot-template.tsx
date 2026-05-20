type PwaScreenshotTemplateProps = {
  width: number;
  height: number;
  mobile?: boolean;
};

const statCards = [
  { label: "Facturas", value: "12" },
  { label: "Avisos", value: "3" },
  { label: "Incidencias", value: "2" }
];

const invoiceRows = [
  { title: "Factura 2026-041", subtitle: "Vence el 25/05/2026", amount: "1.280 EUR" },
  { title: "Aviso comunidad", subtitle: "Confirmación requerida", amount: "Nuevo" },
  { title: "Incidencia abierta", subtitle: "Seguimiento en curso", amount: "Activa" }
];

export default function PwaScreenshotTemplate({
  width,
  height,
  mobile = false
}: PwaScreenshotTemplateProps) {
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at top left, rgba(27,111,216,0.16), transparent 25%), radial-gradient(circle at 85% 12%, rgba(217,200,176,0.18), transparent 20%), linear-gradient(180deg, #eef4fb 0%, #f7f9fc 36%, #fbfdff 100%)",
        color: "#18202B",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: mobile ? 36 : 52,
          right: mobile ? -30 : -40,
          width: mobile ? 170 : 240,
          height: mobile ? 170 : 240,
          borderRadius: 9999,
          background: "rgba(27,111,216,0.12)",
          filter: "blur(28px)"
        }}
      />

      <div
        style={{
          display: "flex",
          flex: 1,
          padding: mobile ? 34 : 48,
          gap: mobile ? 0 : 30,
          flexDirection: mobile ? "column" : "row"
        }}
      >
        {!mobile ? (
          <aside
            style={{
              width: 300,
              borderRadius: 30,
              padding: 28,
              color: "white",
              display: "flex",
              flexDirection: "column",
              background:
                "radial-gradient(circle at top right, rgba(74,144,226,0.2), transparent 30%), linear-gradient(135deg, #0f1f37 0%, #123861 58%, #0d2b4d 100%)",
              boxShadow: "0 34px 75px -42px rgba(8, 23, 44, 0.52)"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 20,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.12)"
                }}
              >
                FF
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 20, fontWeight: 700 }}>Forné Portal</span>
                <span style={{ fontSize: 13, opacity: 0.64 }}>Espacio privado de cliente</span>
              </div>
            </div>

            <div
              style={{
                marginTop: 28,
                display: "flex",
                flexDirection: "column",
                gap: 12
              }}
            >
              {["Inicio", "Avisos", "Facturas", "Incidencias", "Perfil"].map((item, index) => (
                <div
                  key={item}
                  style={{
                    borderRadius: 22,
                    padding: "16px 18px",
                    fontSize: 16,
                    fontWeight: 600,
                    color: index === 0 ? "#FFFFFF" : "rgba(255,255,255,0.75)",
                    background: index === 0 ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.10)"
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>
        ) : null}

        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: mobile ? "flex-start" : "center",
              flexDirection: mobile ? "column" : "row",
              gap: 18
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#1B6FD8"
                }}
              >
                Portal privado
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: mobile ? 42 : 52,
                  fontWeight: 700,
                  color: "#0F2F57",
                  lineHeight: 1.05
                }}
              >
                Gestión clara de alquileres, avisos y facturas
              </div>
              <div
                style={{
                  marginTop: 18,
                  fontSize: mobile ? 20 : 24,
                  color: "#5D6776",
                  maxWidth: mobile ? "100%" : 760,
                  lineHeight: 1.5
                }}
              >
                Una sola experiencia para seguimiento, incidencias y documentación de clientes e inquilinos.
              </div>
            </div>

            <div
              style={{
                borderRadius: 26,
                padding: mobile ? "14px 18px" : "16px 22px",
                background: "rgba(255,255,255,0.78)",
                border: "1px solid rgba(255,255,255,0.62)",
                boxShadow: "0 18px 45px -34px rgba(15,47,87,0.30)"
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "#5D6776", textTransform: "uppercase", letterSpacing: "0.18em" }}>
                Sesión
              </div>
              <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700 }}>Cliente Microsoft</div>
              <div style={{ marginTop: 4, fontSize: 13, color: "#5D6776" }}>office@forne.family</div>
            </div>
          </div>

          {mobile ? (
            <div
              style={{
                marginTop: 26,
                display: "flex",
                gap: 10
              }}
            >
              {["Inicio", "Facturas", "Incidencias"].map((item, index) => (
                <div
                  key={item}
                  style={{
                    borderRadius: 18,
                    padding: "10px 14px",
                    fontSize: 16,
                    fontWeight: 700,
                    color: index === 0 ? "#FFFFFF" : "#5D6776",
                    background: index === 0 ? "linear-gradient(135deg, #123861 0%, #1b6fd8 100%)" : "rgba(255,255,255,0.88)",
                    border: index === 0 ? "none" : "1px solid rgba(24,32,43,0.08)"
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          ) : null}

          <div
            style={{
              marginTop: mobile ? 26 : 32,
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
              gap: 18
            }}
          >
            {statCards.map((card) => (
              <div
                key={card.label}
                style={{
                  borderRadius: 28,
                  padding: mobile ? 22 : 24,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,251,255,0.95) 100%)",
                  border: "1px solid rgba(24,32,43,0.08)",
                  boxShadow: "0 30px 70px -44px rgba(15, 47, 87, 0.28)"
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", color: "#5D6776", textTransform: "uppercase" }}>
                  {card.label}
                </div>
                <div style={{ marginTop: 18, fontSize: mobile ? 42 : 48, fontWeight: 700, color: "#18202B" }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 22,
              borderRadius: 32,
              padding: mobile ? 18 : 22,
              background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,251,255,0.95) 100%)",
              border: "1px solid rgba(24,32,43,0.08)",
              boxShadow: "0 30px 70px -44px rgba(15, 47, 87, 0.28)",
              display: "flex",
              flexDirection: "column",
              gap: 14
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", color: "#5D6776", textTransform: "uppercase" }}>
                  Resumen operativo
                </span>
                <span style={{ marginTop: 8, fontSize: mobile ? 24 : 28, fontWeight: 700, color: "#18202B" }}>
                  Autoservicio más rápido desde la app instalada
                </span>
              </div>
              {!mobile ? (
                <div
                  style={{
                    borderRadius: 16,
                    padding: "10px 16px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    background: "linear-gradient(135deg, #123861 0%, #1b6fd8 100%)"
                  }}
                >
                  Abrir portal
                </div>
              ) : null}
            </div>

            {invoiceRows.map((row) => (
              <div
                key={row.title}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  borderRadius: 24,
                  padding: mobile ? "16px 18px" : "18px 20px",
                  background: "#FFFFFF",
                  border: "1px solid rgba(24,32,43,0.08)"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: mobile ? 18 : 20, fontWeight: 700, color: "#18202B" }}>
                    {row.title}
                  </span>
                  <span style={{ marginTop: 6, fontSize: mobile ? 14 : 16, color: "#5D6776" }}>
                    {row.subtitle}
                  </span>
                </div>
                <div
                  style={{
                    borderRadius: 18,
                    padding: mobile ? "10px 12px" : "10px 14px",
                    fontSize: mobile ? 14 : 16,
                    fontWeight: 700,
                    color: "#0F2F57",
                    background: "#EFF6FC"
                  }}
                >
                  {row.amount}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
