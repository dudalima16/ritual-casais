import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type CreditCard = Tables<"credit_cards">;
export type CreditCardInsert = TablesInsert<"credit_cards">;
export type CreditCardUpdate = TablesUpdate<"credit_cards">;

export const useCreditCards = (onlyActive = true) => {
  return useQuery({
    queryKey: ["credit_cards", { onlyActive }],
    queryFn: async () => {
      let query = supabase
        .from("credit_cards")
        .select("*")
        .order("created_at");
      
      if (onlyActive) {
        query = query.eq("is_active", true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CreditCard[];
    },
  });
};

export const useCreateCreditCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (card: Omit<CreditCardInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("credit_cards")
        .insert({ ...card, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
    },
  });
};

export const useUpdateCreditCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: CreditCardUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("credit_cards")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
    },
  });
};

export const useDeleteCreditCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("credit_cards")
        .update({ is_active: false })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
    },
  });
};
