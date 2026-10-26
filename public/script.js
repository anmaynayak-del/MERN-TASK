const API_URL = "/api/items";

const form = document.getElementById("itemForm");
const itemIdInput = document.getElementById("itemId");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const tableBody = document.getElementById("itemsTableBody");

let isEditing = false;

// Fetch and display all items (READ)
async function fetchItems() {
  try {
    const res = await fetch(API_URL);
    const items = await res.json();
    renderTable(items);
  } catch (error) {
    console.error("Error fetching items:", error);
  }
}

// Render items into the table
function renderTable(items) {
  tableBody.innerHTML = "";

  if (items.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4">No items found</td></tr>`;
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.price}</td>
      <td>
        <button class="edit-btn" onclick="startEdit(${item.id}, '${escapeHtml(item.name)}', ${item.price})">Edit</button>
        <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Handle Form Submit (CREATE / UPDATE)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value);

  if (!name || isNaN(price)) {
    alert("Please provide valid Name and Price");
    return;
  }

  try {
    if (isEditing) {
      // UPDATE (PUT)
      const id = itemIdInput.value;
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price }),
      });

      if (!res.ok) throw new Error("Failed to update item");
    } else {
      // CREATE (POST)
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price }),
      });

      if (!res.ok) throw new Error("Failed to create item");
    }

    resetForm();
    fetchItems();
  } catch (error) {
    console.error("Error saving item:", error);
    alert(error.message);
  }
});

// Prepare form for editing
function startEdit(id, name, price) {
  isEditing = true;
  itemIdInput.value = id;
  nameInput.value = name;
  priceInput.value = price;

  submitBtn.textContent = "Update";
  cancelBtn.style.display = "inline-block";
  nameInput.focus();
}

// Cancel edit
cancelBtn.addEventListener("click", resetForm);

function resetForm() {
  isEditing = false;
  itemIdInput.value = "";
  form.reset();
  submitBtn.textContent = "Submit";
  cancelBtn.style.display = "none";
}

// DELETE an item
async function deleteItem(id) {
  if (!confirm(`Are you sure you want to delete item #${id}?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete item");

    // If currently editing this item, reset form
    if (isEditing && itemIdInput.value == id) {
      resetForm();
    }

    fetchItems();
  } catch (error) {
    console.error("Error deleting item:", error);
    alert(error.message);
  }
}

function escapeHtml(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// Initial fetch on page load
fetchItems();
