import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type {
  CartItem,
  Category,
  Order,
  OrderStatus,
  Product,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export { ExternalBlob };
export type { Category, Product, CartItem, Order, OrderStatus, UserProfile };

export function useCategories() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => actor!.listCategories(),
    enabled: !!actor,
  });
}

export function useProducts() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["products"],
    queryFn: () => actor!.listProducts(),
    enabled: !!actor,
  });
}

export function useProductsByCategory(categoryId: string) {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["products", categoryId],
    queryFn: () => actor!.listProductsByCategory(categoryId),
    enabled: !!actor && !!categoryId,
  });
}

export function useProduct(id: string) {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => actor!.getProduct(id),
    enabled: !!actor && !!id,
  });
}

export function useCart() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["cart"],
    queryFn: () => actor!.getCart(),
    enabled: !!actor,
  });
}

export function useMyOrders() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["myOrders"],
    queryFn: () => actor!.getMyOrders(),
    enabled: !!actor,
  });
}

export function useAllOrders() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["allOrders"],
    queryFn: () => actor!.getAllOrders(),
    enabled: !!actor,
  });
}

export function useUserRole() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["userRole"],
    queryFn: () => actor!.getCallerUserRole(),
    enabled: !!actor,
  });
}

export function useUserProfile() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: () => actor!.getCallerUserProfile(),
    enabled: !!actor,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: { productId: string; quantity: bigint }) =>
      actor!.addToCart(productId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: { productId: string; quantity: bigint }) =>
      actor!.removeFromCart(productId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => actor!.clearCart(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amountPaid: bigint) => actor!.placeOrder(amountPaid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      description,
    }: { id: string; name: string; description: string }) =>
      actor!.createCategory(id, name, description),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: {
      id: string;
      name: string;
      description: string;
      price: bigint;
      originalPrice: bigint | null;
      categoryId: string;
      stock: bigint;
      imageUrl: string;
      imageBytes?: Uint8Array;
      onUploadProgress?: (pct: number) => void;
    }) => {
      let blob = p.imageBytes
        ? ExternalBlob.fromBytes(p.imageBytes as Uint8Array<ArrayBuffer>)
        : ExternalBlob.fromURL(p.imageUrl);
      if (p.onUploadProgress) {
        blob = blob.withUploadProgress(p.onUploadProgress);
      }
      return actor!.createProduct(
        p.id,
        p.name,
        p.description,
        p.price,
        p.originalPrice,
        p.categoryId,
        p.stock,
        blob,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: {
      id: string;
      name: string;
      description: string;
      price: bigint;
      originalPrice: bigint | null;
      categoryId: string;
      stock: bigint;
      imageUrl: string;
      imageBytes?: Uint8Array;
      isActive: boolean;
      onUploadProgress?: (pct: number) => void;
    }) => {
      let blob = p.imageBytes
        ? ExternalBlob.fromBytes(p.imageBytes as Uint8Array<ArrayBuffer>)
        : ExternalBlob.fromURL(p.imageUrl);
      if (p.onUploadProgress) {
        blob = blob.withUploadProgress(p.onUploadProgress);
      }
      return actor!.updateProduct(
        p.id,
        p.name,
        p.description,
        p.price,
        p.originalPrice,
        p.categoryId,
        p.stock,
        blob,
        p.isActive,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: { orderId: string; status: OrderStatus }) =>
      actor!.updateOrderStatus(orderId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allOrders"] }),
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profile: UserProfile) => actor!.saveCallerUserProfile(profile),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] }),
  });
}
