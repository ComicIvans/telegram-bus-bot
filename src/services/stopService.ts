import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger';
import { Stop } from '../db/models';
import { config } from '../config';

export interface NextBus {
  line: string;
  destination: string;
  minutes: number;
  arrival: string;
}
export interface StopInfo {
  stopId: string;
  stopName: string;
  nextBuses: NextBus[];
}

/**
 * POST to the stop endpoint and return raw HTML.
 * @param stopId – numeric code of the stop
 */
async function fetchHTML(stopId: string): Promise<string> {
  logger.info('Fetching HTML for stop=%s', stopId);
  const params = new URLSearchParams();
  params.append('parada', stopId);
  params.append('excel', '');
  const resp = await axios.post(config.url, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 10_000,
  });
  logger.info(
    'Received %d bytes of HTML for stop=%s',
    resp.data.length,
    stopId,
  );
  return resp.data as string;
}

/**
 * Extract stop metadata and next-bus list from HTML.
 */
function parseHTML(html: string): StopInfo {
  const $ = cheerio.load(html);

  // Stop ID & name
  const stopId = $('.mainhead .subtit')
    .first()
    .text()
    .replace('Parada', '')
    .trim();
  const stopName = $('.mainhead span').first().text().trim();

  const nextBuses: NextBus[] = [];

  $('.tf .tfr').each((_, el) => {
    const lineCell = $(el).children('div.tfcc').first();
    const destCell = $(el).children('div.tfccs').first();
    const otherCells = $(el).children('div.tfcc').slice(1);

    const line = lineCell.find('.form_lle').text().trim();
    const rawDest = destCell.text().trim();
    const destination = rawDest.replace(new RegExp('^${line}\\s*'), '');

    const minutesText = otherCells.eq(0).text().trim();
    const minutes = parseInt(minutesText, 10);

    const arrival = otherCells.eq(1).text().trim();

    nextBuses.push({ line, destination, minutes, arrival });
  });

  return { stopId, stopName, nextBuses };
}

/**
 * Fetch & parse stop info, and upsert into DB.
 */
export async function fetchStopInfo(stopId: string): Promise<StopInfo> {
  const html = await fetchHTML(stopId);
  const info = parseHTML(html);
  await Stop.upsert({
    id: info.stopId,
    name: info.stopName,
    lines: JSON.stringify(info.nextBuses.map((b) => b.line)),
  });
  return info;
}

/**
 * Same as fetchStopInfo, but only for a single line.
 */
export async function getNextBuses(
  stopId: string,
  lineId: string,
): Promise<StopInfo> {
  const info = await fetchStopInfo(stopId);
  const filtered = info.nextBuses.filter((b) => b.line === lineId);
  return { ...info, nextBuses: filtered };
}
