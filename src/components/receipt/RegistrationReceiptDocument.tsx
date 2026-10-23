import {
  Document,
  Font,
  Image,
  Page,
  Polyline,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ComponentProps, ReactNode } from "react";
import poppins400 from "@fontsource/poppins/files/poppins-latin-400-normal.woff?url";
import poppins500 from "@fontsource/poppins/files/poppins-latin-500-normal.woff?url";
import poppins600 from "@fontsource/poppins/files/poppins-latin-600-normal.woff?url";
import poppins700 from "@fontsource/poppins/files/poppins-latin-700-normal.woff?url";

import Logo from "@/assets/icons/logo.png";
import type { ConsentBlock } from "@/utils/consent-html";
import type {
  ReceiptPaymentTone,
  ReceiptRow,
  RegistrationReceipt,
} from "@/utils/registration-receipt";

// Same font and palette as the portal (index.css).
Font.register({
  family: "Poppins",
  fonts: [
    { src: poppins400, fontWeight: 400 },
    { src: poppins500, fontWeight: 500 },
    { src: poppins600, fontWeight: 600 },
    { src: poppins700, fontWeight: 700 },
  ],
});
// Keep long values (addresses, emails) from being hyphenated mid-word.
Font.registerHyphenationCallback((word) => [word]);

const COLORS = {
  primary: "#b44423",
  primaryDark: "#91371d",
  primarySoft: "#fbeee9",
  heading: "#1F1838",
  body: "#25314D",
  muted: "#6B7890",
  border: "#E8E8E8",
  surface: "#F9FAFD",
  paid: "#1F7A4D",
  paidSoft: "#E7F5EE",
  free: "#9A6B00",
  freeSoft: "#FFF8E8",
};

const PAYMENT_TONE: Record<ReceiptPaymentTone, { color: string; background: string }> = {
  paid: { color: COLORS.paid, background: COLORS.paidSoft },
  free: { color: COLORS.free, background: COLORS.freeSoft },
  unknown: { color: COLORS.muted, background: COLORS.surface },
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Poppins",
    fontSize: 9,
    color: COLORS.body,
    // Top padding for continuation pages; the first-page header pulls itself up.
    paddingTop: 28,
    paddingBottom: 48,
    backgroundColor: "#ffffff",
  },
  header: {
    marginTop: -28,
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { flexDirection: "row", alignItems: "center" },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logo: { width: 32, height: 32 },
  brandName: { color: "#ffffff", fontSize: 15, fontWeight: 700 },
  brandTag: { color: "#ffffff", fontSize: 8.5, opacity: 0.85 },
  headerRight: { alignItems: "flex-end" },
  docTitle: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  docMeta: { color: "#ffffff", fontSize: 8, opacity: 0.85, marginTop: 2 },
  body: { paddingHorizontal: 32, paddingTop: 20 },
  summary: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryMain: { flex: 1, padding: 14 },
  summaryLabel: {
    fontSize: 7.5,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  rallyName: {
    fontSize: 15,
    fontWeight: 700,
    color: COLORS.heading,
    marginTop: 2,
  },
  summarySub: { fontSize: 8.5, color: COLORS.muted, marginTop: 4 },
  summarySide: {
    width: 170,
    padding: 14,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  amount: {
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.heading,
    marginTop: 2,
  },
  pillRow: { flexDirection: "row", marginTop: 6 },
  pill: {
    marginLeft: 5,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 10,
    fontSize: 8,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  section: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primarySoft,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    color: COLORS.primaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionName: { fontSize: 9.5, fontWeight: 600, color: COLORS.heading },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  cell: { width: "50%", paddingRight: 10, marginBottom: 7 },
  cellLabel: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cellValue: { fontSize: 9, color: COLORS.heading, marginTop: 1 },
  personHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  personHeading: { fontSize: 9.5, fontWeight: 700, color: COLORS.primaryDark },
  personName: { fontSize: 9.5, fontWeight: 600, color: COLORS.heading },
  // Inset divider: stops short of the card borders on both sides.
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
    marginTop: 4,
  },
  consentBody: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4 },
  consentHeading: {
    fontSize: 9.5,
    fontWeight: 700,
    color: COLORS.heading,
    marginBottom: 4,
  },
  consentParagraph: {
    fontSize: 8.5,
    lineHeight: 1.5,
    color: COLORS.body,
    marginBottom: 6,
  },
  consentListItem: { flexDirection: "row", marginBottom: 4 },
  consentMarker: { width: 14, fontSize: 8.5, lineHeight: 1.5, color: COLORS.body },
  consentListText: { flex: 1, fontSize: 8.5, lineHeight: 1.5, color: COLORS.body },
  consentEmpty: { fontSize: 8.5, color: COLORS.muted, marginBottom: 6 },
  acceptance: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 12,
    padding: 9,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkbox: {
    width: 13,
    height: 13,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  acceptanceText: { fontSize: 8.5, fontWeight: 600, color: COLORS.heading },
  acceptanceMeta: { fontSize: 7.5, color: COLORS.muted, marginTop: 1 },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
    fontSize: 7.5,
    color: COLORS.muted,
  },
});

