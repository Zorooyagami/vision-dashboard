const CATEGORY_META = {
  browsing: { label: 'Browsing & Interaction', color: '#0D9488', bg: '#F0FDFA' },
  cart:     { label: 'Shopping Cart',          color: '#D97706', bg: '#FFFBEB' },
  checkout: { label: 'Checkout & Purchase',    color: '#4338CA', bg: '#EEF2FF' },
}


const EVENTS = [
  {
    id: 'view_item_list', name: 'view_item_list', description: 'User views a collection, category page, or list of products',
    category: 'browsing', platform: 'Both', volume: 482300, lastSeen: '2 min ago', status: 'Active',
    spark: [38, 42, 44, 41, 48, 52, 49, 54, 58, 62, 60, 65, 68, 72],
    properties: [{ key: 'item_list_id', type: 'string' }, { key: 'item_list_name', type: 'string' }, { key: 'items', type: 'array' }],
  },
  {
    id: 'select_item', name: 'select_item', description: 'User clicks on a specific product from an item list',
    category: 'browsing', platform: 'Both', volume: 318400, lastSeen: '3 min ago', status: 'Active',
    spark: [28, 31, 34, 30, 36, 38, 35, 40, 42, 44, 46, 48, 50, 52],
    properties: [{ key: 'item_list_id', type: 'string' }, { key: 'item_id', type: 'string' }, { key: 'item_name', type: 'string' }],
  },
  {
    id: 'view_item', name: 'view_item', description: 'User views a detailed product description page',
    category: 'browsing', platform: 'Both', volume: 276800, lastSeen: '1 min ago', status: 'Active',
    spark: [22, 24, 26, 28, 25, 30, 32, 29, 34, 36, 38, 40, 42, 44],
    properties: [{ key: 'item_id', type: 'string' }, { key: 'item_name', type: 'string' }, { key: 'price', type: 'number' }, { key: 'currency', type: 'string' }],
  },
  {
    id: 'add_to_wishlist', name: 'add_to_wishlist', description: 'User saves an item to their favorites list',
    category: 'browsing', platform: 'Both', volume: 98400, lastSeen: '8 min ago', status: 'Active',
    spark: [8, 9, 10, 9, 11, 12, 10, 13, 14, 13, 15, 16, 15, 17],
    properties: [{ key: 'item_id', type: 'string' }, { key: 'item_name', type: 'string' }, { key: 'price', type: 'number' }],
  },
  {
    id: 'add_to_cart', name: 'add_to_cart', description: 'User adds a product to their shopping cart',
    category: 'cart', platform: 'Both', volume: 184200, lastSeen: '1 min ago', status: 'Active',
    spark: [14, 16, 18, 17, 20, 22, 21, 24, 26, 25, 28, 30, 29, 32],
    properties: [{ key: 'product_id', type: 'string' }, { key: 'price', type: 'number' }, { key: 'quantity', type: 'number' }, { key: 'currency', type: 'string' }],
  },
  {
    id: 'remove_from_cart', name: 'remove_from_cart', description: 'User removes a specific product from their cart',
    category: 'cart', platform: 'Both', volume: 42600, lastSeen: '14 min ago', status: 'Active',
    spark: [4, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8, 10, 9, 11],
    properties: [{ key: 'product_id', type: 'string' }, { key: 'price', type: 'number' }, { key: 'quantity', type: 'number' }],
  },
  {
    id: 'view_cart', name: 'view_cart', description: 'User navigates to and opens their shopping cart page',
    category: 'cart', platform: 'Web', volume: 128700, lastSeen: '4 min ago', status: 'Active',
    spark: [10, 11, 12, 11, 13, 14, 13, 15, 16, 15, 17, 18, 17, 19],
    properties: [{ key: 'cart_id', type: 'string' }, { key: 'cart_total', type: 'number' }, { key: 'item_count', type: 'number' }],
  },
  {
    id: 'begin_checkout', name: 'begin_checkout', description: 'User clicks to initiate the checkout flow',
    category: 'checkout', platform: 'Both', volume: 96800, lastSeen: '2 min ago', status: 'Active',
    spark: [8, 9, 10, 9, 11, 12, 10, 13, 14, 13, 15, 16, 15, 17],
    properties: [{ key: 'cart_total', type: 'number' }, { key: 'item_count', type: 'number' }, { key: 'currency', type: 'string' }],
  },
  {
    id: 'add_shipping_info', name: 'add_shipping_info', description: 'User submits their shipping address or selects a delivery tier',
    category: 'checkout', platform: 'Both', volume: 84300, lastSeen: '3 min ago', status: 'Active',
    spark: [7, 8, 8, 9, 10, 9, 11, 12, 11, 13, 14, 13, 15, 16],
    properties: [{ key: 'shipping_tier', type: 'string' }, { key: 'country', type: 'string' }],
  },
  {
    id: 'add_payment_info', name: 'add_payment_info', description: 'User enters credit card, PayPal, or other billing information',
    category: 'checkout', platform: 'Both', volume: 76400, lastSeen: '4 min ago', status: 'Active',
    spark: [6, 7, 7, 8, 9, 8, 10, 11, 10, 12, 13, 12, 14, 15],
    properties: [{ key: 'payment_type', type: 'string' }, { key: 'currency', type: 'string' }],
  },
  {
    id: 'purchase', name: 'purchase', description: 'User completes the transaction; triggers the final confirmation page',
    category: 'checkout', platform: 'Both', volume: 64800, lastSeen: '1 min ago', status: 'Active',
    spark: [5, 6, 6, 7, 8, 7, 9, 10, 9, 11, 12, 11, 13, 14],
    properties: [{ key: 'order_id', type: 'string' }, { key: 'value', type: 'number' }, { key: 'currency', type: 'string' }, { key: 'items', type: 'array' }],
  },
  {
    id: 'refund', name: 'refund', description: 'A full or partial monetary refund is processed for an order',
    category: 'checkout', platform: 'Both', volume: 8200, lastSeen: '22 min ago', status: 'Active',
    spark: [1, 1, 2, 1, 2, 2, 1, 2, 3, 2, 3, 3, 2, 3],
    properties: [{ key: 'order_id', type: 'string' }, { key: 'refund_amount', type: 'number' }, { key: 'currency', type: 'string' }],
  },
]

const SAVED_FUNNELS = [
  { id: 'f1', name: 'Wishlist to Purchase', steps: ['view_item', 'add_to_wishlist', 'add_to_cart', 'purchase'], conversion: 14.2, lastEdited: '2 days ago' },
  { id: 'f2', name: 'Checkout Drop-off', steps: ['begin_checkout', 'add_shipping_info', 'add_payment_info', 'purchase'], conversion: 67.8, lastEdited: '5 days ago' },
]

const SAVED_QUERIES = [
  { id: 'q1', label: 'App purchases by persona', event: 'purchase', groupBy: 'Persona' },
  { id: 'q2', label: 'High-value cart adds', event: 'add_to_cart', groupBy: 'Platform' },
]

export { CATEGORY_META, EVENTS, SAVED_FUNNELS, SAVED_QUERIES }
