import { useCallback, useEffect, useState } from 'react'
import { AdminNotice } from '../../components/admin/AdminNotice'
import { Checkbox, Field, TextInput } from '../../components/admin/AdminField'
import { Button } from '../../components/ui/Button'
import { catalogService, catalogAdminService } from '../../services'
import type { BrandInput } from '../../services/admin/adminService'
import { slugify } from '../../lib/text'
import type { Brand } from '../../types/catalog'

const emptyBrand: BrandInput = {
  slug: '',
  name: '',
  logo: '',
  color: '',
  description: '',
  partner: true,
}

/** Cadastro de marcas: nome, logo, cor do wordmark e exibição na seção "Marcas". */
export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<BrandInput>(emptyBrand)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setBrands(await catalogService.listBrands())
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startEdit(brand: Brand) {
    setEditingId(brand.id)
    setForm({
      slug: brand.slug,
      name: brand.name,
      logo: brand.logo ?? '',
      color: brand.color ?? '',
      description: brand.description ?? '',
      partner: true,
    })
  }

  function reset() {
    setEditingId(null)
    setForm(emptyBrand)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form, slug: form.slug || slugify(form.name) }
      if (editingId) await catalogAdminService.updateBrand(editingId, payload)
      else await catalogAdminService.createBrand(payload)
      reset()
      await load()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível salvar a marca.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(brand: Brand) {
    if (!window.confirm(`Excluir a marca "${brand.name}"?`)) return
    setError(null)
    try {
      await catalogAdminService.deleteBrand(brand.id)
      await load()
    } catch {
      setError(
        `Não foi possível excluir "${brand.name}". Verifique se ainda existem produtos usando essa marca.`,
      )
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Marcas</h1>
      <p className="mt-1 text-sm text-ink-600">
        As marcas marcadas como parceiras aparecem na seção “Marcas” do site.
      </p>

      {error ? (
        <AdminNotice tone="error" className="mt-4">
          {error}
        </AdminNotice>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="overflow-x-auto rounded-2xl border border-ink-200 bg-white">
          <table className="w-full min-w-[30rem] text-sm">
            <caption className="sr-only">Marcas cadastradas</caption>
            <thead className="border-b border-ink-200 bg-ink-50 text-left">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Marca</th>
                <th scope="col" className="px-4 py-3 font-semibold">Logo</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {brands.map((brand) => (
                <tr key={brand.id}>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-ink-900">{brand.name}</span>
                    <span className="ml-2 text-xs text-ink-400">{brand.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    {brand.logo ? brand.logo : <span className="text-ink-400">sem arquivo</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(brand)}>
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => void handleDelete(brand)}>
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
          <h2 className="text-base font-bold">{editingId ? 'Editar marca' : 'Nova marca'}</h2>

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

          <Field label="Slug *" hint="Usado no filtro: /produtos?marca=slug">
            {(id) => (
              <TextInput
                id={id}
                value={form.slug}
                required
                onChange={(event) => setForm((c) => ({ ...c, slug: slugify(event.target.value) }))}
              />
            )}
          </Field>

          <Field label="Arquivo do logo" hint="Ex.: /brands/penalty.svg — deixe vazio para mostrar o nome em texto.">
            {(id) => (
              <TextInput
                id={id}
                value={form.logo ?? ''}
                onChange={(event) => setForm((c) => ({ ...c, logo: event.target.value }))}
              />
            )}
          </Field>

          <Field label="Cor do nome" hint="Usada quando não há arquivo de logo. Ex.: #c8102e">
            {(id) => (
              <TextInput
                id={id}
                value={form.color ?? ''}
                onChange={(event) => setForm((c) => ({ ...c, color: event.target.value }))}
              />
            )}
          </Field>

          <Field label="Descrição curta">
            {(id) => (
              <TextInput
                id={id}
                value={form.description ?? ''}
                onChange={(event) => setForm((c) => ({ ...c, description: event.target.value }))}
              />
            )}
          </Field>

          <Checkbox
            label="Marca parceira"
            hint="Aparece na seção “Marcas” do site."
            checked={form.partner}
            onChange={(checked) => setForm((c) => ({ ...c, partner: checked }))}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Cadastrar marca'}
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
