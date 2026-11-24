import { errorText, formatPrice } from '../src/presentation/format'

describe('formatação', () => {
  it('formata preço em reais', () => {
    // o Intl usa espaço não separável entre "R$" e o valor
    expect(formatPrice(1234.5).replace(/\s/g, ' ')).toBe('R$ 1.234,50')
    expect(formatPrice(0).replace(/\s/g, ' ')).toBe('R$ 0,00')
  })

  it('errorText usa a mensagem do erro ou o texto padrão', () => {
    expect(errorText(new Error('falhou'), 'padrão')).toBe('falhou')
    expect(errorText('algo', 'padrão')).toBe('padrão')
    expect(errorText(undefined, 'padrão')).toBe('padrão')
  })
})
