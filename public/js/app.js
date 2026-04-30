/* ===== Industrial Belt Dashboard - Main App ===== */

let beltData = null;
let mapChart = null;
let currentUser = null;
const ITEMS_PER_PAGE = 5;
let categoryPageState = { belts: [], page: 1, category: '' };

// ===== Search Frequency =====
function getSearchFreq() {
  try { return JSON.parse(localStorage.getItem('searchFreq') || '{}'); } catch(e) { return {}; }
}
function recordSearch(q) {
  if (!q || q.length < 1) return;
  const freq = getSearchFreq();
  freq[q] = (freq[q] || 0) + 1;
  localStorage.setItem('searchFreq', JSON.stringify(freq));
  renderSearchTags();
}
function renderSearchTags() {
  const container = document.getElementById('searchTagsContainer');
  if (!container) return;
  const freq = getSearchFreq();
  const defaults = ['电子电器','五金工具','纺织服装','家具家居','义乌','深圳','汽配','灯具照明'];
  // Merge: sort by frequency desc, fill with defaults
  const entries = Object.entries(freq).sort((a,b) => b[1] - a[1]);
  const topKeys = entries.map(e => e[0]);
  const merged = [];
  const seen = new Set();
  for (const k of topKeys) { if (merged.length >= 8) break; if (!seen.has(k)) { merged.push(k); seen.add(k); } }
  for (const k of defaults) { if (merged.length >= 8) break; if (!seen.has(k)) { merged.push(k); seen.add(k); } }

  container.innerHTML = merged.map(q => {
    const count = freq[q] || 0;
    const hot = count >= 3 ? ' hot' : '';
    return `<span class="search-tag${hot}" data-q="${q}">${q}${count > 0 ? '<sup>' + count + '</sup>' : ''}</span>`;
  }).join('');

  container.querySelectorAll('.search-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.getElementById('searchInput').value = tag.dataset.q;
      doSearch(tag.dataset.q);
    });
  });
}

// ===== Auth =====
async function checkAuth() {
  try {
    const res = await fetch('/api/me');
    const data = await res.json();
    if (data.user) {
      showDashboard(data.user);
    }
  } catch (e) { /* not logged in */ }
}

async function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = '';
  if (!username || !password) { errorEl.textContent = '请输入用户名和密码'; return; }
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) { showDashboard(data.user); }
    else { errorEl.textContent = data.error || '登录失败'; }
  } catch (e) { errorEl.textContent = '网络错误，请重试'; }
}

async function register() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = '';
  if (!username || !password) { errorEl.textContent = '请输入用户名和密码'; return; }
  if (password.length < 6) { errorEl.textContent = '密码至少6位'; return; }
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) { showDashboard(data.user); }
    else { errorEl.textContent = data.error || '注册失败'; }
  } catch (e) { errorEl.textContent = '网络错误，请重试'; }
}

function showForgotForm() {
  document.getElementById('forgotPwForm').classList.add('show');
  document.getElementById('loginError').textContent = '';
  const u = document.getElementById('loginUsername').value.trim();
  if (u) document.getElementById('forgotUsername').value = u;
  document.getElementById('forgotUsername').focus();
}

function hideForgotForm() {
  document.getElementById('forgotPwForm').classList.remove('show');
  document.getElementById('forgotMsg').textContent = '';
  document.getElementById('forgotMsg').className = 'forgot-msg';
}

async function submitForgotPassword() {
  const username = document.getElementById('forgotUsername').value.trim();
  const msgEl = document.getElementById('forgotMsg');
  msgEl.textContent = '';
  msgEl.className = 'forgot-msg';
  if (!username) { msgEl.textContent = '请输入用户名'; msgEl.className = 'forgot-msg error'; return; }
  try {
    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    const data = await res.json();
    if (data.success) {
      msgEl.textContent = data.message || '请求已提交';
      msgEl.className = 'forgot-msg success';
      document.getElementById('forgotUsername').value = '';
    } else {
      msgEl.textContent = data.error || '提交失败';
      msgEl.className = 'forgot-msg error';
    }
  } catch (e) {
    msgEl.textContent = '网络错误，请重试';
    msgEl.className = 'forgot-msg error';
  }
}

async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('dashboard').classList.remove('active');
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
}

function showDashboard(user) {
  currentUser = user;
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('dashboard').classList.add('active');
  document.getElementById('userName').textContent = user.username;
  document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();
  // Show/hide admin-only features
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = user.role === 'admin' ? '' : 'none';
  });
  loadData();
}

// ===== Data Loading =====
async function loadData() {
  try {
    const res = await fetch('/api/industrial-belts');
    beltData = await res.json();
    renderStats();
    renderCategories();
    function tryInitMap() {
      if (window.__chinaMapReady) { initMap(); }
      else if (window.__chinaMapReady === false && typeof echarts !== 'undefined') { initMap(); }
      else { setTimeout(tryInitMap, 200); }
    }
    tryInitMap();
  } catch (e) {
    console.error('Failed to load data:', e);
  }
}

