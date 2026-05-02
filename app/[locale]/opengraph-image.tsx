import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          background: "#0a0a0a",
          color: "#f5f1e8",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#d4af37",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Queen House
        </div>
        <div style={{ fontSize: 72, lineHeight: 1.05, marginTop: 16 }}>
          {t("title")}
        </div>
      </div>
    ),
    size,
  );
}
