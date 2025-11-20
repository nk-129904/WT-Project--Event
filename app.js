// assets/js/app.js
(function () {
  // Load events from localStorage
  let events = JSON.parse(localStorage.getItem("events")) || [];

  // ALERT helper (floating)
  function showAlert(msg, type = "success", timeout = 3000) {
    const div = document.createElement("div");
    div.className = `alert alert-${type} alert-floating shadow`;
    div.innerText = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), timeout);
  }

  /* ---------- CREATE ---------- */
  const createForm = document.getElementById("eventForm");
  if (createForm) {
    createForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const title = document.getElementById("title").value.trim();
      const date = document.getElementById("date").value;
      const desc = document.getElementById("desc").value.trim();

      if (!title || !date) {
        showAlert("Title and date are required", "warning");
        return;
      }

      const selected = new Date(date);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selected < today) {
        showAlert("Choose today or a future date", "warning");
        return;
      }

      events.push({ id: Date.now(), title, date, desc });
      localStorage.setItem("events", JSON.stringify(events));
      const modalEl = document.getElementById("infoModal");
      const bs = bootstrap.Modal.getOrCreateInstance(modalEl);
      document.getElementById("modalBody").innerHTML = "Event created successfully";
      bs.show();
      setTimeout(() => { bs.hide(); window.location.href = "view.html"; }, 900);
    });
  }

  /* ---------- VIEW (cards + pagination + delete modal) ---------- */
  const eventList = document.getElementById("eventList");
  if (eventList) {
    let currentPage = 1;
    const perPage = 6;

    function escapeHtml(s) {
      return String(s || "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
    }

    function renderCards(items) {
      eventList.innerHTML = "";
      if (!items.length) {
        eventList.innerHTML = `<div class="col-12"><div class="card-dark p-4 text-slate-300 text-center">No events found — <a class="text-sky-400" href="create.html">create one</a>.</div></div>`;
        document.getElementById("pagination").innerHTML = "";
        return;
      }

      items.forEach(evt => {
        const wrapper = document.createElement("div");
        wrapper.className = "col";
        wrapper.innerHTML = `
          <div class="card-dark p-3 h-full flex flex-col">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h5 class="text-lg font-semibold">${escapeHtml(evt.title)}</h5>
                <div class="text-slate-400 text-sm">${escapeHtml(evt.date)}</div>
              </div>
              <div class="text-sm text-slate-400">${evt.id}</div>
            </div>
            <p class="text-slate-300 mt-3 truncate-2">${escapeHtml(evt.desc || "")}</p>

            <div class="mt-4 flex gap-2">
              <a class="btn btn-sm btn-outline-light" href="edit.html?id=${evt.id}">Edit</a>
              <button class="btn btn-sm btn-danger" onclick="confirmDelete(${evt.id})">Delete</button>
            </div>
          </div>
        `;
        eventList.appendChild(wrapper);
      });
    }

    function renderPagination() {
      const total = events.length;
      const pages = Math.ceil(total / perPage) || 1;
      const container = document.getElementById("pagination");
      let html = "";
      for (let i=1;i<=pages;i++){
        html += `<li class="page-item ${i===currentPage?'active':''}"><button class="page-link" data-page="${i}">${i}</button></li>`;
      }
      container.innerHTML = html;
      container.querySelectorAll("[data-page]").forEach(btn=>{
        btn.addEventListener("click", ()=> {
          currentPage = Number(btn.getAttribute("data-page"));
          displayPage(currentPage);
        });
      });
    }

    function displayPage(page = 1) {
      currentPage = page;
      const start = (page-1)*perPage;
      const subset = events.slice(start, start+perPage);
      renderCards(subset);
      renderPagination();
    }

    // initial render
    displayPage(1);

    // Delete handlers
    window.confirmDelete = function (id) {
      const evt = events.find(e=> e.id === id);
      document.getElementById("delInfo").innerText = evt ? `${evt.title} — ${evt.date}` : "";
      const modalEl = document.getElementById("deleteModal");
      modalEl._delId = id;
      const bs = new bootstrap.Modal(modalEl);
      bs.show();
    };

    const confirmBtn = document.getElementById("confirmDeleteBtn");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", ()=> {
        const modalEl = document.getElementById("deleteModal");
        const id = modalEl._delId;
        events = events.filter(e => e.id !== id);
        localStorage.setItem("events", JSON.stringify(events));
        const bs = bootstrap.Modal.getInstance(modalEl);
        bs.hide();
        showAlert("Event deleted", "danger");
        // adjust current page if needed
        const pages = Math.ceil(events.length / perPage) || 1;
        if (currentPage > pages) currentPage = pages;
        displayPage(currentPage);
      });
    }
  }

  /* ---------- EDIT (client) ---------- */
  const editForm = document.getElementById("editForm");
  if (editForm) {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));
    const target = events.find(e => e.id === id);
    if (!target) {
      showAlert("Event not found", "warning");
      setTimeout(()=> location.href = "view.html", 700);
    } else {
      document.getElementById("editTitle").value = target.title;
      document.getElementById("editDate").value = target.date;
      document.getElementById("editDesc").value = target.desc;
    }

    editForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!target) return;
      target.title = document.getElementById("editTitle").value.trim();
      target.date = document.getElementById("editDate").value;
      target.desc = document.getElementById("editDesc").value.trim();

      if (!target.title || !target.date) {
        showAlert("Title and date are required", "warning");
        return;
      }

      localStorage.setItem("events", JSON.stringify(events));
      showAlert("Event updated", "success");
      setTimeout(()=> location.href = "view.html", 700);
    });
  }

})();
