export interface User {
  fio: string;
  role: 'Администратор' | 'Пользователь' | string;
  id: string;
  email: string;
}

export type AddressCard = Record<string, any> & {
  rowNumber: number;
  'Адрес'?: string;
  'Адрес (ФИАС)'?: string;
  'Город'?: string;
  'Улица'?: string;
  'номер дома'?: string;
  'корпус'?: string;
  'литера'?: string;
  '№ подьезда'?: string;
  'Квартира с'?: string | number;
  'Квартира по'?: string | number;
  'Кол-во квартир'?: string | number;
  'Стратегия'?: string;
  'Тип договора'?: string;
  'Статус подъезда'?: string;
  'Группа договора'?: string;
  'Причина брака (классификатор)'?: string;
  'Причина расторжения'?: string;
  'Примечание'?: string;
  'Домофонная компания'?: string;
  'Интернет провайдер'?: string;
  'Управляющая компания'?: string;
  'Прочие СБ на адресе'?: string;
  'Входит в состав общего имущества'?: string;
  'ФИО РОП'?: string;
  'ФИО старшего'?: string;
  'Адрес старшего'?: string;
  'Контакты старшего'?: string;
  'E-mail старшего'?: string;
  'Дата информирования ПБД'?: string;
  'ФИО ответственный ПБД'?: string;
  'Данные осмотра'?: string;
  'Дата размещения РИМ презентация'?: string;
  'ФИО ответственный РИМ презентация'?: string;
  'Факт размещения РИМ презентация'?: string;
  'Дата презентации ПБД'?: string;
  'ФИО ответственный презентация ПБД'?: string;
  'Результат презентации ПБД'?: string;
  'Комментарий КОП после собрания'?: string;
  'Дата запроса реестра собственников'?: string;
  'Факт получения реестра собственников'?: string;
  'Дата подготовки документов ОСС'?: string;
  'Дата размещения РИМ о проведении ОСС'?: string;
  'Дата проведения ОСС'?: string;
  'Конечная дата ОСС'?: string;
  'Результат ОСС'?: string;
  'Дата подписания договора ЭРТХ'?: string;
  'Планируемая дата монтажа'?: string;
  'Фактическая дата монтажа'?: string;
};

export interface UKItem {
  'Полное название'?: string;
  'Сокращенное название'?: string;
  'Субъект РФ'?: string;
  'Ответственное лицо'?: string;
  'ИНН'?: string;
  'ОГРН'?: string;
  'Телефон'?: string;
  'email'?: string;
  'Сайт'?: string;
  'Юридический адрес'?: string;
  'Фактический адрес'?: string;
  [key: string]: any;
}

export interface OsmotrData {
  uk: string;
  domofon: string;
  tarif: string;
  cameras: string;
}

export interface GeneratedDocItem {
  id: string;
  url: string;
}

export type GeneratedDocsMap = Record<string, GeneratedDocItem | null>;

export interface Dictionaries {
  __EMPLOYEES__?: string[];
  [key: string]: string[] | undefined;
}

export type KanbanStage =
  | 'Информирование о БД'
  | 'Информирование о собрании'
  | 'Собрание'
  | 'Доработка'
  | 'ОСС'
  | 'Монтаж'
  | 'Отказ';

export interface CalendarStageMap {
  stage: string;
  field: string;
  color: string;
  dotColor: string;
}

export interface ToastState {
  visible: boolean;
  message: string;
  type: 'error' | 'success' | 'info';
}