function renderStats() {
  const provinces = beltData.provinces.length;
  let belts = 0, suppliers = 0;
  beltData.provinces.forEach(p => {
    belts += p.belts.length;
    p.belts.forEach(b => suppliers += b.supplierCount);
  });
  animateNumber('statProvinces', provinces);
  animateNumber('statBelts', belts);
  animateNumber('statSuppliers', suppliers);
  animateNumber('statCategories', beltData.categories.length);
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  const duration = 1200;
  const start = performance.now();
  const fmt = target > 9999
    ? (n) => (n / 10000).toFixed(1) + '万+'
    : (n) => n.toLocaleString();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = fmt(Math.floor(target * eased));
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ===== Map show/hide =====
function showMapSection() {
  document.querySelector('.map-section').style.display = '';
  if (mapChart) mapChart.resize();
}

function hideMapSection() {
  document.querySelector('.map-section').style.display = 'none';
}

// ===== Categories Sidebar =====
function renderCategories() {
  const list = document.getElementById('categoryList');
  const categoryCounts = {};
  beltData.provinces.forEach(p => {
    p.belts.forEach(b => {
      if (!categoryCounts[b.category]) categoryCounts[b.category] = 0;
      categoryCounts[b.category]++;
    });
  });

  list.innerHTML = beltData.categories
    .filter(c => categoryCounts[c])
    .map(cat => `
      <div class="category-item" data-category="${cat}">
        <span class="category-name">${cat}</span>
        <span class="category-count">${categoryCounts[cat] || 0} 个产业带</span>
      </div>
    `).join('');

  list.querySelectorAll('.category-item').forEach(el => {
    el.addEventListener('click', () => {
      showCategoryBelts(el.dataset.category);
      closeSidebar();
    });
  });
}

function showCategoryBelts(category) {
  const belts = [];
  beltData.provinces.forEach(p => {
    p.belts.forEach(b => {
      if (b.category === category) {
        belts.push({ ...b, province: p.name });
      }
    });
  });
  belts.sort((a, b) => b.supplierCount - a.supplierCount);

  categoryPageState = { belts, page: 1, category };
  renderCategoryPage();

  document.getElementById('categoryResults').classList.add('active');
  document.getElementById('searchResults').classList.remove('active');
  hideMapSection();
  document.getElementById('categoryResults').scrollIntoView({ behavior: 'smooth' });
}

function renderCategoryPage() {
  const { belts, page, category } = categoryPageState;
  const totalPages = Math.ceil(belts.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const pageBelts = belts.slice(start, start + ITEMS_PER_PAGE);

  // Count total suppliers across all belts in this category
  let totalSuppliers = 0;
  belts.forEach(b => { totalSuppliers += (b.topSuppliers || []).length; });

  document.getElementById('categoryTitle').textContent = category + ' 产业带';
  document.getElementById('categoryCount').textContent = `共 ${belts.length} 个产业带 · ${totalSuppliers} 家供应商`;

  let html = '';

  // Render current page belts
  pageBelts.forEach(belt => {
    const suppliersHtml = (belt.topSuppliers || []).map(s => `
      <div class="supplier-card-mini">
        <div class="supplier-mini-name">${s.name}</div>
        <div class="supplier-mini-info">
          <span>注册: ${s.regTime || '-'}</span>
          <span>资本: ${s.regCapital || '-'}</span>
          <span>人数: ${s.employees || '-'}</span>
          <span>营业额: ${s.revenue || '-'}</span>
          <span>资质: ${s.qualification || '-'}</span>
        </div>
      </div>
    `).join('');

    html += `
    <div class="result-card" onclick='openBeltDetail(${JSON.stringify(belt).replace(/'/g, "&#39;")})'>
      <div class="result-header">
        <div class="result-name">${belt.name}</div>
        <div class="result-badge">${belt.province}</div>
      </div>
      <div class="result-meta">
        <span>📍 ${belt.location} · ${belt.county || ''}</span>
        <span>🏭 ${belt.supplierCount.toLocaleString()} 家供应商</span>
      </div>
      <div class="result-tags">
        ${(belt.tags || []).map(t => `<span class="result-tag">${t}</span>`).join('')}
      </div>
      <div class="belt-suppliers-preview">
        ${suppliersHtml}
      </div>
    </div>
    `;
  });

  // Pagination controls
  if (totalPages > 1) {
    html += '<div class="pagination">';
    html += `<button class="page-btn${page<=1?' disabled':''}" onclick="categoryGoPage(${page-1})">上一页</button>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn${i===page?' active':''}" onclick="categoryGoPage(${i})">${i}</button>`;
    }
    html += `<button class="page-btn${page>=totalPages?' disabled':''}" onclick="categoryGoPage(${page+1})">下一页</button>`;
    html += `<span class="page-info">第 ${page}/${totalPages} 页</span>`;
    html += '</div>';
  }

  document.getElementById('categoryBeltList').innerHTML = html;
}

function categoryGoPage(p) {
  const totalPages = Math.ceil(categoryPageState.belts.length / ITEMS_PER_PAGE);
  if (p < 1 || p > totalPages) return;
  categoryPageState.page = p;
  renderCategoryPage();
  document.getElementById('categoryResults').scrollIntoView({ behavior: 'smooth' });
}

// ===== Sidebar Toggle =====
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('show');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

// ===== Search =====
async function doSearch(query) {
  if (!query) return;
  recordSearch(query);
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    renderSearchResults(data.results, query);
  } catch (e) {
    console.error('Search failed:', e);
  }
}

