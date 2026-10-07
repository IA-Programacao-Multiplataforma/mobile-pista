import { errorText, formatPrice } from '../src/presentation/format'
import { formatCountdown } from '../src/presentation/queue/useCountdown'

describe('formatação', () => {
  it('formata preço em reais', () => {
    // o Intl usa espaço não separável entre "R$" e o valor
    expect(formatPrice(1234.5).replace(/\s/g, ' ')).toBe('R$ 1.234,50')
    expect(formatPrice(0).replace(/\s/g, ' ')).toBe('R$ 0,00')
  })

  it('formata contagem regressiva como mm:ss', () => {
    expect(formatCountdown(0)).toBe('00:00')
    expect(formatCountdown(9)).toBe('00:09')
    expect(formatCountdown(111)).toBe('01:51')
    expect(formatCountdown(600)).toBe('10:00')
  })

  it('errorText usa a mensagem do erro ou o texto padrão', () => {
    expect(errorText(new Error('falhou'), 'padrão')).toBe('falhou')
    expect(errorText('algo', 'padrão')).toBe('padrão')
    expect(errorText(undefined, 'padrão')).toBe('padrão')
  })
})
