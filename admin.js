// assets/js/admin.js
(function () {
  let events = JSON.parse(localStorage.getItem("events")) || [];

  // Dashboard count
  const totalEventsEl = document.getElementById("totalEvents");
  if (totalEventsEl) totalEventsEl.innerText = events.length;

  // Manage listing
  const adminList = document.getElementById("adminEventList");
  if (adminList) {
    adminList.innerHTML = "";
    if (!events.length) {
      adminList.innerHTML = `<li class="list-group-item bg-transparent text-slate-400">No events available</li>`;
    } else {
      events.forEach(evt => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-start bg-transparent border-b border-slate-700";
        li.innerHTML = `
          <div>
            <div class="fw-semibold">${escapeHtml(evt.title)}</div>
            <div class="text-muted small">${evt.date}</div>
            <div class="text-muted small truncate-2">${escapeHtml(evt.desc||'')}</div>
          </div>
          <div class="btn-group btn-group-sm">
            <a href="edit.html?id=${evt.id}" class="btn btn-sm btn-outline-light">Edit</a>
            <a href="delete.html?id=${evt.id}" class="btn btn-sm btn-danger">Delete</a>
          </div>
        `;
        adminList.appendChild(li);
      });
    }
  }

  // Admin edit
  const adminEditForm = document.getElementById("adminEditForm");
  if (adminEditForm) {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));
    const selected = events.find(e=> e.id === id);
    if (!selected) { alert("Event not found"); location.href = "manage.html"; }
    document.getElementById("aTitle").value = selected.title;
    document.getElementById("aDate").value = selected.date;
    document.getElementById("aDesc").value = selected.desc;

    adminEditForm.addEventListener("submit", function (e) {
      e.preventDefault();
      selected.title = document.getElementById("aTitle").value.trim();
      selected.date = document.getElementById("aDate").value;
      selected.desc = document.getElementById("aDesc").value.trim();
      localStorage.setItem("events", JSON.stringify(events));
      alert("Event updated (admin)");
      location.href = "manage.html";
    });
  }

  // Admin delete fallback
  const deleteList = document.getElementById("deleteList");
  if (deleteList) {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));
    const evt = events.find(e=> e.id === id);
    if (!evt) {
      deleteList.innerHTML = `<div class="card-dark p-4 text-slate-300">Event not found</div>`;
    } else {
      deleteList.innerHTML = `
        <div class="card-dark p-4">
          <h5>${escapeHtml(evt.title)}</h5>
          <div class="text-slate-400">${evt.date}</div>
          <p class="mt-2 text-slate-300">${escapeHtml(evt.desc||'')}</p>
          <div class="mt-3 text-end">
            <button id="confirmAdminDelete" class="btn btn-danger">Confirm Delete</button>
            <a href="manage.html" class="btn btn-outline-light ms-2">Cancel</a>
          </div>
        </div>
      `;
      document.getElementById("confirmAdminDelete").addEventListener("click", function () {
        events = events.filter(e => e.id !== id);
        localStorage.setItem("events", JSON.stringify(events));
        alert("Deleted");
        location.href = "manage.html";
      });
    }
  }

  // Logs: search, filter, sort
  const logTable = document.getElementById("logTable");
  if (logTable) {
    let filtered = [...events];
    const searchInput = document.getElementById("searchInput");
    const filterSelect = document.getElementById("filterSelect");
    const sortSelect = document.getElementById("sortSelect");

    function renderRows(data) {
      logTable.innerHTML = "";
      if (!data.length) {
        logTable.innerHTML = `<tr><td colspan="4" class="text-center text-slate-400 py-3">No events</td></tr>`;
        return;
      }
      data.forEach(evt => {
        logTable.innerHTML += `
          <tr>
            <td>${evt.id}</td>
            <td>${escapeHtml(evt.title)}</td>
            <td>${evt.date}</td>
            <td>${escapeHtml(evt.desc||'')}</td>
          </tr>
        `;
      });
    }

    function applyAll() {
      filtered = events.filter(e => e.title.toLowerCase().includes((searchInput.value||'').toLowerCase()));
      const today = new Date().toISOString().split("T")[0];
      if (filterSelect.value === "upcoming") filtered = filtered.filter(e => e.date >= today);
      if (filterSelect.value === "past") filtered = filtered.filter(e => e.date < today);
      if (sortSelect.value === "newest") filtered.sort((a,b) => b.id - a.id);
      else filtered.sort((a,b) => a.id - b.id);
      renderRows(filtered);
    }

    [searchInput, filterSelect, sortSelect].forEach(el => {
      el.addEventListener("input", applyAll);
      el.addEventListener("change", applyAll);
    });

    renderRows(filtered);
  }

  // small escape utility
  function escapeHtml(s) {
    return String(s || "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
  }

})();
