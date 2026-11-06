import { useEffect, useState } from 'react'
import { appendLocalOrder, clearSession, fetchOrders, fetchSession, getToken, isAuthError, login, placeOrder, readLocalOrders, readWishlist, register, rememberedUser, setToken, updateProfile, writeWishlist } from './auth'
import './App.css'

const fallbackProducts = [
  { id: 1, name: 'Cotton T-Shirt', category: 'Clothing', price: 799, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80' },
  { id: 2, name: 'Canvas Backpack', category: 'Bags', price: 1499, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80' },
  { id: 3, name: 'Ceramic Coffee Mug', category: 'Home', price: 499, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=700&q=80' },
  { id: 4, name: 'Running Shoes', category: 'Footwear', price: 2499, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80' },
  { id: 5, name: 'Classic Wristwatch', category: 'Accessories', price: 1899, image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80' },
  { id: 6, name: 'Desk Plant Pot', category: 'Home', price: 649, image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=700&q=80' },
  { id: 7, name: 'Everyday Sunglasses', category: 'Accessories', price: 999, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80' },
  { id: 8, name: 'Linen Shirt', category: 'Clothing', price: 1299, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80' },
  { id: 9, name: 'Leather Crossbody Bag', category: 'Bags', price: 2199, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80' },
  { id: 10, name: 'Minimal Desk Lamp', category: 'Home', price: 1799, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80' },
  { id: 11, name: 'Wireless Headphones', category: 'Electronics', price: 3299, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80' },
  { id: 12, name: 'Stainless Water Bottle', category: 'Accessories', price: 899, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=80' },
  { id: 13, name: 'Ceramic Serving Bowl', category: 'Kitchen', price: 749, image: 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=700&q=80' },
  { id: 14, name: 'Daily Journal', category: 'Stationery', price: 399, image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80' },
  { id: 15, name: 'Gentle Face Cleanser', category: 'Beauty', price: 599, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=700&q=80' },
  { id: 16, name: 'Relaxed Chinos', category: 'Clothing', price: 1599, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=80' },
  { id: 17, name: 'AI Intelligence Starter Kit', category: 'Electronics', price: 7999, image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=700&q=80', description: 'A practical artificial intelligence and machine learning starter kit.' },
  { id: 18, name: 'AI Laptop for Machine Learning', category: 'Computers', price: 68999, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=80', description: 'Powerful laptop for artificial intelligence, data science, and coding.' },
  { id: 19, name: 'AI Writing Assistant Device', category: 'Electronics', price: 12999, image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=700&q=80', description: 'Smart productivity device with artificial intelligence tools.' },
  { id: 20, name: 'Computer Vision Camera', category: 'Electronics', price: 8999, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80', description: 'Intelligent camera for computer vision and AI-powered projects.' },
  { id: 21, name: 'Data Science Learning Bundle', category: 'Books', price: 2499, image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=700&q=80', description: 'Learn Python, data science, artificial intelligence, and machine learning.' },
  { id: 22, name: 'Smart AI Home Speaker', category: 'Electronics', price: 5499, image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=700&q=80', description: 'Voice-controlled smart speaker with AI assistant features.' },
]

const categories = ['All', 'Clothing', 'Bags', 'Footwear', 'Accessories', 'Home', 'Electronics', 'Computers', 'Books', 'Kitchen', 'Stationery', 'Beauty']
const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)
const filterFallbackProducts = (category, search) => fallbackProducts.filter((product) => {
  const matchesCategory = category === 'All' || product.category === category
  const searchableText = `${product.name} ${product.category} ${product.description || ''}`.toLowerCase()
  const matchesSearch = search.toLowerCase().trim().split(/\s+/).filter(Boolean).every((term) => searchableText.includes(term))
  return matchesCategory && matchesSearch
})

const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'S'
const heartIcon = <svg viewBox="0 0 24 24" aria-hidden="true" width="15" height="15"><path d="M12 20.3l-1.4-1.3C5.4 14.2 2.5 11.5 2.5 8.2 2.5 5.6 4.5 3.6 7.1 3.6c1.5 0 2.9.7 3.7 1.8.8-1.1 2.2-1.8 3.7-1.8 2.6 0 4.6 2 4.6 4.6 0 3.3-2.9 6-8.1 10.8L12 20.3z" /></svg>

function App() {
  const [page, setPage] = useState(() => window.location.hash.replace('#', '') || 'home')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState(fallbackProducts)
  const [productsLoading, setProductsLoading] = useState(false)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [user, setUser] = useState(() => rememberedUser())
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [wishlist, setWishlist] = useState(() => readWishlist())
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' })
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileBusy, setProfileBusy] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [orders, setOrders] = useState(null)
  const [lastOrder, setLastOrder] = useState(null)
  const [offlineAuth, setOfflineAuth] = useState(false)

  const visibleProducts = products

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  useEffect(() => {
    if (!getToken()) return
    fetchSession().then((session) => setUser(session.user)).catch((error) => { if (isAuthError(error)) clearSession() })
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const close = (event) => { if (!event.target.closest('.user-area')) setMenuOpen(false) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  useEffect(() => {
    if (page !== 'profile' || !user) return
    fetchOrders().then((list) => setOrders(list)).catch(() => { setOrders(readLocalOrders()); setOfflineAuth(true) })
  }, [page, user])

  useEffect(() => {
    if (page === 'profile' && !user) navigate('home')
  }, [page, user])

  useEffect(() => {
    function handleHashChange() {
      const nextPage = window.location.hash.replace('#', '') || 'home'
      setPage(['home', 'products', 'about', 'profile'].includes(nextPage) ? nextPage : 'home')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ category, search })
    const fallback = filterFallbackProducts(category, search)
    const loadProducts = async () => {
      setProductsLoading(true)
      try {
        const response = await fetch(`/api/products?${params}`, { signal: controller.signal })
        if (!response.ok) throw new Error('Products request failed')
        setProducts(await response.json())
      } catch (error) {
        if (error.name !== 'AbortError') setProducts(fallback)
      } finally {
        if (!controller.signal.aborted) setProductsLoading(false)
      }
    }
    const requestDelay = window.setTimeout(loadProducts, 180)
    return () => {
      window.clearTimeout(requestDelay)
      controller.abort()
    }
  }, [category, search])

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id)
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }]
    })
    setCartOpen(true)
    setJustAdded(true)
  }

  function changeQuantity(id, amount) {
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0))
  }

  function applySession(result) {
    setToken(result.token || '')
    const nextUser = { ...result.user, email: String(result.user.email || '').toLowerCase() }
    window.localStorage.setItem('shopeasy.auth.currentUser', JSON.stringify(nextUser))
    setUser(nextUser)
    setWishlist(readWishlist())
    setProfileForm({ name: nextUser.name, email: nextUser.email, phone: nextUser.phone || '' })
    setOrders(null)
    return nextUser
  }

  async function submitAuth(event, mode = authMode) {
    event.preventDefault()
    setAuthBusy(true)
    setAuthError('')
    try {
      if (mode === 'signup') {
        if (authForm.password !== authForm.confirm) throw new Error('Both passwords must match')
      }
      const payload = mode === 'signup'
        ? { name: authForm.name, email: authForm.email, password: authForm.password }
        : { email: authForm.email, password: authForm.password }
      const result = mode === 'signup' ? await register(payload) : await login(payload)
      applySession(result)
      setAuthOpen(false)
      setAuthForm({ name: '', email: '', password: '', confirm: '' })
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthBusy(false)
    }
  }

  function signOut() {
    clearSession()
    setUser(null)
    setMenuOpen(false)
    setWishlist(readWishlist())
    setOrders(null)
    setOfflineAuth(false)
    navigate('home')
  }

  function toggleWishlist(product) {
    setWishlist((current) => {
      const next = current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id]
      writeWishlist(next)
      return next
    })
  }

  async function saveProfile(event) {
    event.preventDefault()
    setProfileBusy(true)
    setProfileSaved(false)
    setProfileError('')
    try {
      const saved = await updateProfile(profileForm)
      setUser(saved.user)
      window.localStorage.setItem('shopeasy.auth.currentUser', JSON.stringify(saved.user))
      setProfileForm({ name: saved.user.name, email: saved.user.email, phone: saved.user.phone || '' })
      setProfileSaved(true)
      window.setTimeout(() => setProfileSaved(false), 2600)
    } catch (error) {
      setProfileError(error.message)
    } finally {
      setProfileBusy(false)
    }
  }

  function navigate(nextPage) {
    window.location.hash = nextPage
  }

  function openCheckout() {
    setCartOpen(false)
    setPaymentComplete(false)
    setPaymentOpen(true)
  }

  async function completePayment(event) {
    event.preventDefault()
    let order = null
    if (user) {
      try {
        const result = await placeOrder({ method: paymentMethod, items: cart.map((item) => ({ id: item.id, quantity: item.quantity })) })
        order = result.order
      } catch {
        order = { reference: 'SE-LOCAL-' + Date.now().toString(36).toUpperCase(), method: paymentMethod, total: cartTotal, items: cart.map((item) => ({ name: item.name, category: item.category, price: item.price, quantity: item.quantity, image: item.image })) }
        appendLocalOrder(order)
      }
    } else {
      order = { reference: 'SE-GUEST-' + Date.now().toString(36).toUpperCase(), method: paymentMethod, total: cartTotal, items: cart.map((item) => ({ name: item.name, category: item.category, price: item.price, quantity: item.quantity, image: item.image })) }
      appendLocalOrder(order)
    }
    setLastOrder(order)
    setPaymentComplete(true)
    setCart([])
  }

  return (
    <div className="store">
      <div className="page-fx" aria-hidden="true" />
      <div className="top-banner">Free delivery on orders above {formatPrice(999)}</div>
      <header className="header">
        <a className="logo" href="#home" onClick={() => navigate('home')}>ShopEasy</a>
        <nav>{['home', 'products', 'about'].map((item) => <a className={page === item ? 'active' : ''} key={item} href={`#${item}`} onClick={() => navigate(item)}>{item[0].toUpperCase() + item.slice(1)}</a>)}</nav>
        <div className="header-actions"><input value={search} onFocus={() => navigate('products')} onChange={(event) => { setSearch(event.target.value); navigate('products') }} placeholder="Search products" aria-label="Search products" /><button className={`cart-button ${justAdded ? 'added' : ''}`} onClick={() => { setCartOpen(true); setJustAdded(false); }}>Cart {cartCount > 0 && <span className="cart-count">{cartCount}</span>}</button>
          <div className="user-area">
            <button className={`avatar-button ${user ? 'signed-in' : ''}`} onClick={() => setMenuOpen((open) => !open)} aria-label={user ? 'Account menu' : 'Sign in or create an account'} aria-expanded={menuOpen}>
              {user ? <span className="avatar" style={{ background: user.avatarColor }}>{initials(user.name)}</span> : <span className="avatar avatar-guest" />}
            </button>
            {menuOpen && <div className="user-menu">
              {user ? <>
                <div className="user-menu-head"><strong>{user.name}</strong><small>{user.email}</small></div>
                <button onClick={() => { navigate('profile'); setMenuOpen(false) }}>My profile</button>
                <button onClick={() => { navigate('profile'); setMenuOpen(false) }}>Saved items <span className="menu-count">{wishlist.length}</span></button>
                <button className="danger" onClick={signOut}>Sign out</button>
              </> : <>
                <div className="user-menu-head"><strong>Welcome</strong><small>Sign in for orders and saved items</small></div>
                <button onClick={() => { setAuthMode('signin'); setAuthOpen(true); setMenuOpen(false) }}>Sign in</button>
                <button onClick={() => { setAuthMode('signup'); setAuthOpen(true); setMenuOpen(false) }}>Create account</button>
              </>}
            </div>}
          </div></div>
      </header>

      <main className="page-stage" key={page}>
        {page === 'home' && <section className="welcome"><div><p className="small-label">WELCOME TO SHOPEASY</p><h1>Everything you need,<br /><span>all in one place.</span></h1><p>Shop clothing, accessories, home items and more at simple, affordable prices.</p><a className="shop-button" href="#products" onClick={() => navigate('products')}>Shop now</a></div><img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80" alt="Clothing store interior" /></section>}

        {page === 'products' && <section className="products-section"><div className="section-title"><div><p className="small-label">OUR PRODUCTS</p><h2>{search ? `Results for "${search}"` : 'Popular products'}</h2></div><span>{productsLoading ? 'Searching...' : `${visibleProducts.length} items`}</span></div><div className="filters">{categories.map((item, index) => <button key={item} style={{ '--i': String(index) }} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="product-grid">{visibleProducts.map((product, index) => <article className="product-card" style={{ '--delay': `${index * 70}ms` }} key={product.id}>{index % 4 === 1 && <span className="card-badge">Premium</span>}<button className={`heart ${wishlist.includes(product.id) ? 'saved' : ''}`} onClick={() => toggleWishlist(product)} aria-label={wishlist.includes(product.id) ? 'Remove from saved items' : 'Save this item'} aria-pressed={wishlist.includes(product.id)}>{heartIcon}</button><img src={product.image} alt={product.name} /><div className="product-details"><div><h3>{product.name}</h3><p>{product.category}</p></div><strong>{formatPrice(product.price)}</strong></div><button className="add-button" onClick={() => addToCart(product)}>Add to cart</button></article>)}</div>{!productsLoading && visibleProducts.length === 0 && <p className="no-results">No products found. Try a different search.</p>}</section>}

  {page === 'profile' && <section className="profile-section">
        <div className="section-title"><div><p className="small-label">MY ACCOUNT</p><h2>Profile and orders</h2></div><span>{user ? 'Member since ' + new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Guest'}</span></div>
        <div className="profile-grid">
          <div className="profile-card">
            <div className="profile-head"><span className="avatar avatar-lg" style={{ background: user?.avatarColor }}>{initials(user?.name)}</span><div><h3>{user?.name}</h3><p>{user?.email}</p></div></div>
            <form className="profile-form" onSubmit={saveProfile}>
              <label className="payment-field">Name<input value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} required minLength="2" /></label>
              <label className="payment-field">Email<input type="email" value={profileForm.email} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} required /></label>
              <label className="payment-field">Phone<input value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} placeholder="9876543210" /></label>
              <button className="pay-button" type="submit" disabled={profileBusy}>{profileBusy ? 'Saving...' : 'Save changes'}</button>
              {profileSaved && <p className="profile-saved">Profile updated.</p>}
              {profileError && <p className="auth-error">{profileError}</p>}
            </form>
          </div>
          <div className="profile-side">
            <div className="side-block" style={{ '--i': '1' }}><h3>Saved items <span>{wishlist.length}</span></h3>{wishlist.length === 0 ? <p className="side-empty">Tap the heart on any product to save it here.</p> : <div className="wish-grid">{products.filter((product) => wishlist.includes(product.id)).map((product, index) => <div className="wish-item" style={{ '--i': index }} key={product.id}><img src={product.image} alt={product.name} /><strong>{product.name}</strong><button onClick={() => toggleWishlist(product)} aria-label="Remove saved item">×</button></div>)}</div>}</div>
            <div className="side-block"><h3>Order history <span>{orders?.length ?? 0}</span></h3>{orders === null ? <p className="side-empty">Loading orders...</p> : orders.length === 0 ? <p className="side-empty">No orders yet. Your purchases appear here.</p> : <div className="order-list">{orders.map((order, index) => <div className="order-row" style={{ '--i': index }} key={order.id || order.reference}><div><strong>{order.reference}</strong><small>{new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · {order.method.toUpperCase()}</small></div><div className="order-items">{order.items.slice(0, 3).map((item) => <img src={item.image} alt={item.name} key={item.name} />)}</div><em>{formatPrice(order.total)}</em></div>)}</div>}{offlineAuth && <p className="offline-note">Showing demo records stored on this device.</p>}</div>
          </div>
        </div>
      </section>}

      {page === 'about' && <section className="about"><p className="small-label">THE SHOPEASY PROMISE</p><h2>Shopping made simple.</h2><p>We bring useful products together so you can find what you need without the fuss.</p><button className="shop-button" onClick={() => navigate('products')}>Explore products</button></section>}
      </main>

      <footer><strong>ShopEasy</strong><span>© 2025 ShopEasy. All rights reserved.</span><span>Made for everyday shopping.</span></footer>

      {cartOpen && <div className="cart-overlay" onClick={() => setCartOpen(false)}><aside className="cart-panel" onClick={(event) => event.stopPropagation()}><div className="cart-heading"><h2>Your cart</h2><button onClick={() => setCartOpen(false)} aria-label="Close cart">×</button></div>{cart.length === 0 ? <p className="empty-cart">Your cart is empty.</p> : <><div className="cart-list">{cart.map((item, index) => <div className="cart-item" style={{ '--i': index }} key={item.id}><img src={item.image} alt={item.name} /><div className="cart-item-info"><h3>{item.name}</h3><p>{formatPrice(item.price)}</p><div className="quantity"><button onClick={() => changeQuantity(item.id, -1)} aria-label="Remove one">−</button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)} aria-label="Add one">+</button></div></div></div>)}</div><div className="cart-total"><div><span>Total</span><strong>{formatPrice(cartTotal)}</strong></div><button onClick={openCheckout}>Proceed to checkout</button></div></>}</aside></div>}

      {paymentOpen && <div className="payment-overlay" onClick={() => setPaymentOpen(false)}><section className="payment-modal" onClick={(event) => event.stopPropagation()}>{paymentComplete ? <div className="payment-success"><div className="success-mark" aria-hidden="true" /><p className="small-label">PAYMENT RECEIVED</p><h2>Order confirmed.</h2><p>Your ShopEasy order has been placed successfully.{lastOrder && <span className='order-ref'>{lastOrder.reference} · {formatPrice(lastOrder.total)}</span>}</p><button className="shop-button" onClick={() => setPaymentOpen(false)}>Continue shopping</button></div> : <form onSubmit={completePayment}><div className="payment-heading"><div><p className="small-label">SECURE CHECKOUT</p><h2>Choose payment</h2></div><button type="button" onClick={() => setPaymentOpen(false)} aria-label="Close payment">×</button></div><div className="payment-total"><span>Order total</span><strong>{formatPrice(cartTotal)}</strong></div><div className="payment-options">{[['upi', 'UPI', 'Pay with any UPI app'], ['card', 'Card', 'Credit or debit card'], ['cod', 'Cash on delivery', 'Pay when your order arrives']].map(([value, title, description]) => <button type="button" className={`payment-option ${paymentMethod === value ? 'selected' : ''}`} key={value} onClick={() => setPaymentMethod(value)}><span className="payment-radio" /><span><strong>{title}</strong><small>{description}</small></span></button>)}</div>{paymentMethod === 'upi' && <label className="payment-field">UPI ID<input required placeholder="name@bank" pattern=".+@.+" /></label>}{paymentMethod === 'card' && <div className="card-fields"><label className="payment-field">Card number<input required inputMode="numeric" placeholder="1234 5678 9012 3456" minLength="12" /></label><div><label className="payment-field">Expiry<input required placeholder="MM/YY" /></label><label className="payment-field">CVV<input required inputMode="numeric" placeholder="123" minLength="3" maxLength="4" /></label></div></div>}<button className="pay-button" type="submit">{paymentMethod === 'cod' ? 'Place order' : `Pay ${formatPrice(cartTotal)}`}</button><p className="payment-note">Demo checkout. No real payment is processed.</p></form>}</section></div>}
      {authOpen && <div className="auth-overlay" onClick={() => setAuthOpen(false)}>
        <section className="auth-modal" onClick={(event) => event.stopPropagation()}>
          <div className="auth-tabs">
            <button className={authMode === 'signin' ? 'selected' : ''} onClick={() => { setAuthMode('signin'); setAuthError('') }}>Sign in</button>
            <button className={authMode === 'signup' ? 'selected' : ''} onClick={() => { setAuthMode('signup'); setAuthError('') }}>Create account</button>
            <button className="auth-close" onClick={() => setAuthOpen(false)} aria-label="Close account dialog">×</button>
          </div>
          <p className="small-label">{authMode === 'signin' ? 'WELCOME BACK' : 'JOIN SHOPEASY'}</p>
          <h2>{authMode === 'signin' ? 'Sign in to your account' : 'Create your account'}</h2>
          {authMode === 'signup' ? <form onSubmit={(event) => submitAuth(event, 'signup')}>
            <label className="payment-field">Full name<input value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} required minLength="2" placeholder="Aarav Menon" /></label>
            <label className="payment-field">Email<input type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} required placeholder="you@example.com" /></label>
            <label className="payment-field">Password<input type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} required minLength="8" placeholder="At least 8 characters" /></label>
            <label className="payment-field">Confirm password<input type="password" value={authForm.confirm} onChange={(event) => setAuthForm({ ...authForm, confirm: event.target.value })} required placeholder="Repeat password" /></label>
            {authError && <p className="auth-error">{authError}</p>}
            <button className="pay-button" type="submit" disabled={authBusy}>{authBusy ? 'Creating account...' : 'Create account'}</button>
          </form> : <form onSubmit={(event) => submitAuth(event, 'signin')}>
            <label className="payment-field">Email<input key="signin-email" type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} required placeholder="you@example.com" /></label>
            <label className="payment-field">Password<input key="signin-password" type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} required placeholder="Your password" /></label>
            {authError && <p className="auth-error">{authError}</p>}
            <button className="pay-button" type="submit" disabled={authBusy}>{authBusy ? 'Signing in...' : 'Sign in'}</button>
          </form>}
          <p className="payment-note">Passwords are stored as scrypt hashes on the API.</p>
          <button className="auth-switch" onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setAuthError('') }}>{authMode === 'signin' ? 'Create an account' : 'Sign in instead'}</button>
        </section>
      </div>}
    </div>
  )
}

export default App
