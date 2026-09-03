// ==========================================================
// LUCCA PIZZERIA
// Cardápio, carrinho, WhatsApp, reservas e formulários
// ==========================================================

const PRODUCTS = [
    { id: 1, name: "Moda da Casa", category: "especiais", price: 58, image: "moda-casa.jpg" },
    { id: 2, name: "Portuguesa", category: "classicas", price: 52, image: "portuguesa.jpg" },
    { id: 3, name: "Frango com Catupiry", category: "classicas", price: 54, image: "frango-catupiry.jpg" },
    { id: 4, name: "Margherita", category: "classicas", price: 48, image: "margherita.jpg" },
    { id: 5, name: "Baiana", category: "especiais", price: 56, image: "baiana.jpg" },
    { id: 6, name: "Carijó", category: "especiais", price: 59, image: "carijo.jpg" },
    { id: 7, name: "Calabresa", category: "classicas", price: 49, image: "calabresa.jpg" },
    { id: 8, name: "Rúcula", category: "especiais", price: 55, image: "rucula.jpg" },
    { id: 9, name: "Brigadeiro com morango", category: "doces", price: 52, image: "brigadeiro-morango.jpg" },
    { id: 10, name: "Brigadeiro com leite ninho", category: "doces", price: 52, image: "brigadeiro-ninho.jpg" },
    { id: 11, name: "Banana nevada", category: "doces", price: 49, image: "banana-nevada.jpg" },
    { id: 12, name: "Sorvete napolitano", category: "doces", price: 56, image: "sorvete-napolitano.jpg" }
];

const WHATSAPP_NUMBER = "5514991820718";
const CART_STORAGE_KEY = "lucca-cart";
const RESERVATIONS_STORAGE_KEY = "lucca-reservas";

const select = (selector, context = document) => context.querySelector(selector);
const selectAll = (selector, context = document) => [...context.querySelectorAll(selector)];

let cart = readStorage(CART_STORAGE_KEY, []);

function readStorage(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
        console.warn(`Não foi possível ler ${key}:`, error);
        return fallback;
    }
}

function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function showToast(message) {
    const toast = select("[data-toast]");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    window.setTimeout(() => toast.classList.remove("show"), 2200);
}

// ----------------------------------------------------------
// Cardápio
// ----------------------------------------------------------

function renderProducts(filter = "todos") {
    const productGrid = select("[data-product-grid]");

    if (!productGrid) return;

    const visibleProducts = filter === "todos"
        ? PRODUCTS
        : PRODUCTS.filter(product => product.category === filter);

    productGrid.innerHTML = visibleProducts.map(product => `
        <article class="pizza-card">
            <img src="assets/img/${product.image}" alt="Pizza ${product.name}">

            <div class="row">
                <div>
                    <h3>${product.name}</h3>
                    <p>${formatCurrency(product.price)}</p>
                </div>

                <button
                    class="add"
                    type="button"
                    data-add="${product.id}"
                    aria-label="Adicionar ${product.name} ao carrinho"
                >+</button>
            </div>
        </article>
    `).join("");

    selectAll("[data-add]").forEach(button => {
        button.addEventListener("click", () => addProductToCart(Number(button.dataset.add)));
    });
}

function setupProductFilters() {
    selectAll("[data-filter]").forEach(button => {
        button.addEventListener("click", () => {
            selectAll("[data-filter]").forEach(filter => filter.classList.remove("active"));
            button.classList.add("active");
            renderProducts(button.dataset.filter);
        });
    });
}

// ----------------------------------------------------------
// Carrinho
// ----------------------------------------------------------

function saveCart() {
    writeStorage(CART_STORAGE_KEY, cart);
    renderCart();
}

function addProductToCart(productId) {
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    saveCart();
    showToast("Pizza adicionada ao carrinho");
}

function changeProductQuantity(productId, amount) {
    const cartItem = cart.find(item => item.id === productId);

    if (!cartItem) return;

    cartItem.quantity += amount;

    if (cartItem.quantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    }

    saveCart();
}

function getCartTotal() {
    return cart.reduce((total, item) => {
        const product = PRODUCTS.find(productItem => productItem.id === item.id);
        return product ? total + product.price * item.quantity : total;
    }, 0);
}

function renderCart() {
    const cartItems = select("[data-cart-items]");
    const cartQuantity = cart.reduce((total, item) => total + item.quantity, 0);

    selectAll("[data-cart-count]").forEach(counter => {
        counter.textContent = cartQuantity;
    });

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty">Seu carrinho está vazio.</p>';
        select("[data-cart-total]").textContent = formatCurrency(0);
        return;
    }

    cartItems.innerHTML = cart.map(item => {
        const product = PRODUCTS.find(productItem => productItem.id === item.id);

        if (!product) return "";

        return `
            <div class="cart-item">
                <img src="assets/img/${product.image}" alt="Pizza ${product.name}">

                <div>
                    <b>${product.name}</b>
                    <small>${formatCurrency(product.price)}</small>
                </div>

                <div class="qty" aria-label="Quantidade de ${product.name}">
                    <button type="button" data-decrease="${product.id}" aria-label="Diminuir quantidade">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" data-increase="${product.id}" aria-label="Aumentar quantidade">+</button>
                </div>
            </div>
        `;
    }).join("");

    select("[data-cart-total]").textContent = formatCurrency(getCartTotal());

    selectAll("[data-increase]").forEach(button => {
        button.addEventListener("click", () => changeProductQuantity(Number(button.dataset.increase), 1));
    });

    selectAll("[data-decrease]").forEach(button => {
        button.addEventListener("click", () => changeProductQuantity(Number(button.dataset.decrease), -1));
    });
}

