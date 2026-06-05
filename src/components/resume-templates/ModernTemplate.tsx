"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/resume-schema";

const MAX_SIDEBAR_CERTS = 5;
const MAX_SIDEBAR_SKILL_GROUPS = 6;

function buildStyles(accent: string) {
  const SIDEBAR_BG = "#f4f6f8";
  const DARK = "#1a1a1a";
  const MUTED = "#4a5568";

  return StyleSheet.create({
    page: {
      flexDirection: "row",
      fontFamily: "Helvetica",
      fontSize: 9.5,
      lineHeight: 1.4,
      color: DARK,
    },
    sidebar: {
      width: "32%",
      backgroundColor: SIDEBAR_BG,
      padding: 16,
      paddingTop: 28,
    },
    main: {
      width: "68%",
      padding: 22,
      paddingTop: 28,
    },
    name: {
      fontSize: 18,
      fontFamily: "Helvetica-Bold",
      color: accent,
      marginBottom: 2,
    },
    title: {
      fontSize: 10,
      color: MUTED,
      marginBottom: 14,
    },
    sidebarSection: {
      marginBottom: 10,
    },
    sidebarHeading: {
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      color: accent,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 4,
      paddingBottom: 2,
      borderBottomWidth: 0.5,
      borderBottomColor: accent,
    },
    sidebarItem: {
      fontSize: 8,
      color: DARK,
      marginBottom: 1,
    },
    sidebarLabel: {
      fontSize: 7,
      fontFamily: "Helvetica-Bold",
      color: MUTED,
      textTransform: "uppercase",
      letterSpacing: 0.3,
      marginTop: 4,
      marginBottom: 1,
    },
    sidebarInline: {
      fontSize: 7.5,
      color: DARK,
      marginBottom: 3,
      lineHeight: 1.4,
    },
    mainSection: {
      marginBottom: 10,
    },
    mainHeading: {
      fontSize: 10.5,
      fontFamily: "Helvetica-Bold",
      color: accent,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 5,
      paddingBottom: 2,
      borderBottomWidth: 0.7,
      borderBottomColor: accent,
    },
    summary: {
      fontSize: 8.5,
      color: MUTED,
      marginBottom: 8,
      lineHeight: 1.5,
    },
    jobRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginTop: 6,
      marginBottom: 1,
    },
    jobRole: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      color: DARK,
      maxWidth: "68%",
    },
    jobDate: {
      fontSize: 7.5,
      color: MUTED,
      fontFamily: "Helvetica-Oblique",
    },
    jobCompany: {
      fontSize: 8,
      color: MUTED,
      marginBottom: 2,
    },
    bullet: {
      fontSize: 8,
      color: DARK,
      marginBottom: 1.5,
      paddingLeft: 8,
    },
    eduRow: {
      marginTop: 4,
      marginBottom: 2,
    },
    eduDegree: {
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      color: DARK,
    },
    eduInstitution: {
      fontSize: 7.5,
      color: MUTED,
    },
    eduDate: {
      fontSize: 7,
      color: MUTED,
      fontFamily: "Helvetica-Oblique",
    },
    certLine: {
      fontSize: 7.5,
      color: DARK,
      marginBottom: 1,
    },
    footer: {
      position: "absolute",
      bottom: 8,
      left: 0,
      right: 0,
      fontSize: 6,
      color: "#c0c0c0",
      textAlign: "center",
    },
  });
}

export default function ModernTemplate({ data }: { data: ResumeData }) {
  const accent = data.accent_color || "#2a7a6b";
  const s = buildStyles(accent);

  const sidebarSkills = data.skills.slice(0, MAX_SIDEBAR_SKILL_GROUPS);
  const sidebarCerts = data.certifications.slice(0, MAX_SIDEBAR_CERTS);
  const overflowCerts = data.certifications.slice(MAX_SIDEBAR_CERTS);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Sidebar */}
        <View style={s.sidebar}>
          {/* Contact */}
          <View style={s.sidebarSection}>
            <Text style={s.sidebarHeading}>Contact</Text>
            {data.contact.email && <Text style={s.sidebarItem}>{data.contact.email}</Text>}
            {data.contact.phone && <Text style={s.sidebarItem}>{data.contact.phone}</Text>}
            {data.contact.linkedin && <Text style={s.sidebarItem}>{data.contact.linkedin}</Text>}
            {data.contact.location && <Text style={s.sidebarItem}>{data.contact.location}</Text>}
          </View>

          {/* Skills — condensed as comma-separated per category */}
          {sidebarSkills.length > 0 && (
            <View style={s.sidebarSection}>
              <Text style={s.sidebarHeading}>Skills</Text>
              {sidebarSkills.map((group) => (
                <View key={group.category}>
                  <Text style={s.sidebarLabel}>{group.category}</Text>
                  <Text style={s.sidebarInline}>{group.items.join(", ")}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <View style={s.sidebarSection}>
              <Text style={s.sidebarHeading}>Education</Text>
              {data.education.map((edu, i) => (
                <View key={i} style={s.eduRow}>
                  <Text style={s.eduDegree}>{edu.degree}</Text>
                  <Text style={s.eduInstitution}>{edu.institution}</Text>
                  <Text style={s.eduDate}>{edu.date}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Certifications (top N only) */}
          {sidebarCerts.length > 0 && (
            <View style={s.sidebarSection}>
              <Text style={s.sidebarHeading}>
                Certifications{overflowCerts.length > 0 ? ` (Top ${MAX_SIDEBAR_CERTS})` : ""}
              </Text>
              {sidebarCerts.map((cert, i) => (
                <Text key={i} style={s.certLine}>
                  {cert.name} ({cert.date || cert.issuer})
                </Text>
              ))}
              {overflowCerts.length > 0 && (
                <Text style={{ ...s.sidebarItem, fontFamily: "Helvetica-Oblique", marginTop: 2 }}>
                  +{overflowCerts.length} more (see page 2)
                </Text>
              )}
            </View>
          )}

          {/* Languages */}
          {data.languages.length > 0 && (
            <View style={s.sidebarSection}>
              <Text style={s.sidebarHeading}>Languages</Text>
              <Text style={s.sidebarInline}>{data.languages.join(", ")}</Text>
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={s.main}>
          <Text style={s.name}>{data.name}</Text>
          {data.title && <Text style={s.title}>{data.title}</Text>}

          {/* Summary */}
          {data.summary && (
            <View style={s.mainSection}>
              <Text style={s.mainHeading}>Summary</Text>
              <Text style={s.summary}>{data.summary}</Text>
            </View>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <View style={s.mainSection}>
              <Text style={s.mainHeading}>Experience</Text>
              {data.experience.map((exp, i) => (
                <View key={i}>
                  <View style={s.jobRow}>
                    <Text style={s.jobRole}>{exp.role}</Text>
                    <Text style={s.jobDate}>{exp.date}</Text>
                  </View>
                  <Text style={s.jobCompany}>{exp.company}</Text>
                  {exp.bullets.map((bullet, j) => (
                    <Text key={j} style={s.bullet}>{"•  "}{bullet}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Overflow Certifications on page 2 area */}
          {overflowCerts.length > 0 && (
            <View style={s.mainSection}>
              <Text style={s.mainHeading}>Additional Certifications</Text>
              {overflowCerts.map((cert, i) => (
                <Text key={i} style={s.bullet}>
                  {"•  "}{cert.name} — {cert.issuer}{cert.date ? `, ${cert.date}` : ""}
                </Text>
              ))}
            </View>
          )}
        </View>

        <Text style={s.footer}>Generated by SG Job Hunt Copilot</Text>
      </Page>
    </Document>
  );
}