function renderSearchResults(results, query) {
  let totalMatchedSuppliers = 0;
  results.forEach(r => { totalMatchedSuppliers += (r._matchedSupplierCount || 0); });
  const supplierNote = totalMatchedSuppliers > 0 ? ` · 匹配 ${totalMatchedSuppliers} 家供应商` : '';
  document.getElementById('resultsCount').textContent = `共 ${results.length} 个产业带${supplierNote}`;
  // External search links
  const eq = encodeURIComponent(query);
  const extLinksHtml = `
    <div class="ext-search-bar">
      <span class="ext-search-label">在外部平台搜索「${query}」：</span>
      <a class="ext-link-btn" href="https://www.tianyancha.com/search?key=${eq}" target="_blank">🔍 天眼查</a>
      <a class="ext-link-btn" href="https://www.qcc.com/web/search?key=${eq}" target="_blank">🔍 企查查</a>
      <a class="ext-link-btn" href="https://aiqicha.baidu.com/s?q=${eq}" target="_blank">🔍 爱企查</a>
      <a class="ext-link-btn" href="https://s.1688.com/selloffer/offer_search.htm?keywords=${eq}" target="_blank">🏪 1688</a>
      <a class="ext-link-btn" href="https://www.made-in-china.com/manufacturers/${eq}.html" target="_blank">🌐 中国制造网</a>
      <a class="ext-link-btn" href="https://www.baidu.com/s?wd=${eq}+供应商+厂家" target="_blank">🌐 百度</a>
      <a class="ext-link-btn" href="https://xin.baidu.com/s?q=${eq}" target="_blank">🏢 百度信用</a>
    </div>`;

  document.getElementById('resultsList').innerHTML = extLinksHtml + (results.length === 0
    ? '<div class="loading">本地未找到匹配，请点击上方外部平台查询更多供应商</div>'
    : results.map(r => {
      const matchCount = r._matchedSupplierCount || 0;
      const suppliersHtml = (r.topSuppliers || []).map((s, idx) => `
        <div class="supplier-card-mini${idx < matchCount ? ' matched' : ''}">
          <div class="supplier-mini-name">${s.name}</div>
          <div class="supplier-mini-info">
            <span>注册: ${s.regTime || '-'}</span>
            <span>资本: ${s.regCapital || '-'}</span>
            <span>人数: ${s.employees || '-'}</span>
            <span>营业额: ${s.revenue || '-'}</span>
            <span>资质: ${s.qualification || '-'}</span>
          </div>
        </div>
      `).join('');

      return `
      <div class="result-card" onclick='openBeltDetail(${JSON.stringify(r).replace(/'/g, "&#39;")})'>
        <div class="result-header">
          <div class="result-name">${r.name}</div>
          <div class="result-badge">${r.province}</div>
        </div>
        <div class="result-meta">
          <span>📍 ${r.location} · ${r.county || ''}</span>
          <span>🏭 ${r.supplierCount.toLocaleString()} 家供应商</span>
          <span>📦 ${r.category}</span>
        </div>
        <div class="result-tags">
          ${(r.tags || []).map(t => `<span class="result-tag">${t}</span>`).join('')}
        </div>
        <div class="belt-suppliers-preview">
          ${suppliersHtml}
        </div>
      </div>
      `;
    }).join(''));

  document.getElementById('searchResults').classList.add('active');
  document.getElementById('categoryResults').classList.remove('active');
  hideMapSection();
  document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });
}

