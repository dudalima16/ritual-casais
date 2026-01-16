import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type BankAccount = Tables<"bank_accounts">;
export type BankAccountInsert = TablesInsert<"bank_accounts">;
export type BankAccountUpdate = TablesUpdate<"bank_accounts">;

export const useBankAccounts = (onlyActive = true) => {
  return useQuery({
    queryKey: ["bank_accounts", { onlyActive }],
    queryFn: async () => {
      let query = supabase
        .from("bank_accounts")
        .select("*")
        .order("created_at");
      
      if (onlyActive) {
        query = query.eq("is_active", true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as BankAccount[];
    },
  });
};

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (account: Omit<BankAccountInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("bank_accounts")
        .insert({ ...account, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_accounts"] });
    },
  });
};

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: BankAccountUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_accounts"] });
    },
  });
};

export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bank_accounts")
        .update({ is_active: false })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_accounts"] });
    },
  });
};
