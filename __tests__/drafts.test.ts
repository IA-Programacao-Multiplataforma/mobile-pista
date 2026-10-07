import { emptySession, toSessionData, type SessionDraft } from '../src/presentation/admin/drafts'

const valid = (): SessionDraft => ({
  eventDate: '2027-10-18 20:00',
  salesStart: '2027-10-01 10:00',
  sectors: [
    { name: ' Pista ', price: '189,90', capacity: '500' },
    { name: 'Camarote', price: '300.5', capacity: '20' },
  ],
})

describe('formulário de sessão do admin', () => {
  it('converte datas e números do texto digitado', () => {
    expect(toSessionData(valid())).toEqual({
      eventDate: '2027-10-18T20:00',
      salesStart: '2027-10-01T10:00',
      sectors: [
        { name: 'Pista', price: 189.9, capacity: 500 },
        { name: 'Camarote', price: 300.5, capacity: 20 },
      ],
    })
  })

  it('aceita preço com vírgula ou ponto', () => {
    const [pista, camarote] = toSessionData(valid()).sectors
    expect(pista.price).toBe(189.9)
    expect(camarote.price).toBe(300.5)
  })

  it('recusa data fora do formato AAAA-MM-DD HH:MM', () => {
    expect(() => toSessionData({ ...valid(), eventDate: '18/10/2027 20:00' })).toThrow(/Data e hora do evento/)
    expect(() => toSessionData({ ...valid(), salesStart: '2027-10-01' })).toThrow(/Início da venda/)
  })

  it('recusa preço ou capacidade que não é número', () => {
    const draft = valid()
    draft.sectors[0].price = 'abc'
    expect(() => toSessionData(draft)).toThrow(/preço e a capacidade/)

    const other = valid()
    other.sectors[0].capacity = ''
    // "" vira 0, que o backend recusa; aqui o formulário só barra o que não é número
    expect(toSessionData(other).sectors[0].capacity).toBe(0)
  })

  it('uma sessão nova começa com um setor vazio', () => {
    const session = emptySession()
    expect(session.sectors).toHaveLength(1)
    expect(session.eventDate).toBe('')
  })

  it('duas sessões novas não compartilham setores', () => {
    expect(emptySession().sectors).not.toBe(emptySession().sectors)
  })
})
