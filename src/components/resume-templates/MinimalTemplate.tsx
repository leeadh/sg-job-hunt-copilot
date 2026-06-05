"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/resume-schema";

function buildStyles(accent: string) {
  const DARK = "#1a1a1a";
  const MUTED = "#555555";

  return StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      fontSize: 9.5,
      lineHeight: 1.5,
      color: DARK,
      padding: 40,
      paddingTop: 36,
    },
    header: {
      textAlign: "center",
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: accent,
    },
    name: {
      fontSize: 22,
      fontFamily: "Helvetica-Bold",
      color: DARK,
      marginBottom: 3,
    },
    title: {
      fontSize: 10.5,
      color: MUTED,
      marginBottom: 6,
    },
    contactRow: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    contactItem: {
      fontSize: 8.5,
      color: MUTED,
    },
    separator: {
      fontSize: 8.5,
      color: "#ccc",
    },
    section: {
      marginBottom: 12,
    },
    sectionHeading: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: accent,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 5,
      paddingBottom: 2,
      borderBottomWidth: 0.5,
      borderBottomColor: "#e2e8f0",
    },
    summary: {
      fontSize: 9,
      color: MUTED,
      lineHeight: 1.6,
      marginBottom: 4,
    },
    jobRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginTop: 7,
      marginBottom: 1,
    },
    jobRole: {
      fontSize: 9.5,
      fontFamily: "Helvetica-Bold",
      color: DARK,
    },
    jobDate: {
      fontSize: 8,
      color: MUTED,
      fontFamily: "Helvetica-Oblique",
    },
    jobCompany: {
      fontSize: 8.5,
      color: MUTED,
      marginBottom: 2,
    },
    bullet: {
      fontSize: 9,
      color: DARK,
      marginBottom: 2,
      paddingLeft: 10,
    },
    eduRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginTop: 4,
      marginBottom: 2,
    },
    eduDegree: {
      fontSize: 9.5,
      fontFamily: "Helvetica-Bold",
      color: DARK,
    },
    eduInstitution: {
      fontSize: 8.5,
      color: MUTED,
    },
    eduDate: {
      fontSize: 8,
      color: MUTED,
      fontFamily: "Helvetica-Oblique",
    },
    skillsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 3,
    },
    skillCategory: {
      fontSize: 8.5,
      fontFamily: "Helvetica-Bold",
      color: DARK,
      marginRight: 4,
    },
    skillText: {
      fontSize: 8.5,
      color: MUTED,
    },
    certItem: {
      fontSize: 9,
      color: DARK,
      marginBottom: 2,
    },
    footer: {
      position: "absolute",
      bottom: 10,
      left: 0,
      right: 0,
      fontSize: 6.5,
      color: "#c0c0c0",
      textAlign: "center",
    },
  });
}

export default function MinimalTemplate({ data }: { data: ResumeData }) {
  const accent = data.accent_color || "#374151";
  const s = buildStyles(accent);

  const contactParts = [
    data.contact.email,
    data.contact.phone,
    data.contact.linkedin,
    data.contact.location,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.name}>{data.name}</Text>
          {data.title && <Text style={s.title}>{data.title}</Text>}
          <View style={s.contactRow}>
            {contactParts.map((part, i) => (
              <View key={i} style={{ flexDirection: "row" }}>
                {i > 0 && <Text style={s.separator}>{"  |  "}</Text>}
                <Text style={s.contactItem}>{part}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary */}
        {data.summary && (
          <View style={s.section}>
            <Text style={s.sectionHeading}>Summary</Text>
            <Text style={s.summary}>{data.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionHeading}>Experience</Text>
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

        {/* Education */}
        {data.education.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionHeading}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i}>
                <View style={s.eduRow}>
                  <View>
                    <Text style={s.eduDegree}>{edu.degree}</Text>
                    <Text style={s.eduInstitution}>{edu.institution}</Text>
                  </View>
                  <Text style={s.eduDate}>{edu.date}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionHeading}>Skills</Text>
            {data.skills.map((group) => (
              <View key={group.category} style={s.skillsRow}>
                <Text style={s.skillCategory}>{group.category}:</Text>
                <Text style={s.skillText}>{group.items.join(", ")}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionHeading}>Certifications</Text>
            {data.certifications.map((cert, i) => (
              <Text key={i} style={s.certItem}>
                {cert.name} — {cert.issuer}{cert.date ? ` (${cert.date})` : ""}
              </Text>
            ))}
          </View>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionHeading}>Languages</Text>
            <Text style={s.skillText}>{data.languages.join(", ")}</Text>
          </View>
        )}

        <Text style={s.footer}>Generated by SG Job Hunt Copilot</Text>
      </Page>
    </Document>
  );
}
