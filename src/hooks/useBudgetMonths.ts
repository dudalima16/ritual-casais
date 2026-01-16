import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesUpdate } from "@/integrations/supabase/types";

export type BudgetMonth = Tables<"budget_months">;
export type BudgetMonthUpdate = TablesUpdate<"budget_months">;

export const useBudgetMonths = () => {
  return useQuery({
    queryKey: ["budget_months"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_months")
        .select("*")
        .order("year", { ascending: false })
        .order("month", { ascending: false });
      
      if (error) throw error;
      return data as BudgetMonth[];
    },
  });
};

export const useCurrentBudgetMonth = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  return useQuery({
    queryKey: ["budget_months", "current", currentYear, currentMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_months")
        .select("*")
        .eq("year", currentYear)
        .eq("month", currentMonth)
        .maybeSingle();
      
      if (error) throw error;
      return data as BudgetMonth | null;
    },
  });
};

export const useClonePreviousMonth = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ year, month }: { year: number; month: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase.rpc("clone_previous_month", {
        _user_id: user.id,
        _year: year,
        _month: month,
      });
      
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget_months"] });
      queryClient.invalidateQueries({ queryKey: ["fixed_expenses"] });
      queryClient.invalidateQueries({ queryKey: ["budget_categories"] });
    },
  });
};

export const useCloseBudgetMonth = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (budgetMonthId: string) => {
      const { data, error } = await supabase
        .from("budget_months")
        .update({ 
          status: "closed",
          closed_at: new Date().toISOString()
        })
        .eq("id", budgetMonthId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget_months"] });
    },
  });
};

export const useCreateBudgetMonth = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ year, month }: { year: number; month: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("budget_months")
        .insert({
          user_id: user.id,
          year,
          month,
          status: "draft",
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget_months"] });
    },
  });
};
