import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type FixedExpense = Tables<"fixed_expenses">;
export type FixedExpenseInsert = TablesInsert<"fixed_expenses">;
export type FixedExpenseUpdate = TablesUpdate<"fixed_expenses">;

export const useFixedExpenses = (budgetMonthId?: string) => {
  return useQuery({
    queryKey: ["fixed_expenses", budgetMonthId],
    queryFn: async () => {
      if (!budgetMonthId) return [];
      
      const { data, error } = await supabase
        .from("fixed_expenses")
        .select("*")
        .eq("budget_month_id", budgetMonthId)
        .order("due_day", { ascending: true, nullsFirst: false });
      
      if (error) throw error;
      return data as FixedExpense[];
    },
    enabled: !!budgetMonthId,
  });
};

export const useCreateFixedExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (expense: Omit<FixedExpenseInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("fixed_expenses")
        .insert({ ...expense, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["fixed_expenses", variables.budget_month_id] });
    },
  });
};

export const useUpdateFixedExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: FixedExpenseUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("fixed_expenses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fixed_expenses", data.budget_month_id] });
    },
  });
};

export const useDeleteFixedExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, budgetMonthId }: { id: string; budgetMonthId: string }) => {
      const { error } = await supabase
        .from("fixed_expenses")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return budgetMonthId;
    },
    onSuccess: (budgetMonthId) => {
      queryClient.invalidateQueries({ queryKey: ["fixed_expenses", budgetMonthId] });
    },
  });
};

export const useToggleFixedExpensePaid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isPaid }: { id: string; isPaid: boolean }) => {
      const { data, error } = await supabase
        .from("fixed_expenses")
        .update({ is_paid: isPaid })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fixed_expenses", data.budget_month_id] });
    },
  });
};
