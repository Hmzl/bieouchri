import type { Order, Product } from '../types'

export interface Range {
  from: Date
  to: Date
}

export interface TopProduct {
  name: string
  quantity: number
  revenue: number
}

export interface Analytics {
  totalSales: number
  profit: number
  itemsSold: number
  orderCount: number
  topProducts: TopProduct[]
}

export function filterOrders(orders: Order[], range?: Range): Order[] {
  return orders.filter((o) => {
    if (o.status === 'cancelled') return false
    if (!range) return true
    const d = new Date(o.createdAt).getTime()
    return d >= range.from.getTime() && d <= range.to.getTime()
  })
}

export function computeAnalytics(orders: Order[], range?: Range): Analytics {
  const list = filterOrders(orders, range)
  const map = new Map<string, TopProduct>()
  let totalSales = 0
  let profit = 0
  let itemsSold = 0

  for (const order of list) {
    totalSales += order.total
    profit += order.deliveryFee ?? 0
    for (const item of order.items) {
      itemsSold += item.quantity
      profit += (item.price - item.cost) * item.quantity
      const prev = map.get(item.name) ?? { name: item.name, quantity: 0, revenue: 0 }
      prev.quantity += item.quantity
      prev.revenue += item.price * item.quantity
      map.set(item.name, prev)
    }
  }

  const topProducts = [...map.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5)

  return {
    totalSales,
    profit,
    itemsSold,
    orderCount: list.length,
    topProducts,
  }
}

export function lowStockProducts(products: Product[], threshold: number): Product[] {
  return products.filter((p) => p.quantity > 0 && p.quantity <= threshold)
}

export function outOfStockProducts(products: Product[]): Product[] {
  return products.filter((p) => p.quantity <= 0)
}

export function lastNDaysSales(orders: Order[], days: number): { label: string; value: number }[] {
  const result: { label: string; value: number }[] = []
  const loc = document.documentElement.lang === 'ar' ? 'ar-MA' : 'fr-FR'
  const formatter = new Intl.DateTimeFormat(loc, { weekday: 'short', numberingSystem: 'latn' })
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date()
    day.setHours(0, 0, 0, 0)
    day.setDate(day.getDate() - i)
    const end = new Date(day)
    end.setHours(23, 59, 59, 999)
    const value = filterOrders(orders, { from: day, to: end }).reduce((s, o) => s + o.total, 0)
    result.push({ label: formatter.format(day).replace('.', ''), value })
  }
  return result
}

export function lastNMonthsSales(orders: Order[], months: number): { label: string; value: number }[] {
  const result: { label: string; value: number }[] = []
  const loc = document.documentElement.lang === 'ar' ? 'ar-MA' : 'fr-FR'
  const formatter = new Intl.DateTimeFormat(loc, { month: 'short', numberingSystem: 'latn' })
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const from = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)
    const value = filterOrders(orders, { from, to }).reduce((s, o) => s + o.total, 0)
    result.push({ label: formatter.format(from).replace('.', ''), value })
  }
  return result
}
