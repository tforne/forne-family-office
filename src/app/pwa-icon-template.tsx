type PwaIconTemplateProps = {
  size: number;
};

export default function PwaIconTemplate({ size }: PwaIconTemplateProps) {
  const panelInset = size * 0.08;
  const panelSize = size - panelInset * 2;
  const radius = size * 0.24;
  const badgeSize = size * 0.42;
  const brandScale = size / 512;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F6F2EA",
        position: "relative"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: size * 0.12,
          left: size * 0.08,
          width: size * 0.34,
          height: size * 0.34,
          borderRadius: 9999,
          background: "rgba(132, 151, 173, 0.12)",
          filter: "blur(14px)"
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: size * 0.1,
          right: size * 0.08,
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: 9999,
          background: "rgba(201, 190, 173, 0.18)",
          filter: "blur(16px)"
        }}
      />
      <div
        style={{
          width: panelSize,
          height: panelSize,
          borderRadius: radius,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(246,242,234,0.98) 100%)",
          boxShadow: "0 24px 50px rgba(34, 42, 52, 0.16)",
          border: `${Math.max(1, Math.round(size * 0.004))}px solid rgba(183, 174, 161, 0.35)`,
          overflow: "hidden",
          position: "relative"
        }}
      >
        <div
          style={{
            width: badgeSize,
            height: badgeSize,
            borderRadius: size * 0.11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0F2F57 0%, #1B6FD8 100%)",
            boxShadow: "0 30px 42px rgba(15, 47, 87, 0.22)"
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              width: 170 * brandScale,
              height: 196 * brandScale,
              marginTop: -size * 0.012,
              marginLeft: size * 0.008
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 52 * brandScale,
                height: 196 * brandScale,
                borderRadius: 9999,
                background: "#FFFFFF"
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 30 * brandScale,
                top: 0,
                width: 118 * brandScale,
                height: 28 * brandScale,
                borderRadius: 9999,
                background: "#FFFFFF",
                transform: "skewX(-14deg)",
                transformOrigin: "left center"
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 26 * brandScale,
                top: 74 * brandScale,
                width: 98 * brandScale,
                height: 28 * brandScale,
                borderRadius: 9999,
                background: "#FFFFFF",
                transform: "skewX(-14deg)",
                transformOrigin: "left center"
              }}
            />
            <div
              style={{
                position: "absolute",
                left: -8 * brandScale,
                top: 170 * brandScale,
                width: 72 * brandScale,
                height: 18 * brandScale,
                borderRadius: 9999,
                background: "rgba(255,255,255,0.92)",
                transform: "rotate(-12deg)"
              }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 34 * brandScale,
            color: "#151313",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 50 * brandScale,
            fontStyle: "italic",
            lineHeight: 0.92,
            fontWeight: 400,
            letterSpacing: "0.015em"
          }}
        >
          Forné
        </div>

        <div
          style={{
            width: 74 * brandScale,
            height: Math.max(1, Math.round(size * 0.004)),
            background: "#B9C2CD",
            borderRadius: 9999,
            marginTop: 18 * brandScale,
            alignSelf: "center"
          }}
        />

        <div
          style={{
            marginTop: 18 * brandScale,
            color: "#8A9CB0",
            fontFamily: "Arial, sans-serif",
            fontSize: 16 * brandScale,
            fontWeight: 700,
            letterSpacing: "0.34em",
            textIndent: "0.34em",
            lineHeight: 1
          }}
        >
          FFO
        </div>
      </div>
    </div>
  );
}
