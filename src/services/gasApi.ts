import { AddressCard, Dictionaries, GeneratedDocsMap, UKItem, User } from '../types';
import { INITIAL_CARDS, INITIAL_DICTIONARIES, INITIAL_UK_DIRECTORY, INITIAL_USERS } from '../data/mockData';

const GAS_URL_KEY = 'crmGasWebAppUrl';
const GAS_MODE_KEY = 'crmGasMode'; // 'live' | 'demo'
const STORAGE_CARDS_KEY = 'crmStoredCards';
const STORAGE_DICTS_KEY = 'crmStoredDicts';
const STORAGE_UK_KEY = 'crmStoredUK';
const STORAGE_DOCS_KEY = 'crmStoredDocs';

export class GasApiService {
  static getGasUrl(): string {
    return localStorage.getItem(GAS_URL_KEY) || '';
  }

  static setGasUrl(url: string) {
    localStorage.setItem(GAS_URL_KEY, url.trim());
  }

  static isDemoMode(): boolean {
    const mode = localStorage.getItem(GAS_MODE_KEY);
    if (mode === 'demo') return true;
    if (mode === 'live') return false;
    // Default to demo if no URL is provided
    return !this.getGasUrl();
  }

  static setDemoMode(isDemo: boolean) {
    localStorage.setItem(GAS_MODE_KEY, isDemo ? 'demo' : 'live');
  }

  private static isGitHubPages(): boolean {
    return typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io');
  }

