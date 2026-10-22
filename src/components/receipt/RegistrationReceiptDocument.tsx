import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import poppins400 from "@fontsource/poppins/files/poppins-latin-400-normal.woff?url";
import poppins500 from "@fontsource/poppins/files/poppins-latin-500-normal.woff?url";
import poppins600 from "@fontsource/poppins/files/poppins-latin-600-normal.woff?url";
import poppins700 from "@fontsource/poppins/files/poppins-latin-700-normal.woff?url";

import Logo from "@/assets/icons/logo.png";
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
  pill: {
    marginTop: 6,
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
  groupHeading: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.heading,
    marginTop: 4,
    marginBottom: 8,
  },
  note: {
    marginTop: 4,
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    fontSize: 8,
    color: COLORS.muted,
  },
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

function Rows({ rows }: { rows: ReceiptRow[] }) {
  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row.label} style={styles.cell} wrap={false}>
          <Text style={styles.cellLabel}>{row.label}</Text>
          <Text style={styles.cellValue}>{row.value}</Text>
        </View>
      ))}
    </View>
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
    <View style={styles.section} wrap={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {name ? <Text style={styles.sectionName}>{name}</Text> : null}
      </View>
      <Rows rows={rows} />
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
              <Text
                style={[
                  styles.pill,
                  { color: tone.color, backgroundColor: tone.background },
                ]}
              >
                {receipt.payment.statusLabel}
              </Text>
            </View>
          </View>

          <Section title="Payment" rows={receipt.payment.rows} />
          {receipt.sections.map((section) => (
            <Section key={section.title} title={section.title} rows={section.rows} />
          ))}

          {receipt.people.length > 0 ? (
            <Text style={styles.groupHeading} minPresenceAhead={80}>
              Team
            </Text>
          ) : null}
          {receipt.people.map((person) => (
            <Section
              key={person.role}
              title={person.role}
              name={person.name}
              rows={person.rows}
            />
          ))}

          <Text style={styles.note} wrap={false}>
            Registration is subject to organiser approval, vehicle inspection
            and qualification. The desired rally number is subject to
            availability. Keep this receipt for your records.
          </Text>
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
