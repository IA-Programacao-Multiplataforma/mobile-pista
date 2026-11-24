// Cookies do navegador (só para a versão web do app). Ficam na aba "Cookies" das ferramentas do
// desenvolvedor (Application/Aplicativo), e não no localStorage.

// Quantos segundos o cookie dura: o mesmo 1 hora do token JWT (o login emite com validade de 1 h)
export const SESSION_MAX_AGE_SECONDS = 60 * 60

export function readCookie(name: string): string | null {
  const prefix = `${name}=`
  for (const part of document.cookie.split(';')) {
    const cookie = part.trim()
    if (cookie.startsWith(prefix)) {
      try {
        return decodeURIComponent(cookie.slice(prefix.length))
      } catch {
        return null
      }
    }
  }
  return null
}

export function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  // path=/ : vale para todas as telas. SameSite=Lax: não vai em requisições de outros sites.
  // Secure só quando a página é https (em http://localhost o navegador recusaria o cookie Secure).
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`
}

export function removeCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}