  // Generic request dispatcher
  private static async request(action: string, payload: Record<string, any> = {}): Promise<any> {
    const isDemo = this.isDemoMode();
    const gasUrl = this.getGasUrl();

    if (isDemo || !gasUrl) {
      return this.handleDemoRequest(action, payload);
    }

    try {
      const res = this.isGitHubPages()
        ? await fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action, ...payload }),
            redirect: 'follow',
          })
        : await fetch('/api/gas-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: gasUrl,
              payload: { action, ...payload },
            }),
          });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Ошибка обращения к Google Apps Script`);
      }

      const json = await res.json();
      return json;
    } catch (err: any) {
      console.warn(`GAS Live API call failed for action "${action}", error:`, err);
      // Fallback or rethrow
      throw err;
    }
  }

  // Ping backend
  static async ping(): Promise<{ success: boolean; spreadsheet?: string; timestamp?: string; error?: string; status?: string }> {
    const isDemo = this.isDemoMode();
    const gasUrl = this.getGasUrl();

    if (isDemo || !gasUrl) {
      return {
        success: true,
        status: 'connected',
        spreadsheet: 'CRM_Управление_адресами (Демо-база данных)',
        timestamp: new Date().toISOString(),
      };
    }

    return this.request('ping');
  }

  // Login
  static async login(login: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> {
    return this.request('login', { login, password });
  }

  // Dictionaries
  static async getDictionaries(): Promise<Dictionaries> {
    return this.request('getDictionaries');
  }

  // Address Data
  static async getAddressData(userRole: string, userFio: string): Promise<AddressCard[]> {
    return this.request('getAddressData', { userRole, userFio });
  }

  // UK Directory
  static async getUKDirectory(): Promise<UKItem[]> {
    return this.request('getUKDirectory');
  }

  // Save Card
  static async saveAddressData(updatedObject: AddressCard, userRole: string): Promise<{ success: boolean; error?: string }> {
    return this.request('saveAddressData', { updatedObject, userRole });
  }

  // Documents
  static async getGeneratedDocs(address: string): Promise<{ success: boolean; data: GeneratedDocsMap; error?: string }> {
    return this.request('getGeneratedDocs', { address });
  }

  static async generateDocument(docType: string, cardData: AddressCard): Promise<{ success: boolean; id?: string; url?: string; error?: string }> {
    return this.request('generateDocument', { docType, cardData });
  }

  static async deleteDocument(fileId: string): Promise<{ success: boolean; error?: string }> {
    return this.request('deleteDocument', { fileId });
  }

  // ================= DEMO MODE IN-MEMORY / LOCALSTORAGE ENGINE =================
  private static getStoredCards(): AddressCard[] {
    const raw = localStorage.getItem(STORAGE_CARDS_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    localStorage.setItem(STORAGE_CARDS_KEY, JSON.stringify(INITIAL_CARDS));
    return [...INITIAL_CARDS];
  }

  private static setStoredCards(cards: AddressCard[]) {
    localStorage.setItem(STORAGE_CARDS_KEY, JSON.stringify(cards));
  }

  private static getStoredDocs(): Record<string, GeneratedDocsMap> {
    const raw = localStorage.getItem(STORAGE_DOCS_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    return {};
  }

  private static setStoredDocs(docs: Record<string, GeneratedDocsMap>) {
    localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(docs));
  }

  private static handleDemoRequest(action: string, payload: Record<string, any>): any {
    // Artificial slight delay for realistic feel
    switch (action) {
      case 'ping':
        return {
          success: true,
          status: 'connected',
          spreadsheet: 'CRM_Управление_адресами (Демо)',
          timestamp: new Date().toISOString(),
        };

      case 'login': {
        const { login, password } = payload;
        const cleanLogin = (login || '').trim().toLowerCase();
        const cleanPass = (password || '').trim();

        const match = INITIAL_USERS.find(
          u => u.login.toLowerCase() === cleanLogin && u.password === cleanPass
        );

        if (match) {
          return {
            success: true,
            user: {
              fio: match.fio,
              role: match.role,
              id: match.id,
              email: match.email,
            },
          };
        }
        return { success: false, message: 'Неверный логин или пароль (Демо: admin/admin или ivanov/123)' };
      }

      case 'getDictionaries': {
        const rawDicts = localStorage.getItem(STORAGE_DICTS_KEY);
        if (rawDicts) {
          try { return JSON.parse(rawDicts); } catch {}
        }
        return INITIAL_DICTIONARIES;
      }

      case 'getUKDirectory': {
        const rawUK = localStorage.getItem(STORAGE_UK_KEY);
        if (rawUK) {
          try { return JSON.parse(rawUK); } catch {}
        }
        return INITIAL_UK_DIRECTORY;
      }

      case 'getAddressData': {
        const { userRole, userFio } = payload;
        const cards = this.getStoredCards();

        if (userRole === 'Пользователь') {
          return cards.filter(card => {
            const respPBD = (card['ФИО ответственный ПБД'] || '').trim() === (userFio || '').trim();
            const respRIM = (card['ФИО ответственный РИМ презентация'] || '').trim() === (userFio || '').trim();
            const respPres = (card['ФИО ответственный презентация ПБД'] || '').trim() === (userFio || '').trim();
            return respPBD || respRIM || respPres;
          });
        }
        return cards;
      }

      case 'saveAddressData': {
        const { updatedObject, userRole } = payload;
        const cards = this.getStoredCards();
        const idx = cards.findIndex(c => c.rowNumber === updatedObject.rowNumber);

        if (idx !== -1) {
          const current = { ...cards[idx] };
          const isAddressData = [
            'Адрес',
            'Адрес (ФИАС)',
            'Город',
            'Улица',
            'номер дома',
            'корпус',
            'литера',
            '№ подьезда',
            'Квартира с',
            'Квартира по',
            'Кол-во квартир',
          ];
          const isMontageData = ['Планируемая дата монтажа', 'Фактическая дата монтажа'];

          for (const key in updatedObject) {
            if (userRole === 'Пользователь' && (isAddressData.includes(key) || isMontageData.includes(key))) {
              continue;
            }
            current[key] = updatedObject[key];
          }
          cards[idx] = current;
          this.setStoredCards(cards);
          return { success: true };
        }
        return { success: false, error: 'Объект не найден' };
      }

      case 'getGeneratedDocs': {
        const address = payload.address || '';
        const allDocs = this.getStoredDocs();
        const existing = allDocs[address] || {
          'Бюллетень': null,
          'Протокол': null,
          'Сообщение': null,
        };
        return { success: true, data: existing };
      }

      case 'generateDocument': {
        const { docType, cardData } = payload;
        const address = cardData?.['Адрес'] || 'Без адреса';
        const docId = 'doc_' + Math.random().toString(36).substring(2, 9);
        const docUrl = `https://docs.google.com/document/d/${docId}/edit?usp=sharing`;

        const allDocs = this.getStoredDocs();
        if (!allDocs[address]) {
          allDocs[address] = { 'Бюллетень': null, 'Протокол': null, 'Сообщение': null };
        }
        allDocs[address][docType] = { id: docId, url: docUrl };
        this.setStoredDocs(allDocs);

        return { success: true, id: docId, url: docUrl };
      }

      case 'deleteDocument': {
        const fileId = payload.fileId;
        const allDocs = this.getStoredDocs();
        for (const addr in allDocs) {
          for (const type in allDocs[addr]) {
            if (allDocs[addr][type]?.id === fileId) {
              allDocs[addr][type] = null;
            }
          }
        }
        this.setStoredDocs(allDocs);
        return { success: true };
      }

      default:
        return { success: false, error: 'Неизвестное действие: ' + action };
    }
  }

  // Reset demo storage to default
  static resetDemoData() {
    localStorage.removeItem(STORAGE_CARDS_KEY);
    localStorage.removeItem(STORAGE_DOCS_KEY);
    localStorage.removeItem(STORAGE_DICTS_KEY);
    localStorage.removeItem(STORAGE_UK_KEY);
  }
}
