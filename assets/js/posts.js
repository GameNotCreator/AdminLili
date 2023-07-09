$(document).ready(function () {
    checkUserRole();
    checkUserRoleOrder(); 
    loadMenuItems();
    setInterval(loadMenuItems, 5000); // Met à jour les commandes toutes les 5 secondes
    loadOrders();
    setInterval(loadOrders, 5000); // Met à jour les commandes toutes les 5 secondes

    $('#addMenuItemForm').submit(function (e) {
       e.preventDefault();
       const formData = new FormData();
       formData.append('name', $('#name').val());
       formData.append('price', $('#price').val());
       formData.append('description', $('#description').val());
       formData.append('image', $('#image')[0].files[0]);
       $.ajax({
          url: '/api/menu/menu/add',
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          success: function (data) {
             console.log('Article ajouté:', data);
             loadMenuItems();
             $('#addMenuItemForm')[0].reset();
          }
       });
    });
 });

 const shoppingCart = [];
 let totalPrice = 0;
 
 function getCookie(name) {
   let cookieArray = document.cookie.split(';');
   for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
      while (cookie.charAt(0) == ' ') {
         cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) == 0) {
         return cookie.substring(name.length + 1, cookie.length);
      }
   }
   return "";
}

 function checkUserRole() {
    const userRole = getCookie('user_role');
    if (userRole === 'dev' || userRole === 'admin') {
       $('#add-menu-item-form').show();
    } else {
       $('#add-menu-item-form').hide();
    }
 }

 function checkUserRoleOrder() {
   const userRole = getCookie('user_role');
   if (userRole === 'dev' || userRole === 'admin' || userRole === 'serveur') {
      $('#order-access').show();
   } else {
      $('#order-access').hide();
   }
}
  function checkAccess() {
      let user_id = getCookie("user_id");
      let user_role = getCookie("user_role");

      if (user_id !== "" && (user_role === "admin" || user_role === "client" || user_role === "serveur" || user_role === "dev")) {
         return true;
      } else {
         return false;
      }
   }
    
 function loadMenuItems() {
   if (!checkAccess()) {
      window.location.href = "/";
      return;
   }
    $.get('/api/menu/menu', function (data) {
       let menuHtml = '';
       data.forEach(item => {
          menuHtml += `
                  <div class="menu__content">
                     <img src="/uploads/${item.image}" alt="${item.name}" class="menu__img"><br>
                     <h3 class="menu__name">${item.name}</h3><br>
                     <span class="menu__detail">${item.description}</span><br><br>
                     <span class="menu__preci">${item.price}DT</span><br>
                     <button onclick="addToCart('${item._id}', '${item.name}', ${item.price})" class="button-menu">&nbsp Ajouter au panier 🛒&nbsp</button><br>
                  </div>
             `;
       });
       $('#menu-list').html(menuHtml);
    });
 }
 function addToCart(itemId, itemName, itemPrice) { 
    const existingItem = shoppingCart.find(item => item.id === itemId);
    if (existingItem) {
       existingItem.quantity++;
    } else {
       shoppingCart.push({
          id: itemId,
          name: itemName,
          price: itemPrice,
          quantity: 1
       });
    }
    updateCart();
 }
 
 function updateCart() {
    let cartHtml = '';
    totalPrice = 0;
    shoppingCart.forEach(item => {
       cartHtml += `
         <div class="cart-item">
             <h4>${item.name} x${item.quantity}</h4>
             <p>${item.price * item.quantity}DT</p>
             <button onclick="removeFromCart('${item.id}')">×</button>
         </div>
         `;
       totalPrice += item.price * item.quantity;
    });
    $('.cart-items').html(cartHtml);
    $('#total-price').text(totalPrice.toFixed(2));
 }
 function removeFromCart(itemId) {
    const itemIndex = shoppingCart.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
       shoppingCart[itemIndex].quantity--;
       if (shoppingCart[itemIndex].quantity === 0) {
          shoppingCart.splice(itemIndex, 1);
       }
       updateCart();
    }
 }

 function checkout() {
   const orderData = {
       tableId: 1, // Replace this with the actual table ID
       items: shoppingCart,
       totalAmount: totalPrice.toFixed(2),
       firstName: 'John', // Replace this with the actual user's first name
       lastName: 'Doe'// Replace this with the actual user's last name
   };

   console.log("Total price:", totalPrice); // Add this line

   $.ajax({
       url: '/api/orders/orders',
       type: 'POST',
       data: JSON.stringify(orderData),
       contentType: 'application/json',
       success: function (data) {
           console.log('Order submitted:', data);
           shoppingCart.length = 0;
           updateCart();
           alert("Commande passée avec succès ! Votre total de commande est de " + data.totalAmount + "DT");
       }
   });
}


 $('#cart-button').click(function () {
    $('.shopping-cart').animate({
       right: '0'
    }, 200);
 });
 
 $('#close-cart').click(function () {
    $('.shopping-cart').animate({
       right: '-350px'
    }, 200);
 });
 
 $('#checkout').click(function () {
    checkout();
 });
 
 function getCookie(name) {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length === 2) return parts.pop().split(';').shift();
 }

 function fetchOrders(status) {
   return $.get(`/api/orders/orders${status === "archived" ? "/archived" : ""}`);
}

