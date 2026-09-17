/**
 * Indian state codes for GST (shared).
 *
 * Used to map a state name (or short code) to its GST state code, and to
 * derive the intra/inter-state supply determination from a GSTIN prefix.
 * Shared by the GST report (sales) and purchase (ITC) flows.
 */
export const STATE_CODES: Record<string, string> = {
  'Jammu and Kashmir': '01', 'Himachal Pradesh': '02', 'Punjab': '03', 'Chandigarh': '04',
  'Uttarakhand': '05', 'Haryana': '06', 'Delhi': '07', 'Rajasthan': '08',
  'Uttar Pradesh': '09', 'Bihar': '10', 'Sikkim': '11', 'Arunachal Pradesh': '12',
  'Nagaland': '13', 'Manipur': '14', 'Mizoram': '15', 'Tripura': '16',
  'Meghalaya': '17', 'Assam': '18', 'West Bengal': '19', 'Jharkhand': '20',
  'Odisha': '21', 'Chhattisgarh': '22', 'Madhya Pradesh': '23', 'Gujarat': '24',
  'Daman and Diu': '25', 'Dadra and Nagar Haveli': '26', 'Maharashtra': '27',
  'Andhra Pradesh': '28', 'Karnataka': '29', 'Goa': '30', 'Lakshadweep': '31',
  'Kerala': '32', 'Tamil Nadu': '33', 'Puducherry': '34', 'Andaman and Nicobar': '35',
  'Telangana': '36', 'Andhra Pradesh (New)': '37', 'Ladakh': '38',
  // Short forms
  'WB': '19', 'MH': '27', 'KA': '29', 'TN': '33', 'UP': '09',
  'BR': '10', 'RJ': '08', 'MP': '23', 'GJ': '24', 'AP': '28',
  'TS': '36', 'KL': '32', 'HR': '06', 'PB': '03', 'CT': '22',
};

/**
 * Map a state name/short-code to its GST state code.
 * Returns '99' (Other territory) for unknown/empty input — same behavior
 * the GST report service has always used.
 */
export function getStateCode(state: string | null | undefined): string {
  if (!state) return '99';
  return STATE_CODES[state.trim()] ?? STATE_CODES[state.trim().toUpperCase()] ?? '99';
}
