/* script.js */
(function(){
  /* ---------- Sample product DB (در پروژه واقعی از سرور خواهید گرفت) ---------- */
  const PRODUCTS = {
    "p1": {
      id:"p1", title:"گلدان سفالی دست‌ساز", price:240000,
      desc:"شیرنی خوانساری",
      images:["images/p1.jpg","images/p1-2.jpg","images/p1-3.jpg"],
      variants:{color:["سفید","قهوه‌ای"], size:["کوچک","متوسط","بزرگ"]},
      specs:{وزن:"800 گرم",ابعاد:"20x12x12 cm",مواد:"سفال"},
      category:"سرامیک"
    },
    "p2": {
      id:"p2", title:"تابلو نقاشی محلی", price:480000,
      desc:"تابلوی دست‌ساز با نقوش محلی و رنگ طبیعی.",
      images:["images/p2.jpg","images/p2-2.jpg"],
      variants:{color:["طبیعی"], size:["متوسط"]},
      specs:{ابعاد:"40x30 cm",مواد:"رنگ طبیعی روی بوم"},
      category:"منسوجات"
    },
    "p3": {
      id:"p3", title:"کیف چرمی روستایی", price:790000,
      desc:"کیف چرمیِ دست‌دوز با دوخت سنتی.",
      images:["images/p3.jpg","images/p3-2.jpg"],
      variants:{color:["خرمایی","قهوه‌ای تیره"], size:["یک اندازه"]},
      specs:{وزن:"600 گرم",ابعاد:"28x20 cm",مواد:"چرم طبیعی"},
      category:"چرم"
    }
  };

  /* ---------- Utilities ---------- */
  const q = s => document.querySelector(s);
  const qs = s => Array.from(document.querySelectorAll(s));
  const formatPrice = v => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " تومان";

  /* ---------- CART (localStorage) ---------- */
  const CART_KEY = 'hc_cart_v1';
  function loadCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCartCount(); }
  function addToCart(item){
    const cart = loadCart();
    const found = cart.find(i=>i.id===item.id && i.color===item.color && i.size===item.size);
    if(found) found.qty += item.qty;
    else cart.push(item);
    saveCart(cart);
  }
  function updateCartCount(){
    const count = loadCart().reduce((s,i)=>s+i.qty,0);
    qs('#cart-count, #cart-count-2, #cart-count-3').forEach(el=>{ if(el) el.textContent = count; });
  }

  /* ---------- Page Init ---------- */
  document.addEventListener('DOMContentLoaded', ()=>{
    // loader hide delay
    setTimeout(()=> document.body.classList.add('loaded'), 700);

    // mobile nav
    const mobileToggle = q('#mobile-toggle');
    if(mobileToggle){
      mobileToggle.addEventListener('click', ()=>{
        const nav = q('#main-nav');
        if(nav) nav.classList.toggle('open');
      });
    }

    updateCartCount();
    initIndex();
    initShop();
    initProduct();
    initCart();
    initCheckout();
    initContact();
    initTracking();
    initSubscribe();
  });

  /* ---------- INDEX: nothing special (buttons wired in html) ---------- */
  function initIndex(){ /* placeholder */ }

  /* ---------- SHOP ---------- */
  function initShop(){
    const productList = q('#product-list');
    if(!productList) return;
    function render(products){
      productList.innerHTML = '';
      Object.values(products).forEach(p=>{
        const card = document.createElement('article');
        card.className='product-card';
        card.innerHTML = `
          <div class="thumb"><img src="${p.images[0]}" alt="${p.title}"></div>
          <h4>${p.title}</h4>
          <p class="price">${formatPrice(p.price)}</p>
          <div class="card-actions">
            <a class="btn sm" href="product.html?id=${p.id}">مشاهده</a>
            <button class="btn sm outline add-to-cart" data-id="${p.id}">افزودن</button>
          </div>
        `;
        productList.appendChild(card);
      });
      // attach add-to-cart
      qs('.add-to-cart').forEach(btn=>{
        btn.addEventListener('click', e=>{
          const id = btn.dataset.id;
          const product = PRODUCTS[id];
          addToCart({id:product.id, title:product.title, price:product.price, qty:1, color:(product.variants.color[0]||''), size:(product.variants.size[0]||'')});
          alert('محصول به سبد اضافه شد');
        });
      });
    }

    // filters
    const search = q('#search-input');
    const cat = q('#cat-filter');
    const sort = q('#sort-filter');
    function filterAndRender(){
      let list = Object.values(PRODUCTS);
      if(search && search.value.trim()) list = list.filter(p=>p.title.includes(search.value.trim()));
      if(cat && cat.value) list = list.filter(p=>p.category===cat.value);
      if(sort){
        if(sort.value==='price-asc') list.sort((a,b)=>a.price-b.price);
        if(sort.value==='price-desc') list.sort((a,b)=>b.price-a.price);
      }
      render(Object.fromEntries(list.map(p=>[p.id,p])));
    }
    [search,cat,sort].forEach(el=>{ if(el) el.addEventListener('input', filterAndRender) });
    filterAndRender();
  }

  /* ---------- PRODUCT PAGE ---------- */
  function initProduct(){
    const section = q('#product-section');
    if(!section) return;
    const params = new URLSearchParams(location.search);
    const id = params.get('id') || 'p1';
    const product = PRODUCTS[id];
    if(!product) return;

    q('#product-title').textContent = product.title;
    q('#product-desc').textContent = product.desc;
    q('#product-price').textContent = formatPrice(product.price);

    // gallery
    const mainImg = q('#main-product-img');
    const thumbs = q('#thumbs');
    thumbs.innerHTML = '';
    product.images.forEach((src,i)=>{
      const img = document.createElement('img');
      img.src = src; img.alt = product.title + ' ' + (i+1);
      if(i===0) img.classList.add('active');
      img.addEventListener('click', ()=>{ mainImg.src=src; qs('.thumbs img').forEach(t=>t.classList.remove('active')); img.classList.add('active'); });
      thumbs.appendChild(img);
    });
    mainImg.src = product.images[0];

    // variants
    const vcolor = q('#variant-color');
    const vsize = q('#variant-size');
    product.variants.color.forEach(c=>{ const o=document.createElement('option'); o.textContent=c; vcolor.appendChild(o); });
    product.variants.size.forEach(s=>{ const o=document.createElement('option'); o.textContent=s; vsize.appendChild(o); });

    // specs
    const specsT = q('#specs-table');
    specsT.innerHTML = '';
    for(const k in product.specs){
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${k}</td><td>${product.specs[k]}</td>`;
      specsT.appendChild(tr);
    }

    // reviews (localStorage by product)
    const reviewsKey = 'reviews_'+product.id;
    const reviewsList = q('#reviews-list');
    function loadReviews(){
      const arr = JSON.parse(localStorage.getItem(reviewsKey)||'[]');
      reviewsList.innerHTML = arr.map(r=>`<div class="review"><strong>${r.name||'کاربر'}</strong> — <span class="small-muted">${r.date}</span><p>${r.text}</p></div>`).join('');
    }
    loadReviews();
    q('#add-review').addEventListener('click', ()=>{
      const txt = q('#review-text').value.trim();
      if(!txt){ alert('نظر نمی‌تواند خالی باشد'); return; }
      const arr = JSON.parse(localStorage.getItem(reviewsKey)||'[]');
      arr.unshift({name:'مشتری', text:txt, date:new Date().toLocaleString()});
      localStorage.setItem(reviewsKey, JSON.stringify(arr));
      q('#review-text').value=''; loadReviews();
      alert('نظر ثبت شد');
    });

    // add to cart
    q('#add-to-cart-btn').addEventListener('click', ()=>{
      const item = {id:product.id, title:product.title, price:product.price, qty:1, color:vcolor.value, size:vsize.value};
      addToCart(item);
      alert('به سبد خرید اضافه شد');
    });
  }

  /* ---------- CART PAGE ---------- */
  function initCart(){
    const body = q('#cart-body');
    if(!body) return;
    function render(){
      const cart = loadCart();
      body.innerHTML = '';
      if(cart.length===0){
        body.innerHTML = '<tr><td colspan="5">سبد خرید خالی است.</td></tr>';
        q('#cart-total').textContent = '۰ تومان';
        return;
      }
      let total = 0;
      cart.forEach((it,idx)=>{
        const row = document.createElement('tr');
        const sum = it.price * it.qty;
        total += sum;
        row.innerHTML = `
          <td>${it.title}<div class="small-muted">رنگ: ${it.color} — اندازه: ${it.size}</div></td>
          <td>${formatPrice(it.price)}</td>
          <td><input type="number" min="1" value="${it.qty}" data-idx="${idx}" class="qty-input" style="width:80px;padding:6px;border-radius:6px"></td>
          <td>${formatPrice(sum)}</td>
          <td><button class="btn sm outline remove" data-idx="${idx}">حذف</button></td>
        `;
        body.appendChild(row);
      });
      q('#cart-total').textContent = formatPrice(total);
      // events
      qs('.qty-input').forEach(inp=>inp.addEventListener('change', e=>{
        const idx = +e.target.dataset.idx;
        const val = Math.max(1, +e.target.value);
        const cart = loadCart();
        cart[idx].qty = val;
        saveCart(cart);
        render();
      }));
      qs('.remove').forEach(btn=>btn.addEventListener('click', e=>{
        const idx = +e.target.dataset.idx;
        const cart = loadCart();
        cart.splice(idx,1); saveCart(cart); render();
      }));
    }
    render();

    // export CSV (sales report mock)
    const exportBtn = q('#export-sales');
    if(exportBtn){
      exportBtn.addEventListener('click', ()=>{
        const cart = loadCart();
        if(cart.length===0){ alert('سبد خرید خالی است'); return; }
        // create CSV content
        let csv = 'id,title,price,qty,total\n';
        cart.forEach(it=> csv += `${it.id},"${it.title}",${it.price},${it.qty},${it.price*it.qty}\n`);
        // download
        const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'sales_report.csv'; a.click(); URL.revokeObjectURL(url);
      });
    }
  }

  /* ---------- CHECKOUT ---------- */
  function initCheckout(){
    const form = q('#checkout-form');
    if(!form) return;
    // calculate sums from cart
    function refreshTotals(){
      const cart = loadCart();
      const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
      q('#checkout-subtotal').textContent = formatPrice(subtotal);
      const shipSel = q('#shipping-method');
      const shipCost = +shipSel.selectedOptions[0].dataset.cost;
      q('#checkout-shipping').textContent = formatPrice(shipCost);
      q('#checkout-total').textContent = formatPrice(subtotal + shipCost);
    }
    refreshTotals();
    q('#shipping-method').addEventListener('change', refreshTotals);

    form.addEventListener('submit', e=>{
      e.preventDefault();
      // gather
      const name = q('#cust-name').value.trim();
      const phone = q('#cust-phone').value.trim();
      const address = q('#cust-address').value.trim();
      if(!name||!phone||!address){ alert('لطفاً فیلدها را پر کنید'); return; }
      // create order (mock)
      const orderId = 'ORD' + Date.now();
      // save order to localStorage
      const orders = JSON.parse(localStorage.getItem('orders')||'[]');
      const cart = loadCart();
      const shipEl = q('#shipping-method').selectedOptions[0];
      const shipCost = +shipEl.dataset.cost;
      const total = cart.reduce((s,i)=>s+i.price*i.qty,0) + shipCost;
      orders.unshift({id:orderId,name,phone,address,items:cart,shipping:shipEl.value,total,created:new Date().toLocaleString(),status:'درحال پردازش'});
      localStorage.setItem('orders', JSON.stringify(orders));
      // clear cart
      saveCart([]);
      // mock payment result
      alert('پرداخت شبیه‌سازی شده انجام شد. کد سفارش: ' + orderId);
      // simulate SMS
      mockSendSMS(phone, `سفارش شما با کد ${orderId} ثبت شد. مبلغ ${formatPrice(total)}`);
      // redirect to tracking
      location.href = 'tracking.html?order=' + orderId;
    });
  }

  /* ---------- CONTACT ---------- */
  function initContact(){
    const form = q('#contact-form');
    if(!form) return;
    form.addEventListener('submit', e=>{
      e.preventDefault();
      alert('پیام شما ثبت شد. به زودی با شما تماس می‌گیریم.');
      form.reset();
    });
  }

  /* ---------- TRACKING ---------- */
  function initTracking(){
    const form = q('#track-form');
    const out = q('#track-result');
    if(!form) return;
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const id = q('#track-id').value.trim() || new URLSearchParams(location.search).get('order');
      if(!id){ out.innerHTML = '<p class="small-muted">کدی وارد نشده است.</p>'; return; }
      const orders = JSON.parse(localStorage.getItem('orders')||'[]');
      const order = orders.find(o=>o.id === id);
      if(!order){ out.innerHTML = `<p>سفارشی با کد ${id} پیدا نشد.</p>`; return; }
      out.innerHTML = `
        <h3>وضعیت سفارش ${order.id}</h3>
        <p>نام: ${order.name}</p>
        <p>تاریخ: ${order.created}</p>
        <p>وضعیت: <strong>${order.status}</strong></p>
        <p>جمع کل: ${formatPrice(order.total)}</p>
      `;
    });
  }

  /* ---------- SUBSCRIBE ---------- */
  function initSubscribe(){
    const f = q('#subscribe-form');
    if(!f) return;
    f.addEventListener('submit', e=>{
      e.preventDefault();
      alert('از عضویت شما سپاس‌گزاریم!');
      f.reset();
    });
  }

  /* ---------- MOCK SMS SENDER ---------- */
  function mockSendSMS(phone, text){
    // شبیه‌سازی ارسال پیامک — در حالت واقعی از API پیامک استفاده شود
    console.info('SMS to', phone, text);
    // نمایش کوچک در صفحه (اختیاری)
    const el = document.createElement('div');
    el.style.position='fixed';el.style.bottom='20px';el.style.left='20px';el.style.background='rgba(0,0,0,0.7)';el.style.color='#fff';
    el.style.padding='10px 14px';el.style.borderRadius='8px';el.style.zIndex=99999;el.textContent='پیامک: '+text;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),3000);
  }

  /* expose addToCart for index product buttons */
  window.addToCart = addToCart;
})();
