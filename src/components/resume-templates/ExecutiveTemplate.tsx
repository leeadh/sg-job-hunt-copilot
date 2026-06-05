"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/resume-schema";

function buildStyles(accent: string) {
  const DARK = "#1f2937";
  const MUTED = "#4b5563";

  return StyleSheet.create({
    page: {
      fontFamily: "Times-Roman",
      fontSize: 10,
      lineHeight: 1.5,
      color: DARK,
      padding: 44,
      paddingTop: 40,
    },
    name: {
      fontSize: 24,
      fontFamily: "Times-Bold",
      color: DARK,
      textAlign: "center",
      marginBottom: 2,
    },
    title: {
      fontSize: 11,
      fontFamily: "Times-Italic",
      color: MUTED,
      textAlign: "center",
      marginBottom: 8,
    },
    contactRow: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      marginBottom: 14,
      paddingBottom: 10,
      borderBottomWidth: 1.5,
      borderBottomColor: accent,
    },
    contactItem: {
      fontSize: 9,
      color: MUTED,
      marginHorizontal: 6,
    },
    section: {
      marginBottom: 12,
    },
    sectionHeading: {
      fontSize: 11,
      fontFamily: "Times-Bold",
      color: DARK,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 4,
      paddingBottom: 2,
      borderBottomWidth: 0.5,
      borderBottomColor: MUTED,
    },
    summary: {
      fontSize: 9.5,
      fontFamily: "Times-Italic",
      color: MUTED,
      lineHeight: 1.6,
      marginBottom: 4,
    },
    jobRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginTop: 8,
      marginBottom: 1,
    },
    jobRole: {
      fontSize: 10,
      fontFamily: "Times-Bold",
      color: DARK,
    },
    jobDate: {
      fontSize: 9,
      color: MUTED,
      fontFamily: "Times-Italic",
    },
    jobCompany: {
      fontSize: 9.5,
      fontFamily: "Times-Italic",
      color: MUTED,
      marginBottom: 3,
    },
    bullet: {
      fontSize: 9.5,
      color: DARK,
      marginBottom: 2,
      paddingLeft: 12,
    },
    eduBlock: {
      marginTop: 5,
      marginBottom: 3,
    },
    eduDegree: {
      fontSize: 10,
      fontFamily: "Times-Bold",
      color: DARK,
    },
    eduInstitution: {
      fontSize: 9.5,
      fontFamily: "Times-Italic",
      color: MUTED,
    },
    eduDate: {
      fontSize: 9,
      color: MUTED,
      fontFamily: "Times-Italic",
    },
    skillLine: {
      fontSize: 9.5,
      color: DARK,
      marginBottom: 2,
    },
    skillCategory: {
      fontFamily: "Times-Bold",
    },
    certItem: {
      fontSize: 9.5,
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

export default function ExecutiveTemplate({ data }: { data: ResumeData }) {
  const accent = data.accent_color || "#1f2937";
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
        <Text style={s.name}>{data.name}</Text>
        {data.title && <Text style={s.title}>{data.title}</Text>}
        <View style={s.contactRow}>
          {contactParts.map((part, i) => (
            <Text key={i} style={s.contactItem}>{part}</Text>
          ))}
        </View>

        {/* Summary */}
        {data.summary && (
          <View style={s.section}>
            <Text style={s.sectionHeading}>Executive Summary</Text>
            <Text style={s.summary}>{data.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionHeading}>Professional Experience</Text>
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
              <View key={i} style={s.eduBlock}>
                <Text style={s.eduDegree}>{edu.degree}</Text>
                <Text style={s.eduInstitution}>{edu.institution} — {edu.date}</Text>
                {edu.details.map((d, j) => (
                  <Text key={j} style={s.bullet}>{"•  "}{d}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionHeading}>Core Competencies</Text>
            {data.skills.map((group) => (
              <Text key={group.category} style={s.skillLine}>
                <Text style={s.skillCategory}>{group.category}: </Text>
                {group.items.join(", ")}
              </Text>
            ))}
          </View>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionHeading}>Certifications & Licenses</Text>
            {data.certifications.map((cert, i) => (
              <Text key={i} style={s.certItem}>
                {cert.name} — {cert.issuer}{cert.date ? `, ${cert.date}` : ""}
              </Text>
            ))}
          </View>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionHeading}>Languages</Text>
            <Text style={s.skillLine}>{data.languages.join("  |  ")}</Text>
          </View>
        )}

        <Text style={s.footer}>Generated by SG Job Hunt Copilot</Text>
      </Page>
    </Document>
  );
}
