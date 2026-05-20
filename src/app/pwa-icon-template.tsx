type PwaIconTemplateProps = {
  size: number;
};

export default function PwaIconTemplate({ size }: PwaIconTemplateProps) {
  const panelInset = size * 0.08;
  const panelSize = size - panelInset * 2;
  const radius = size * 0.24;
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
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: size * 0.006,
            marginTop: -size * 0.015
          }}
        >
          <span
            style={{
              color: "#8A9CB0",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 250 * brandScale,
              fontStyle: "italic",
              lineHeight: 0.78,
              fontWeight: 400,
              letterSpacing: "-0.06em",
              marginRight: size * 0.01
            }}
          >
            f
          </span>
          <span
            style={{
              color: "#151313",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 124 * brandScale,
              lineHeight: 0.85,
              fontWeight: 400,
              letterSpacing: "0.01em"
            }}
          >
            orn
          </span>
          <span
            style={{
              color: "#151313",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 136 * brandScale,
              lineHeight: 0.8,
              fontWeight: 400,
              letterSpacing: "0.01em",
              position: "relative",
              marginLeft: size * 0.002
            }}
          >
            è
          </span>
        </div>

        <div
          style={{
            width: 70 * brandScale,
            height: Math.max(1, Math.round(size * 0.004)),
            background: "#B9C2CD",
            borderRadius: 9999,
            marginTop: 26 * brandScale,
            alignSelf: "center"
          }}
        />

        <div
          style={{
            marginTop: 18 * brandScale,
            color: "#8A9CB0",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 18 * brandScale,
            letterSpacing: "0.45em",
            textIndent: "0.45em",
            lineHeight: 1
          }}
        >
          1933
        </div>
      </div>
    </div>
  );
}
