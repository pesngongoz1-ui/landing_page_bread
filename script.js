// ============================================================
// 📌 1. วาง Web App URL ที่ได้จาก Google Apps Script ในอัญประกาศด้านล่างนี้
// ============================================================
const webAppUrl = "https://script.google.com/macros/s/AKfycbz6U-9CITTSlA7kxga8Vw0W5gPabS8_ycKY6TxdK-GS_OSWxUWVeBr8Wp8Wln8zjZ5RxQ/exec"; 


// ============================================================
// 📌 2. โค้ดการทำงานของระบบ (ไม่ต้องแก้ไขส่วนนี้ครับ)
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const productContainer = document.getElementById("product-list");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // ดึงข้อมูลจาก product.json มาแสดง
  if (productContainer) {
    fetch("product.json")
      .then((res) => {
        if (!res.ok) throw new Error("ไม่สามารถอ่านไฟล์ product.json ได้");
        return res.json();
      })
      .then((data) => {
        const urlParams = new URLSearchParams(window.location.search);
        const moodParam = urlParams.get("mood") || urlParams.get("category");

        if (moodParam && moodParam !== "all") {
          const filtered = data.filter(
            (p) => p.category.toLowerCase() === moodParam.toLowerCase()
          );
          renderProducts(filtered);
          setActiveButton(moodParam);
        } else {
          renderProducts(data);
        }

        // ระบบปุ่มกรองสินค้า
        filterButtons.forEach((btn) => {
          btn.addEventListener("click", () => {
            const category = btn.getAttribute("data-category");
            filterButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            if (category === "all") {
              renderProducts(data);
            } else {
              const filtered = data.filter(
                (p) => p.category.toLowerCase() === category.toLowerCase()
              );
              renderProducts(filtered);
            }
          });
        });
      })
      .catch((err) => {
        console.error("Error:", err);
        productContainer.innerHTML =
          "<p style='text-align:center; grid-column: 1/-1;'>เกิดข้อผิดพลาดในการโหลดรายการสินค้า</p>";
      });
  }

  // จัดการการส่งฟอร์มสั่งซื้อในหน้า order.html
  const orderForm = document.getElementById("orderForm");
  if (orderForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const itemName = urlParams.get("item");
    const itemPrice = urlParams.get("price");

    if (itemName) document.getElementById("items").value = itemName;
    if (itemPrice) document.getElementById("total").value = itemPrice + " บาท";

    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const submitBtn = orderForm.querySelector(".btn-submit");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "กำลังส่งข้อมูล...";
      }

      const payload = {
        customerName: document.getElementById("customerName").value,
        contact: document.getElementById("contact").value,
        items: document.getElementById("items").value,
        total: document.getElementById("total").value,
        note: document.getElementById("note").value
      };

      // ส่งข้อมูลไปยัง Google Sheets
      if (webAppUrl && !webAppUrl.includes("ใส่_WEB_APP_URL")) {
        fetch(webAppUrl, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        })
          .then(() => {
            window.location.href = "receipt.html";
          })
          .catch((err) => {
            console.error("Error:", err);
            alert("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง");
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerText = "ยืนยันการสั่งซื้อ";
            }
          });
      } else {
        // หากยังไม่ได้ใส่ URL ให้ย้ายไปหน้าขอบคุณทันทีเพื่อทดสอบ
        window.location.href = "receipt.html";
      }
    });
  }
});

function renderProducts(products) {
  const container = document.getElementById("product-list");
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML =
      "<p style='text-align:center; grid-column: 1/-1;'>ไม่พบสินค้าในหมวดหมู่นี้</p>";
    return;
  }

  container.innerHTML = products
    .map(
      (item) => `
    <div class="product-card">
      <img src="${item.image}" alt="${item.name}" class="product-img" onerror="this.src='https://via.placeholder.com/300x300?text=Daily+Bake'">
      <div class="product-info">
        <span class="badge ${item.category.toLowerCase()}">${item.category}</span>
        <h3>${item.name}</h3>
        <p class="description">${item.description}</p>
        <div class="price-row">
          <span class="price">${item.price} บาท</span>
          <a href="order.html?item=${encodeURIComponent(item.name)}&price=${item.price}" class="btn-buy">สั่งซื้อ</a>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

function setActiveButton(category) {
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    if (btn.getAttribute("data-category").toLowerCase() === category.toLowerCase()) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}