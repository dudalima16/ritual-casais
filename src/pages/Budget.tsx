import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Copy, 
  Check, 
  Pencil, 
  Lock,
  ChevronRight,
  CreditCard,
  Home,
  AlertCircle,
  Sparkles,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useCurrentBudgetMonth, useClonePreviousMonth, useCloseBudgetMonth, useBudgetMonths } from "@/hooks/useBudgetMonths";
import { useFixedExpenses, useUpdateFixedExpense, useCreateFixedExpense } from "@/hooks/useFixedExpenses";
import { useBudgetCategories, useUpdateBudgetCategory, useCreateBudgetCategory } from "@/hooks/useBudgetCategories";
import { useCreditCards, useUpdateCreditCard } from "@/hooks/useCreditCards";
import { useCategories } from "@/hooks/useCategories";
import * as LucideIcons from "lucide-react";

type Step = "clone" | "edit" | "close";

export default function Budget() {
  const [currentStep, setCurrentStep] = useState<Step>("clone");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [localBudgetCategories, setLocalBudgetCategories] = useState<Record<string, number>>({});
  const [localFixedExpenses, setLocalFixedExpenses] = useState<Record<string, number>>({});
  const [localCardLimits, setLocalCardLimits] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const monthName = format(now, "MMMM yyyy", { locale: ptBR });
  const monthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // Queries
  const { data: currentBudget, isLoading: budgetLoading } = useCurrentBudgetMonth();
  const { data: allBudgets } = useBudgetMonths();
  const { data: fixedExpenses, isLoading: fixedLoading } = useFixedExpenses(currentBudget?.id);
  const { data: budgetCategories, isLoading: categoriesLoading } = useBudgetCategories(currentBudget?.id);
  const { data: creditCards, isLoading: cardsLoading } = useCreditCards();
  const { data: categories } = useCategories();

  // Mutations
  const clonePreviousMonth = useClonePreviousMonth();
  const closeBudgetMonth = useCloseBudgetMonth();
  const updateFixedExpense = useUpdateFixedExpense();
  const createFixedExpense = useCreateFixedExpense();
  const updateBudgetCategory = useUpdateBudgetCategory();
  const createBudgetCategory = useCreateBudgetCategory();
  const updateCreditCard = useUpdateCreditCard();

  const isLoading = budgetLoading || fixedLoading || categoriesLoading || cardsLoading;

  // Check if there's a previous budget to clone from
  const hasPreviousBudget = useMemo(() => {
    if (!allBudgets) return false;
    return allBudgets.some(b => 
      (b.year < currentYear) || 
      (b.year === currentYear && b.month < currentMonth)
    );
  }, [allBudgets, currentYear, currentMonth]);

  // Update step based on budget status
  useEffect(() => {
    if (currentBudget) {
      if (currentBudget.status === "closed") {
        setCurrentStep("close");
      } else if (budgetCategories && budgetCategories.length > 0) {
        setCurrentStep("edit");
      }
    }
  }, [currentBudget, budgetCategories]);

  // Initialize local state from fetched data
  useEffect(() => {
    if (budgetCategories) {
      const catMap: Record<string, number> = {};
      budgetCategories.forEach(bc => {
        catMap[bc.category_id] = Number(bc.planned_amount);
      });
      setLocalBudgetCategories(catMap);
    }
  }, [budgetCategories]);

  useEffect(() => {
    if (fixedExpenses) {
      const expMap: Record<string, number> = {};
      fixedExpenses.forEach(fe => {
        expMap[fe.id] = Number(fe.amount);
      });
      setLocalFixedExpenses(expMap);
    }
  }, [fixedExpenses]);

  useEffect(() => {
    if (creditCards) {
      const cardMap: Record<string, number> = {};
      creditCards.forEach(cc => {
        cardMap[cc.id] = Number(cc.budget_limit);
      });
      setLocalCardLimits(cardMap);
    }
  }, [creditCards]);

  const steps: { key: Step; label: string; description: string }[] = [
    { key: "clone", label: "Clonar", description: "Clone o mês anterior" },
    { key: "edit", label: "Ajustar", description: "Faça ajustes rápidos" },
    { key: "close", label: "Fechar", description: "Feche o orçamento" },
  ];

  const handleClone = async () => {
    try {
      await clonePreviousMonth.mutateAsync({ year: currentYear, month: currentMonth });
      toast({
        title: "Mês clonado!",
        description: "O orçamento do mês anterior foi copiado.",
      });
      setCurrentStep("edit");
    } catch (error) {
      toast({
        title: "Erro ao clonar",
        description: "Não foi possível clonar o mês anterior.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async (categoryId: string, value: number) => {
    setLocalBudgetCategories(prev => ({ ...prev, [categoryId]: value }));
    
    const existingBc = budgetCategories?.find(bc => bc.category_id === categoryId);
    if (existingBc) {
      await updateBudgetCategory.mutateAsync({ id: existingBc.id, planned_amount: value });
    } else if (currentBudget) {
      await createBudgetCategory.mutateAsync({
        budget_month_id: currentBudget.id,
        category_id: categoryId,
        planned_amount: value,
      });
    }
  };

  const handleUpdateFixed = async (expenseId: string, amount: number) => {
    setLocalFixedExpenses(prev => ({ ...prev, [expenseId]: amount }));
    await updateFixedExpense.mutateAsync({ id: expenseId, amount });
  };

  const handleUpdateCard = async (cardId: string, budgetLimit: number) => {
    setLocalCardLimits(prev => ({ ...prev, [cardId]: budgetLimit }));
    await updateCreditCard.mutateAsync({ id: cardId, budget_limit: budgetLimit });
  };

  const handleCloseMonth = async () => {
    if (!currentBudget) return;
    
    try {
      await closeBudgetMonth.mutateAsync(currentBudget.id);
      setShowConfirmModal(false);
      toast({
        title: "🎉 Mês fechado com sucesso!",
        description: `O orçamento de ${monthNameCapitalized} está definido. Bom ritual!`,
      });
    } catch (error) {
      toast({
        title: "Erro ao fechar mês",
        description: "Não foi possível fechar o mês.",
        variant: "destructive",
      });
    }
  };

  const totalPlanned = Object.values(localBudgetCategories).reduce((acc, val) => acc + val, 0);
  const totalFixed = Object.values(localFixedExpenses).reduce((acc, val) => acc + val, 0);
  const totalCardLimit = Object.values(localCardLimits).reduce((acc, val) => acc + val, 0);

  const isMonthClosed = currentBudget?.status === "closed";

  // Helper to get icon component
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = LucideIcons;
    const formattedName = iconName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    return icons[formattedName] || icons.CircleDot;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <LoadingState type="page" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Ritual Dia 1</h1>
          <p className="text-muted-foreground">{monthNameCapitalized} • Meta: 10 minutos</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex">
                {steps.map((step, index) => {
                  const stepIndex = steps.findIndex(s => s.key === currentStep);
                  const isActive = step.key === currentStep;
                  const isCompleted = index < stepIndex || isMonthClosed;
                  
                  return (
                    <div
                      key={step.key}
                      className={`flex-1 flex items-center gap-3 p-4 border-b-2 transition-colors ${
                        isActive ? 'border-primary bg-primary/5' :
                        isCompleted ? 'border-secondary bg-secondary/5' :
                        'border-transparent bg-muted/30'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isActive ? 'gradient-primary text-primary-foreground' :
                        isCompleted ? 'bg-secondary text-secondary-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                      </div>
                      <div className="hidden sm:block">
                        <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                      {index < steps.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto hidden md:block" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === "clone" && !isMonthClosed && (
            <motion.div
              key="clone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-2 border-dashed border-primary/30">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                    <Copy className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    {hasPreviousBudget ? "Clonar Mês Anterior" : "Criar Novo Orçamento"}
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {hasPreviousBudget 
                      ? "Comece com o orçamento do mês anterior e faça ajustes rápidos."
                      : "Crie seu primeiro orçamento definindo categorias e contas fixas."
                    }
                  </p>
                  
                  {(budgetCategories && budgetCategories.length > 0) && (
                    <div className="bg-muted/50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Total planejado</span>
                        <span className="font-medium text-foreground">R$ {totalPlanned.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Contas fixas</span>
                        <span className="font-medium text-foreground">R$ {totalFixed.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    variant="hero" 
                    size="lg" 
                    onClick={handleClone}
                    disabled={clonePreviousMonth.isPending}
                  >
                    <Copy className="w-5 h-5 mr-2" />
                    {hasPreviousBudget ? "Clonar Mês Anterior" : "Criar Orçamento"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === "edit" && !isMonthClosed && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Fixed Expenses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    Contas com Vencimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {fixedExpenses && fixedExpenses.length > 0 ? (
                    <div className="space-y-3">
                      {fixedExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{expense.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {expense.due_day ? `Vence dia ${expense.due_day}` : "Sem vencimento"}
                            </p>
                          </div>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                            <Input
                              type="number"
                              value={localFixedExpenses[expense.id] ?? Number(expense.amount)}
                              onChange={(e) => handleUpdateFixed(expense.id, Number(e.target.value))}
                              className="w-32 pl-9 text-right"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Plus}
                      title="Nenhuma conta fixa"
                      description="Adicione suas contas fixas nas configurações."
                    />
                  )}
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-primary" />
                    Categorias Variáveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categories && categories.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {categories.map((category) => {
                        const IconComponent = getIconComponent(category.icon);
                        return (
                          <div key={category.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <div className={`w-8 h-8 rounded-lg ${category.color} bg-opacity-20 flex items-center justify-center`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground text-sm">{category.name}</p>
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                              <Input
                                type="number"
                                value={localBudgetCategories[category.id] ?? 0}
                                onChange={(e) => handleUpdateCategory(category.id, Number(e.target.value))}
                                className="w-28 pl-9 text-right text-sm"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Plus}
                      title="Nenhuma categoria"
                      description="Categorias serão criadas automaticamente ao fazer login."
                    />
                  )}
                </CardContent>
              </Card>

              {/* Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Cartões de Crédito
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {creditCards && creditCards.length > 0 ? (
                    <div className="space-y-3">
                      {creditCards.map((card) => (
                        <div key={card.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{card.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Limite: R$ {Number(card.total_limit).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1 text-right">Teto mensal</p>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                              <Input
                                type="number"
                                value={localCardLimits[card.id] ?? Number(card.budget_limit)}
                                onChange={(e) => handleUpdateCard(card.id, Number(e.target.value))}
                                className="w-32 pl-9 text-right"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={CreditCard}
                      title="Nenhum cartão cadastrado"
                      description="Adicione seus cartões nas configurações."
                    />
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button variant="outline" onClick={() => setCurrentStep("clone")}>
                  Voltar
                </Button>
                <Button variant="hero" onClick={() => setCurrentStep("close")}>
                  Revisar e Fechar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === "close" && !isMonthClosed && (
            <motion.div
              key="close"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Resumo do Orçamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="p-4 bg-primary/5 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">Total Planejado</p>
                      <p className="text-2xl font-bold text-primary">R$ {totalPlanned.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">Contas Fixas</p>
                      <p className="text-2xl font-bold text-foreground">R$ {totalFixed.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="p-4 bg-secondary/10 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">Teto Cartões</p>
                      <p className="text-2xl font-bold text-secondary">R$ {totalCardLimit.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Após fechar o mês</p>
                      <p className="text-sm text-muted-foreground">
                        Você ainda poderá editar valores, mas as alterações serão marcadas como 
                        "editado após fechamento" para transparência.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <Button variant="outline" onClick={() => setCurrentStep("edit")}>
                      Voltar para Edição
                    </Button>
                    <Button variant="ritual" onClick={() => setShowConfirmModal(true)}>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Fechar Mês de {monthNameCapitalized}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {isMonthClosed && (
            <motion.div
              key="closed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-2 border-secondary">
                <CardContent className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-10 h-10 text-secondary" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">🎉 Mês Fechado!</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {monthNameCapitalized} está definido. Agora é só acompanhar as transações e manter o controle.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-3 max-w-lg mx-auto">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Planejado</p>
                      <p className="text-lg font-bold text-foreground">R$ {totalPlanned.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Fixas</p>
                      <p className="text-lg font-bold text-foreground">R$ {totalFixed.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Cartões</p>
                      <p className="text-lg font-bold text-foreground">R$ {totalCardLimit.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm Modal */}
        <AnimatePresence>
          {showConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
              onClick={() => setShowConfirmModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Fechar o Mês?</h3>
                  <p className="text-muted-foreground mb-6">
                    Você poderá editar valores depois, mas as alterações serão marcadas.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowConfirmModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      variant="ritual" 
                      className="flex-1"
                      onClick={handleCloseMonth}
                      disabled={closeBudgetMonth.isPending}
                    >
                      Confirmar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