function loadOrders() {
   fetchOrders("in_progress").done((ordersInProgress) => {
       displayOrders(ordersInProgress, "orders-in-progress");
   });

   fetchOrders("archived").done((ordersArchived) => {
       displayOrders(ordersArchived, "orders-archived");
   });

   // Ajouter un écouteur d'événements pour les boutons de changement de statut
   $(document).on("click", ".change-status", function () {
      const orderId = $(this).data("order-id");
      const currentStatus = $(this).data("order-status");
      const newStatus = currentStatus === "in_progress" ? "archived" : "in_progress";
      changeOrderStatus(orderId, newStatus);
   });
}

function cancelOrder(orderId) {
   $.ajax({
      url: `/api/orders/orders/${orderId}/cancel`,
      type: 'PUT',
      success: function (data) {       
         console.log("Commande annulée:", data);
         loadOrders();
   }, }) }


function completeOrder(orderId) {
   $.ajax({
      url: `/api/orders/orders/${orderId}/complete`,
      type: 'PUT',
      success: function (data) {
       console.log("Commande validée:", data);
       loadOrders();
   }, }) }



   function changeOrderStatus(orderId, newStatus) {
      $.ajax({
         url: `/api/orders/orders/update/${orderId}`,
         type: "PUT",
         data: JSON.stringify({ status: newStatus }),
         contentType: "application/json",
         success: function (data) {
            console.log("Statut de la commande mis à jour:", data);
            loadOrders();
         },
         error: function (error) {
            console.log("Erreur lors de la mise à jour du statut de la commande:", error);
         },
      });
   }

   function displayOrders(orders, containerId) {
      const container = document.getElementById(containerId);
      container.innerHTML = "";
   
      orders.forEach((order) => {
          const itemsString = order.items.map(item => `${item.name} x${item.quantity}`).join(', ');
          const orderElement = document.createElement("li");
          orderElement.innerHTML = `
              <h3>Commande #${order._id}</h3>
              <p>Nom: ${order.firstName} ${order.lastName}</p>
              <p>Table: ${order.tableId}</p>
              <p>Contenu de la commande: ${itemsString}</p>
              <p>Total: ${order.totalAmount} €</p>
              <p>Status: ${order.status}</p>
          `;
   
          // Afficher les boutons "Annuler" et "Valider" seulement si la commande n'est pas archivée
          if (order.status !== 'cancelled' && order.status !== 'completed') {
              orderElement.innerHTML += `
                  <button onclick="cancelOrder('${order._id}')" data-order-id="${order._id}">Annuler la commande</button>
                  <button onclick="completeOrder('${order._id}')" data-order-id="${order._id}">Valider la commande</button>
              `;
          }
   
          container.appendChild(orderElement);
      });
   }
   



 