const API = path => '/api/' + path;
const token = localStorage.getItem('token') || '';
const headers = {
  'Content-Type': 'application/json',
  'x-admin-token': token
};

// alert stok menipis
async function loadLowStock() {
  const resp = await fetch(API('low-stock'), { headers });
  const list = await resp.json();
  const alertEl = document.getElementById('low-stock-alert');
  if (alertEl && list.length) {
    alertEl.innerHTML = `<p>⚠️ ${list.length} produk stok menipis!</p>`;
  }
}

// kategori
async function loadKategori() {
  const resp = await fetch(API('kategori'), { headers });
  const ks = await resp.json();
  const ul = document.getElementById('list-kat');
  const sel = document.getElementById('p-kat');
  if (!ul || !sel) return;
  ul.innerHTML = '';
  sel.innerHTML = '';
  ks.forEach(k => {
    ul.innerHTML += `<li>${k.nama}
      <button onclick="delKat('${k._id}')">✖️</button></li>`;
    sel.innerHTML += `<option value="${k._id}">${k.nama}</option>`;
  });
}

async function addKategori() {
  const namaEl = document.getElementById('new-kat');
  if (!namaEl) return;
  const nama = namaEl.value;
  await fetch(API('kategori'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ nama })
  });
  loadKategori();
}

async function delKat(id) {
  await fetch(API('kategori/' + id), { method: 'DELETE', headers });
  loadKategori();
}

// produk
async function loadProduk() {
  const resp = await fetch(API('produk'), { headers });
  const ps = await resp.json();
  const ul = document.getElementById('list-produk');
  if (!ul) return;
  ul.innerHTML = '';
  ps.forEach(p => {
    ul.innerHTML += `<li>${p.nama} (Stok: ${p.stok})
      <button onclick="delProd('${p._id}')">✖️</button></li>`;
  });
}

async function addProduk() {
  const namaEl  = document.getElementById('p-nama');
  const stokEl  = document.getElementById('p-stok');
  const hargaEl = document.getElementById('p-harga');
  const katEl   = document.getElementById('p-kat');
  if (!namaEl || !stokEl || !hargaEl || !katEl) return;

  const nama  = namaEl.value;
  const stok  = Number(stokEl.value);
  const harga = Number(hargaEl.value);
  const kat   = katEl.value;

  await fetch(API('produk'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ nama, stok, harga, kategori: kat })
  });
  loadProduk();
  loadLowStock();
}

async function delProd(id) {
  await fetch(API('produk/' + id), { method: 'DELETE', headers });
  loadProduk();
}

// supplier
async function loadSupplier() {
  const resp = await fetch(API('supplier'), { headers });
  const ss = await resp.json();
  const ul = document.getElementById('list-supplier');
  if (!ul) return;
  ul.innerHTML = '';
  ss.forEach(s => {
    ul.innerHTML += `<li>
      ${s.nama} — ${s.kontak} 
      <button onclick="delSupplier('${s._id}')">✖️</button>
    </li>`;
  });
}

async function addSupplier() {
  const namaEl   = document.getElementById('new-supplier-nama');
  const alamatEl = document.getElementById('new-supplier-alamat');
  const kontakEl = document.getElementById('new-supplier-kontak');
  if (!namaEl || !alamatEl || !kontakEl) return;

  const nama   = namaEl.value;
  const alamat = alamatEl.value;
  const kontak = kontakEl.value;

  await fetch(API('supplier'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ nama, alamat, kontak })
  });
  loadSupplier();
}

async function delSupplier(id) {
  await fetch(API('supplier/' + id), { method: 'DELETE', headers });
  loadSupplier();
}

// Transaksi Penjualan
let cart = [];

async function loadProdukForTx() {
  const resp = await fetch(API('produk'), { headers });
  const ps = await resp.json();
  const sel = document.getElementById('tx-produk');
  if (!sel) return;
  sel.innerHTML = '';
  ps.forEach(p => {
    sel.innerHTML += `<option value="${p._id}">${p.nama} (Rp${p.harga})</option>`;
  });
}

function addItem() {
  const selEl    = document.getElementById('tx-produk');
  const jumlahEl = document.getElementById('tx-jumlah');
  const jenisEl  = document.getElementById('jenispembayaran');
  if (!selEl || !jumlahEl || !jenisEl) return;

  const pid    = selEl.value;
  const jumlah = Number(jumlahEl.value);
  const jenis  = jenisEl.value;
  cart.push({ produk: pid, jumlah, jenisPembayaran: jenis });
  renderCart();
}

