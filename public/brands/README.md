# Logos das marcas

Coloque aqui os arquivos oficiais dos logos das marcas parceiras.

1. Salve o arquivo com o *slug* da marca — os slugs estão em `src/data/brands.ts`:

   ```
   public/brands/penalty.svg
   public/brands/comfortflex.svg
   public/brands/olympikus.svg
   public/brands/via-marte.svg
   public/brands/macboot.svg
   public/brands/ramarim.svg
   public/brands/umbro.svg
   public/brands/dakota.svg
   public/brands/freeway.svg
   ```

2. Preencha o campo `logo` da marca em `src/data/brands.ts`:

   ```ts
   { id: 'penalty', slug: 'penalty', name: 'Penalty', logo: '/brands/penalty.svg', ... }
   ```

Formato recomendado: **SVG** (ou PNG com fundo transparente, altura ≥ 120 px).

Enquanto não houver arquivo, o site mostra o nome da marca em texto — nunca uma
imitação do logotipo oficial. Use somente material fornecido pelas próprias
marcas ou pelos representantes, respeitando as regras de uso de cada uma.