// ===== Detail Panel =====
function openBeltDetail(belt) {
  document.getElementById('detailTitle').textContent = belt.name;
  document.getElementById('detailLocation').textContent =
    `${belt.province ? belt.province + ' · ' : ''}${belt.location} · ${belt.county || ''}`;

  document.getElementById('detailStats').innerHTML = `
    <div class="detail-stat">
      <div class="detail-stat-value">${belt.supplierCount.toLocaleString()}</div>
      <div class="detail-stat-label">供应商总数</div>
    </div>
    <div class="detail-stat">
      <div class="detail-stat-value">${(belt.topSuppliers || []).length}</div>
      <div class="detail-stat-label">核心供应商</div>
    </div>
    <div class="detail-stat">
      <div class="detail-stat-value">${belt.category}</div>
      <div class="detail-stat-label">主要品类</div>
    </div>
  `;

  document.getElementById('supplierList').innerHTML = (belt.topSuppliers || []).map(s => `
    <div class="supplier-card">
      <div class="supplier-name">${s.name}</div>
      <div class="supplier-grid">
        <div class="supplier-field">
          <div class="supplier-field-label">注册时间</div>
          <div class="supplier-field-value">${s.regTime || '-'}</div>
        </div>
        <div class="supplier-field">
          <div class="supplier-field-label">注册资本</div>
          <div class="supplier-field-value">${s.regCapital || '-'}</div>
        </div>
        <div class="supplier-field">
          <div class="supplier-field-label">实缴资本</div>
          <div class="supplier-field-value">${s.paidCapital || '-'}</div>
        </div>
        <div class="supplier-field">
          <div class="supplier-field-label">企业资质</div>
          <div class="supplier-field-value">${s.qualification || '-'}</div>
        </div>
        <div class="supplier-field">
          <div class="supplier-field-label">公司人数</div>
          <div class="supplier-field-value">${s.employees || '-'}</div>
        </div>
        <div class="supplier-field">
          <div class="supplier-field-label">年营业额</div>
          <div class="supplier-field-value">${s.revenue || '-'}</div>
        </div>
        <div class="supplier-field">
          <div class="supplier-field-label">联系方式</div>
          <div class="supplier-field-value">${s.contact || '-'}</div>
        </div>
        <div class="supplier-field">
          <div class="supplier-field-label">主营品类</div>
          <div class="supplier-field-value">${s.mainCategory || '-'}</div>
        </div>
        <div class="supplier-field" style="grid-column:1/-1">
          <div class="supplier-field-label">官网</div>
          <div class="supplier-field-value">${s.website ? `<a href="https://${s.website}" target="_blank">${s.website}</a>` : '-'}</div>
        </div>
        ${s.partners && s.partners.length > 0 ? `
        <div class="supplier-field supplier-partners">
          <div class="supplier-field-label">合作品牌/公司</div>
          <div class="supplier-field-value">
            ${s.partners.map(p => `<span class="partner-tag">${p}</span>`).join('')}
          </div>
        </div>` : ''}
      </div>
    </div>
  `).join('');

  const companyName = (belt.topSuppliers && belt.topSuppliers[0]) ? belt.topSuppliers[0].name : belt.name;
  const encodedName = encodeURIComponent(companyName);
  const encodedBelt = encodeURIComponent(belt.name);
  document.getElementById('externalLinks').innerHTML = `
    <a class="ext-link-btn" href="https://www.tianyancha.com/search?key=${encodedName}" target="_blank">🔍 天眼查</a>
    <a class="ext-link-btn" href="https://www.qcc.com/web/search?key=${encodedName}" target="_blank">🔍 企查查</a>
    <a class="ext-link-btn" href="https://aiqicha.baidu.com/s?q=${encodedName}" target="_blank">🔍 爱企查</a>
    <a class="ext-link-btn" href="https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(belt.category)}&spm=a260k.dacugeneral" target="_blank">🏪 1688 找货</a>
    <a class="ext-link-btn" href="https://www.baidu.com/s?wd=${encodedBelt}+供应商" target="_blank">🌐 百度搜索</a>
  `;

  document.getElementById('detailPanel').classList.add('open');
  document.getElementById('detailOverlay').classList.add('show');
}

function closeDetail() {
  document.getElementById('detailPanel').classList.remove('open');
  document.getElementById('detailOverlay').classList.remove('show');
}

// ===== Right Panel (Settings) =====
function toggleSettingsPanel() {
  const panel = document.getElementById('settingsPanel');
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    document.getElementById('settingsOverlay').classList.add('show');
  } else {
    document.getElementById('settingsOverlay').classList.remove('show');
  }
}

function closeSettings() {
  document.getElementById('settingsPanel').classList.remove('open');
  document.getElementById('settingsOverlay').classList.remove('show');
}

function switchSettingsTab(tab) {
  document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.settings-pane').forEach(p => p.classList.remove('active'));
  document.querySelector(`.settings-tab[data-tab="${tab}"]`).classList.add('active');
  document.getElementById('pane-' + tab).classList.add('active');

  if (tab === 'accounts') loadUserList();
  if (tab === 'files') loadFileList();
}

// -- Accounts --
async function createSubAccount() {
  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newPassword').value;
  const msgEl = document.getElementById('createAccountMsg');
  msgEl.textContent = '';
  msgEl.className = 'settings-msg';

  if (!username || !password) { msgEl.textContent = '请填写用户名和密码'; msgEl.className = 'settings-msg error'; return; }
  if (password.length < 6) { msgEl.textContent = '密码至少6位'; msgEl.className = 'settings-msg error'; return; }

  try {
    const res = await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      msgEl.textContent = `子账号 "${username}" 创建成功！密码: ${password}`;
      msgEl.className = 'settings-msg success';
      document.getElementById('newUsername').value = '';
      document.getElementById('newPassword').value = '';
      loadUserList();
    } else {
      msgEl.textContent = data.error || '创建失败';
      msgEl.className = 'settings-msg error';
    }
  } catch (e) {
    msgEl.textContent = '网络错误';
    msgEl.className = 'settings-msg error';
  }
}

