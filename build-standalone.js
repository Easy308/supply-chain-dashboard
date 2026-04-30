const fs = require('fs');

const css = fs.readFileSync('C:/industrial-belt-dashboard/public/css/style.css', 'utf-8');
const data = fs.readFileSync('C:/industrial-belt-dashboard/data/industrial-belts.json', 'utf-8');
const jsApp = fs.readFileSync('C:/industrial-belt-dashboard/public/js/app.js', 'utf-8');

// Modify JS for standalone
let modifiedJs = jsApp;

// Replace checkAuth - auto show dashboard
modifiedJs = modifiedJs.replace(
  /async function checkAuth\(\) \{[\s\S]*?\n\}/,
  "async function checkAuth() { showDashboard({username:'用户',role:'admin'}); }"
);

// Replace loadData - use embedded data
modifiedJs = modifiedJs.replace(
  /async function loadData\(\) \{[\s\S]*?\n\}/,
  [
    'async function loadData() {',
    '  beltData = window.__BELT_DATA;',
    '  renderStats();',
    '  renderCategories();',
    '  function tryInitMap() {',
    '    if (window.__chinaMapReady) { initMap(); }',
    '    else { setTimeout(tryInitMap, 200); }',
    '  }',
    '  tryInitMap();',
    '}'
  ].join('\n')
);

// Replace doSearch - client-side search
modifiedJs = modifiedJs.replace(
  /async function doSearch\(query\) \{[\s\S]*?\n\}/,
  [
    'async function doSearch(query) {',
    '  if (!query) return;',
    '  var keyword = query.toLowerCase();',
    '  var results = [];',
    '  beltData.provinces.forEach(function(p) {',
    '    p.belts.forEach(function(b) {',
    '      var match = b.name.toLowerCase().includes(keyword) ||',
    '        b.category.toLowerCase().includes(keyword) ||',
    '        b.location.toLowerCase().includes(keyword) ||',
    '        (b.county && b.county.toLowerCase().includes(keyword)) ||',
    '        (b.tags && b.tags.some(function(t) { return t.toLowerCase().includes(keyword); }));',
    '      if (match) results.push(Object.assign({ province: p.name, provinceCode: p.code }, b));',
    '    });',
    '  });',
    '  renderSearchResults(results, query);',
    '}'
  ].join('\n')
);

// Replace login/register/logout - no-ops
modifiedJs = modifiedJs.replace(/async function login\(\) \{[\s\S]*?\n\}/, 'async function login() {}');
modifiedJs = modifiedJs.replace(/async function register\(\) \{[\s\S]*?\n\}/, 'async function register() {}');
modifiedJs = modifiedJs.replace(/async function logout\(\) \{[\s\S]*?\n\}/, 'async function logout() {}');

// Replace server-based functions with no-ops for standalone
modifiedJs = modifiedJs.replace(/async function createSubAccount\(\) \{[\s\S]*?\n\}/, 'async function createSubAccount() { document.getElementById("createAccountMsg").textContent = "独立版不支持账号管理，请使用在线版"; document.getElementById("createAccountMsg").className = "settings-msg error"; }');
modifiedJs = modifiedJs.replace(/async function loadUserList\(\) \{[\s\S]*?\n\}/, 'async function loadUserList() { document.getElementById("userList").innerHTML = "<div class=\\"empty-files\\">独立版不支持账号管理</div>"; }');
modifiedJs = modifiedJs.replace(/async function resetUserPassword\(userId\) \{[\s\S]*?\n\}/, 'async function resetUserPassword(userId) {}');
modifiedJs = modifiedJs.replace(/async function changeMyPassword\(\) \{[\s\S]*?\n\}/, 'async function changeMyPassword() { document.getElementById("changePwMsg").textContent = "独立版不支持密码修改，请使用在线版"; document.getElementById("changePwMsg").className = "settings-msg error"; }');
modifiedJs = modifiedJs.replace(/async function uploadFiles\(\) \{[\s\S]*?\n\}/, 'async function uploadFiles() { document.getElementById("uploadMsg").textContent = "独立版不支持文件上传，请使用在线版"; document.getElementById("uploadMsg").className = "settings-msg error"; }');
modifiedJs = modifiedJs.replace(/async function loadFileList\(\) \{[\s\S]*?\n\}/, 'async function loadFileList() { document.getElementById("fileList").innerHTML = "<div class=\\"empty-files\\">独立版不支持文件管理</div>"; }');
modifiedJs = modifiedJs.replace(/async function deleteFile\(storedName\) \{[\s\S]*?\n\}/, 'async function deleteFile(storedName) {}');