function renderCart() {
  const ul = document.getElementById('list-items');
  if (!ul) return;
  ul.innerHTML = '';
  cart.forEach((it, i) => {
    ul.innerHTML += `<li>
      ${it.jumlah} × ${it.jenisPembayaran} 
      <button onclick="removeItem(${i})">✖️</button>
    </li>`;
  });
}

function removeItem(idx) {
  cart.splice(idx, 1);
  renderCart();
}

async function submitTransaksi() {
  const pembeliEl = document.getElementById('pembeli');
  if (!pembeliEl) return;
  const pembeli = pembeliEl.value;
  await fetch(API('penjualan'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ pembeli, items: cart })
  });
  cart = [];
  renderCart();
  loadLowStock();
  loadPenjualan();
}

async function loadPenjualan() {
  const resp = await fetch(API('penjualan'), { headers });
  const ls   = await resp.json();
  const ul   = document.getElementById('list-penjualan');
  if (!ul) return;
  ul.innerHTML = '';
  ls.forEach(tx => {
    ul.innerHTML += `<li>
      ${new Date(tx.tanggal).toLocaleString()} —
      ${tx.pembeli} (Total: Rp${tx.totalHarga})
    </li>`;
  });
}

// ===== Transaksi Pembelian =====
let purchaseCart = [];

async function loadSuppliersForTx() {
  // reuse API /api/supplier
  const resp = await fetch(API('supplier'), { headers });
  const ss = await resp.json();
  const sel = document.getElementById('tx-supplier');
  if (!sel) return;
  sel.innerHTML = '<option value="">--Pilih Supplier--</option>';
  ss.forEach(s => {
    sel.innerHTML += `<option value="${s._id}">${s.nama}</option>`;
  });
}

async function loadProdukForPembelian() {
  const resp = await fetch(API('produk'), { headers });
  const ps = await resp.json();
  const sel = document.getElementById('txp-produk');
  if (!sel) return;
  sel.innerHTML = '';
  ps.forEach(p => {
    sel.innerHTML += `<option value="${p._id}">${p.nama}</option>`;
  });
}

function addItemPembelian() {
  const selP  = document.getElementById('txp-produk');
  const qtyEl = document.getElementById('txp-jumlah');
  const priceEl = document.getElementById('txp-harga');
  if (!selP || !qtyEl || !priceEl) return;

  const pid  = selP.value;
  const jumlah = Number(qtyEl.value);
  const hargaBeli = Number(priceEl.value);
  purchaseCart.push({ produk: pid, jumlah, hargaBeliSatuan: hargaBeli });
  renderCartPembelian();
}

function renderCartPembelian() {
  const ul = document.getElementById('list-items-pembelian');
  if (!ul) return;
  ul.innerHTML = '';
  purchaseCart.forEach((it, i) => {
    ul.innerHTML += `<li>
      ${it.jumlah} × (Rp${it.hargaBeliSatuan}) 
      <button onclick="removeItemPembelian(${i})">✖️</button>
    </li>`;
  });
}

function removeItemPembelian(idx) {
  purchaseCart.splice(idx, 1);
  renderCartPembelian();
}

async function submitPembelian() {
  const supEl = document.getElementById('tx-supplier');
  if (!supEl) return;
  const supplierId = supEl.value;
  await fetch(API('pembelian'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ supplierId, items: purchaseCart })
  });
  purchaseCart = [];
  renderCartPembelian();
  loadLowStock();       // stok sudah update
  loadPembelian();
}

async function loadPembelian() {
  const resp = await fetch(API('pembelian'), { headers });
  const ls   = await resp.json();
  const ul   = document.getElementById('list-pembelian');
  if (!ul) return;
  ul.innerHTML = '';
  ls.forEach(p => {
    const date = new Date(p.tanggal).toLocaleString();
    ul.innerHTML += `<li>
      ${date} — ${p.supplier.nama} (Total: Rp${p.totalHarga})
    </li>`;
  });
}

// Tambahkan ke init
window.onload = () => {
  loadLowStock();
  loadKategori();
  loadProduk();
  loadSupplier();
  loadProdukForTx();
  loadPenjualan();
  // baru:
  loadSuppliersForTx();
  loadProdukForPembelian();
  loadPembelian();
};

