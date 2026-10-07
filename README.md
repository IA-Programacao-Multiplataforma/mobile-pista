# App Pista (React Native)

Frontend do sistema: um único app em **Expo (React Native)** que roda no celular (Android e iOS, pelo Expo Go) e no navegador (`react-native-web`). Fala só com o gateway.

## Telas
Vitrine (destaque e grade de eventos no computador), evento, login, cadastro, **fila e sacola**, **confirmação da compra (sem pagamento)**, **status do pedido**, perfil (ingressos em formato de bilhete com QR code e pedidos), e, para o administrador, **eventos** (criar, ajustar capacidade, nova data, excluir) e **relatório de vendas**.

## Estrutura
```
src/
  domain/          entidades e interfaces de repositório (TypeScript puro)
  application/     casos de uso
  infrastructure/  chamadas HTTP ao gateway (api.ts, repositórios, mapeadores)
  presentation/    componentes, hooks (polling), tema, bilhete
  app/             telas e rotas (Expo Router, uma rota por arquivo)
__tests__/         testes (Jest)
```

## Como rodar
```bash
npm install
npx expo start --web --port 8090      # navegador (use 8090: a 8081 é do login)
npx expo start                        # celular: leia o QR code com o Expo Go
```
Os serviços do backend precisam estar no ar (veja o [README da raiz](../README.md)).

## Endereço da API
Em ordem: `EXPO_PUBLIC_API_URL` (por exemplo, num arquivo `.env`); no celular, o IP da máquina onde o Expo roda (`localhost` dentro do celular é o próprio celular); no navegador, `http://localhost:8080`. O celular e o computador precisam estar na mesma rede.

No navegador, o gateway precisa liberar a origem do app (CORS): hoje `http://localhost:8090`.

## Detalhes
- O token fica no `expo-secure-store` (celular) ou no `localStorage` (navegador).
- "Confirmar compra" gera um `Idempotency-Key` por tentativa, para não criar dois pedidos num duplo toque.
- A fila e o pedido são acompanhados por **polling** (3 s e 2 s).
- Cartões de teste: final `1111` aprova, `0000` recusa, `2222` sem saldo, `9999` aprova devagar.

## Testes e qualidade
```bash
npm test                  # Jest: 42 testes (máscaras, formulários, mapeadores, HTTP, polling)
npx tsc --noEmit          # tipos
npx expo lint
```
