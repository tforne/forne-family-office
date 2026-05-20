type PwaIconTemplateProps = {
  size: number;
};

export default function PwaIconTemplate({ size }: PwaIconTemplateProps) {
  const inset = size * 0.1;
  const innerSize = size - inset * 2;
  const radius = size * 0.22;
  const letterSize = Math.round(size * 0.44);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(180deg, #F7FBFF 0%, #EAF2FC 100%)",
        position: "relative"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: size * 0.12,
          right: size * 0.1,
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: 9999,
          background: "rgba(27, 111, 216, 0.14)",
          filter: "blur(10px)"
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: size * 0.08,
          left: size * 0.08,
          width: size * 0.32,
          height: size * 0.32,
          borderRadius: 9999,
          background: "rgba(217, 200, 176, 0.22)",
          filter: "blur(12px)"
        }}
      />
      <div
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: radius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          fontSize: letterSize,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          background: "linear-gradient(135deg, #0F2F57 0%, #1B6FD8 100%)",
          boxShadow: "0 18px 40px rgba(15, 47, 87, 0.28)"
        }}
      >
        F
      </div>
    </div>
  );
}
