import { useState } from 'react'
import './index.css'

const PRODUCTS = [
  { id: 1, name: 'Espresso', price: 5, image: '/images/espresso.png' },
  { id: 2, name: 'Cappuccino', price: 35, image: '/images/espresso.png' },
  { id: 3, name: 'Latte', price: 40, image: '/images/espresso.png' },
  { id: 4, name: 'Iced Coffee', price: 30, image: '/images/espresso.png' },
]

function App() {
  const [partyA, setPartyA] = useState('251723747252')
  const [phoneNumber, setPhoneNumber] = useState('251723747252')
  const [cart, setCart] = useState({})
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  const handleProductClick = (productId) => {
    setCart((prevCart) => {
      const currentQty = prevCart[productId] || 0
      return { ...prevCart, [productId]: currentQty + 1 }
    })
  }

  const handleRemoveClick = (productId, e) => {
    e.stopPropagation() // Prevent triggering add
    setCart((prevCart) => {
      const currentQty = prevCart[productId] || 0
      if (currentQty <= 1) {
        const newCart = { ...prevCart }
        delete newCart[productId]
        return newCart
      }
      return { ...prevCart, [productId]: currentQty - 1 }
    })
  }

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [productId, qty]) => {
      const product = PRODUCTS.find((p) => p.id === parseInt(productId))
      return total + (product ? product.price * qty : 0)
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    const amount = calculateTotal()

    if (amount === 0) {
      setStatus({ type: 'error', message: 'Please select at least one product.' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:5001/api/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partyA, phoneNumber, amount }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({ type: 'success', message: 'Payment request sent successfully!' })
        setCart({}) // Clear cart on success
      } else {
        setStatus({ type: 'error', message: data.error || 'Payment failed. Please try again.' })
      }
    } catch (error) {
      console.error('Error:', error)
      setStatus({ type: 'error', message: 'Failed to connect to the server.' })
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = calculateTotal()

  return (
    <div className="app-container">
      {/* Products Section */}
      <div className="products-container">
        <h1>Coffee Menu</h1>
        <p className="subtitle">Select items for the order</p>

        <div className="products-grid">
          {PRODUCTS.map((product) => {
            const qty = cart[product.id] || 0
            return (
              <div
                key={product.id}
                className={`product-card ${qty > 0 ? 'selected' : ''}`}
                onClick={() => handleProductClick(product.id)}
              >
                <img src={product.image} alt={product.name} />
                <div className="product-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="product-name">{product.name}</div>
                    {qty > 0 && (
                      <span className="product-quantity" onClick={(e) => handleRemoveClick(product.id, e)}>
                        x{qty}
                      </span>
                    )}
                  </div>
                  <div className="product-price">{product.price} Birr</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Checkout Card */}
      <div className="cafe-card">
        <h1>Checkout</h1>
        <p className="subtitle">Barista Portal</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="partyA">Party A (Customer Phone)</label>
            <input
              id="partyA"
              type="text"
              value={partyA}
              onChange={(e) => setPartyA(e.target.value)}
              placeholder="e.g. 251723747252"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 251723747252"
              required
            />
          </div>

          <div className="cart-total">
            Total: {totalAmount} Birr
          </div>

          <button type="submit" disabled={loading || totalAmount === 0}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              `Pay ${totalAmount} Birr`
            )}
          </button>
        </form>

        {status && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