// Build HTML body from index.html structure (without login page, with dashboard active)
var html = [];
html.push('<!DOCTYPE html>');
html.push('<html lang="zh-CN">');
html.push('<head>');
html.push('  <meta charset="UTF-8">');
html.push('  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
html.push('  <title>产业带智能看板 - 深圳弘歌电子有限公司</title>');
html.push('  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">');
html.push('  <style>');
html.push(css);
html.push('  </style>');
html.push('</head>');
html.push('<body>');
html.push('  <div class="grid-bg"></div>');
html.push('');
html.push('  <div class="dashboard active" id="dashboard">');
html.push('    <div class="header">');
html.push('      <div class="header-left">');
html.push('        <button class="menu-toggle" id="menuToggle">\u2630</button>');
html.push('        <span class="header-title">产业带看板 v1.0</span>');
html.push('      </div>');
html.push('      <div class="header-right">');
html.push('        <button class="settings-toggle" id="settingsToggle">\u2699</button>');
html.push('      </div>');
html.push('    </div>');
html.push('');
html.push('    <div class="sidebar-overlay" id="sidebarOverlay"></div>');
html.push('    <div class="sidebar" id="sidebar">');
html.push('      <div class="sidebar-header">');
html.push('        <div class="sidebar-title">品类导航</div>');
html.push('        <button class="sidebar-close" id="sidebarClose">\u2715</button>');
html.push('      </div>');
html.push('      <div id="categoryList"></div>');
html.push('    </div>');
html.push('');
html.push('    <div class="detail-overlay" id="detailOverlay"></div>');
html.push('    <div class="detail-panel" id="detailPanel">');
html.push('      <div class="detail-header">');
html.push('        <div>');
html.push('          <div class="detail-title" id="detailTitle">-</div>');
html.push('          <div class="detail-location" id="detailLocation">-</div>');
html.push('        </div>');
html.push('        <button class="detail-close" id="detailClose">\u2715</button>');
html.push('      </div>');
html.push('      <div class="detail-stats" id="detailStats"></div>');
html.push('      <div class="detail-section">');
html.push('        <div class="detail-section-title">核心供应商</div>');
html.push('        <div id="supplierList"></div>');
html.push('      </div>');
html.push('      <div class="external-links" id="externalLinks"></div>');
html.push('    </div>');
html.push('');
// Settings Panel
html.push('    <div class="detail-overlay" id="settingsOverlay"></div>');
html.push('    <div class="detail-panel settings-panel" id="settingsPanel">');
html.push('      <div class="detail-header">');
html.push('        <div class="detail-title">系统设置</div>');
html.push('        <button class="detail-close" id="settingsClose">\u2715</button>');
html.push('      </div>');
html.push('      <div class="settings-tabs">');
html.push('        <div class="settings-tab active" data-tab="accounts">添加账号</div>');
html.push('        <div class="settings-tab" data-tab="password">修改密码</div>');
html.push('        <div class="settings-tab" data-tab="files">上传文件</div>');
html.push('      </div>');
html.push('      <div class="settings-pane active" id="pane-accounts">');
html.push('        <div class="settings-form">');
html.push('          <h3 class="settings-form-title">创建子账号</h3>');
html.push('          <div class="form-group"><label>用户名</label><input type="text" id="newUsername" placeholder="输入新用户名"></div>');
html.push('          <div class="form-group"><label>密码</label><input type="text" id="newPassword" placeholder="输入密码（至少6位）"></div>');
html.push('          <button class="btn-login" id="btnCreateAccount" style="margin-top:8px">创建账号</button>');
html.push('          <div class="settings-msg" id="createAccountMsg"></div>');
html.push('        </div>');
html.push('        <div class="settings-form" style="margin-top:20px"><h3 class="settings-form-title">账号列表</h3><div id="userList" class="user-list"></div></div>');
html.push('      </div>');
html.push('      <div class="settings-pane" id="pane-password">');
html.push('        <div class="settings-form">');
html.push('          <h3 class="settings-form-title">修改我的密码</h3>');
html.push('          <div class="form-group"><label>原密码</label><input type="password" id="oldPassword" placeholder="输入原密码"></div>');
html.push('          <div class="form-group"><label>新密码</label><input type="password" id="newPasswordSelf" placeholder="输入新密码（至少6位）"></div>');
html.push('          <button class="btn-login" id="btnChangePassword" style="margin-top:8px">确认修改</button>');
html.push('          <div class="settings-msg" id="changePwMsg"></div>');
html.push('        </div>');
html.push('      </div>');
html.push('      <div class="settings-pane" id="pane-files">');
html.push('        <div class="settings-form">');
html.push('          <h3 class="settings-form-title">上传文件</h3>');
html.push('          <div class="upload-area"><input type="file" id="fileInput" multiple><p class="upload-hint">支持图片、表格、文档、PDF等格式</p></div>');
html.push('          <button class="btn-login" id="btnUpload" style="margin-top:8px">上传</button>');
html.push('          <div class="settings-msg" id="uploadMsg"></div>');
html.push('        </div>');
html.push('        <div class="settings-form" style="margin-top:20px"><h3 class="settings-form-title">已上传文件</h3><div id="fileList" class="file-list"></div></div>');
html.push('      </div>');
html.push('    </div>');
html.push('');
// Main content
html.push('    <div class="main-content">');
html.push('      <div class="search-section">');
html.push('        <div class="company-name">深圳弘歌电子有限公司</div>');
html.push('        <div class="company-subtitle">SUPPLY CHAIN INTELLIGENCE DASHBOARD</div>');
html.push('        <div class="search-box">');
html.push('          <input type="text" class="search-input" id="searchInput" placeholder="搜索产品名称、品类关键词、地区（如：义乌、电子、五金、晋江市）...">');
html.push('          <button class="search-btn" id="searchBtn">\u2315</button>');
html.push('        </div>');
html.push('        <div class="search-tags">');
html.push('          <span class="search-tag" data-q="电子电器">电子电器</span>');
html.push('          <span class="search-tag" data-q="五金工具">五金工具</span>');
html.push('          <span class="search-tag" data-q="纺织服装">纺织服装</span>');
html.push('          <span class="search-tag" data-q="家具家居">家具家居</span>');
html.push('          <span class="search-tag" data-q="义乌">义乌</span>');
html.push('          <span class="search-tag" data-q="深圳">深圳</span>');
html.push('          <span class="search-tag" data-q="汽配">汽配</span>');
html.push('          <span class="search-tag" data-q="灯具照明">灯具照明</span>');
html.push('        </div>');
html.push('      </div>');
html.push('      <div class="stats-bar">');
html.push('        <div class="stat-item"><div class="stat-value" id="statProvinces">0</div><div class="stat-label">覆盖省份</div></div>');
html.push('        <div class="stat-item"><div class="stat-value" id="statBelts">0</div><div class="stat-label">产业带</div></div>');
html.push('        <div class="stat-item"><div class="stat-value" id="statSuppliers">0</div><div class="stat-label">供应商总数</div></div>');
html.push('        <div class="stat-item"><div class="stat-value" id="statCategories">0</div><div class="stat-label">品类覆盖</div></div>');
html.push('      </div>');
html.push('      <div class="search-results" id="searchResults"><div class="results-header"><div><span class="results-title">搜索结果</span><span class="results-count" id="resultsCount"></span></div><button class="results-close" id="resultsClose">关闭结果</button></div><div id="resultsList"></div></div>');
html.push('      <div class="category-results" id="categoryResults"><div class="results-header"><div><span class="results-title" id="categoryTitle">-</span><span class="results-count" id="categoryCount"></span></div><button class="results-close" id="categoryClose">关闭</button></div><div id="categoryBeltList"></div></div>');
html.push('      <div class="map-section"><div class="map-title">全国产业带分布图</div><div id="china-map"></div></div>');
html.push('    </div>');
html.push('  </div>');
html.push('');
// Hidden elements for JS compatibility
html.push('  <div style="display:none"><div id="loginPage"></div><input id="loginUsername"><input id="loginPassword"><button id="btnLogin"></button><button id="btnRegister"></button><div id="loginError"></div><button id="btnLogout"></button><div id="userAvatar"></div><span id="userName"></span></div>');
html.push('');
// Data
html.push('  <script>window.__BELT_DATA = ' + data + ';</' + 'script>');
// ECharts
html.push('  <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></' + 'script>');
// Map loader
html.push('  <script>');
html.push('    window.__chinaMapReady = false;');
html.push('    fetch("https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json")');
html.push('      .then(function(r){return r.json()})');
html.push('      .then(function(g){echarts.registerMap("china",g);window.__chinaMapReady=true;})');
html.push('      .catch(function(e){console.error("Map load failed:",e);window.__chinaMapReady=false;});');
html.push('  </' + 'script>');
// App JS
html.push('  <script>');
html.push(modifiedJs);
html.push('  </' + 'script>');
html.push('</body>');
html.push('</html>');

var output = html.join('\n');
var outPath = 'C:/Users/Administrator/Desktop/席皓竹/产业带智能看板_完整版.html';
fs.writeFileSync(outPath, output, 'utf-8');

var stat = fs.statSync(outPath);
console.log('File written:', outPath);
console.log('Size:', (stat.size / 1024).toFixed(1), 'KB');
var content = fs.readFileSync(outPath, 'utf-8');
console.log('Province entries:', (content.match(/"code":\s*"/g) || []).length);
console.log('Has settings panel:', content.includes('settingsPanel'));
console.log('Has supplier-card-mini:', content.includes('supplier-card-mini'));
console.log('Has hideMapSection:', content.includes('hideMapSection'));
