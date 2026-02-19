// services/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Save or update user lead data
 */
async function saveLead(data) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  
  try {
    const { data: result, error } = await supabase
      .from('leads')
      .upsert({
        phone: data.phone,
        name: data.name || null,
        occupation: data.occupation || null,
        budget: data.budget || null,
        need: data.need || null,
        timeline: data.timeline || null,
        status: data.status || 'new',
        last_contact: new Date().toISOString(),
        source: 'whatsapp_bot'
      }, {
        onConflict: 'phone'
      });

    if (error) throw error;
    return { ok: true, data: result };
  } catch (error) {
    console.error('❌ Save Lead Error:', error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * Get user lead by phone
 */
async function getLeadByPhone(phone) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { ok: true, data: data || null };
  } catch (error) {
    console.error('❌ Get Lead Error:', error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * Update lead status
 */
async function updateLeadStatus(phone, status) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({ 
        status,
        last_contact: new Date().toISOString()
      })
      .eq('phone', phone);

    if (error) throw error;
    return { ok: true, data };
  } catch (error) {
    console.error('❌ Update Lead Status Error:', error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * Save conversation message
 */
async function saveConversation(data) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  
  try {
    const { data: result, error } = await supabase
      .from('conversations')
      .insert({
        phone: data.phone,
        role: data.role,
        message: data.message,
        intent: data.intent || null,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return { ok: true, data: result };
  } catch (error) {
    console.error('❌ Save Conversation Error:', error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * Get conversation history from database (Last 10 messages)
 */
async function getConversationHistory(phone, limit = 10) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Reverse to get chronological order
    const history = data ? data.reverse() : [];
    return { ok: true, data: history };
  } catch (error) {
    console.error('❌ Get Conversation History Error:', error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * Format conversation history for AI prompt
 */
function formatHistoryForPrompt(conversations) {
// services/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Save or update user lead data
 */
async function saveLead(data) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  
  try {
    const { data: result, error } = await supabase
      .from('leads')
      .upsert({
        phone: data.phone,
        name: data.name || null,
        occupation: data.occupation || null,
        budget: data.budget || null,
        need: data.need || null,
        timeline: data.timeline || null,
        status: data.status || 'new',
        last_contact: new Date().toISOString(),
        source: 'whatsapp_bot'
      }, {
        onConflict: 'phone'
      });

    if (error) throw error;
    return { ok: true, data: result };
  } catch (error) {
    console.error('❌ Save Lead Error:', error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * Get user lead by phone
 */
async function getLeadByPhone(phone) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { ok: true, data: data || null };
  } catch (error) {
    console.error('❌ Get Lead Error:', error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * Update lead status
 */
async function updateLeadStatus(phone, status) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({ 
        status,
        last_contact: new Date().toISOString()
      })
      .eq('phone', phone);

    if (error) throw error;
    return { ok: true, data };
  } catch (error) {
    console.error('❌ Update Lead Status Error:', error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * Save conversation message
 */
async function saveConversation(data) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  
  try {
    const { data: result, error } = await supabase
      .from('conversations')
      .insert({
        phone: data.phone,
        role: data.role,
        message: data.message,
        intent: data.intent || null,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return { ok: true, data: result };
  } catch (error) {
    console.error('❌ Save Conversation Error:', error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * Get conversation history from database (Last 10 messages)
 */
async function getConversationHistory(phone, limit = 10) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Reverse to get chronological order
    const history = data ? data.reverse() : [];
    return { ok: true, data: history };
  } catch (error) {
    console.error('❌ Get Conversation History Error:', error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * Format conversation history for AI prompt
 */
function formatHistoryForPrompt(conversations) {
  if (!conversations || conversations.length === 0) {
    return '• Percakapan baru dimulai';
  }
  
  return conversations.map(c => 
    `${c.role === 'user' ? 'User' : 'AI'}: ${c.message}`
  ).join('\n');
}

/**
 * Check if user is new or returning
 */
async function checkUserStatus(phone) {
  const leadResult = await getLeadByPhone(phone);
  
  if (!leadResult.ok || !leadResult.data) {
    return { isNew: true, data: null };
  }
  
  const hasName = leadResult.data.name && leadResult.data.name.trim() !== '';
  const hasBudget = leadResult.data.budget && leadResult.data.budget.trim() !== '';
  
  return {
    isNew: false,
    data: leadResult.data,
    isComplete: hasName && hasBudget,
    missingFields: {
      name: !hasName,
      budget: !hasBudget,
      occupation: !leadResult.data.occupation,
      need: !leadResult.data.need
    }
  };
}

/**
 * Get next field to collect from user
 */
function getNextFieldToCollect(userStatus) {
  if (userStatus.isNew) return 'name';
  if (userStatus.missingFields.name) return 'name';
  if (userStatus.missingFields.occupation) return 'occupation';
  if (userStatus.missingFields.budget) return 'budget';
  if (userStatus.missingFields.need) return 'need';
  return null;
}

module.exports = {
  supabase,
  saveLead,
  getLeadByPhone,
  updateLeadStatus,
  saveConversation,
  getConversationHistory,
  formatHistoryForPrompt,
  checkUserStatus,
  getNextFieldToCollect
};    return '• Percakapan baru dimulai';
  }
  
  return conversations.map(c => 
    `${c.role === 'user' ? 'User' : 'AI'}: ${c.message}`
  ).join('\n');
}

/**
 * Check if user is new or returning
 */
async function checkUserStatus(phone) {
  const leadResult = await getLeadByPhone(phone);
  
  if (!leadResult.ok || !leadResult.data) {
    return { isNew: true, data: null };
  }
  
  const hasName = leadResult.data.name && leadResult.data.name.trim() !== '';
  const hasBudget = leadResult.data.budget && leadResult.data.budget.trim() !== '';
  
  return {
    isNew: false,
    data: leadResult.data,
    isComplete: hasName && hasBudget,
    missingFields: {
      name: !hasName,
      budget: !hasBudget,
      occupation: !leadResult.data.occupation,
      need: !leadResult.data.need
    }
  };
}

/**
 * Get next field to collect from user
 */
function getNextFieldToCollect(userStatus) {
  if (userStatus.isNew) return 'name';
  if (userStatus.missingFields.name) return 'name';
  if (userStatus.missingFields.occupation) return 'occupation';
  if (userStatus.missingFields.budget) return 'budget';
  if (userStatus.missingFields.need) return 'need';
  return null;
}

module.exports = {
  supabase,
  saveLead,
  getLeadByPhone,
  updateLeadStatus,
  saveConversation,
  getConversationHistory,
  formatHistoryForPrompt,
  checkUserStatus,
  getNextFieldToCollect
};