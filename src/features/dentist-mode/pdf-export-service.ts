import * as Print from 'expo-print';
import { Platform } from 'react-native';

import { DentistModeSummary } from '@/src/features/dentist-mode/model';
import { entitlementService } from '@/src/services/entitlement-service';

function humanizeLabel(value: string | null) {
  if (!value) {
    return '';
  }

  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function renderRateBar(label: string, value: number, color: string) {
  return `
    <div style="margin: 0 0 14px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span>${label}</span>
        <strong>${value}%</strong>
      </div>
      <div style="background:#E7EEF5;border-radius:999px;height:10px;overflow:hidden;">
        <div style="background:${color};height:100%;width:${Math.max(0, Math.min(value, 100))}%;"></div>
      </div>
    </div>
  `;
}

function buildSummaryHtml(summary: DentistModeSummary) {
  return `
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#FFFFFF; padding:28px; color:#132238;">
        <div style="max-width:760px;margin:0 auto;">
          <div style="padding:0 0 18px;border-bottom:1px solid #DCE6F0;">
            <h1 style="margin:0 0 8px;font-size:30px;line-height:1.15;">30-day oral care summary</h1>
            <p style="margin:0;color:#5F7289;">Generated from recent local Dentli records for appointment prep and discussion.</p>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:24px;">
              <div style="background:#F4F8FB;border-radius:16px;padding:16px;"><div style="color:#5F7289;font-size:12px;">Hygiene</div><div style="font-size:28px;font-weight:700;margin-top:6px;">${summary.stats.totalHygieneEvents}</div></div>
              <div style="background:#F4F8FB;border-radius:16px;padding:16px;"><div style="color:#5F7289;font-size:12px;">Symptoms</div><div style="font-size:28px;font-weight:700;margin-top:6px;">${summary.stats.totalSymptoms}</div></div>
              <div style="background:#F4F8FB;border-radius:16px;padding:16px;"><div style="color:#5F7289;font-size:12px;">Appointments</div><div style="font-size:28px;font-weight:700;margin-top:6px;">${summary.stats.totalAppointments}</div></div>
              <div style="background:#F4F8FB;border-radius:16px;padding:16px;"><div style="color:#5F7289;font-size:12px;">Tooth updates</div><div style="font-size:28px;font-weight:700;margin-top:6px;">${summary.stats.totalToothUpdates}</div></div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:18px;margin-top:18px;">
            <div style="padding:20px 0;border-bottom:1px solid #E7EEF5;">
              <h2 style="margin:0 0 18px;font-size:22px;">Hygiene rates</h2>
              ${renderRateBar('Brushing', summary.hygieneRates.brushingRate, '#0F7B6C')}
              ${renderRateBar('Floss', summary.hygieneRates.flossRate, '#1F9D8B')}
              ${renderRateBar('Mouthwash', summary.hygieneRates.mouthwashRate, '#3AA3E3')}
            </div>

            <div style="padding:20px 0;border-bottom:1px solid #E7EEF5;">
              <h2 style="margin:0 0 18px;font-size:22px;">Problem teeth</h2>
              ${
                summary.problemTeeth.length === 0
                  ? '<p style="margin:0;color:#5F7289;">No flagged teeth in the last 30 days.</p>'
                  : summary.problemTeeth
                      .map(
                        (item) => `
                          <div style="background:#F6FAFD;border-radius:12px;padding:12px 14px;margin-bottom:10px;">
                            <strong>Tooth ${item.toothNumber}</strong>
                            <div style="color:#5F7289;margin-top:4px;">${humanizeLabel(item.status)} • ${item.occurrences} updates</div>
                          </div>
                        `,
                      )
                      .join('')
              }
            </div>
          </div>

          <div style="padding:20px 0;margin-top:18px;">
            <h2 style="margin:0 0 18px;font-size:22px;">Recent events</h2>
            ${
              summary.recentEvents
                .map(
                  (event) => `
                    <div style="border-bottom:1px solid #E7EEF5;padding:12px 0;">
                      <div style="display:flex;justify-content:space-between;gap:12px;">
                        <strong>${humanizeLabel(event.title)}</strong>
                        <span style="color:#5F7289;">${event.timestamp}</span>
                      </div>
                      ${event.detail ? `<div style="color:#5F7289;margin-top:6px;">${humanizeLabel(event.detail)}</div>` : ''}
                    </div>
                  `,
                )
                .join('')
            }
          </div>
        </div>
      </body>
    </html>
  `;
}

export class DentistModePdfExportService {
  async export(summary: DentistModeSummary) {
    if (!entitlementService.hasFeature('pdf_export')) {
      throw new Error('pdf_export_locked');
    }

    const html = buildSummaryHtml(summary);
    if (Platform.OS === 'web') {
      await Print.printAsync({ html });
      return { uri: null };
    }

    return Print.printToFileAsync({ html });
  }
}

export const dentistModePdfExportService = new DentistModePdfExportService();
