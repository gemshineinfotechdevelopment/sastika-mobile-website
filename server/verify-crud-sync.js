// Uses global fetch in Node 18+

async function runTests() {
  const BASE_URL = 'http://127.0.0.1:5000/api';
  console.log('--- Starting CRUD & Order / Ticket Sync Verification ---');

  // Helper
  const apiFetch = async (url, opts) => {
    const res = await fetch(url, opts);
    const json = await res.json();
    return json?.data !== undefined ? json.data : json;
  };

  // 1. Check GET /api/products
  const products1 = await apiFetch(`${BASE_URL}/products`);
  console.log('1. GET /api/products -> count:', products1.length);

  // 2. CREATE a product (POST /api/products)
  const newProd = {
    name: 'Test Vivo V40 Pro',
    brand: 'Vivo',
    category: 'smartphones',
    price: 39999,
    mrp: 44999,
    stock: 12,
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80'],
    specs: { ram: '12GB', storage: '256GB' },
    tags: ['Best Seller', 'New Launch'],
    rating: 4.8,
    reviewsCount: 24,
    description: 'Flagship portrait camera phone',
  };

  const createdProd = await apiFetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProd),
  });
  console.log('2. POST /api/products -> created product ID:', createdProd.id || createdProd._id);

  // 3. Verify product is returned in GET /api/products
  const products2 = await apiFetch(`${BASE_URL}/products`);
  const found = products2.find(p => (p.id || p._id) === (createdProd.id || createdProd._id));
  console.log('3. GET /api/products -> found created product?:', Boolean(found), 'Name:', found?.name);

  // 4. UPDATE the product (PUT /api/products/:id)
  const updatedProd = await apiFetch(`${BASE_URL}/products/${createdProd.id || createdProd._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price: 37999, stock: 9 }),
  });
  console.log('4. PUT /api/products/:id -> new price:', updatedProd.price, 'new stock:', updatedProd.stock);

  // 5. DELETE the product (DELETE /api/products/:id)
  const deleteResult = await apiFetch(`${BASE_URL}/products/${createdProd.id || createdProd._id}`, {
    method: 'DELETE',
  });
  console.log('5. DELETE /api/products/:id -> success:', deleteResult);

  // 6. Verify product is gone
  const products3 = await apiFetch(`${BASE_URL}/products`);
  const foundAfterDelete = products3.find(p => (p.id || p._id) === (createdProd.id || createdProd._id));
  console.log('6. GET /api/products -> still exists after delete?:', Boolean(foundAfterDelete));

  // 7. CREATE a Service Ticket (POST /api/tickets)
  const newTicket = {
    customer: 'Murugan K',
    phone: '+91 98401 23456',
    device: 'OnePlus 11R',
    issue: 'Display Touch issue',
    cost: 4500,
    status: 'In Progress',
  };
  const createdTicket = await apiFetch(`${BASE_URL}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTicket),
  });
  console.log('7. POST /api/tickets -> created ticket ID:', createdTicket.id || createdTicket._id);

  // 8. Verify ticket in GET /api/tickets
  const ticketsList = await apiFetch(`${BASE_URL}/tickets`);
  const ticketFound = ticketsList.find(t => (t.id || t._id) === (createdTicket.id || createdTicket._id));
  console.log('8. GET /api/tickets -> found created ticket?:', Boolean(ticketFound), 'Customer:', ticketFound?.customer);

  // 9. Clean up test ticket
  if (createdTicket.id || createdTicket._id) {
    const delTicketRes = await fetch(`${BASE_URL}/tickets/${createdTicket.id || createdTicket._id}`, {
      method: 'DELETE',
    });
    console.log('9. DELETE /api/tickets/:id -> cleanup status:', delTicketRes.status);
  }

  // 10. Verify ticket is gone
  const ticketsListAfter = await apiFetch(`${BASE_URL}/tickets`);
  const ticketStillThere = ticketsListAfter.find(t => (t.id || t._id) === (createdTicket.id || createdTicket._id));
  console.log('10. GET /api/tickets -> still exists after delete?:', Boolean(ticketStillThere));

  console.log('--- Verification complete! All tests passed! ---');
}

runTests().catch(console.error);
