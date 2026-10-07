import type { NewSessionData } from '../../domain/entities/ManagedEvent'

// Tudo como texto, porque é o que os campos de digitação entregam
export interface SectorDraft {
  name: string
  price: string
  capacity: string
}

export interface SessionDraft {
  eventDate: string
  salesStart: string
  sectors: SectorDraft[]
}

export const emptySector = (): SectorDraft => ({ name: '', price: '', capacity: '' })

export const emptySession = (): SessionDraft => ({ eventDate: '', salesStart: '', sectors: [emptySector()] })

// "2027-10-18 20:00" -> "2027-10-18T20:00" (o repositório acrescenta os segundos)
const DATE_TEXT = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/

function toLocalDateTime(text: string, field: string): string {
  const trimmed = text.trim()
  if (!DATE_TEXT.test(trimmed)) {
    throw new Error(`${field}: use o formato AAAA-MM-DD HH:MM (ex.: 2027-10-18 20:00).`)
  }
  return trimmed.replace(' ', 'T')
}

// "189,90" ou "189.90" -> 189.9
const toNumber = (value: string) => Number(value.trim().replace(',', '.'))

export function toSessionData(draft: SessionDraft): NewSessionData {
  return {
    eventDate: toLocalDateTime(draft.eventDate, 'Data e hora do evento'),
    salesStart: toLocalDateTime(draft.salesStart, 'Início da venda'),
    sectors: draft.sectors.map((sector) => {
      const price = toNumber(sector.price)
      const capacity = toNumber(sector.capacity)

      if (Number.isNaN(price) || Number.isNaN(capacity)) {
        throw new Error('Confira o preço e a capacidade dos setores.')
      }

      return { name: sector.name.trim(), price, capacity }
    }),
  }
}
