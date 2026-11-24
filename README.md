# App Pista (React Native)

Frontend do sistema: um único app em **Expo (React Native)** que roda no celular (Android e iOS, pelo Expo Go) e no navegador (`react-native-web`). Fala só com o gateway.

## Telas
Vitrine (destaque e grade de eventos no computador), evento, login, cadastro, **escolha dos ingressos e compra (sem pagamento)**, **status do pedido** (`PROCESSANDO` → `REALIZADO` ou `CANCELADO`), perfil (ingressos em formato de bilhete com QR code e pedidos), e, para o administrador, **eventos** (criar, editar dados, datas e tipos de ingresso, e excluir o que for preciso) e **relatório de vendas**.

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
- "Comprar" gera um `Idempotency-Key`, para não criar dois pedidos num duplo toque.
- O status do pedido é acompanhado por **polling** (a cada 2 s), porque o estoque responde de forma assíncrona.

## Testes e qualidade
```bash
npm test                  # Jest: 29 testes (formulários, mapeadores, HTTP, polling)
npx tsc --noEmit          # tipos
npx expo lint
```
