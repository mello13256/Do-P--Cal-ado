# Banco de dados (Supabase)

Passo a passo para ligar o site ao Postgres do Supabase e liberar o painel
administrativo. Leva cerca de 15 minutos e não precisa de servidor próprio.

Enquanto isso não for feito, o site continua funcionando com o catálogo de
`src/data` e o painel abre em **modo demonstração** (as alterações ficam só no
navegador).

---

## 1. Criar o projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta.
2. **New project** → nome `do-pe-calcado`, região **South America (São Paulo)**.
3. Guarde a senha do banco em lugar seguro (ela não é usada pelo site, mas serve
   para acessos administrativos).

## 2. Criar as tabelas e carregar o catálogo

Abra **SQL Editor → New query**, cole o conteúdo de
**`supabase/instalacao-completa.sql`** e clique em **Run**.

Esse arquivo faz tudo de uma vez: tabelas, índices, gatilhos, regras de acesso,
a pasta pública das fotos e o catálogo atual (10 marcas, 9 categorias,
34 produtos). Pode rodar de novo quando quiser — nada é duplicado.

Ao terminar, confira em **Table Editor** se as tabelas `brands`, `categories`,
`products`, `product_images`, `product_sizes` e `admins` apareceram.

> Se preferir aplicar por partes (ou usar a CLI com `supabase db push`), os
> arquivos originais estão em `migrations/`, e o catálogo em `seed.sql`.
>
> O arquivo único é gerado a partir deles; para regerar depois de mexer em
> `src/data`, rode `npm run seed:sql` e refaça a junção (ou cole só o `seed.sql`).

**Sobre o estoque:** a carga inicial coloca **1 par** em cada numeração dos
produtos em estoque, só para o site ter o que mostrar. Ajuste as quantidades
reais no painel, em cada produto.

## 3. Criar o usuário do painel

1. **Authentication → Users → Add user** → e-mail e senha da loja.
   Marque *Auto Confirm User* para não precisar confirmar por e-mail.
2. Copie o **UID** do usuário criado.
3. No **SQL Editor**, autorize esse usuário como administrador:

```sql
insert into public.admins (user_id, name)
values ('COLE-O-UID-AQUI', 'Do Pé Calçado');
```

Sem esse cadastro a pessoa até consegue entrar, mas não grava nada — as regras
de RLS recusam. É essa tabela que controla quem administra o catálogo.

> Em **Authentication → Providers → Email**, deixe *Enable Signups* **desligado**:
> assim ninguém cria conta sozinho; as contas são criadas por você.

## 4. Configurar o site

Copie `.env.example` para `.env` e preencha com os dados de
**Project Settings → API**:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Reinicie o `npm run dev`. O site passa a ler do banco e o painel
(`/admin`) passa a exigir login.

Na hospedagem (Netlify, Vercel, Cloudflare Pages…), cadastre as mesmas duas
variáveis nas configurações do projeto — o `.env` não vai para o repositório.

---

## Como os dados estão organizados

| Tabela | Para que serve |
| --- | --- |
| `brands` | Marcas (Penalty, Olympikus…). `is_partner` controla a seção “Marcas”. |
| `categories` | As categorias do catálogo, com frase do card e ordem de exibição. |
| `products` | Produto: nome, marca, categoria, público, preço, disponibilidade, descrição, destaques. |
| `product_images` | Fotos do produto, em ordem. A primeira é a principal. |
| `product_sizes` | **Estoque por numeração** (par produto + numeração). |
| `admins` | Quem pode administrar o catálogo. |

Dois detalhes que evitam trabalho manual:

- **`products.sizes` é preenchida sozinha.** Um gatilho copia para lá as
  numerações com estoque maior que zero. Zerou o 38 no painel? Ele some do site.
- **`products.search_text` também.** É uma coluna gerada com o texto do produto
  sem acento, o que faz “tenis” encontrar “Tênis” direto no banco.

## Segurança

- A chave `anon` do `.env` é pública por natureza: ela vai para o navegador de
  todo visitante. Quem protege os dados são as políticas de RLS.
- Leitura: liberada para todos (é uma vitrine). Produtos com `is_active = false`
  só aparecem para administradores.
- Escrita: apenas para usuários cadastrados em `public.admins`, em todas as
  tabelas e também no armazenamento das fotos.
- A chave `service_role` **nunca** deve ir para o site nem para o repositório.

## Backup

Em **Database → Backups** o Supabase mantém cópias automáticas. Para uma cópia
manual antes de mudanças grandes: **Database → Backups → Download**.
