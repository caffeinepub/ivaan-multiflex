import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  type CartItem = {
    productId : Text;
    quantity : Nat;
  };

  type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    originalPrice : ?Nat;
    categoryId : Text;
    stock : Nat;
    sellerId : Principal;
    imageUrl : Storage.ExternalBlob;
    isActive : Bool;
  };

  module Product {
    public func compareByPrice(product1 : Product, product2 : Product) : Order.Order {
      switch (Nat.compare(product1.price, product2.price)) {
        case (#equal) { Text.compare(product1.name, product2.name) };
        case (order) { order };
      };
    };
  };

  type Category = {
    id : Text;
    name : Text;
    description : Text;
  };

  type OrderItem = {
    productId : Text;
    quantity : Nat;
    price : Nat;
  };

  type Order = {
    id : Text;
    items : [OrderItem];
    total : Nat;
    status : OrderStatus;
    customerId : Principal;
    timestamp : Time.Time;
  };

  type OrderStatus = {
    #pending;
    #shipped;
    #delivered;
    #cancelled;
  };

  public type UserProfile = {
    name : Text;
    isSeller : Bool;
  };

  // State
  let products = Map.empty<Text, Product>();
  let categories = Map.empty<Text, Category>();
  let orders = Map.empty<Text, Order>();
  let carts = Map.empty<Principal, List.List<CartItem>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to check if caller is a seller
  func isSeller(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.isSeller };
    };
  };

  // Category Management
  public shared ({ caller }) func createCategory(id : Text, name : Text, description : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };
    let category : Category = {
      id;
      name;
      description;
    };
    categories.add(id, category);
  };

  public query ({ caller }) func getCategory(id : Text) : async ?Category {
    categories.get(id);
  };

  public query ({ caller }) func listCategories() : async [Category] {
    categories.values().toArray();
  };

  // Product Management
  public shared ({ caller }) func createProduct(
    id : Text,
    name : Text,
    description : Text,
    price : Nat,
    originalPrice : ?Nat,
    categoryId : Text,
    stock : Nat,
    imageUrl : Storage.ExternalBlob,
  ) : async () {
    // Only sellers and admins can create products
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create products");
    };
    if (not (isSeller(caller) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only sellers and admins can create products");
    };

    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category does not exist") };
      case (?_) {};
    };

    let product : Product = {
      id;
      name;
      description;
      price;
      originalPrice;
      categoryId;
      stock;
      sellerId = caller;
      imageUrl;
      isActive = true;
    };
    products.add(id, product);
  };

  public shared ({ caller }) func updateProduct(
    id : Text,
    name : Text,
    description : Text,
    price : Nat,
    originalPrice : ?Nat,
    categoryId : Text,
    stock : Nat,
    imageUrl : Storage.ExternalBlob,
    isActive : Bool,
  ) : async () {
    let existingProduct = switch (products.get(id)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?p) { p };
    };

    // Sellers can only update their own products, admins can update any
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      if (existingProduct.sellerId != caller) {
        Runtime.trap("Unauthorized: Sellers can only update their own products");
      };
    };

    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category does not exist") };
      case (?_) {};
    };

    let updatedProduct : Product = {
      id;
      name;
      description;
      price;
      originalPrice;
      categoryId;
      stock;
      sellerId = existingProduct.sellerId; // Preserve original seller
      imageUrl;
      isActive;
    };
    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async () {
    let existingProduct = switch (products.get(id)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?p) { p };
    };

    // Sellers can only delete their own products, admins can delete any
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      if (existingProduct.sellerId != caller) {
        Runtime.trap("Unauthorized: Sellers can only delete their own products");
      };
    };

    products.remove(id);
  };

  public query ({ caller }) func getProduct(id : Text) : async ?Product {
    products.get(id);
  };

  public query ({ caller }) func listProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func listProductsByCategory(categoryId : Text) : async [Product] {
    if (categories.get(categoryId) == null) {
      Runtime.trap("Category does not exist");
    };
    products.values().toArray().filter(func(p) { p.categoryId == categoryId });
  };

  // Cart Management
  public shared ({ caller }) func addToCart(productId : Text, quantity : Nat) : async () {
    // Only authenticated users can use cart
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add to cart");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) {
        if (not product.isActive or product.stock < quantity) {
          Runtime.trap("Invalid product selection");
        };
        let newItem : CartItem = {
          productId;
          quantity;
        };

        let existingCart = switch (carts.get(caller)) {
          case (null) { List.empty<CartItem>() };
          case (?cart) { cart };
        };

        let updatedCart = List.empty<CartItem>();
        var itemAdded = false;

        existingCart.forEach(
          func(item) {
            if (item.productId == productId) {
              updatedCart.add({
                productId;
                quantity = item.quantity + quantity;
              });
              itemAdded := true;
            } else {
              updatedCart.add(item);
            };
          }
        );

        if (not itemAdded) {
          updatedCart.add(newItem);
        };

        carts.add(caller, updatedCart);
      };
    };
  };

  public shared ({ caller }) func removeFromCart(productId : Text, quantity : Nat) : async () {
    // Only authenticated users can use cart
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can remove from cart");
    };

    let existingCart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?cart) { cart };
    };

    let updatedCart = List.empty<CartItem>();

    existingCart.forEach(
      func(item) {
        if (item.productId == productId) {
          if (item.quantity > quantity) {
            updatedCart.add({
              productId;
              quantity = item.quantity - quantity;
            });
          };
        } else {
          updatedCart.add(item);
        };
      }
    );

    carts.add(caller, updatedCart);
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    // Only authenticated users can view cart
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view cart");
    };

    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    // Only authenticated users can clear cart
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can clear cart");
    };

    carts.remove(caller);
  };

  // Order Management
  public shared ({ caller }) func placeOrder(amountPaid : Nat) : async Text {
    // Only authenticated users can place orders
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can place orders");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) { cart };
    };

    let items = List.empty<OrderItem>();
    var total = 0;

    for (cartItem in cart.values()) {
      switch (products.get(cartItem.productId)) {
        case (null) { Runtime.trap("Product does not exist") };
        case (?product) {
          if (cartItem.quantity > product.stock) {
            Runtime.trap("Not enough stock for product: " # product.id);
          };
          let item : OrderItem = {
            productId = cartItem.productId;
            quantity = cartItem.quantity;
            price = product.price;
          };
          items.add(item);
          total += cartItem.quantity * product.price;
        };
      };
    };

    if (total != amountPaid) {
      Runtime.trap("Amount paid does not match cart total");
    };

    let orderId = "ORDER_" # Time.now().toText();
    let order : Order = {
      id = orderId;
      items = items.toArray();
      total;
      status = #pending;
      customerId = caller;
      timestamp = Time.now();
    };

    orders.add(orderId, order);

    for (cartItem in cart.values()) {
      switch (products.get(cartItem.productId)) {
        case (null) {};
        case (?product) {
          let updatedProduct : Product = {
            id = product.id;
            name = product.name;
            description = product.description;
            price = product.price;
            originalPrice = product.originalPrice;
            categoryId = product.categoryId;
            stock = product.stock - cartItem.quantity;
            sellerId = product.sellerId;
            imageUrl = product.imageUrl;
            isActive = product.isActive;
          };
          products.add(cartItem.productId, updatedProduct);
        };
      };
    };

    carts.remove(caller);
    orderId;
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    // Only authenticated users can view their orders
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };

    let userOrders = List.empty<Order>();
    for ((_, order) in orders.entries()) {
      if (order.customerId == caller) {
        userOrders.add(order);
      };
    };
    userOrders.toArray();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, newStatus : OrderStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?o) { o };
    };
    let updatedOrder : Order = {
      id = order.id;
      items = order.items;
      total = order.total;
      status = newStatus;
      customerId = order.customerId;
      timestamp = order.timestamp;
    };
    orders.add(orderId, updatedOrder);
  };
};
