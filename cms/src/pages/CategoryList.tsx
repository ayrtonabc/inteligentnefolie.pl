import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import { pb, TENANT_ID } from '@/lib/pocketbase'
import { useLanguage } from '@/context/LanguageContext'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { slugify } from '@/lib/utils'
import PageHeader from '@/components/PageHeader'
import { Tag as TagIcon } from 'lucide-react'

interface Category {
    id: string
    name: string
    slug: string
    description: string
    created_at: string
}

export default function CategoryList() {
    const { t } = useLanguage()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const toast = useToast()

    const [newCategory, setNewCategory] = useState({
        name: '',
        slug: '',
        description: ''
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const records = await pb.collection('blog_categories').getFullList({
                filter: `website_id = "${TENANT_ID}"`,
                sort: '-created'
            })
            setCategories(records.map(r => ({
                id: r.id,
                name: r.name,
                slug: r.slug,
                description: r.description,
                created_at: r.created
            })))
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCategory.name) return

        setSaving(true)
        try {
            const slug = slugify(newCategory.slug || newCategory.name)
            const categoryData = {
                name: newCategory.name,
                slug,
                description: newCategory.description || '',
                website_id: TENANT_ID
            }

            if (editingId) {
                await pb.collection('blog_categories').update(editingId, categoryData)
                setCategories(categories.map(c => c.id === editingId ? { ...c, ...categoryData } : c))
            } else {
                const record = await pb.collection('blog_categories').create(categoryData)
                setCategories([{
                    id: record.id,
                    name: record.name,
                    slug: record.slug,
                    description: record.description,
                    created_at: record.created
                }, ...categories])
            }

            setShowAddModal(false)
            resetForm()
            toast.success(t('category_saved_success'))
        } catch (error) {
            console.error('Error saving category:', error)
            toast.error(t('error_saving_category'))
        } finally {
            setSaving(false)
        }
    }

    const resetForm = () => {
        setEditingId(null)
        setNewCategory({
            name: '',
            slug: '',
            description: ''
        })
    }

    const openEditModal = (category: Category) => {
        setEditingId(category.id)
        setNewCategory({
            name: category.name,
            slug: category.slug,
            description: category.description || ''
        })
        setShowAddModal(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await pb.collection('blog_categories').delete(id)
            setCategories(categories.filter(c => c.id !== id))
            toast.success('Usunięto kategorię')
        } catch (error) {
            console.error('Error deleting category:', error)
            toast.error(t('error_deleting'))
        }
    }

    return (
        <div className="page px-6 py-6 relative">
            <PageHeader
                title={t('blog_categories')}
                subtitle="Zarządzaj kategoriami bloga"
                icon={<TagIcon className="w-6 h-6 text-primary-600" />}
                trailing={
                    <button
                        onClick={() => { resetForm(); setShowAddModal(true); }}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        {t('new_category')}
                    </button>
                }
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">{t('loading')}</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('category_name')}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{category.name}</div>
                                        {category.description && (
                                            <div className="text-sm text-gray-500">{category.description}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => openEditModal(category)}
                                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                                title={t('edit')}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDeleteId(category.id)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                                title={t('delete')}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                        {t('no_categories_yet')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />

                        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">{editingId ? t('edit_category') : t('new_category')}</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveCategory} className="space-y-6">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        {t('category_name')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:bg-white outline-none transition-all"
                                        required
                                        placeholder={t('category_name_placeholder')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        {t('category_slug')}
                                    </label>
                                    <input
                                        type="text"
                                        value={newCategory.slug}
                                        onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:bg-white outline-none transition-all"
                                        placeholder={t('category_slug_placeholder')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        {t('category_description')}
                                    </label>
                                    <textarea
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:bg-white outline-none transition-all min-h-[100px]"
                                        placeholder={t('category_description_placeholder')}
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-6 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all"
                                        disabled={saving}
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-[#f39c12] text-white rounded-xl font-bold text-sm shadow-xl shadow-orange-500/20 hover:bg-[#d68910] transition-all flex items-center gap-2 disabled:opacity-50"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                {t('saving')}
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={18} />
                                                {editingId ? t('save_changes') : t('save_category')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                title={t('confirm_delete')}
                message="Ta akcja jest nieodwracalna."
                danger
                onCancel={() => setConfirmDeleteId(null)}
                onConfirm={async () => {
                    if (!confirmDeleteId) return
                    await handleDelete(confirmDeleteId)
                    setConfirmDeleteId(null)
                }}
            />
        </div>
    )
}
