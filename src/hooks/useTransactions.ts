import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Transaction = Tables<"transactions">;
export type TransactionInsert = TablesInsert<"transactions">;
export type TransactionUpdate = TablesUpdate<"transactions">;

export type TransactionWithCategory = Transaction & {
  categories: { name: string; icon: string; color: string } | null;
};

interface UseTransactionsOptions {
  budgetMonthId?: string;
  needsReview?: boolean;
  isInternal?: boolean;
  limit?: number;
}

export const useTransactions = (options: UseTransactionsOptions = {}) => {
  const { budgetMonthId, needsReview, isInternal, limit } = options;
  
  return useQuery({
    queryKey: ["transactions", options],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select(`
          *,
          categories (name, icon, color)
        `)
        .order("transaction_date", { ascending: false });
      
      if (budgetMonthId) {
        query = query.eq("budget_month_id", budgetMonthId);
      }
      
      if (needsReview !== undefined) {
        query = query.eq("needs_review", needsReview);
      }
      
      if (isInternal !== undefined) {
        query = query.eq("is_internal", isInternal);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as TransactionWithCategory[];
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transaction: Omit<TransactionInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...transaction, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: TransactionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useCategorizeTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      categoryId, 
      confidence = "high" 
    }: { 
      id: string; 
      categoryId: string; 
      confidence?: "high" | "medium" | "low";
    }) => {
      const { data, error } = await supabase
        .from("transactions")
        .update({ 
          category_id: categoryId,
          confidence,
          needs_review: false,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useMarkAsInternal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("transactions")
        .update({ 
          is_internal: true,
          needs_review: false,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useTransactionsByCategory = (budgetMonthId?: string) => {
  return useQuery({
    queryKey: ["transactions", "by_category", budgetMonthId],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select(`
          amount,
          category_id,
          categories (id, name, icon, color)
        `)
        .eq("is_internal", false);
      
      if (budgetMonthId) {
        query = query.eq("budget_month_id", budgetMonthId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Group by category
      const grouped = (data || []).reduce((acc, tx) => {
        const categoryId = tx.category_id || "uncategorized";
        if (!acc[categoryId]) {
          acc[categoryId] = {
            category: tx.categories || { id: "uncategorized", name: "Sem Categoria", icon: "circle-dot", color: "bg-gray-500" },
            total: 0,
            transactions: [],
          };
        }
        acc[categoryId].total += Math.abs(Number(tx.amount));
        acc[categoryId].transactions.push(tx);
        return acc;
      }, {} as Record<string, { category: any; total: number; transactions: any[] }>);
      
      return Object.values(grouped);
    },
    enabled: !!budgetMonthId,
  });
};
