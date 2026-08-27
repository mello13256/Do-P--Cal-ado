# Fotos dos produtos

Coloque aqui as fotos reais dos produtos e informe o caminho no campo
`images[].src` de cada item em `src/data/products.ts`:

```ts
images: [
  { src: '/produtos/tenis-olympikus-01.jpg', alt: 'Tênis Olympikus preto visto de lado' },
  { src: '/produtos/tenis-olympikus-02.jpg', alt: 'Solado do tênis Olympikus' },
],
```

Recomendações:

- proporção **4:5** (ex.: 1000 × 1250 px), fundo claro e uniforme;
- formato `.webp` ou `.jpg` com até ~300 KB por foto;
- sempre preencher o `alt` descrevendo a foto (acessibilidade e SEO).

Sem `src`, o site desenha um placeholder com a identidade da loja.
