const fs = require('fs');

['backend/server.js', 'server.js'].forEach(f => {
  let code = fs.readFileSync(f, 'utf8');

  // Wire Supabase into GET /api/orders
  const getOrdersTarget = `  try {
    let orders = [];
    if (isMongoConnected) {`;
  const getOrdersReplacement = `  try {
    let orders = [];
    if (isSupabaseActive) {
      try {
        const { data, error } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
        if (!error && data) orders = data;
      } catch(e) {}
    } else if (isMongoConnected) {`;
  if (code.includes(getOrdersTarget)) code = code.replace(getOrdersTarget, getOrdersReplacement);

  // Wire Supabase into POST /api/orders
  const postOrdersTarget = `  try {
    if (isMongoConnected) {
      await MongoOrder.create(newOrder);
    }`;
  const postOrdersReplacement = `  try {
    if (isSupabaseActive) {
      try { await supabase.from('orders').insert([newOrder]); } catch(e) {}
    }
    if (isMongoConnected) {
      await MongoOrder.create(newOrder);
    }`;
  if (code.includes(postOrdersTarget)) code = code.replace(postOrdersTarget, postOrdersReplacement);

  // Wire Supabase into PUT /api/orders/:id/status
  const putOrdersTarget = `  try {
    const { status, paymentStatus } = req.body;
    let order = null;
    if (isMongoConnected) {`;
  const putOrdersReplacement = `  try {
    const { status, paymentStatus } = req.body;
    let order = null;
    if (isSupabaseActive) {
      try {
        const updatePayload = { ...(status && { status }), ...(paymentStatus && { paymentStatus }), updatedAt: new Date().toISOString() };
        const { data } = await supabase.from('orders').update(updatePayload).eq('id', req.params.id).select();
        if (data && data[0]) order = data[0];
      } catch(e) {}
    }
    if (isMongoConnected) {`;
  if (code.includes(putOrdersTarget)) code = code.replace(putOrdersTarget, putOrdersReplacement);

  // Wire Supabase into DELETE /api/orders/:id
  const delOrdersTarget = `  try {
    if (isMongoConnected) {
      await MongoOrder.deleteOne({ id: req.params.id });
    }`;
  const delOrdersReplacement = `  try {
    if (isSupabaseActive) {
      try { await supabase.from('orders').delete().eq('id', req.params.id); } catch(e) {}
    }
    if (isMongoConnected) {
      await MongoOrder.deleteOne({ id: req.params.id });
    }`;
  if (code.includes(delOrdersTarget)) code = code.replace(delOrdersTarget, delOrdersReplacement);

  // Wire Supabase into GET /api/settings
  const getSettingsTarget = `  try {
    let settings = {};
    if (isMongoConnected) {`;
  const getSettingsReplacement = `  try {
    let settings = {};
    if (isSupabaseActive) {
      try {
        const { data } = await supabase.from('settings').select('*').eq('key', 'store_settings').single();
        if (data && data.data) settings = data.data;
      } catch(e) {}
    } else if (isMongoConnected) {`;
  if (code.includes(getSettingsTarget)) code = code.replace(getSettingsTarget, getSettingsReplacement);

  // Wire Supabase into PUT /api/settings
  const putSettingsTarget = `    if (isMongoConnected) {
      await MongoSetting.findOneAndUpdate(
        { key: 'store_settings' },
        { key: 'store_settings', data: updated },
        { upsert: true }
      );
    }`;
  const putSettingsReplacement = `    if (isSupabaseActive) {
      try {
        await supabase.from('settings').upsert({ key: 'store_settings', data: updated });
      } catch(e) {}
    }
    if (isMongoConnected) {
      await MongoSetting.findOneAndUpdate(
        { key: 'store_settings' },
        { key: 'store_settings', data: updated },
        { upsert: true }
      );
    }`;
  if (code.includes(putSettingsTarget)) code = code.replace(putSettingsTarget, putSettingsReplacement);

  fs.writeFileSync(f, code, 'utf8');
  console.log('Successfully wired Supabase orders and settings in', f);
});