function fmtDateTime(iso) {
  if (!iso) return '从未登录';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return mins + ' 分钟前';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + ' 小时前';
  const days = Math.floor(hrs / 24);
  if (days < 30) return days + ' 天前';
  return d.toISOString().split('T')[0];
}

async function loadUserList() {
  try {
    const res = await fetch('/api/users');
    const data = await res.json();
    const list = document.getElementById('userList');
    const isAdmin = currentUser && currentUser.role === 'admin';

    const pendingCount = data.users.filter(u => u.pendingReset).length;
    let header = '';
    if (isAdmin && pendingCount > 0) {
      header = `<div class="pending-reset-banner">🔔 有 ${pendingCount} 个账号申请重置密码，请在下方处理</div>`;
    }

    list.innerHTML = header + data.users.map(u => {
      const status = u.status || 'active';
      const isSelf = currentUser && u.id === currentUser.id;
      const canManage = isAdmin && u.role !== 'admin';
      return `
      <div class="user-card ${status === 'disabled' ? 'is-disabled' : ''}">
        <div class="user-card-head">
          <div class="user-card-title">
            <span class="user-card-name">${u.username}</span>
            <span class="user-badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}">${u.role === 'admin' ? '主账号' : '子账号'}</span>
            <span class="user-badge ${status === 'disabled' ? 'badge-disabled' : 'badge-active'}">${status === 'disabled' ? '已禁用' : '正常'}</span>
            ${u.pendingReset ? `<span class="user-badge badge-pending" title="${u.pendingReset}">🔔 待重置</span>` : ''}
            ${isSelf ? '<span class="user-badge badge-self">本人</span>' : ''}
          </div>
        </div>
        <div class="user-card-meta">
          <span>📅 创建: ${u.createdAt ? u.createdAt.split('T')[0] : '-'}</span>
          <span>🕒 最近登录: ${fmtDateTime(u.lastLoginAt)}</span>
          ${u.pendingReset ? `<span>⚠ 重置申请: ${fmtDateTime(u.pendingReset)}</span>` : ''}
        </div>
        ${canManage ? `
        <div class="user-card-actions">
          <div class="action-row">
            <input type="text" class="reset-pw-input" id="resetPw_${u.id}" placeholder="设置新密码（至少6位）">
            <button class="btn-action btn-primary" onclick="resetUserPassword(${u.id})">修改密码</button>
          </div>
          <div class="action-row">
            <button class="btn-action ${status === 'disabled' ? 'btn-success' : 'btn-warn'}" onclick="toggleUserStatus(${u.id})">
              ${status === 'disabled' ? '✓ 启用账号' : '⊘ 禁用账号'}
            </button>
            <button class="btn-action btn-danger" onclick="deleteUser(${u.id}, '${u.username.replace(/'/g, "\\'")}')">🗑 删除账号</button>
          </div>
        </div>` : ''}
      </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Load users failed:', e);
  }
}

async function resetUserPassword(userId) {
  const input = document.getElementById('resetPw_' + userId);
  const newPassword = input.value.trim();
  if (!newPassword || newPassword.length < 6) { alert('新密码至少6位'); return; }

  try {
    const res = await fetch('/api/users/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newPassword })
    });
    const data = await res.json();
    if (data.success) {
      alert('密码已修改为: ' + newPassword + '\n请告知该账号使用者');
      input.value = '';
      loadUserList();
    } else {
      alert(data.error || '修改失败');
    }
  } catch (e) { alert('网络错误'); }
}

async function toggleUserStatus(userId) {
  try {
    const res = await fetch('/api/users/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (data.success) {
      loadUserList();
    } else {
      alert(data.error || '操作失败');
    }
  } catch (e) { alert('网络错误'); }
}

async function deleteUser(userId, username) {
  if (!confirm(`确认永久删除账号 "${username}" ？此操作不可恢复。`)) return;
  try {
    const res = await fetch('/api/users/' + userId, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      loadUserList();
    } else {
      alert(data.error || '删除失败');
    }
  } catch (e) { alert('网络错误'); }
}

// -- Change own password --
async function changeMyPassword() {
  const oldPw = document.getElementById('oldPassword').value;
  const newPw = document.getElementById('newPasswordSelf').value;
  const msgEl = document.getElementById('changePwMsg');
  msgEl.textContent = '';
  msgEl.className = 'settings-msg';

  if (!oldPw || !newPw) { msgEl.textContent = '请填写完整'; msgEl.className = 'settings-msg error'; return; }
  if (newPw.length < 6) { msgEl.textContent = '新密码至少6位'; msgEl.className = 'settings-msg error'; return; }

  try {
    const res = await fetch('/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw })
    });
    const data = await res.json();
    if (data.success) {
      msgEl.textContent = '密码修改成功！';
      msgEl.className = 'settings-msg success';
      document.getElementById('oldPassword').value = '';
      document.getElementById('newPasswordSelf').value = '';
    } else {
      msgEl.textContent = data.error || '修改失败';
      msgEl.className = 'settings-msg error';
    }
  } catch (e) { msgEl.textContent = '网络错误'; msgEl.className = 'settings-msg error'; }
}

// -- Files --
async function uploadFiles() {
  const input = document.getElementById('fileInput');
  if (!input.files.length) return;

  const formData = new FormData();
  for (let i = 0; i < input.files.length; i++) {
    formData.append('files', input.files[i]);
  }

  const msgEl = document.getElementById('uploadMsg');
  msgEl.textContent = '上传中...';
  msgEl.className = 'settings-msg';

  try {
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      msgEl.textContent = `成功上传 ${data.files.length} 个文件`;
      msgEl.className = 'settings-msg success';
      input.value = '';
      loadFileList();
    } else {
      msgEl.textContent = data.error || '上传失败';
      msgEl.className = 'settings-msg error';
    }
  } catch (e) { msgEl.textContent = '上传失败'; msgEl.className = 'settings-msg error'; }
}

async function loadFileList() {
  try {
    const res = await fetch('/api/files');
    const data = await res.json();
    const list = document.getElementById('fileList');

    if (!data.files.length) {
      list.innerHTML = '<div class="empty-files">暂无文件</div>';
      return;
    }

    list.innerHTML = data.files.map(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      const icon = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', csv: '📊',
        jpg: '🖼', jpeg: '🖼', png: '🖼', gif: '🖼', webp: '🖼', svg: '🖼',
        ppt: '📽', pptx: '📽', txt: '📃', zip: '📦', rar: '📦', '7z': '📦' }[ext] || '📎';
      const size = f.size < 1024 ? f.size + 'B' :
        f.size < 1048576 ? (f.size / 1024).toFixed(1) + 'KB' :
        (f.size / 1048576).toFixed(1) + 'MB';

      return `
      <div class="file-row">
        <span class="file-icon">${icon}</span>
        <div class="file-info">
          <a href="${f.url}" target="_blank" class="file-name">${f.name}</a>
          <span class="file-meta">${size} · ${f.uploadedBy} · ${f.uploadedAt ? f.uploadedAt.split('T')[0] : ''}</span>
        </div>
        <button class="btn-file-del" onclick="deleteFile('${f.storedName}')">删除</button>
      </div>`;
    }).join('');
  } catch (e) { console.error('Load files failed:', e); }
}

async function deleteFile(storedName) {
  if (!confirm('确定删除此文件？')) return;
  try {
    const res = await fetch('/api/files/' + storedName, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) loadFileList();
    else alert(data.error || '删除失败');
  } catch (e) { alert('网络错误'); }
}

// ===== China Map =====
function initMap() {
  const mapDom = document.getElementById('china-map');
  mapChart = echarts.init(mapDom, null, { renderer: 'canvas' });

  const provinceNameMap = {};
  const provinceData = [];
  const scatterData = [];

  const nameMap = {
    '广东省': '广东', '浙江省': '浙江', '江苏省': '江苏', '福建省': '福建',
    '山东省': '山东', '河北省': '河北', '湖南省': '湖南', '湖北省': '湖北',
    '四川省': '四川', '安徽省': '安徽', '河南省': '河南', '辽宁省': '辽宁',
    '吉林省': '吉林', '黑龙江省': '黑龙江', '江西省': '江西',
    '广西壮族自治区': '广西', '云南省': '云南', '贵州省': '贵州',
    '陕西省': '陕西', '甘肃省': '甘肃', '重庆市': '重庆', '天津市': '天津',
    '上海市': '上海', '北京市': '北京', '山西省': '山西',
    '内蒙古自治区': '内蒙古', '宁夏回族自治区': '宁夏', '青海省': '青海',
    '新疆维吾尔自治区': '新疆', '西藏自治区': '西藏', '海南省': '海南'
  };

  const cityCoords = {
    '深圳市': [114.07, 22.62], '东莞市': [113.75, 23.04], '佛山市': [113.12, 23.02],
    '中山市': [113.38, 22.52], '广州市': [113.26, 23.13], '汕头市': [116.69, 23.35],
    '惠州市': [114.42, 23.09], '揭阳市': [116.37, 23.55], '潮州市': [116.63, 23.66],
    '江门市': [113.08, 22.58], '金华市': [119.65, 29.08], '温州市': [120.7, 28.0],
    '宁波市': [121.56, 29.87], '嘉兴市': [120.76, 30.77], '绍兴市': [120.58, 30.0],
    '台州市': [121.42, 28.66], '杭州市': [120.15, 30.28], '湖州市': [120.09, 30.89],
    '苏州市': [120.62, 31.3], '南通市': [120.86, 32.01], '常州市': [119.97, 31.81],
    '无锡市': [120.31, 31.49], '扬州市': [119.41, 32.39], '镇江市': [119.45, 32.2],
    '泉州市': [118.68, 24.87], '莆田市': [119.01, 25.43], '厦门市': [118.09, 24.48],
    '青岛市': [120.38, 36.07], '临沂市': [118.35, 35.05], '潍坊市': [119.16, 36.71],
    '菏泽市': [115.48, 35.23], '烟台市': [121.45, 37.46],
    '保定市': [115.47, 38.87], '衡水市': [115.67, 37.74], '邢台市': [114.5, 37.07],
    '沧州市': [116.84, 38.31], '邵阳市': [111.47, 27.24], '株洲市': [113.13, 27.83],
    '长沙市': [112.98, 28.2], '武汉市': [114.3, 30.6], '仙桃市': [113.44, 30.36],
    '成都市': [104.07, 30.67], '自贡市': [104.77, 29.35],
    '合肥市': [117.28, 31.86], '芜湖市': [118.38, 31.33], '阜阳市': [115.81, 32.89],
    '许昌市': [113.85, 34.04], '郑州市': [113.62, 34.75], '南阳市': [112.53, 33.0],
    '新乡市': [113.88, 35.3],
    '大连市': [121.62, 38.91], '鞍山市': [122.99, 41.11],
    '长春市': [125.32, 43.88], '哈尔滨市': [126.63, 45.75],
    '赣州市': [114.94, 25.83], '景德镇市': [117.18, 29.27],
    '玉林市': [110.15, 22.63], '梧州市': [111.28, 23.48],
    '普洱市': [100.97, 22.78], '德宏州': [98.58, 24.43],
    '遵义市': [106.93, 27.73], '西安市': [108.94, 34.26], '宝鸡市': [107.14, 34.37],
    '兰州市': [103.83, 36.06], '重庆市': [106.55, 29.56], '天津市': [117.2, 39.13],
    '上海市': [121.47, 31.23], '北京市': [116.41, 39.9],
    '太原市': [112.55, 37.87], '鄂尔多斯市': [109.99, 39.82],
    '银川市': [106.28, 38.47], '海西州': [97.37, 37.38],
    '阿克苏地区': [80.26, 41.17], '拉萨市': [91.11, 29.65], '海口市': [110.35, 20.02]
  };

  beltData.provinces.forEach(p => {
    const mapName = nameMap[p.name] || p.name;
    let totalSuppliers = 0;
    let beltCount = p.belts.length;
    let categories = new Set();
    p.belts.forEach(b => {
      totalSuppliers += b.supplierCount;
      categories.add(b.category);
      const coords = cityCoords[b.location];
      if (coords) {
        scatterData.push({ name: b.name, value: [...coords, b.supplierCount], belt: b, province: p.name });
      }
    });
    provinceNameMap[mapName] = p;
    provinceData.push({
      name: mapName, value: totalSuppliers, beltCount, categories: [...categories],
      belts: p.belts, provinceName: p.name,
      itemStyle: { areaColor: p.color + '30', borderColor: p.color }
    });
  });

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(17,24,39,0.95)',
      borderColor: '#1e3a5f',
      borderWidth: 1,
      textStyle: { color: '#e0e6ed', fontSize: 13 },
      formatter: function(params) {
        if (params.seriesType === 'scatter') {
          const b = params.data.belt;
          return `<div style="min-width:200px">
            <div style="font-size:15px;font-weight:700;color:#00f2fe;margin-bottom:6px">${b.name}</div>
            <div style="color:#8899aa;margin-bottom:4px">📍 ${b.location} · ${b.county || ''}</div>
            <div style="color:#8899aa;margin-bottom:4px">📦 ${b.category}</div>
            <div style="color:#4facfe;font-weight:600">🏭 ${b.supplierCount.toLocaleString()} 家供应商</div>
            <div style="color:#556677;margin-top:6px;font-size:11px">点击查看详情 →</div>
          </div>`;
        }
        if (params.data && params.data.beltCount) {
          const d = params.data;
          return `<div style="min-width:200px">
            <div style="font-size:15px;font-weight:700;color:#00f2fe;margin-bottom:6px">${d.provinceName}</div>
            <div style="color:#8899aa;margin-bottom:4px">产业带: ${d.beltCount} 个</div>
            <div style="color:#4facfe;font-weight:600;margin-bottom:4px">供应商: ${d.value.toLocaleString()} 家</div>
            <div style="color:#8899aa;font-size:12px">品类: ${d.categories.join('、')}</div>
            <div style="color:#556677;margin-top:6px;font-size:11px">点击查看所有产业带 →</div>
          </div>`;
        }
        return params.name;
      }
    },
    geo: {
      map: 'china', roam: true, zoom: 1.2, center: [104, 36],
      scaleLimit: { min: 0.8, max: 6 },
      label: { show: true, color: '#556677', fontSize: 10 },
      emphasis: {
        label: { color: '#00f2fe', fontSize: 12 },
        itemStyle: { areaColor: 'rgba(0,242,254,0.15)', borderColor: '#00f2fe', borderWidth: 2 }
      },
      itemStyle: { areaColor: '#1a2332', borderColor: '#1e3a5f', borderWidth: 1 },
      regions: provinceData.map(p => ({ name: p.name, itemStyle: p.itemStyle }))
    },
    series: [
      { name: '产业带', type: 'map', map: 'china', geoIndex: 0, data: provinceData },
      {
        name: '产业带热点', type: 'scatter', coordinateSystem: 'geo', data: scatterData,
        symbolSize: function(val) { return Math.max(8, Math.min(30, Math.sqrt(val[2]) / 8)); },
        itemStyle: { color: '#00f2fe', shadowBlur: 10, shadowColor: 'rgba(0,242,254,0.5)' },
        emphasis: { itemStyle: { color: '#4facfe', shadowBlur: 20, borderColor: '#fff', borderWidth: 1 } }
      },
      {
        name: '涟漪效果', type: 'effectScatter', coordinateSystem: 'geo',
        data: scatterData.filter(d => d.value[2] > 10000),
        symbolSize: function(val) { return Math.max(6, Math.min(20, Math.sqrt(val[2]) / 12)); },
        showEffectOn: 'render',
        rippleEffect: { brushType: 'stroke', scale: 3, period: 4 },
        itemStyle: { color: '#00f2fe', shadowBlur: 10, shadowColor: 'rgba(0,242,254,0.5)' }
      }
    ]
  };

  mapChart.setOption(option);
  mapChart.on('click', function(params) {
    if (params.seriesType === 'scatter' || params.seriesType === 'effectScatter') {
      openBeltDetail({ ...params.data.belt, province: params.data.province });
    } else if (params.data && params.data.belts) {
      showProvinceBelts(params.data);
    }
  });
  window.addEventListener('resize', () => mapChart && mapChart.resize());
}

function showProvinceBelts(provinceData) {
  const belts = provinceData.belts.map(b => ({ ...b, province: provinceData.provinceName }));
  belts.sort((a, b) => b.supplierCount - a.supplierCount);

  categoryPageState = { belts, page: 1, category: provinceData.provinceName };
  renderCategoryPage();

  document.getElementById('categoryResults').classList.add('active');
  document.getElementById('searchResults').classList.remove('active');
  hideMapSection();
  document.getElementById('categoryResults').scrollIntoView({ behavior: 'smooth' });
}

// ===== Event Listeners =====
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  // Login
  document.getElementById('btnLogin').addEventListener('click', login);
  document.getElementById('btnRegister').addEventListener('click', register);
  document.getElementById('loginPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') login();
  });

  // Forgot password
  document.getElementById('btnForgotPw').addEventListener('click', showForgotForm);
  document.getElementById('btnCancelForgot').addEventListener('click', hideForgotForm);
  document.getElementById('btnSubmitForgot').addEventListener('click', submitForgotPassword);
  document.getElementById('forgotUsername').addEventListener('keydown', e => {
    if (e.key === 'Enter') submitForgotPassword();
  });

  // Logout
  document.getElementById('btnLogout').addEventListener('click', logout);

  // Sidebar
  document.getElementById('menuToggle').addEventListener('click', openSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

  // Search
  document.getElementById('searchBtn').addEventListener('click', () => {
    doSearch(document.getElementById('searchInput').value.trim());
  });
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch(e.target.value.trim());
  });

  // Search tags - render dynamically based on frequency
  renderSearchTags();

  // Close results - FIX #2: show map again when closing
  document.getElementById('resultsClose').addEventListener('click', () => {
    document.getElementById('searchResults').classList.remove('active');
    showMapSection();
  });
  document.getElementById('categoryClose').addEventListener('click', () => {
    document.getElementById('categoryResults').classList.remove('active');
    showMapSection();
  });

  // Detail panel
  document.getElementById('detailClose').addEventListener('click', closeDetail);
  document.getElementById('detailOverlay').addEventListener('click', closeDetail);

  // Settings panel
  document.getElementById('settingsToggle').addEventListener('click', toggleSettingsPanel);
  document.getElementById('settingsClose').addEventListener('click', closeSettings);
  document.getElementById('settingsOverlay').addEventListener('click', closeSettings);

  // Settings tabs
  document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.addEventListener('click', () => switchSettingsTab(tab.dataset.tab));
  });

  // Create account
  document.getElementById('btnCreateAccount').addEventListener('click', createSubAccount);

  // Change password
  document.getElementById('btnChangePassword').addEventListener('click', changeMyPassword);

  // File upload
  document.getElementById('btnUpload').addEventListener('click', uploadFiles);

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeDetail();
      closeSidebar();
      closeSettings();
    }
  });
});
