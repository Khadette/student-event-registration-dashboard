
    let events = [];
    let nextId = 1;

    const defaultEvents = [
      { id: 1, title: "AI Bootcamp",    category: "Technology", seats: 30, registered: 12 },
      { id: 2, title: "Science Fair",   category: "Science",    seats: 50, registered: 20 },
      { id: 3, title: "Art Workshop",   category: "Arts",       seats: 20, registered: 5  },
    ];

    // ─── TOAST POPUP ─────────────────────────────────────────────────────────

    let toastTimer = null;

    function showToast(message, type) {
      const toast = document.getElementById("toast");

      // Color based on type
      toast.className = "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-semibold pointer-events-none";

      if (type === "success") {
        toast.classList.add("bg-teal-600");
      } else if (type === "cancel") {
        toast.classList.add("bg-red-500");
      } else if (type === "error") {
        toast.classList.add("bg-amber-500");
      } else if (type === "add") {
        toast.classList.add("bg-indigo-500");
      }

      toast.style.minWidth  = "220px";
      toast.style.textAlign = "center";
      toast.textContent = message;

      // Show it
      toast.classList.remove("hide");
      toast.classList.add("show");

      // Hide after 2.5 seconds
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(function() {
        toast.classList.remove("show");
        toast.classList.add("hide");
      }, 2500);
    }

    // ─── LOCAL STORAGE ───────────────────────────────────────────────────────

    function saveToLocalStorage() {
      localStorage.setItem("studentEvents", JSON.stringify(events));
      localStorage.setItem("studentEventsNextId", JSON.stringify(nextId));
    }

    function loadFromLocalStorage() {
      const saved   = localStorage.getItem("studentEvents");
      const savedId = localStorage.getItem("studentEventsNextId");

      if (saved) {
        events = JSON.parse(saved);
        nextId = savedId ? JSON.parse(savedId) : events.length + 1;
      } else {
        events = defaultEvents;
        nextId = events.length + 1;
        saveToLocalStorage();
      }
    }

    // ─── STATISTICS ──────────────────────────────────────────────────────────

    function updateStats() {
      const totalEvents     = events.length;
      const totalRegistered = events.reduce(function(sum, e) { return sum + e.registered; }, 0);
      const totalRemaining  = events.reduce(function(sum, e) { return sum + (e.seats - e.registered); }, 0);

      document.getElementById("statTotalEvents").textContent     = totalEvents;
      document.getElementById("statTotalRegistered").textContent = totalRegistered;
      document.getElementById("statTotalSeats").textContent      = totalRemaining;
    }

    // ─── CATEGORY COLORS ─────────────────────────────────────────────────────

    function getCategoryStyle(category) {
      var map = {
        "Technology": "bg-blue-100 text-blue-700",
        "Science":    "bg-green-100 text-green-700",
        "Arts":       "bg-pink-100 text-pink-700",
        "Sports":     "bg-orange-100 text-orange-700",
        "Business":   "bg-yellow-100 text-yellow-700",
        "Health":     "bg-teal-100 text-teal-700",
        "Other":      "bg-slate-100 text-slate-600",
      };
      return map[category] || "bg-slate-100 text-slate-600";
    }

    // ─── RENDER EVENTS ───────────────────────────────────────────────────────

    function renderEvents(list) {
      const container = document.getElementById("eventContainer");
      const noMsg     = document.getElementById("noEventsMsg");
      container.innerHTML = "";

      if (list.length === 0) {
        noMsg.classList.remove("hidden");
        return;
      }

      noMsg.classList.add("hidden");

      list.forEach(function(event) {
        const remaining   = event.seats - event.registered;
        const isFull      = remaining <= 0;
        const noReg       = event.registered <= 0;
        const catStyle    = getCategoryStyle(event.category);

        const card = document.createElement("div");
        card.className = "bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col gap-3";

        card.innerHTML = `
          <div class="flex justify-between items-start">
            <h4 class="font-bold text-base text-slate-800 leading-snug">${event.title}</h4>
            <span class="text-xs font-semibold px-2 py-1 rounded-full ${catStyle} ml-2 shrink-0">${event.category}</span>
          </div>

          <div class="text-sm text-slate-600 space-y-1">
            <div class="flex justify-between"><span>Total Seats</span><span class="font-semibold text-slate-700">${event.seats}</span></div>
            <div class="flex justify-between"><span>Registered</span><span class="font-semibold text-indigo-600">${event.registered}</span></div>
            <div class="flex justify-between"><span>Remaining</span><span class="font-semibold ${isFull ? 'text-red-500' : 'text-teal-600'}">${remaining}</span></div>
          </div>

          ${isFull ? '<p class="text-xs text-red-500 font-semibold text-center">⚠️ Event is Full</p>' : ''}

          <div class="flex gap-2 pt-1">
            <button
              onclick="registerForEvent(${event.id})"
              ${isFull ? 'disabled' : ''}
              class="flex-1 py-1.5 rounded-md text-white text-xs font-bold transition-all active:scale-95
                ${isFull ? 'bg-slate-300 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'}"
            >
              ✔ Register
            </button>
            <button
              onclick="cancelRegistration(${event.id})"
              ${noReg ? 'disabled' : ''}
              class="flex-1 py-1.5 rounded-md text-white text-xs font-bold transition-all active:scale-95
                ${noReg ? 'bg-slate-300 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600'}"
            >
              ✖ Cancel
            </button>
          </div>
        `;

        container.appendChild(card);
      });
    }

    // ─── ADD EVENT ───────────────────────────────────────────────────────────

    function addEvent() {
      const title    = document.getElementById("inputTitle").value.trim();
      const category = document.getElementById("inputCategory").value;
      const seats    = parseInt(document.getElementById("inputSeats").value);
      const errorBox = document.getElementById("formError");

      if (!title) {
        showFormError("Please enter an event title.");
        return;
      }
      if (!category) {
        showFormError("Please select a category.");
        return;
      }
      if (!seats || seats < 1) {
        showFormError("Please enter a valid number of seats (at least 1).");
        return;
      }

      errorBox.classList.add("hidden");

      const newEvent = {
        id: nextId,
        title: title,
        category: category,
        seats: seats,
        registered: 0
      };

      nextId++;
      events.push(newEvent);
      saveToLocalStorage();

      // Clear form
      document.getElementById("inputTitle").value    = "";
      document.getElementById("inputCategory").value = "";
      document.getElementById("inputSeats").value    = "";

      renderEvents(events);
      updateStats();

      // Toast notification
      showToast("✅ Event \"" + newEvent.title + "\" added!", "add");
    }

    function showFormError(msg) {
      const errorBox = document.getElementById("formError");
      errorBox.textContent = msg;
      errorBox.classList.remove("hidden");
    }

    // ─── REGISTER ────────────────────────────────────────────────────────────

    function registerForEvent(id) {
      const event = events.find(function(e) { return e.id === id; });
      if (!event) return;

      if (event.registered >= event.seats) {
        showToast("⚠️ This event is full!", "error");
        return;
      }

      event.registered++;
      saveToLocalStorage();
      renderEvents(events);
      updateStats();

      showToast("✅ Registered for \"" + event.title + "\"!", "success");
    }

    // ─── CANCEL ──────────────────────────────────────────────────────────────

    function cancelRegistration(id) {
      const event = events.find(function(e) { return e.id === id; });
      if (!event) return;

      if (event.registered <= 0) {
        showToast("ℹ️ No registrations to cancel.", "error");
        return;
      }

      event.registered--;
      saveToLocalStorage();
      renderEvents(events);
      updateStats();

      showToast("❌ Cancelled registration for \"" + event.title + "\"", "cancel");
    }

    // ─── SEARCH ──────────────────────────────────────────────────────────────

    function searchEvents() {
      const query = document.getElementById("searchInput").value.toLowerCase().trim();

      const filtered = events.filter(function(event) {
        return (
          event.title.toLowerCase().includes(query) ||
          event.category.toLowerCase().includes(query)
        );
      });

      renderEvents(filtered);
    }

    // ─── INIT ────────────────────────────────────────────────────────────────

    loadFromLocalStorage();
    renderEvents(events);
    updateStats();