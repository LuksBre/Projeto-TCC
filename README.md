# Lucca Pizzeria

Frontend desenvolvido em HTML, CSS e JavaScript puro com base nas telas enviadas.

## Estrutura

```text
lucca-pizzaria/
├── assets/
│   └── img/
├── css/
│   └── style.css
├── js/
│   └── app.js
├── index.html
├── cardapio.html
├── reservas.html
├── sobre.html
└── localizacao.html
```

## Como executar

Abra `index.html` no navegador. Para uma experiência melhor durante o desenvolvimento, use um servidor local, como o Live Server do VS Code.

## Configuração do WhatsApp

Abra `js/app.js` e altere:

```js
const WHATSAPP_NUMBER = "5511999999999";
```

Use o formato `55 + DDD + número`, sem espaços ou símbolos.

## Produtos e preços

Os produtos ficam no array `PRODUCTS`, no início do arquivo `js/app.js`.

## Funcionalidades

- Cardápio com filtros por categoria
- Carrinho salvo no `localStorage`
- Alteração de quantidades e cálculo do total
- Pedido formatado e redirecionado ao WhatsApp
- Reservas salvas localmente
- Formulários com validação nativa do navegador
- Layout responsivo para celular, tablet e desktop
- Menu mobile e carrinho lateral

## Observação

As imagens foram extraídas das referências enviadas no chat. Para maior qualidade, podem ser substituídas pelos arquivos exportados diretamente do Figma.
