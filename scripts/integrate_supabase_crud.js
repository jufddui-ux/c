const fs = require('fs');

['backend/server.js', 'server.js'].forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add auto-seed block right after isSupabaseActive check
  const seedBlock = `
if (isSupabaseActive) {
  (async () => {
    try {
      const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
      if (!error && (count === 0 || count === null)) {
        const bundled = readData(PRODUCTS_FILE, []);
        if (bundled.length > 0) {
          await supabase.from('products').insert(bundled);
          console.log(\`✅ Seeded Supabase with \${bundled.length} initial products\`);
        }
      }
    } catch (e) {
      console.log('Supabase auto-seed note:', e.message);
    }
  })();
}
`;

  if (!content.includes('Seeded Supabase with')) {
    content = content.replace(
      'console.log(\'⚡ Supabase Cloud PostgreSQL Active (Zero Firewall Friction)\');',
      'console.log(\'⚡ Supabase Cloud PostgreSQL Active (Zero Firewall Friction)\');' + seedBlock
    );
  }

  // Hook GET /api/products
  const getProductsTarget = `    let products = [];
    if (isMongoConnected) {`;
  const getProductsReplacement = `    let products = [];
    if (isSupabaseActive) {
      try {
        let query = supabase.from('products').select('*');
        if (category && category !== 'all') {
          query = query.eq('category', category);
        }
        if (search) {
          query = query.ilike('title', \`%\${search.trim()}%\`);
        }
        if (sort === 'price-low') query = query.order('price', { ascending: true });
        else if (sort === 'price-high') query = query.order('price', { ascending: false });
        else query = query.order('createdAt', { ascending: false });
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          products = data;
        } else {
          // If empty in Supabase, fallback to bundled file
          products = readData(PRODUCTS_FILE, []);
        }
      } catch(err) {
        console.error('Supabase fetch error, fallback to file:', err.message);
        products = readData(PRODUCTS_FILE, []);
      }
    } else if (isMongoConnected) {`;

  if (content.includes(getProductsTarget)) {
    content = content.replace(getProductsTarget, getProductsReplacement);
  }

  // Hook POST /api/products
  const postProductTarget = `  try {
    if (isMongoConnected) {
      await MongoProduct.create(newProduct);
    }`;
  const postProductReplacement = `  try {
    if (isSupabaseActive) {
      try {
        await supabase.from('products').insert([newProduct]);
      } catch(e) {
        console.error('Supabase product insert error:', e.message);
      }
    }
    if (isMongoConnected) {
      await MongoProduct.create(newProduct);
    }`;

  if (content.includes(postProductTarget)) {
    content = content.replace(postProductTarget, postProductReplacement);
  }

  // Hook PUT /api/products/:id
  const putProductTarget = `    if (isMongoConnected) {
      await MongoProduct.findOneAndUpdate({ id: req.params.id }, updated, { new: true });
    }`;
  const putProductReplacement = `    if (isSupabaseActive) {
      try {
        await supabase.from('products').update(updated).eq('id', req.params.id);
      } catch(e) {
        console.error('Supabase product update error:', e.message);
      }
    }
    if (isMongoConnected) {
      await MongoProduct.findOneAndUpdate({ id: req.params.id }, updated, { new: true });
    }`;

  if (content.includes(putProductTarget)) {
    content = content.replace(putProductTarget, putProductReplacement);
  }

  // Hook DELETE /api/products/:id
  const delProductTarget = `  try {
    if (isMongoConnected) {
      await MongoProduct.deleteOne({ id: req.params.id });
    }`;
  const delProductReplacement = `  try {
    if (isSupabaseActive) {
      try {
        await supabase.from('products').delete().eq('id', req.params.id);
      } catch(e) {
        console.error('Supabase product delete error:', e.message);
      }
    }
    if (isMongoConnected) {
      await MongoProduct.deleteOne({ id: req.params.id });
    }`;

  if (content.includes(delProductTarget)) {
    content = content.replace(delProductTarget, delProductReplacement);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Integrated Supabase CRUD into', filePath);
});

