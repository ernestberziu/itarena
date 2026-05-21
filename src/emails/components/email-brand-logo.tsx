import { BRAND_NAME, emailColors } from "@/lib/email/brand";

/** Email-safe IT Arena mark + wordmark (inline SVG, no external images). */
export function EmailBrandLogo() {
  const brand = emailColors.brand;
  const charcoal = "#2D2D38";
  const m = 36;
  const dotR = m * 0.13;
  const dotCY = dotR;
  const dotSpacing = m * 0.36;
  const cx = m / 2;
  const leftCX = cx - dotSpacing;
  const rightCX = cx + dotSpacing;
  const pillW = m * 0.24;
  const pillH = m * 0.52;
  const pillX = cx - pillW / 2;
  const pillY = dotCY + dotR + m * 0.06;
  const pillRX = pillW / 2;
  const markH = Math.round(pillY + pillH);

  return (
    <table cellPadding={0} cellSpacing={0} role="presentation">
      <tbody>
        <tr>
          <td style={{ verticalAlign: "middle", paddingRight: "12px" }}>
            <svg
              width={m}
              height={markH}
              viewBox={`0 0 ${m} ${markH}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "block" }}
            >
              <circle cx={leftCX} cy={dotCY} r={dotR} fill={charcoal} />
              <circle cx={cx} cy={dotCY} r={dotR} fill={brand} />
              <circle cx={rightCX} cy={dotCY} r={dotR} fill={charcoal} />
              <rect x={pillX} y={pillY} width={pillW} height={pillH} rx={pillRX} fill={brand} />
            </svg>
          </td>
          <td style={{ verticalAlign: "middle" }}>
            <table cellPadding={0} cellSpacing={0} role="presentation">
              <tbody>
                <tr>
                  <td
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: charcoal,
                      letterSpacing: "0.06em",
                      lineHeight: 1,
                      fontFamily: "Helvetica,Arial,sans-serif",
                      paddingBottom: "2px",
                    }}
                  >
                    IT
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      color: brand,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                      fontFamily: "Helvetica,Arial,sans-serif",
                    }}
                  >
                    arena
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      fontSize: "10px",
                      fontWeight: 400,
                      color: emailColors.muted,
                      letterSpacing: "0.04em",
                      lineHeight: 1.2,
                      paddingTop: "4px",
                      fontFamily: "Helvetica,Arial,sans-serif",
                    }}
                  >
                    Technology &amp; Service
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function EmailBrandLogoAlt() {
  return <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>{BRAND_NAME}</span>;
}