function Rows({ rows, style }: { rows: ReceiptRow[]; style?: Style }) {
  return (
    <View style={style ? [styles.grid, style] : styles.grid}>
      {rows.map((row) => (
        <View key={row.label} style={styles.cell} wrap={false}>
          <Text style={styles.cellLabel}>{row.label}</Text>
          <Text style={styles.cellValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

type Style = NonNullable<ComponentProps<typeof View>["style"]>;

/** Fields kept on the same page as their heading, so a heading is never stranded. */
const FIRST_ROW = 2;

function HeadedRows({
  heading,
  rows,
}: {
  heading: ReactNode;
  rows: ReceiptRow[];
}) {
  return (
    <>
      <View wrap={false}>
        {heading}
        <Rows rows={rows.slice(0, FIRST_ROW)} style={{ paddingBottom: 0 }} />
      </View>
      {rows.length > FIRST_ROW ? (
        <Rows rows={rows.slice(FIRST_ROW)} style={{ paddingTop: 0 }} />
      ) : null}
    </>
  );
}

function Section({
  title,
  name,
  rows,
}: {
  title: string;
  name?: string;
  rows: ReceiptRow[];
}) {
  return (
    // Cards flow across pages; single fields never split.
    <View style={styles.section}>
      <HeadedRows
        heading={
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {name ? <Text style={styles.sectionName}>{name}</Text> : null}
          </View>
        }
        rows={rows}
      />
    </View>
  );
}

function ConsentText({ blocks }: { blocks: ConsentBlock[] }) {
  if (blocks.length === 0) {
    return (
      <Text style={styles.consentEmpty}>
        Consent text is not available for this category.
      </Text>
    );
  }
  return (
    <>
      {blocks.map((block, index) => {
        const inline = block.segments.map((seg, i) => (
          <Text key={i} style={seg.bold ? { fontWeight: 600 } : undefined}>
            {seg.text}
          </Text>
        ));
        if (block.kind === "heading") {
          return (
            <Text key={index} style={styles.consentHeading} minPresenceAhead={30}>
              {inline}
            </Text>
          );
        }
        if (block.kind === "listItem") {
          return (
            <View key={index} style={styles.consentListItem} wrap={false}>
              <Text style={styles.consentMarker}>{block.marker ?? "•"}</Text>
              <Text style={styles.consentListText}>{inline}</Text>
            </View>
          );
        }
        return (
          <Text key={index} style={styles.consentParagraph}>
            {inline}
          </Text>
        );
      })}
    </>
  );
}

function CheckedBox() {
  return (
    <View style={styles.checkbox}>
      <Svg width={9} height={9} viewBox="0 0 12 12">
        <Polyline
          points="2,6.5 5,9.5 10,3"
          stroke="#ffffff"
          strokeWidth={2}
          fill="none"
        />
      </Svg>
    </View>
  );
}

export function RegistrationReceiptDocument({
  receipt,
}: {
  receipt: RegistrationReceipt;
}) {
  const tone = PAYMENT_TONE[receipt.payment.tone];

  return (
    <Document
      title={`Registration receipt – ${receipt.rallyName}`}
      author="TDCP Jeep Rally"
      subject="Rally registration receipt"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.logoWrap}>
              <Image src={Logo} style={styles.logo} />
            </View>
            <View>
              <Text style={styles.brandName}>Jeep Rally</Text>
              <Text style={styles.brandTag}>TDCP driver portal</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>Registration receipt</Text>
            <Text style={styles.docMeta}>Issued {receipt.issuedOn}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.summary} wrap={false}>
            <View style={styles.summaryMain}>
              <Text style={styles.summaryLabel}>Rally</Text>
              <Text style={styles.rallyName}>{receipt.rallyName}</Text>
              <Text style={styles.summarySub}>
                Registration status: {receipt.registrationStatus}
              </Text>
            </View>
            <View style={styles.summarySide}>
              <Text style={styles.summaryLabel}>Amount</Text>
              <Text style={styles.amount}>{receipt.payment.amountLabel}</Text>
              <View style={styles.pillRow}>
                <Text
                  style={[
                    styles.pill,
                    { color: tone.color, backgroundColor: tone.background },
                  ]}
                >
                  {receipt.payment.statusLabel}
                </Text>
                {receipt.entryModeLabel ? (
                  <Text
                    style={[
                      styles.pill,
                      // Same light red as the card headers.
                      {
                        color: COLORS.primaryDark,
                        backgroundColor: COLORS.primarySoft,
                      },
                    ]}
                  >
                    {receipt.entryModeLabel}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          <Section title="Rally Details" rows={receipt.rallyDetails} />

          {receipt.team.people.length > 0 ? (
            <View style={styles.section}>
              {receipt.team.people.map((person, index) => (
                <View key={person.heading}>
                  {index > 0 ? <View style={styles.separator} /> : null}
                  <HeadedRows
                    heading={
                      <>
                        {/* Card header travels with the first person. */}
                        {index === 0 ? (
                          <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Team</Text>
                            <Text style={styles.sectionName}>
                              {receipt.team.name}
                            </Text>
                          </View>
                        ) : null}
                        <View style={styles.personHeader}>
                          <Text style={styles.personHeading}>{person.heading}</Text>
                          <Text style={styles.personName}>{person.name}</Text>
                        </View>
                      </>
                    }
                    rows={person.rows}
                  />
                </View>
              ))}
            </View>
          ) : null}

          <Section title="Vehicle Details" rows={receipt.vehicle} />
          <Section title="Payment Details" rows={receipt.payment.rows} />
          <Section title="Other Information" rows={receipt.otherInfo} />

          <View style={styles.section}>
            <View style={styles.sectionHeader} wrap={false} minPresenceAhead={80}>
              <Text style={styles.sectionTitle}>Consent</Text>
            </View>
            <View style={styles.consentBody}>
              <ConsentText blocks={receipt.consent.blocks} />
            </View>
            <View style={styles.acceptance} wrap={false}>
              <CheckedBox />
              <View style={{ flex: 1 }}>
                <Text style={styles.acceptanceText}>
                  {receipt.consent.acceptance}
                </Text>
                <Text style={styles.acceptanceMeta}>
                  Accepted on {receipt.consent.acceptedOn}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>TDCP Jeep Rally · Registration receipt</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