function openCart() {
    renderCart();
    select("[data-cart-overlay]")?.classList.add("open");
    document.body.classList.add("cart-open");
}

function closeCart() {
    select("[data-cart-overlay]")?.classList.remove("open");
    document.body.classList.remove("cart-open");
}

function clearCart() {
    cart = [];
    saveCart();
    showToast("Carrinho limpo");
}

function checkoutOnWhatsApp() {
    if (cart.length === 0) {
        showToast("Adicione uma pizza primeiro");
        return;
    }

    const customerName = select("[data-customer-name]")?.value.trim() || "Cliente";

    const orderLines = cart.map(item => {
        const product = PRODUCTS.find(productItem => productItem.id === item.id);
        const subtotal = product.price * item.quantity;
        return `${item.quantity}x ${product.name} - ${formatCurrency(subtotal)}`;
    });

    const message = [
        `Olá! Sou ${customerName} e gostaria de fazer o pedido:`,
        "",
        ...orderLines,
        "",
        `Total: ${formatCurrency(getCartTotal())}`
    ].join("\n");

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

function setupCart() {
    select("[data-open-cart]")?.addEventListener("click", openCart);
    select("[data-close-cart]")?.addEventListener("click", closeCart);
    select("[data-clear-cart]")?.addEventListener("click", clearCart);
    select("[data-whatsapp]")?.addEventListener("click", checkoutOnWhatsApp);

    select("[data-cart-overlay]")?.addEventListener("click", event => {
        if (event.target === event.currentTarget) closeCart();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeCart();
    });
}

// ----------------------------------------------------------
// Menu mobile
// ----------------------------------------------------------

function setupMobileMenu() {
    const menuButton = select(".menu-toggle");
    const navigation = select(".main-nav");

    if (!menuButton || !navigation) return;

    menuButton.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.textContent = isOpen ? "×" : "☰";
    });

    selectAll("a", navigation).forEach(link => {
        link.addEventListener("click", () => {
            navigation.classList.remove("open");
            menuButton.setAttribute("aria-expanded", "false");
            menuButton.textContent = "☰";
        });
    });
}

// ----------------------------------------------------------
// Reservas
// ----------------------------------------------------------

function renderReservations() {
    const reservationsContainer = select("[data-reservations]");

    if (!reservationsContainer) return;

    const reservations = readStorage(RESERVATIONS_STORAGE_KEY, []);
    const peopleTotal = reservations.reduce((total, reservation) => {
        return total + Number(reservation.pessoas);
    }, 0);

    select("[data-res-count]").textContent = reservations.length;
    select("[data-people-count]").textContent = peopleTotal;

    if (reservations.length === 0) {
        reservationsContainer.innerHTML = '<p class="empty">Nenhuma reserva cadastrada.</p>';
        return;
    }

    reservationsContainer.innerHTML = reservations.map((reservation, index) => `
        <div class="reservation-item">
            <span>
                <b>${reservation.nome}</b>
                · ${reservation.data} às ${reservation.horario}
                · ${reservation.pessoas} pessoa(s)
            </span>

            <button class="text-button" type="button" data-remove-reservation="${index}">
                Cancelar
            </button>
        </div>
    `).join("");

    selectAll("[data-remove-reservation]").forEach(button => {
        button.addEventListener("click", () => removeReservation(Number(button.dataset.removeReservation)));
    });
}

function removeReservation(index) {
    const reservations = readStorage(RESERVATIONS_STORAGE_KEY, []);
    reservations.splice(index, 1);
    writeStorage(RESERVATIONS_STORAGE_KEY, reservations);
    renderReservations();
    showToast("Reserva cancelada");
}

function setupReservationForm() {
    const reservationForm = select("[data-reservation-form]");

    if (!reservationForm) return;

    const dateInput = select('input[name="data"]', reservationForm);
    if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

    reservationForm.addEventListener("submit", event => {
        event.preventDefault();

        const reservation = Object.fromEntries(new FormData(reservationForm));
        const reservations = readStorage(RESERVATIONS_STORAGE_KEY, []);

        reservations.push(reservation);
        writeStorage(RESERVATIONS_STORAGE_KEY, reservations);

        reservationForm.reset();
        renderReservations();
        showToast("Reserva confirmada!");
    });

    renderReservations();
}

// ----------------------------------------------------------
// Formulários demonstrativos
// ----------------------------------------------------------

function setupSimpleForms() {
    selectAll("[data-contact-form], [data-job-form]").forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();
            form.reset();
            showToast("Formulário enviado com sucesso!");
        });
    });
}

// Inicialização
function initializeApp() {
    renderProducts();
    renderCart();
    setupProductFilters();
    setupCart();
    setupMobileMenu();
    setupReservationForm();
    setupSimpleForms();
}

document.addEventListener("DOMContentLoaded", initializeApp);
