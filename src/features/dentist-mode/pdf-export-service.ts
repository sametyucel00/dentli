import * as Print from 'expo-print';
import { Platform } from 'react-native';

import { DentistModeSummary } from '@/src/features/dentist-mode/model';
import { entitlementService } from '@/src/services/entitlement-service';

function buildSummaryHtml(summary: DentistModeSummary) {
  return `
    <html>
      <body style="font-family: Arial; padding: 24px; color: #132238;">
        <h1>Dentli Dentist Summary</h1>
        <p>Last ${summary.periodDays} days</p>
        <h2>Stats</h2>
        <ul>
          <li>Hygiene events: ${summary.stats.totalHygieneEvents}</li>
          <li>Symptoms: ${summary.stats.totalSymptoms}</li>
          <li>Appointments: ${summary.stats.totalAppointments}</li>
          <li>Tooth updates: ${summary.stats.totalToothUpdates}</li>
        </ul>
        <h2>Hygiene rates</h2>
        <ul>
          <li>Brushing: ${summary.hygieneRates.brushingRate}%</li>
          <li>Flossing: ${summary.hygieneRates.flossRate}%</li>
          <li>Mouthwash: ${summary.hygieneRates.mouthwashRate}%</li>
        </ul>
        <h2>Problem teeth</h2>
        <ul>
          ${summary.problemTeeth
            .map(
              (item) =>
                `<li>Tooth ${item.toothNumber}: ${item.status} (${item.occurrences} updates)</li>`,
            )
            .join('')}
        </ul>
        <h2>Recent events</h2>
        <ul>
          ${summary.recentEvents
            .map(
              (event) =>
                `<li>${event.timestamp}: ${event.title}${event.detail ? ` - ${event.detail}` : ''}</li>`,
            )
            .join('')}
        </ul>
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
