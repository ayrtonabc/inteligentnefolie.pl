import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  Eye,
  Clock,
  ChefHat,
  Info,
  AlertTriangle,
  Download,
  UploadCloud,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { 
  useWebsiteId,
  useMenuProduct,
  useMenuCategory,
  useMenuCategories,
  useCreateMenuProduct,
  useUpdateMenuProduct,
  useDeleteMenuProduct,
  useMenuProducts,
} from '@/features/restaurant/hooks'
import { 
  ALLERGEN_OPTIONS,
  type AllergenId,
  hasAnyDetailField,
  sanitizeDetailsPayload,
  exportMenuToJSON,
  parseMenuFromJSON,
} from '@/features/menu/types'
import type { ProductDetailsPayload } from '@/features/restaurant/types'

interface ProductFormValues {
  name: string
  description: string
  short_description: string
  category_id: string
  price: number
  compare_price: number
  currency: string
  is_available: boolean
  is_featured: boolean
  show_details: boolean
  details_payload: {
    extended_description: string
    ingredients: { value: string }[]
    allergens: AllergenId[]
    spice_level: number
    prep_time_minutes: number
    chef_note: string
    pairing_suggestion: string
    gallery_images: { url: string }[]
  }
  is_vegetarian: boolean
  is_vegan: boolean
  is_gluten_free: boolean
  image_url: string
  sort_order: number
}

