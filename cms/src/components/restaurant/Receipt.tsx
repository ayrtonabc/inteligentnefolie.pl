import { useRef, useEffect } from 'react'
import { Printer, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { RestaurantOrder, RestaurantOrderItem } from '@/features/restaurant/types'

interface ReceiptProps {
  order: RestaurantOrder
  restaurantName?: string
  currency?: string
}

export function Receipt({ order, restaurantName = 'Restaurante', currency = 'PLN' }: ReceiptProps) {
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ${currency}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const receiptContent = `
================================
         ${restaurantName.toUpperCase()}
================================

RECIBO #: ${order.id.slice(0, 8).toUpperCase()}
Fecha: ${formatDate(order.created_at)}
Mesa: ${order.table_number || '-'}
Cliente: ${order.customer_name || '-'}

--------------------------------
PRODUCTOS
--------------------------------
${(order.items || []).map((item: RestaurantOrderItem) => {
  const name = item.product_name.padEnd(20, ' ')
  const qty = `x${item.quantity}`.padStart(4, ' ')
  const price = formatCurrency(item.subtotal || item.product_price * item.quantity)
  return `${name} ${qty}  ${price}`
}).join('\n')}

--------------------------------
SUMA BRUTA:     ${formatCurrency(order.subtotal || 0)}
IVA (${(order.tax_amount && order.subtotal ? (order.tax_amount / order.subtotal * 100).toFixed(0) : '0')}%)   ${formatCurrency(order.tax_amount || 0)}
================================
SUMA TOTAL:     ${formatCurrency(order.total_amount || 0)}
================================

Método de pago: ${order.payment_status === 'paid' ? 'PAGADO' : 'PENDIENTE'}

¡Gracias por su visita!
================================
  `.trim()

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo #${order.id.slice(0, 8)}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          @media print {
            body { 
              width: 80mm; 
              margin: 0; 
              padding: 5px;
              font-family: 'Courier New', monospace;
              font-size: 12px;
            }
          }
          body { 
            width: 80mm; 
            margin: 0 auto; 
            padding: 10px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            line-height: 1.4;
            white-space: pre;
            color: #000;
          }
          .header { text-align: center; margin-bottom: 10px; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .total { font-weight: bold; }
          .footer { text-align: center; margin-top: 10px; }
          @media screen {
            body { 
              border: 1px solid #ccc; 
              margin: 20px auto; 
              max-width: 300px;
              background: #f9f9f9;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <strong>${restaurantName.toUpperCase()}</strong>
        </div>
        <div class="divider"></div>
        RECIBO #: ${order.id.slice(0, 8).toUpperCase()}
        Fecha: ${formatDate(order.created_at)}
        Mesa: ${order.table_number || '-'}
        Cliente: ${order.customer_name || '-'}
        <div class="divider"></div>
        PRODUCTOS
        <div class="divider"></div>
        ${(order.items || []).map((item: RestaurantOrderItem) => {
          const line = `${item.product_name} x${item.quantity}  ${formatCurrency(item.subtotal || item.product_price * item.quantity)}`
          return line
        }).join('\n')}
        <div class="divider"></div>
        SUMA BRUTA:     ${formatCurrency(order.subtotal || 0)}
        IVA:      ${formatCurrency(order.tax_amount || 0)}
        =================================
        SUMA TOTAL:     ${formatCurrency(order.total_amount || 0)}
        =================================
        <div class="divider"></div>
        Método de pago: ${order.payment_status === 'paid' ? 'PAGADO' : 'PENDIENTE'}
        <div class="footer">
          ¡Gracias por su visita!
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 250)
  }

  const handleDownload = () => {
    const content = receiptContent
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `recibo-${order.id.slice(0, 8)}.txt`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="w-4 h-4" />
        Imprimir recibo
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownload}>
        <Download className="w-4 h-4" />
        Descargar
      </Button>
    </div>
  )
}

export function ReceiptPreview({ order, restaurantName = 'Restaurante' }: ReceiptProps) {
  const formatCurrency = (amount: number) => `${amount.toFixed(2)} PLN`
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pl-PL')
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 font-mono text-xs">
      <div className="text-center mb-3">
        <strong className="text-sm">{restaurantName.toUpperCase()}</strong>
      </div>
      <div className="border-t border-b border-dashed border-gray-300 py-2 mb-2">
        <div className="flex justify-between">
          <span>Recibo:</span>
          <span>#{order.id.slice(0, 8)}</span>
        </div>
        <div className="flex justify-between">
          <span>Fecha:</span>
          <span>{formatDate(order.created_at)}</span>
        </div>
        <div className="flex justify-between">
          <span>Mesa:</span>
          <span>{order.table_number || '-'}</span>
        </div>
      </div>
      
      <div className="space-y-1 mb-2">
        {(order.items || []).slice(0, 3).map((item: RestaurantOrderItem, i: number) => (
          <div key={i} className="flex justify-between text-[10px]">
            <span>{item.quantity}x {item.product_name}</span>
            <span>{formatCurrency(item.subtotal || item.product_price * item.quantity)}</span>
          </div>
        ))}
        {(order.items || []).length > 3 && (
          <div className="text-center text-gray-400">
            + {(order.items || []).length - 3} más
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-gray-300 pt-2">
        <div className="flex justify-between font-bold">
          <span>TOTAL:</span>
          <span>{formatCurrency(order.total_amount || 0)}</span>
        </div>
      </div>
    </div>
  )
}