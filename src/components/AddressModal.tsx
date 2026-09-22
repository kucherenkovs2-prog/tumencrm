import React, { useState, useEffect } from 'react';
import { AddressCard, Dictionaries, GeneratedDocsMap, OsmotrData, User } from '../types';
import { GasApiService } from '../services/gasApi';
import { DeleteDocModal } from './DeleteDocModal';
import {
  X,
  FileText,
  Copy,
  ClipboardPaste,
  ChevronDown,
  ExternalLink,
  Trash2,
  Save,
  Lock,
  Layers,
  CheckCircle,
} from 'lucide-react';

interface AddressModalProps {
  card: AddressCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  user: User;
  dictionaries: Dictionaries;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const FORM_STRUCTURE = [
  {
    name: 'Данные об адресе',
    fields: [
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
    ],
  },
  {
    name: 'Данные об объекте',
    fields: [
      'Стратегия',
      'Тип договора',
      'Статус подъезда',
      'Группа договора',
      'Причина брака (классификатор)',
      'Причина расторжения',
      'Примечание',
      'Домофонная компания',
      'Интернет провайдер',
      'Управляющая компания',
      'Прочие СБ на адресе',
      'Входит в состав общего имущества',
      'ФИО РОП',
    ],
  },
  {
    name: 'Данные об активисте',
    fields: ['ФИО старшего', 'Адрес старшего', 'Контакты старшего', 'E-mail старшего'],
  },
  {
    name: 'Информирование о БД',
    fields: ['Дата информирования ПБД', 'ФИО ответственный ПБД', 'Данные осмотра'],
  },
  {
    name: 'Информирование о собрании',
    fields: [
      'Дата размещения РИМ презентация',
      'ФИО ответственный РИМ презентация',
      'Факт размещения РИМ презентация',
    ],
  },
  {
    name: 'Собрание',
    fields: [
      'Дата презентации ПБД',
      'ФИО ответственный презентация ПБД',
      'Результат презентации ПБД',
      'Комментарий КОП после собрания',
    ],
  },
  {
    name: 'ОСС',
    fields: [
      'Дата запроса реестра собственников',
      'Факт получения реестра собственников',
      'Дата подготовки документов ОСС',
      'Дата размещения РИМ о проведении ОСС',
      'Дата проведения ОСС',
      'Конечная дата ОСС',
      'Результат ОСС',
      'Дата подписания договора ЭРТХ',
    ],
  },
  {
    name: 'Монтаж',
    fields: ['Планируемая дата монтажа', 'Фактическая дата монтажа'],
  },
];

const DOC_TYPES = [
  { key: 'Бюллетень', label: 'Бюллетень' },
  { key: 'Протокол', label: 'Протокол' },
  { key: 'Сообщение', label: 'Сообщение' },
];

export const AddressModal: React.FC<AddressModalProps> = ({
  card,
  isOpen,
  onClose,
  onSaved,
  user,
  dictionaries,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeOsmotr, setActiveOsmotr] = useState<OsmotrData>({
    uk: '',
    domofon: '',
    tarif: '',
    cameras: '',
  });
  const [showOsmotr, setShowOsmotr] = useState(false);
  const [saving, setSaving] = useState(false);

  // Docs state
  const [cardDocs, setCardDocs] = useState<GeneratedDocsMap>({
    'Бюллетень': null,
    'Протокол': null,
    'Сообщение': null,
  });
  const [docsLoading, setDocsLoading] = useState(false);
  const [docProcessing, setDocProcessing] = useState<Record<string, boolean>>({
    'Бюллетень': false,
    'Протокол': false,
    'Сообщение': false,
  });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    type: string;
    fileId: string | null;
  }>({
    visible: false,
    type: '',
    fileId: null,
  });
  const [deleteProcessing, setDeleteProcessing] = useState(false);

