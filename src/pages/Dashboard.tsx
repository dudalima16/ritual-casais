import { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Upload, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Inbox
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useCurrentBudgetMonth } from "@/hooks/useBudgetMonths";
import { useCategories } from "@/hooks/useCategories";
import { useBudgetCategories } from "@/hooks/useBudgetCategories";
import { useTransactions, useTransactionsByCategory } from "@/hooks/useTransactions";

export default function Dashboard() {
  const { data: currentBudget, isLoading: budgetLoading } = useCurrentBudgetMonth();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: budgetCategories, isLoading: budgetCategoriesLoading } = useBudgetCategories(currentBudget?.id);
  const { data: recentTransactions, isLoading: transactionsLoading } = useTransactions({ limit: 5 });
  const { data: transactionsByCategory } = useTransactionsByCategory(currentBudget?.id);

  const isLoading = budgetLoading || categoriesLoading || budgetCategoriesLoading || transactionsLoading;

  const now = new Date();
  const currentMonth = format(now, "MMMM yyyy", { locale: ptBR });
  const currentMonthCapitalized = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  const monthClosed = currentBudget?.status === "closed";

  // Calculate pending transactions
  const pendingTransactions = useMemo(() => {
    return recentTransactions?.filter(tx => tx.needs_review).length ?? 0;
  }, [recentTransactions]);

  // Calculate category stats
  const categoryStats = useMemo(() => {
    if (!budgetCategories || !transactionsByCategory || !categories) return [];

    return budgetCategories.map(bc => {
      const txCategory = transactionsByCategory.find(
        tc => tc.category?.id === bc.category_id
      );
      const actual = txCategory?.total ?? 0;
      const planned = Number(bc.planned_amount);
      
      return {
        name: bc.categories.name,
        icon: bc.categories.icon,
        color: bc.categories.color,
        planned,
        actual,
        isOver: actual > planned,
      };
    });
  }, [budgetCategories, transactionsByCategory, categories]);

  const totalPlanned = categoryStats.reduce((acc, cat) => acc + cat.planned, 0);
  const totalActual = categoryStats.reduce((acc, cat) => acc + cat.actual, 0);
  const difference = totalActual - totalPlanned;
  const overBudgetCategories = categoryStats.filter(cat => cat.isOver).length;

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState type="page" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{currentMonthCapitalized}</h1>
            <p className="text-muted-foreground">Visão geral do mês corrente</p>
          </div>
          {!monthClosed && (
            <Link to="/budget">
              <Button variant="ritual" className="gap-2">
                <Sparkles className="w-5 h-5" />
                Fechar Mês
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Ritual Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* Day 1 Ritual */}
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Ritual Dia 1</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Clone e feche o orçamento do mês em até 10 minutos.
                  </p>
                  <Link to="/budget">
                    <Button variant="outline" size="sm" className="gap-1">
                      Iniciar <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Prints */}
          <Card className="hover:shadow-card transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <Upload className="w-6 h-6 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Subir Prints</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Toda quarta-feira, suba os extratos do cartão.
                  </p>
                  <Link to="/uploads">
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      Upload <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Import OFX */}
          <Card className="hover:shadow-card transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Importar OFX</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Importe PIX e boletos das suas contas.
                  </p>
                  <Link to="/uploads">
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      Importar <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 md:grid-cols-4"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Planejado</p>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {totalPlanned.toLocaleString('pt-BR')}
                  </p>
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
                  <p className="text-2xl font-bold text-foreground">
                    R$ {totalActual.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${difference > 0 ? 'bg-destructive/10' : 'bg-secondary/10'}`}>
                  {difference > 0 ? (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-secondary" />
                  )}
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
                    {difference > 0 ? '+' : ''}R$ {difference.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${overBudgetCategories > 0 ? 'bg-destructive/10' : 'bg-secondary/10'}`}>
                  {overBudgetCategories > 0 ? (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-foreground">{pendingTransactions}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Categories Overview & Recent Transactions */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Planejado vs Real</CardTitle>
                <Link to="/report">
                  <Button variant="ghost" size="sm" className="text-primary">
                    Ver relatório completo <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryStats.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="Nenhuma categoria configurada"
                    description="Configure seu orçamento para ver a comparação entre planejado e real."
                    action={{
                      label: "Configurar Orçamento",
                      onClick: () => window.location.href = "/budget"
                    }}
                  />
                ) : (
                  categoryStats.map((category, index) => {
                    const percentage = category.planned > 0 
                      ? Math.min((category.actual / category.planned) * 100, 150)
                      : 0;
                    
                    return (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{category.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={category.isOver ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                              R$ {category.actual.toLocaleString('pt-BR')}
                            </span>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-muted-foreground">
                              R$ {category.planned.toLocaleString('pt-BR')}
                            </span>
                            {category.isOver && <AlertTriangle className="w-4 h-4 text-destructive" />}
                          </div>
                        </div>
                        <div className="relative">
                          <Progress 
                            value={Math.min(percentage, 100)} 
                            className={`h-2 ${category.isOver ? '[&>div]:bg-destructive' : '[&>div]:bg-secondary'}`}
                          />
                          {percentage > 100 && (
                            <div 
                              className="absolute top-0 h-2 bg-destructive/30 rounded-full"
                              style={{ left: '66.67%', width: `${Math.min((percentage - 100) / 50 * 33.33, 33.33)}%` }}
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recentes</CardTitle>
                <Link to="/transactions">
                  <Button variant="ghost" size="sm" className="text-primary">
                    Ver todas
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {!recentTransactions || recentTransactions.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="Nenhuma transação"
                    description="Importe transações via OFX ou prints para começar."
                    action={{
                      label: "Importar",
                      onClick: () => window.location.href = "/uploads"
                    }}
                  />
                ) : (
                  recentTransactions.map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{tx.merchant}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            tx.needs_review 
                              ? 'bg-accent/20 text-accent-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {tx.categories?.name ?? 'Pendente'}
                          </span>
                          {tx.confidence === 'low' && (
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-foreground ml-4">
                        -R$ {Math.abs(Number(tx.amount)).toFixed(2).replace('.', ',')}
                      </p>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
