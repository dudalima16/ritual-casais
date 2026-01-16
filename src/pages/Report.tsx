import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Check,
  ChevronDown,
  Download,
  Calendar,
  Inbox
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useCurrentBudgetMonth } from "@/hooks/useBudgetMonths";
import { useBudgetCategories } from "@/hooks/useBudgetCategories";
import { useTransactionsByCategory } from "@/hooks/useTransactions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function Report() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const now = new Date();
  const monthName = format(now, "MMMM yyyy", { locale: ptBR });
  const monthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const { data: currentBudget, isLoading: budgetLoading } = useCurrentBudgetMonth();
  const { data: budgetCategories, isLoading: categoriesLoading } = useBudgetCategories(currentBudget?.id);
  const { data: transactionsByCategory, isLoading: transactionsLoading } = useTransactionsByCategory(currentBudget?.id);

  const isLoading = budgetLoading || categoriesLoading || transactionsLoading;

  const reportData = useMemo(() => {
    if (!budgetCategories) return [];

    return budgetCategories.map(bc => {
      const txCategory = transactionsByCategory?.find(tc => tc.category?.id === bc.category_id);
      const actual = txCategory?.total ?? 0;
      const planned = Number(bc.planned_amount);
      
      return {
        name: bc.categories.name,
        planned,
        actual,
        isOver: actual > planned,
        transactions: txCategory?.transactions ?? [],
      };
    });
  }, [budgetCategories, transactionsByCategory]);

  const totalPlanned = reportData.reduce((acc, cat) => acc + cat.planned, 0);
  const totalActual = reportData.reduce((acc, cat) => acc + cat.actual, 0);
  const difference = totalActual - totalPlanned;
  const overBudgetCount = reportData.filter((cat) => cat.isOver).length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Planejado:</span>
              <span className="font-medium text-primary">R$ {payload[0]?.value?.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Real:</span>
              <span className={`font-medium ${payload[1]?.value > payload[0]?.value ? 'text-destructive' : 'text-secondary'}`}>
                R$ {payload[1]?.value?.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto">
          <LoadingState type="page" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Relatório</h1>
            <p className="text-muted-foreground">Planejado vs Real por categoria</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
              {monthNameCapitalized}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-4"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Planejado</p>
                  <p className="text-2xl font-bold text-foreground">R$ {totalPlanned.toLocaleString('pt-BR')}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Real</p>
                  <p className="text-2xl font-bold text-foreground">R$ {totalActual.toLocaleString('pt-BR')}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${difference > 0 ? 'bg-destructive/10' : 'bg-secondary/10'}`}>
                  {difference > 0 ? <TrendingDown className="w-5 h-5 text-destructive" /> : <TrendingUp className="w-5 h-5 text-secondary" />}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Diferença</p>
                  <p className={`text-2xl font-bold ${difference > 0 ? 'text-destructive' : 'text-secondary'}`}>
                    {difference > 0 ? '+' : ''}R$ {Math.abs(difference).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${difference > 0 ? 'bg-destructive/10' : 'bg-secondary/10'}`}>
                  {difference > 0 ? <AlertTriangle className="w-5 h-5 text-destructive" /> : <Check className="w-5 h-5 text-secondary" />}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estouros</p>
                  <p className={`text-2xl font-bold ${overBudgetCount > 0 ? 'text-destructive' : 'text-secondary'}`}>{overBudgetCount} categorias</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${overBudgetCount > 0 ? 'bg-destructive/10' : 'bg-secondary/10'}`}>
                  <AlertTriangle className={`w-5 h-5 ${overBudgetCount > 0 ? 'text-destructive' : 'text-secondary'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {reportData.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Nenhum dado para exibir"
            description="Configure seu orçamento para ver o relatório comparativo."
            action={{ label: "Configurar Orçamento", onClick: () => window.location.href = "/budget" }}
          />
        ) : (
          <>
            {/* Chart */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Comparativo por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                        <YAxis tickFormatter={(value) => `R$${value/1000}k`} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="planned" name="Planejado" fill="hsl(207, 78%, 28%)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="actual" name="Real" radius={[4, 4, 0, 0]}>
                          {reportData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isOver ? "hsl(0, 70%, 70%)" : "hsl(166, 73%, 37%)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Details */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes por Categoria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {reportData.map((category, index) => {
                    const isExpanded = expandedCategory === category.name;
                    return (
                      <motion.div key={category.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
                          className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${category.isOver ? 'bg-destructive/5 hover:bg-destructive/10' : 'bg-muted/30 hover:bg-muted/50'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${category.isOver ? 'bg-destructive' : 'bg-secondary'}`} />
                            <span className="font-medium text-foreground">{category.name}</span>
                            {category.isOver && <AlertTriangle className="w-4 h-4 text-destructive" />}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`font-semibold ${category.isOver ? 'text-destructive' : 'text-foreground'}`}>R$ {category.actual.toLocaleString('pt-BR')}</p>
                              <p className="text-xs text-muted-foreground">/ R$ {category.planned.toLocaleString('pt-BR')}</p>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                        <AnimatePresence>
                          {isExpanded && category.transactions.length > 0 && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="pl-7 pr-4 py-3 space-y-2">
                                {category.transactions.map((tx: any, txIndex: number) => (
                                  <div key={txIndex} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20">
                                    <p className="text-sm font-medium text-foreground">Transação</p>
                                    <p className="text-sm font-medium text-foreground">-R$ {Math.abs(Number(tx.amount)).toFixed(2).replace('.', ',')}</p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
