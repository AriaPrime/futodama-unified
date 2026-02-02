import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { consultants } from "@/lib/mock-data/consultants";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const consultantId = searchParams.get("id");
  const format = searchParams.get("format") || "pdf";

  if (!consultantId) {
    return NextResponse.json({ error: "Consultant ID required" }, { status: 400 });
  }

  const consultant = consultants.find(c => c.id === consultantId);
  if (!consultant) {
    return NextResponse.json({ error: "Consultant not found" }, { status: 404 });
  }

  if (format === "pdf") {
    try {
      const pdfDoc = await PDFDocument.create();
      const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      
      const pageWidth = 595.28; // A4 width in points
      const pageHeight = 841.89; // A4 height in points
      const margin = 50;
      const contentWidth = pageWidth - 2 * margin;
      
      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let yPosition = pageHeight - margin;

      const drawText = (text: string, x: number, y: number, size: number, font = timesRoman, color = rgb(0, 0, 0)) => {
        page.drawText(text, { x, y, size, font, color });
      };

      const drawSectionHeader = (title: string) => {
        if (yPosition < 100) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin;
        }
        yPosition -= 25;
        drawText(title, margin, yPosition, 14, timesRomanBold, rgb(0.2, 0.2, 0.6));
        yPosition -= 5;
        page.drawLine({
          start: { x: margin, y: yPosition },
          end: { x: pageWidth - margin, y: yPosition },
          thickness: 1,
          color: rgb(0.2, 0.2, 0.6),
        });
        yPosition -= 15;
      };

      const wrapText = (text: string, maxWidth: number, fontSize: number, font = timesRoman): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const width = font.widthOfTextAtSize(testLine, fontSize);
          
          if (width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine) {
          lines.push(currentLine);
        }
        
        return lines;
      };

      // Header
      drawText(consultant.name, margin, yPosition, 24, timesRomanBold);
      yPosition -= 20;
      drawText(consultant.title, margin, yPosition, 14, timesRoman, rgb(0.4, 0.4, 0.4));
      yPosition -= 15;
      drawText(`${consultant.email} | ${consultant.phone} | ${consultant.location}`, margin, yPosition, 10);
      yPosition -= 10;

      // Professional Profile
      if (consultant.cv.professionalProfile) {
        drawSectionHeader("PROFESSIONAL PROFILE");
        const profileLines = wrapText(consultant.cv.professionalProfile, contentWidth, 10);
        for (const line of profileLines) {
          if (yPosition < 50) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - margin;
          }
          drawText(line, margin, yPosition, 10);
          yPosition -= 14;
        }
      }

      // Skills
      if (consultant.cv.skills.length > 0) {
        drawSectionHeader("KEY SKILLS");
        const skillGroups: Record<string, string[]> = {};
        consultant.cv.skills.forEach(skill => {
          if (!skillGroups[skill.category]) {
            skillGroups[skill.category] = [];
          }
          skillGroups[skill.category].push(`${skill.name} (${skill.level})`);
        });

        for (const [category, skills] of Object.entries(skillGroups)) {
          if (yPosition < 50) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - margin;
          }
          drawText(`${category}:`, margin, yPosition, 10, timesRomanBold);
          yPosition -= 14;
          const skillText = skills.join(", ");
          const skillLines = wrapText(skillText, contentWidth - 10, 10);
          for (const line of skillLines) {
            drawText(line, margin + 10, yPosition, 10);
            yPosition -= 12;
          }
          yPosition -= 5;
        }
      }

      // Experience
      if (consultant.cv.experience.length > 0) {
        drawSectionHeader("PROFESSIONAL EXPERIENCE");
        for (const exp of consultant.cv.experience) {
          if (yPosition < 100) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - margin;
          }
          
          drawText(`${exp.role}`, margin, yPosition, 11, timesRomanBold);
          yPosition -= 14;
          drawText(`${exp.company} | ${exp.project}`, margin, yPosition, 10, timesRoman, rgb(0.3, 0.3, 0.3));
          yPosition -= 12;
          const dates = exp.endDate 
            ? `${exp.startDate} - ${exp.endDate}`
            : `${exp.startDate} - Present`;
          drawText(dates, margin, yPosition, 9, timesRoman, rgb(0.5, 0.5, 0.5));
          yPosition -= 14;
          
          if (exp.description) {
            const descLines = wrapText(exp.description, contentWidth - 10, 10);
            for (const line of descLines) {
              if (yPosition < 50) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                yPosition = pageHeight - margin;
              }
              drawText(line, margin + 10, yPosition, 10);
              yPosition -= 12;
            }
          }
          yPosition -= 10;
        }
      }

      // Education
      if (consultant.cv.education.length > 0) {
        drawSectionHeader("EDUCATION");
        for (const edu of consultant.cv.education) {
          if (yPosition < 60) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - margin;
          }
          drawText(`${edu.degree} in ${edu.field}`, margin, yPosition, 11, timesRomanBold);
          yPosition -= 14;
          drawText(`${edu.institution} | ${edu.startYear} - ${edu.endYear}`, margin, yPosition, 10, timesRoman, rgb(0.4, 0.4, 0.4));
          yPosition -= 18;
        }
      }

      // Languages
      if (consultant.cv.languages.length > 0) {
        drawSectionHeader("LANGUAGES");
        const langText = consultant.cv.languages
          .map(l => `${l.language} (${l.level})`)
          .join(", ");
        const langLines = wrapText(langText, contentWidth, 10);
        for (const line of langLines) {
          drawText(line, margin, yPosition, 10);
          yPosition -= 12;
        }
      }

      // Serialize
      const pdfBytes = await pdfDoc.save();

      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${consultant.name.replace(/\s+/g, '_')}_CV.pdf"`,
        },
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      return NextResponse.json(
        { error: "Failed to generate PDF" },
        { status: 500 }
      );
    }
  }

  // For DOCX format - return a placeholder response
  // Full DOCX support would require the 'docx' npm package
  if (format === "docx") {
    return NextResponse.json(
      { error: "DOCX export coming soon. Please use PDF for now." },
      { status: 501 }
    );
  }

  return NextResponse.json({ error: "Invalid format" }, { status: 400 });
}
