import { useEffect, useState } from 'react'
import './App.css'
import type { Product } from './types/product'
import { fetchProducts } from './api/product'

function App() {
  const [error, setError] = useState('')
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
  }, [])

  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem('selectedCategory') || 'All'
  })
  useEffect(() => {
    localStorage.setItem('selectedCategory', selectedCategory)
  }, [selectedCategory])

  const [cart, setCart] = useState<Record<string, number>>(() => {
    const raw = localStorage.getItem('cart')
    if (!raw) return {}

    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      return Object.fromEntries(
        Object.entries(parsed).filter(([, qty]) => typeof qty === 'number' && qty > 0),
      ) as Record<string, number>
    } catch {
      return {}
    }
  })
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((item) => item.category === selectedCategory)
  const [priceSort, setPriceSort] = useState<'desc' | 'asc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = viewMode === 'grid' ? 8 : 6
  const sortedProducts = [...filteredProducts].sort((a, b) =>
    priceSort === 'desc' ? b.price - a.price : a.price - b.price,
  )
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage))
  const effectiveCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (effectiveCurrentPage - 1) * itemsPerPage
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage)

  function handleAddToCart(productId: string) {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }))
  }

  function handleMinusToCart(productId: string) {
    setCart((prev) => {
      const current = prev[productId] ?? 0
      if (current <= 1) {
        const next = { ...prev }
        delete next[productId]
        return next
      }

      return {
        ...prev,
        [productId]: current - 1,
      }
    })
  }

  function handleCategoryChange(category: string) {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  function handleSortChange(sort: 'desc' | 'asc') {
    setPriceSort(sort)
    setCurrentPage(1)
  }

  function handleViewModeChange(mode: 'grid' | 'list') {
    setViewMode(mode)
    setCurrentPage(1)
  }

  function getProductName(productId: string) {
    const product = products.find((item) => item.id === productId)
    return product?.name ?? 'Unknown product'
  }

  const validProductIds = new Set(products.map((item) => item.id))
  const cartEntries = Object.entries(cart).filter(([productId, qty]) => validProductIds.has(productId) && qty > 0)

  function getTotalPrice() {
    let total = 0
    cartEntries.forEach(([productId, qty]) => {
      const product = products.find((item) => item.id === productId)
      total += (product?.price ?? 0) * qty
    })
    return total
  }

  function formatPrice(price: number) {
    return `$${price.toFixed(2)}`
  }

  function getCategoryIcon(category: Product['category']) {
    if (category === 'Laptop') return '💻'
    if (category === 'Tablet') return '📱'
    if (category === 'Mobile') return '📲'
    return '🎧'
  }

  function getDiscountPercent(msrp: number, price: number) {
    if (msrp <= 0 || price >= msrp) return 0
    return Math.round(((msrp - price) / msrp) * 100)
  }

  const cartItemCount = cartEntries.reduce((sum, [, qty]) => sum + qty, 0)
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <>
      <header className="page-header">
        <div className="page-header-top">
          <div>
            <p className="page-eyebrow">SpotnTango</p>
            <h1>Product Catalog</h1>
            <p className="page-subtitle">Browse products, filter by category, and manage your cart.</p>
          </div>
          <button
            aria-label="Open cart"
            className="cart-trigger-btn"
            onClick={() => setIsCartOpen(true)}
            type="button"
          >
            <span className="cart-trigger-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M7 4h-2v2h1l2.4 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8l1.6-7a1 1 0 0 0-1-1.2h-10.5l-.3-1.2a1 1 0 0 0-1-.8zm3.4 10-1-4h8.1l-.9 4zm-.9 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
              </svg>
            </span>
            {cartItemCount > 0 && <span className="cart-trigger-badge">{cartItemCount}</span>}
          </button>
        </div>
      </header>

      <section id="center">
        <div className="products-panel">
          <div className="category">
            <div className="category-left">
              <label htmlFor="category">Category</label>
              <select id="category" value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)}>
                <option value="All">All</option>
                <option value="Laptop">Laptop</option>
                <option value="Tablet">Tablet</option>
                <option value="Mobile">Mobile</option>
                <option value="Accessory">Accessory</option>
              </select>
            </div>
            <div className="category-actions">
              <label htmlFor="priceSort">Sort</label>
              <select
                id="priceSort"
                value={priceSort}
                onChange={(e) => handleSortChange(e.target.value as 'desc' | 'asc')}
              >
                <option value="desc">Price: High to Low</option>
                <option value="asc">Price: Low to High</option>
              </select>
              <div className="view-toggle">
                <button
                  className={viewMode === 'grid' ? 'active-view' : ''}
                  onClick={() => handleViewModeChange('grid')}
                  type="button"
                >
                  Grid
                </button>
                <button
                  className={viewMode === 'list' ? 'active-view' : ''}
                  onClick={() => handleViewModeChange('list')}
                  type="button"
                >
                  List
                </button>
              </div>
            </div>
            <span className="results-count">{sortedProducts.length} items</span>
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className={`products ${viewMode === 'list' ? 'products-list' : ''}`}>
            {sortedProducts.length === 0 && (
              <div className="empty-products">No products found for this category.</div>
            )}

            {paginatedProducts.map((item) => {
              const qty = cart[item.id] ?? 0
              const discount = getDiscountPercent(item.msrp, item.price)

              return (
                <div className="product-card" key={item.id}>
                  <div className="product-image-wrap">
                    {discount > 0 && <span className="discount-pill">-{discount}%</span>}
                    <div className="image" aria-hidden="true">
                      {getCategoryIcon(item.category)}
                    </div>
                  </div>

                  <ol className="no-style">
                    <li>{item.name}</li>
                    <li className="product-category">{item.category}</li>
                  </ol>

                  <div className="product-footer">
                    <div className="price-block">
                      <p className="product-price">{formatPrice(item.price)}</p>
                      <p className="product-msrp">MSRP {formatPrice(item.msrp)}</p>
                      {discount > 0 && <p className="product-discount">Save {discount}%</p>}
                    </div>

                    <div className="product-actions">
                      {qty > 0 ? (
                        <div className="card-qty-controls">
                          <button onClick={() => handleMinusToCart(item.id)}>-</button>
                          <span>{qty}</span>
                          <button onClick={() => handleAddToCart(item.id)}>+</button>
                        </div>
                      ) : (
                        <button disabled={!item.available} onClick={() => handleAddToCart(item.id)}>
                          Add to Cart
                        </button>
                      )}
                      {!item.available && <p>Sold Out</p>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={effectiveCurrentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                type="button"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                <button
                  className={page === effectiveCurrentPage ? 'active-page' : ''}
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  type="button"
                >
                  {page}
                </button>
              ))}
              <button
                disabled={effectiveCurrentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                type="button"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </section>

      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-summary cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Cart</h2>
              <div className="cart-header-actions">
                <span>{cartItemCount} items</span>
                <button
                  aria-label="Close cart"
                  className="cart-icon-btn"
                  onClick={() => setIsCartOpen(false)}
                  type="button"
                >
                  <span className="cart-icon-mark">x</span>
                </button>
              </div>
            </div>

            {cartEntries.length === 0 && <p className="empty-cart">Your cart is empty.</p>}

            {cartEntries.map(([productId, quantity]) => (
              <div className="product" key={productId}>
                <div className="cart-row">
                  <p>
                    <span className="cart-item-name">{getProductName(productId)}</span>
                    <span className="qty-controls">
                      <button onClick={() => handleMinusToCart(productId)}>-</button>
                      <span className="qty-value">{quantity}</span>
                      <button onClick={() => handleAddToCart(productId)}>+</button>
                    </span>
                  </p>
                </div>
              </div>
            ))}

            <div className="total-row">
              <span>Total</span>
              <strong>{formatPrice(getTotalPrice())}</strong>
            </div>
          </div>
        </div>
      )}

      <section id="spacer"></section>
    </>
  )
}

export default App
