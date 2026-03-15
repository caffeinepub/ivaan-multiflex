import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Category {
    id: string;
    name: string;
    description: string;
}
export type Time = bigint;
export interface OrderItem {
    productId: string;
    quantity: bigint;
    price: bigint;
}
export interface CartItem {
    productId: string;
    quantity: bigint;
}
export interface Order {
    id: string;
    status: OrderStatus;
    total: bigint;
    timestamp: Time;
    customerId: Principal;
    items: Array<OrderItem>;
}
export interface UserProfile {
    name: string;
    isSeller: boolean;
}
export interface Product {
    id: string;
    categoryId: string;
    originalPrice?: bigint;
    name: string;
    description: string;
    isActive: boolean;
    stock: bigint;
    imageUrl: ExternalBlob;
    sellerId: Principal;
    price: bigint;
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToCart(productId: string, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    createCategory(id: string, name: string, description: string): Promise<void>;
    createProduct(id: string, name: string, description: string, price: bigint, originalPrice: bigint | null, categoryId: string, stock: bigint, imageUrl: ExternalBlob): Promise<void>;
    deleteProduct(id: string): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getCategory(id: string): Promise<Category | null>;
    getMyOrders(): Promise<Array<Order>>;
    getProduct(id: string): Promise<Product | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listCategories(): Promise<Array<Category>>;
    listProducts(): Promise<Array<Product>>;
    listProductsByCategory(categoryId: string): Promise<Array<Product>>;
    placeOrder(amountPaid: bigint): Promise<string>;
    removeFromCart(productId: string, quantity: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void>;
    updateProduct(id: string, name: string, description: string, price: bigint, originalPrice: bigint | null, categoryId: string, stock: bigint, imageUrl: ExternalBlob, isActive: boolean): Promise<void>;
}