export default function ProductFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  
  const { data: websiteId } = useWebsiteId()
  const { data: categories = [] } = useMenuCategories(websiteId || '')
  const { data: product } = useMenuProduct(id || '')
  const { data: allProducts = [] } = useMenuProducts(websiteId || '')
  
  const createProduct = useCreateMenuProduct(websiteId || '')
  const updateProduct = useUpdateMenuProduct(id || '', websiteId || '')
  const deleteProduct = useDeleteMenuProduct(websiteId || '')
  
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [validationError, setValidationError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: '',
      description: '',
      short_description: '',
      category_id: '',
      price: 0,
      compare_price: 0,
      currency: 'PLN',
      is_available: true,
      is_featured: false,
      show_details: false,
      details_payload: {
        extended_description: '',
        ingredients: [],
        allergens: [],
        spice_level: 0,
        prep_time_minutes: 0,
        chef_note: '',
        pairing_suggestion: '',
        gallery_images: [],
      },
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      image_url: '',
      sort_order: 0,
    },
  })

  const showDetails = watch('show_details')
  const watchImageUrl = watch('image_url')
  const watchSpiceLevel = watch('details_payload.spice_level')
  const watchGalleryImages = watch('details_payload.gallery_images')

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'details_payload.ingredients',
  })

  const { fields: galleryFields, append: appendGalleryImage, remove: removeGalleryImage } = useFieldArray({
    control,
    name: 'details_payload.gallery_images',
  })

  useEffect(() => {
    if (product) {
      const detailsPayload = (product.details_payload || {}) as any
      reset({
        name: product.name || '',
        description: product.description || '',
        short_description: product.short_description || '',
        category_id: product.category_id || '',
        price: product.price || 0,
        compare_price: product.compare_price || 0,
        currency: product.currency || 'PLN',
        is_available: product.is_available ?? true,
        is_featured: product.is_featured ?? false,
        show_details: (product as any).show_details ?? false,
        details_payload: {
          extended_description: detailsPayload.extended_description || '',
          ingredients: (detailsPayload.ingredients || []).map((i: string) => ({ value: i })),
          allergens: (detailsPayload.allergens || []) as AllergenId[],
          spice_level: detailsPayload.spice_level || 0,
          prep_time_minutes: detailsPayload.prep_time_minutes || 0,
          chef_note: detailsPayload.chef_note || '',
          pairing_suggestion: detailsPayload.pairing_suggestion || '',
          gallery_images: (detailsPayload.gallery_images || []).map((url: string) => ({ url })),
        },
        is_vegetarian: product.is_vegetarian ?? false,
        is_vegan: product.is_vegan ?? false,
        is_gluten_free: product.is_gluten_free ?? false,
        image_url: product.image_url || '',
        sort_order: product.sort_order || 0,
      })
    }
  }, [product, reset])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setValue('image_url', reader.result as string, { shouldDirty: true })
    }
    reader.readAsDataURL(file)
  }

  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setValue(`details_payload.gallery_images.${index}.url`, reader.result as string, { shouldDirty: true })
    }
    reader.readAsDataURL(file)
  }

  const toggleAllergen = (allergenId: AllergenId) => {
    const current = watch('details_payload.allergens')
    const updated = current.includes(allergenId)
      ? current.filter(a => a !== allergenId)
      : [...current, allergenId]
    setValue('details_payload.allergens', updated, { shouldDirty: true })
  }

  const onSubmit = async (data: ProductFormValues) => {
    setValidationError(null)
    
    if (data.show_details) {
      const hasDetails = hasAnyDetailField({
        extended_description: data.details_payload.extended_description,
        ingredients: data.details_payload.ingredients.map(i => i.value).filter(Boolean),
        allergens: data.details_payload.allergens,
        spice_level: data.details_payload.spice_level,
        prep_time_minutes: data.details_payload.prep_time_minutes,
        chef_note: data.details_payload.chef_note,
        pairing_suggestion: data.details_payload.pairing_suggestion,
        gallery_images: data.details_payload.gallery_images.map(i => i.url).filter(Boolean),
      })
      
      if (!hasDetails) {
        setValidationError('Włączono szczegółowe informacje, ale nie wypełniono żadnego pola.')
        return
      }
    }

    if (!websiteId) return

    setIsSaving(true)
    try {
      const payload = {
        name: data.name,
        description: data.description,
        short_description: data.short_description,
        category_id: data.category_id || null,
        price: data.price,
        compare_price: data.compare_price || null,
        currency: data.currency,
        is_available: data.is_available,
        is_featured: data.is_featured,
        show_details: data.show_details,
        details_payload: data.show_details ? sanitizeDetailsPayload({
          extended_description: data.details_payload.extended_description,
          ingredients: data.details_payload.ingredients.map(i => i.value).filter(Boolean),
          allergens: data.details_payload.allergens,
          spice_level: data.details_payload.spice_level || null,
          prep_time_minutes: data.details_payload.prep_time_minutes || null,
          chef_note: data.details_payload.chef_note,
          pairing_suggestion: data.details_payload.pairing_suggestion,
          gallery_images: data.details_payload.gallery_images.map(i => i.url).filter(Boolean),
        }) : null,
        is_vegetarian: data.is_vegetarian,
        is_vegan: data.is_vegan,
        is_gluten_free: data.is_gluten_free,
        image_url: data.image_url || null,
        sort_order: data.sort_order,
      }

      if (isEditing && id) {
        await updateProduct.mutateAsync(payload as any)
      } else {
        await createProduct.mutateAsync(payload as any)
      }
      navigate('/restaurant/products')
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Błąd podczas zapisywania produktu')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!isEditing || !id) return
    if (!confirm('Czy na pewno chcesz usunąć ten produkt?')) return
    
    try {
      await deleteProduct.mutateAsync(id)
      navigate('/restaurant/products')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Błąd podczas usuwania produktu')
    }
  }

  const handleExportMenu = () => {
    const data = exportMenuToJSON(categories, allProducts)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `menu-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportMenu = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      try {
        const text = await file.text()
        const data = parseMenuFromJSON(text)
        if (data) {
          alert(`Znaleziono ${data.products.length} produktów. Funkcja importu wymaga integracji z API.`)
        } else {
          alert('Nieprawidłowy format pliku')
        }
      } catch {
        alert('Błąd podczas czytania pliku')
      }
    }
    input.click()
  }

  const PreviewModal = ({ product, onClose }: { product: any; onClose: () => void }) => {
    const deviceWidths = { mobile: 375, tablet: 768, desktop: 1024 }
    
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <button onClick={onClose} className="p-2 bg-white rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-2 rounded ${previewDevice === 'mobile' ? 'bg-blue-100' : 'bg-gray-100'}`}
            >
              📱 Mobile
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`p-2 rounded ${previewDevice === 'tablet' ? 'bg-blue-100' : 'bg-gray-100'}`}
            >
              📱 Tablet
            </button>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-2 rounded ${previewDevice === 'desktop' ? 'bg-blue-100' : 'bg-gray-100'}`}
            >
              🖥️ Desktop
            </button>
          </div>
          
          <div 
            className="bg-white rounded-xl overflow-hidden shadow-2xl transition-all"
            style={{ width: deviceWidths[previewDevice], maxHeight: '80vh' }}
          >
            <div className="p-4 bg-gray-100 border-b">
              <p className="text-sm text-gray-600 text-center">Podgląd: {previewDevice} ({deviceWidths[previewDevice]}px)</p>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 50px)' }}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden m-4">
                {product.image_url && (
                  <div className="h-48 bg-gray-100">
                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{product.short_description}</p>
                  <p className="text-blue-600 font-bold mt-2">{product.price.toFixed(2)} zł</p>
                  
                  {product.show_details && (
                    <button className="mt-3 w-full py-2 border border-blue-600 text-blue-600 rounded-lg text-sm">
                      Ver más
                    </button>
                  )}
                  
                  <button className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg text-sm">
                    ➕ Agregar al pedido
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/restaurant/products')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Wróć
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edytuj produkt' : 'Nowy produkt'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExportMenu}>
              <Download className="w-4 h-4 mr-2" />
              Eksportuj JSON
            </Button>
            <Button variant="outline" onClick={handleImportMenu}>
              <UploadCloud className="w-4 h-4 mr-2" />
              Importuj JSON
            </Button>
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="w-4 h-4 mr-2" />
              Podgląd
            </Button>
            {isEditing && (
              <Button variant="outline" onClick={handleDelete} className="text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Usuń
              </Button>
            )}
            <Button onClick={handleSubmit(onSubmit)} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Zapisywanie...' : 'Zapisz'}
            </Button>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {validationError}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-gray-400" />
                Zdjęcie główne
              </h2>
              <div className="flex items-start gap-6">
                <div className="w-40 h-40 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                  {watchImageUrl ? (
                    <img src={watchImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="main-image" />
                  <label htmlFor="main-image" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    Wgraj zdjęcie
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Zalecany format: kwadratowy, min. 500x500px</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Informacje podstawowe</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa produktu *</label>
                  <Input {...register('name', { required: 'Nazwa jest wymagana' })} placeholder="np. Margherita Pizza" />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria</label>
                  <Select {...register('category_id')} options={[
                    { value: '', label: 'Wybierz kategorię...' },
                    ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                  ]} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cena *</label>
                  <div className="relative">
                    <Input type="number" step="0.01" {...register('price', { min: 0 })} className="pr-12" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">PLN</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Krótki opis (max 120 znaków)
                </label>
                <Input 
                  {...register('short_description')} 
                  placeholder="Krótki opis widoczny w karcie..."
                  maxLength={120}
                />
                <p className="text-xs text-gray-500 mt-1">{watch('short_description')?.length || 0}/120</p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
                  <input type="checkbox" {...register('is_available')} className="rounded" />
                  <span className="text-sm">Dostępny</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
                  <input type="checkbox" {...register('is_featured')} className="rounded" />
                  <span className="text-sm">Wyróżniony</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
                  <input type="checkbox" {...register('is_vegetarian')} className="rounded" />
                  <span className="text-sm">🌿 Wegetariańskie</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
                  <input type="checkbox" {...register('is_vegan')} className="rounded" />
                  <span className="text-sm">🌱 Wegańskie</span>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-gray-400" />
                  Informacja szczegółowa ("Zobacz więcej")
                </h2>
                <button
                  type="button"
                  onClick={() => setValue('show_details', !showDetails, { shouldDirty: true })}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    showDetails ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  {showDetails ? (
                    <ToggleRight className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                  <span className={`font-medium ${showDetails ? 'text-gray-900' : 'text-gray-500'}`}>
                    {showDetails ? 'Włączone' : 'Wyłączone'}
                  </span>
                </button>
              </div>
              
              {showDetails && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-800">
                      ℹ️ Po włączeniu, w karcie produktu pojawi się przycisk "Zobacz więcej", 
                      a poniższe pola staną się widoczne dla klienta.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opis rozszerzony
                    </label>
                    <Textarea 
                      {...register('details_payload.extended_description')} 
                      placeholder="Szczegółowy opis potrawy, historia, sposób przygotowania..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Składniki (jeden na linię)
                    </label>
                    {ingredientFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 mb-2">
                        <Input {...register(`details_payload.ingredients.${index}.value`)} placeholder="np. Ser mozzarella" />
                        <Button type="button" variant="outline" size="sm" onClick={() => removeIngredient(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendIngredient({ value: '' })}>
                      <Plus className="w-4 h-4 mr-2" />
                      Dodaj składnik
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alergeny
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {ALLERGEN_OPTIONS.map(allergen => (
                        <button
                          key={allergen.id}
                          type="button"
                          onClick={() => toggleAllergen(allergen.id as AllergenId)}
                          className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                            watch('details_payload.allergens')?.includes(allergen.id as AllergenId)
                              ? 'bg-red-100 border-2 border-red-300 text-red-700'
                              : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span>{allergen.icon}</span>
                          <span>{allergen.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Poziom ostrości: {watchSpiceLevel}/5
                      </label>
                      <input type="range" min="0" max="5" {...register('details_payload.spice_level', { valueAsNumber: true })} className="w-full" />
                      <div className="flex justify-between text-2xl mt-2">
                        {[0, 1, 2, 3, 4, 5].map(level => (
                          <span key={level} className={level <= watchSpiceLevel ? 'text-red-500' : 'text-gray-300'}>
                            🌶️
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Czas przygotowania
                      </label>
                      <div className="relative">
                        <Input type="number" min="0" {...register('details_payload.prep_time_minutes', { valueAsNumber: true })} className="pr-12" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">min</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nota szefa kuchni / Rekomendacja
                    </label>
                    <Textarea 
                      {...register('details_payload.chef_note')} 
                      placeholder="Specjalna rekomendacja od naszego szefa kuchni..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Propozycja podania / Maridaje
                    </label>
                    <Textarea 
                      {...register('details_payload.pairing_suggestion')} 
                      placeholder="Idealne do czerwonego wina, sałatki..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Galeria (max 3 zdjęcia)
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[0, 1, 2].map(index => (
                        <div key={index} className="relative">
                          {galleryFields[index] ? (
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                              <img src={galleryFields[index].url} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <input type="file" accept="image/*" onChange={(e) => handleGalleryImageUpload(e, index)} className="hidden" id={`gallery-${index}`} />
                              <label htmlFor={`gallery-${index}`} className="block aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                                <Plus className="w-8 h-8" />
                              </label>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Podsumowanie</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={watch('is_available') ? 'text-green-600' : 'text-red-500'}>
                    {watch('is_available') ? 'Dostępny' : 'Niedostępny'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Szczegóły</span>
                  <span className={showDetails ? 'text-blue-600' : 'text-gray-400'}>
                    {showDetails ? 'Włączone' : 'Wyłączone'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Wyróżniony</span>
                  <span>{watch('is_featured') ? '✓' : '—'}</span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="space-y-2">
                {watch('is_vegetarian') && <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs mr-1">🌿 Wegetariańskie</span>}
                {watch('is_vegan') && <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs mr-1">🌱 Wegańskie</span>}
                {watchSpiceLevel > 0 && <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs mr-1">🌶️ {watchSpiceLevel}/5</span>}
              </div>

              {showDetails && watch('details_payload.allergens')?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Alergeny:</p>
                  <div className="flex flex-wrap gap-1">
                    {watch('details_payload.allergens').map((a: AllergenId) => {
                      const allergen = ALLERGEN_OPTIONS.find(opt => opt.id === a)
                      return allergen ? (
                        <span key={a} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          {allergen.icon} {allergen.label}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {isDirty && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-700">Mas niezapisane zmiany</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {showPreview && (
        <PreviewModal 
          product={{
            name: watch('name') || 'Nazwa produktu',
            price: watch('price') || 0,
            short_description: watch('short_description') || 'Krótki opis produktu...',
            image_url: watchImageUrl,
            show_details: showDetails,
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}