  // Initialize form when card opens
  useEffect(() => {
    if (!card) return;

    const copy = JSON.parse(JSON.stringify(card));

    // Convert Russian dates DD.MM.YYYY to input date YYYY-MM-DD
    for (const key in copy) {
      if (key.toLowerCase().includes('дата') && copy[key] && typeof copy[key] === 'string') {
        const parts = copy[key].split('.');
        if (parts.length === 3) {
          copy[key] = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
    }

    // Default toggle for РИМ
    if (!copy['Факт размещения РИМ презентация']) {
      copy['Факт размещения РИМ презентация'] = 'Нет';
    }

    setFormData(copy);

    // Parse осмотр
    const osmotrData: OsmotrData = { uk: '', domofon: '', tarif: '', cameras: '' };
    let hasOsmotr = false;
    if (copy['Данные осмотра']) {
      hasOsmotr = true;
      const parts = copy['Данные осмотра'].split(';');
      parts.forEach((p: string) => {
        const [k, v] = p.split(':');
        if (k && v) {
          const cleanK = k.trim();
          const cleanV = v.trim();
          if (cleanK === 'Управляющая компания') osmotrData.uk = cleanV;
          if (cleanK === 'Домофонная компания') osmotrData.domofon = cleanV;
          if (cleanK === 'Тариф домофон') osmotrData.tarif = cleanV;
          if (cleanK === 'Наличие камер') osmotrData.cameras = cleanV;
        }
      });
    }
    setActiveOsmotr(osmotrData);
    setShowOsmotr(hasOsmotr);

    // Fetch documents
    loadDocs(copy['Адрес']);
  }, [card, isOpen]);

  const loadDocs = async (address?: string) => {
    if (!address) return;
    setDocsLoading(true);
    try {
      const res = await GasApiService.getGeneratedDocs(address);
      if (res.success && res.data) {
        setCardDocs(res.data);
      }
    } catch {
      // Ignore or log
    } finally {
      setDocsLoading(false);
    }
  };

  const isReadOnly = (categoryName: string) => {
    if (user.role === 'Администратор') return false;
    return categoryName === 'Данные об адресе' || categoryName === 'Монтаж';
  };

  const handleFieldChange = (field: string, value: any) => {
    let finalVal = value;
    if (field === 'Контакты старшего' && typeof value === 'string') {
      finalVal = value.replace(/[^\+0-9]/g, '');
    }
    setFormData(prev => ({ ...prev, [field]: finalVal }));
  };

  const copyOsmotr = () => {
    localStorage.setItem('crmCopiedOsmotr', JSON.stringify(activeOsmotr));
    onShowToast('Данные осмотра скопированы в буфер', 'success');
  };

  const pasteOsmotr = () => {
    const data = localStorage.getItem('crmCopiedOsmotr');
    if (data) {
      try {
        setActiveOsmotr(JSON.parse(data));
        onShowToast('Данные осмотра вставлены', 'success');
      } catch {
        onShowToast('Ошибка чтения буфера', 'error');
      }
    } else {
      onShowToast('Буфер пуст', 'info');
    }
  };

  // Convert dates back to DD.MM.YYYY and format inspection data
  const getFormattedPayload = (): AddressCard => {
    const copy = JSON.parse(JSON.stringify(formData));

    for (const key in copy) {
      if (key.toLowerCase().includes('дата') && copy[key] && typeof copy[key] === 'string') {
        const parts = copy[key].split('-');
        if (parts.length === 3) {
          copy[key] = `${parts[2]}.${parts[1]}.${parts[0]}`;
        }
      }
    }

    const osmotrArr: string[] = [];
    if (activeOsmotr.uk) osmotrArr.push(`Управляющая компания: ${activeOsmotr.uk}`);
    if (activeOsmotr.domofon) osmotrArr.push(`Домофонная компания: ${activeOsmotr.domofon}`);
    if (activeOsmotr.tarif) osmotrArr.push(`Тариф домофон: ${activeOsmotr.tarif}`);
    if (activeOsmotr.cameras) osmotrArr.push(`Наличие камер: ${activeOsmotr.cameras}`);

    copy['Данные осмотра'] = osmotrArr.length > 0 ? osmotrArr.join('; ') : '';

    return copy as AddressCard;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = getFormattedPayload();
      const res = await GasApiService.saveAddressData(payload, user.role);
      if (res.success) {
        onShowToast('Изменения успешно сохранены', 'success');
        onSaved();
        onClose();
      } else {
        onShowToast(res.error || 'Ошибка при сохранении', 'error');
      }
    } catch (err: any) {
      onShowToast('Ошибка связи: ' + (err.message || 'Сбой сохранения'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDoc = async (docType: string) => {
    setDocProcessing(prev => ({ ...prev, [docType]: true }));
    try {
      const payload = getFormattedPayload();
      const res = await GasApiService.generateDocument(docType, payload);
      if (res.success && res.id && res.url) {
        setCardDocs(prev => ({
          ...prev,
          [docType]: { id: res.id!, url: res.url! },
        }));
        onShowToast(`Документ "${docType}" успешно создан!`, 'success');
      } else {
        onShowToast(`Ошибка генерации: ${res.error || 'Сбой'}`, 'error');
      }
    } catch (err: any) {
      onShowToast('Ошибка при формировании документа: ' + err.message, 'error');
    } finally {
      setDocProcessing(prev => ({ ...prev, [docType]: false }));
    }
  };

  const handlePromptDelete = (docType: string, fileId?: string) => {
    if (!fileId) return;
    setDeleteModal({ visible: true, type: docType, fileId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.fileId) return;
    setDeleteProcessing(true);
    try {
      const res = await GasApiService.deleteDocument(deleteModal.fileId);
      if (res.success) {
        setCardDocs(prev => ({ ...prev, [deleteModal.type]: null }));
        onShowToast(`Документ "${deleteModal.type}" перемещен в корзину`, 'success');
      } else {
        onShowToast('Ошибка при удалении: ' + res.error, 'error');
      }
    } catch (err: any) {
      onShowToast('Сбой удаления: ' + err.message, 'error');
    } finally {
      setDeleteProcessing(false);
      setDeleteModal({ visible: false, type: '', fileId: null });
    }
  };

  if (!isOpen || !card) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 md:p-6 transition-opacity">
        <div
          className="bg-white md:rounded-[2rem] shadow-2xl w-full h-full md:h-auto md:max-w-5xl md:max-h-[94vh] flex flex-col transform transition-all border border-slate-100 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 md:px-8 md:py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
            <div className="truncate pr-4">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Карточка объекта
                </span>
                <span className="text-xs text-slate-400 font-mono">#{card.rowNumber}</span>
                {user.role === 'Пользователь' && (
                  <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 font-medium">
                    <Lock className="w-2.5 h-2.5" /> Ограниченный доступ
                  </span>
                )}
              </div>
              <h2
                className="text-lg md:text-2xl font-bold text-slate-900 truncate"
                title={formData['Адрес'] || 'Объект'}
              >
                {formData['Адрес'] || 'Адрес не указан'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 md:p-2.5 rounded-full active:scale-95 transition shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Scroll Body */}
          <div className="p-4 md:p-8 overflow-y-auto flex-1 bg-slate-50/70 space-y-6">
            {FORM_STRUCTURE.map(category => {
              const readOnly = isReadOnly(category.name);

              return (
                <div
                  key={category.name}
                  className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                    <h3 className="text-sm md:text-base font-bold text-slate-800 border-l-4 border-blue-600 pl-3">
                      {category.name}
                    </h3>
                    {readOnly && (
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <Lock className="w-3.5 h-3.5" /> Только для чтения
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                    {category.fields.map(field => {
                      const isFullWidth = [
                        'Данные осмотра',
                        'Комментарий КОП после собрания',
                        'Примечание',
                      ].includes(field);

                      return (
                        <div
                          key={field}
                          className={isFullWidth ? 'col-span-1 md:col-span-2 lg:col-span-3' : 'w-full'}
                        >
                          {/* 1. CUSTOM FIELD: Данные осмотра */}
                          {field === 'Данные осмотра' ? (
                            <div className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-200 w-full shadow-inner">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <button
                                  type="button"
                                  onClick={() => setShowOsmotr(!showOsmotr)}
                                  className="text-sm font-bold text-blue-600 flex items-center gap-1.5 hover:text-blue-800 transition"
                                >
                                  <span>
                                    {showOsmotr
                                      ? 'Скрыть поля осмотра'
                                      : 'Добавить / редактировать результат осмотра'}
                                  </span>
                                  <ChevronDown
                                    className={`w-4 h-4 transform transition-transform ${
                                      showOsmotr ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>
                                {showOsmotr && (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={copyOsmotr}
                                      className="text-xs font-semibold px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 shadow-sm active:scale-95 transition flex items-center gap-1"
                                    >
                                      <Copy className="w-3.5 h-3.5" /> Скопировать
                                    </button>
                                    <button
                                      type="button"
                                      onClick={pasteOsmotr}
                                      className="text-xs font-semibold px-3 py-1.5 bg-white text-blue-600 border border-slate-200 rounded-lg hover:bg-slate-100 shadow-sm active:scale-95 transition flex items-center gap-1"
                                    >
                                      <ClipboardPaste className="w-3.5 h-3.5" /> Вставить
                                    </button>
                                  </div>
                                )}
                              </div>

                              {showOsmotr && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-200">
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                                      Управляющая компания
                                    </label>
                                    <input
                                      type="text"
                                      value={activeOsmotr.uk}
                                      disabled={readOnly}
                                      onChange={e =>
                                        setActiveOsmotr(prev => ({
                                          ...prev,
                                          uk: e.target.value,
                                        }))
                                      }
                                      placeholder="ООО УК..."
                                      className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                                      Домофонная компания
                                    </label>
                                    <input
                                      type="text"
                                      value={activeOsmotr.domofon}
                                      disabled={readOnly}
                                      onChange={e =>
                                        setActiveOsmotr(prev => ({
                                          ...prev,
                                          domofon: e.target.value,
                                        }))
                                      }
                                      placeholder="Цифрал, Визит..."
                                      className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                                      Тариф домофон
                                    </label>
                                    <input
                                      type="text"
                                      value={activeOsmotr.tarif}
                                      disabled={readOnly}
                                      onChange={e =>
                                        setActiveOsmotr(prev => ({
                                          ...prev,
                                          tarif: e.target.value,
                                        }))
                                      }
                                      placeholder="Например: 65 руб/мес"
                                      className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                                      Наличие камер
                                    </label>
                                    <input
                                      type="text"
                                      value={activeOsmotr.cameras}
                                      disabled={readOnly}
                                      onChange={e =>
                                        setActiveOsmotr(prev => ({
                                          ...prev,
                                          cameras: e.target.value,
                                        }))
                                      }
                                      placeholder="Нет / 1 на входе / и т.д."
                                      className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : field === 'Факт размещения РИМ презентация' ? (
                            /* 2. CUSTOM FIELD: Toggle РИМ */
                            <div className="flex flex-col justify-center h-full pt-1">
                              <label className="block text-xs font-semibold text-slate-500 mb-2">
                                РИМ презентация размещен
                              </label>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  disabled={readOnly}
                                  onClick={() =>
                                    handleFieldChange(
                                      field,
                                      formData[field] === 'Да' ? 'Нет' : 'Да'
                                    )
                                  }
                                  className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                                    formData[field] === 'Да' ? 'bg-blue-600' : 'bg-slate-300'
                                  } ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out shadow ${
                                      formData[field] === 'Да' ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                                <span className="text-sm font-bold text-slate-800">
                                  {formData[field] === 'Да' ? 'Да' : 'Нет'}
                                </span>
                              </div>
                            </div>
                          ) : field === 'Комментарий КОП после собрания' || field === 'Примечание' ? (
                            /* 3. CUSTOM FIELD: Textarea */
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                                {field}
                              </label>
                              <textarea
                                rows={3}
                                value={formData[field] || ''}
                                readOnly={readOnly}
                                onChange={e => handleFieldChange(field, e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition shadow-sm ${
                                  readOnly
                                    ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed'
                                    : 'bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                              />
                            </div>
                          ) : field.toLowerCase().includes('дата') ? (
                            /* 4. DATE INPUT */
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                                {field}
                              </label>
                              <input
                                type="date"
                                value={formData[field] || ''}
                                readOnly={readOnly}
                                onChange={e => handleFieldChange(field, e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition shadow-sm ${
                                  readOnly
                                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                                    : 'bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                              />
                            </div>
                          ) : field.toLowerCase().includes('ответственный') ? (
                            /* 5. SELECT: Responsible Employee */
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                                {field}
                              </label>
                              <select
                                value={formData[field] || ''}
                                disabled={readOnly}
                                onChange={e => handleFieldChange(field, e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition shadow-sm ${
                                  readOnly
                                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                                    : 'bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300'
                                }`}
                              >
                                <option value="">Не назначен</option>
                                {(dictionaries['__EMPLOYEES__'] || []).map(emp => (
                                  <option key={emp} value={emp}>
                                    {emp}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : dictionaries[field] ? (
                            /* 6. SELECT: Dictionary options */
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                                {field}
                              </label>
                              <select
                                value={formData[field] || ''}
                                disabled={readOnly}
                                onChange={e => handleFieldChange(field, e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition shadow-sm ${
                                  readOnly
                                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                                    : 'bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300'
                                }`}
                              >
                                <option value="">— Не выбрано —</option>
                                {(dictionaries[field] || []).map(opt => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            /* 7. STANDARD TEXT INPUT */
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                                {field}
                              </label>
                              <input
                                type="text"
                                value={formData[field] ?? ''}
                                readOnly={readOnly}
                                onChange={e => handleFieldChange(field, e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition shadow-sm ${
                                  readOnly
                                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                                    : 'bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Document Generation Section */}
            <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-sm">
              <h3 className="text-sm md:text-base font-bold text-slate-800 border-l-4 border-blue-600 pl-3 mb-4">
                Документация ОСС (Google Документы)
              </h3>

              {docsLoading ? (
                <div className="text-xs text-slate-500 py-6 flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Поиск файлов в папке Google Диска...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {DOC_TYPES.map(docDef => {
                    const docInfo = cardDocs[docDef.key];
                    const isProcessing = docProcessing[docDef.key];

                    return (
                      <div
                        key={docDef.key}
                        className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 flex flex-col justify-between"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-800 text-sm">{docDef.label}</span>
                        </div>

                        {docInfo ? (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                            <a
                              href={docInfo.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 text-center py-2 px-3 bg-white border border-slate-300 hover:border-blue-400 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 transition shadow-sm flex items-center justify-center gap-1.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Открыть</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handlePromptDelete(docDef.key, docInfo.id)}
                              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl transition"
                              title="Удалить файл"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleGenerateDoc(docDef.key)}
                              disabled={isProcessing || !formData['Адрес']}
                              className="w-full py-2.5 px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <>
                                  <svg className="animate-spin h-3.5 w-3.5 text-blue-700" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Создание...</span>
                                </>
                              ) : (
                                <span>Сгенерировать</span>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3 sticky bottom-0 z-20">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            >
              Отмена
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Сохранение...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Сохранить изменения</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Document Confirmation */}
      <DeleteDocModal
        isOpen={deleteModal.visible}
        docType={deleteModal.type}
        onCancel={() => setDeleteModal({ visible: false, type: '', fileId: null })}
        onConfirm={handleConfirmDelete}
        processing={deleteProcessing}
      />
    </>
  );
};
