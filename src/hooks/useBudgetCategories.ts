import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type BudgetCategory = Tables<"budget_categories">;
export type BudgetCategoryInsert = TablesInsert<"budget_categories">;
export type BudgetCategoryUpdate = TablesUpdate<"budget_categories">;

export type BudgetCategoryWithDetails = BudgetCategory & {
  categories: { name: string; icon: string; color: string };
};

export const useBudgetCategories = (budgetMonthId?: string) => {
  return useQuery({
    queryKey: ["budget_categories", budgetMonthId],
    queryFn: async () => {
      if (!budgetMonthId) return [];
      
      const { data, error } = await supabase
        .from("budget_categories")
        .select(`
          *,
          categories (name, icon, color)
        `)
        .eq("budget_month_id", budgetMonthId);
      
      if (error) throw error;
      return data as BudgetCategoryWithDetails[];
    },
    enabled: !!budgetMonthId,
  });
};

export const useCreateBudgetCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (budgetCategory: Omit<BudgetCategoryInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("budget_categories")
        .insert({ ...budgetCategory, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budget_categories", variables.budget_month_id] });
    },
  });
};

export const useUpdateBudgetCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: BudgetCategoryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("budget_categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["budget_categories", data.budget_month_id] });
    },
  });
};

export const useDeleteBudgetCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, budgetMonthId }: { id: string; budgetMonthId: string }) => {
      const { error } = await supabase
        .from("budget_categories")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return budgetMonthId;
    },
    onSuccess: (budgetMonthId) => {
      queryClient.invalidateQueries({ queryKey: ["budget_categories", budgetMonthId] });
    },
  });
};

export const useUpsertBudgetCategories = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      budgetMonthId, 
      categories 
    }: { 
      budgetMonthId: string; 
      categories: Array<{ category_id: string; planned_amount: number }>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      // Delete existing budget categories for this month
      await supabase
        .from("budget_categories")
        .delete()
        .eq("budget_month_id", budgetMonthId);
      
      // Insert new ones
      if (categories.length > 0) {
        const { data, error } = await supabase
          .from("budget_categories")
          .insert(
            categories.map(cat => ({
              budget_month_id: budgetMonthId,
              category_id: cat.category_id,
              planned_amount: cat.planned_amount,
              user_id: user.id,
            }))
          )
          .select();
        
        if (error) throw error;
        return data;
      }
      
      return [];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budget_categories", variables.budgetMonthId] });
    },
  });
};
