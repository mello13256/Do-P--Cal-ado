import { useCallback, useEffect, useState } from 'react'
import { AdminNotice } from '../../components/admin/AdminNotice'
import { Field, TextInput } from '../../components/admin/AdminField'
import { Button } from '../../components/ui/Button'
import { slugify } from '../../lib/text'
import { catalogService, catalogAdminService } from '../../services'
import type { CategoryInput } from '../../services/admin/adminService'
import type { Category } from '../../types/catalog'

const emptyCategory: CategoryInput = {
  slug: '',
  name: '',
  tagline: '',
  description: '',
  image: '',
  order: 99,
}

/** Cadastro de categorias: nome, frase do card, imagem e ordem de exibição. */
export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CategoryInput>(emptyCategory)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setCategories(await catalogService.listCategories())
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startEdit(category: Category) {
    setEditingId(category.id)
    setForm({
      slug: category.slug,
      name: category.name,
      tagline: category.tagline,
      description: category.description ?? '',
      image: category.image ?? '',
      order: category.order ?? 99,
    })
  }

  function reset() {
    setEditingId(null)
    setForm(emptyCategory)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form, slug: form.slug || slugify(form.name) }
      if (editingId) await catalogAdminService.updateCategory(editingId, payload)
      else await catalogAdminService.createCategory(payload)
      reset()
      await load()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível salvar a categoria.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(category: Category) {
    if (!window.confirm(`Excluir a categoria "${category.name}"?`)) return
    setError(null)
    try {
      await catalogAdminService.deleteCategory(category.id)
      await load()
    } catch {
      setError(
        `Não foi possível excluir "${category.name}". Verifique se ainda existem produtos nessa categoria.`,
      )
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Categorias</h1>
      <p className="mt-1 text-sm text-ink-600">
        A ordem define a sequência dos cards na página inicial e no menu.
      </p>

      {error ? (
        <AdminNotice tone="error" className="mt-4">
          {error}
        </AdminNotice>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="overflow-x-auto rounded-2xl border border-ink-200 bg-white">
          <table className="w-full min-w-[30rem] text-sm">
            <caption className="sr-only">Categorias cadastradas</caption>
            <thead className="border-b border-ink-200 bg-ink-50 text-left">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Ordem</th>
                <th scope="col" className="px-4 py-3 font-semibold">Categoria</th>
                <th scope="col" className="px-4 py-3 font-semibold">Frase</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-4 py-3 text-ink-500">{category.order ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-ink-900">{category.name}</span>
                    <span className="ml-2 text-xs text-ink-400">{category.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{category.tagline}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(category)}>
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => void handleDelete(category)}>
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink-200 bg-white p-6">
          <h2 className="text-base font-bold">{editingId ? 'Editar categoria' : 'Nova categoria'}</h2>

          <Field label="Nome *">
            {(id) => (
              <TextInput
                id={id}
                value={form.name}
                required
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                    slug: editingId ? current.slug : slugify(event.target.value),
                  }))
                }
              />
            )}
          </Field>

          <Field label="Slug *" hint="Usado no filtro: /produtos?categoria=slug">
            {(id) => (
              <TextInput
                id={id}
                value={form.slug}
                required
                onChange={(event) => setForm((c) => ({ ...c, slug: slugify(event.target.value) }))}
              />
            )}
          </Field>

          <Field label="Frase do card *" hint="Ex.: “Para quem leva o jogo a sério”">
            {(id) => (
              <TextInput
                id={id}
                value={form.tagline}
                required
                onChange={(event) => setForm((c) => ({ ...c, tagline: event.target.value }))}
              />
            )}
          </Field>

          <Field label="Descrição">
            {(id) => (
              <TextInput
                id={id}
                value={form.description ?? ''}
                onChange={(event) => setForm((c) => ({ ...c, description: event.target.value }))}
              />
            )}
          </Field>

          <Field label="Imagem" hint="Ex.: /categorias/tenis.jpg">
            {(id) => (
              <TextInput
                id={id}
                value={form.image ?? ''}
                onChange={(event) => setForm((c) => ({ ...c, image: event.target.value }))}
              />
            )}
          </Field>

          <Field label="Ordem">
            {(id) => (
              <TextInput
                id={id}
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="9"
                value={form.order ?? ''}
                onChange={(event) =>
                  setForm((c) => ({
                    ...c,
                    order: event.target.value === '' ? undefined : Number(event.target.value),
                  }))
                }
              />
            )}
          </Field>

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Cadastrar categoria'}
            </Button>
            {editingId ? (
              <Button type="button" variant="outline" onClick={reset}>
                Cancelar
              </Button>
            ) : null}
          </div>
        </form>
      </div>
    </>
  )
}
