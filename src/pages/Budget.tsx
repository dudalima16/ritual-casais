import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Copy, 
  Check, 
  Pencil, 
  Lock,
  ChevronRight,
  CreditCard,
  Home,
  ShoppingCart,
  Car,
  Heart,
  Gamepad2,
  GraduationCap,
  Shirt,
  MoreHorizontal,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const categoryIcons: Record<string, React.ReactNode> = {
  "Moradia": <Home className="w-4 h-4" />,
  "Alimentação": <ShoppingCart className="w-4 h-4" />,
  "Transporte": <Car className="w-4 h-4" />,
  "Saúde": <Heart className="w-4 h-4" />,
  "Lazer": <Gamepad2 className="w-4 h-4" />,
  "Educação": <GraduationCap className="w-4 h-4" />,
  "Vestuário": <Shirt className="w-4 h-4" />,
  "Outros": <MoreHorizontal className="w-4 h-4" />,
};

const initialBudget = {
  fixedExpenses: [
    { id: 1, name: "Aluguel", amount: 2500, dueDate: 5 },
    { id: 2, name: "Condomínio", amount: 600, dueDate: 10 },
    { id: 3, name: "Internet", amount: 150, dueDate: 15 },
    { id: 4, name: "Energia", amount: 250, dueDate: 20 },
  ],
  categories: [
    { name: "Moradia", planned: 3500 },
    { name: "Alimentação", planned: 1800 },
    { name: "Transporte", planned: 800 },
    { name: "Saúde", planned: 400 },
    { name: "Lazer", planned: 600 },
    { name: "Educação", planned: 500 },
    { name: "Vestuário", planned: 300 },
    { name: "Outros", planned: 400 },
  ],
  cards: [
    { id: 1, name: "Nubank Maria", limit: 5000, budgetLimit: 2000 },
    { id: 2, name: "Itaú Carlos", limit: 8000, budgetLimit: 3000 },
  ],
};

type Step = "clone" | "edit" | "close";

export default function Budget() {
  const [currentStep, setCurrentStep] = useState<Step>("clone");
  const [budget, setBudget] = useState(initialBudget);
  const [isMonthClosed, setIsMonthClosed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { toast } = useToast();

  const steps: { key: Step; label: string; description: string }[] = [
    { key: "clone", label: "Clonar", description: "Clone o mês anterior" },
    { key: "edit", label: "Ajustar", description: "Faça ajustes rápidos" },
    { key: "close", label: "Fechar", description: "Feche o orçamento" },
  ];

  const handleClone = () => {
    toast({
      title: "Mês clonado!",
      description: "O orçamento de dezembro foi copiado para janeiro.",
    });
    setCurrentStep("edit");
  };

  const handleUpdateCategory = (index: number, value: number) => {
    const newCategories = [...budget.categories];
    newCategories[index].planned = value;
    setBudget({ ...budget, categories: newCategories });
  };

  const handleUpdateFixed = (index: number, amount: number) => {
    const newFixed = [...budget.fixedExpenses];
    newFixed[index].amount = amount;
    setBudget({ ...budget, fixedExpenses: newFixed });
  };

  const handleUpdateCard = (index: number, budgetLimit: number) => {
    const newCards = [...budget.cards];
    newCards[index].budgetLimit = budgetLimit;
    setBudget({ ...budget, cards: newCards });
  };

  const handleCloseMonth = () => {
    setIsMonthClosed(true);
    setShowConfirmModal(false);
    toast({
      title: "🎉 Mês fechado com sucesso!",
      description: "O orçamento de janeiro está definido. Bom ritual!",
    });
  };

  const totalPlanned = budget.categories.reduce((acc, cat) => acc + cat.planned, 0);
  const totalFixed = budget.fixedExpenses.reduce((acc, exp) => acc + exp.amount, 0);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Ritual Dia 1</h1>
          <p className="text-muted-foreground">Janeiro 2025 • Meta: 10 minutos</p>
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
                  <h2 className="text-xl font-bold text-foreground mb-2">Clonar Dezembro 2024</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Comece com o orçamento do mês anterior e faça ajustes rápidos para janeiro.
                  </p>
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
                  <Button variant="hero" size="lg" onClick={handleClone}>
                    <Copy className="w-5 h-5 mr-2" />
                    Clonar Mês Anterior
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
                  <div className="space-y-3">
                    {budget.fixedExpenses.map((expense, index) => (
                      <div key={expense.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{expense.name}</p>
                          <p className="text-xs text-muted-foreground">Vence dia {expense.dueDate}</p>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                          <Input
                            type="number"
                            value={expense.amount}
                            onChange={(e) => handleUpdateFixed(index, Number(e.target.value))}
                            className="w-32 pl-9 text-right"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="grid gap-3 sm:grid-cols-2">
                    {budget.categories.map((category, index) => (
                      <div key={category.name} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          {categoryIcons[category.name]}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{category.name}</p>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                          <Input
                            type="number"
                            value={category.planned}
                            onChange={(e) => handleUpdateCategory(index, Number(e.target.value))}
                            className="w-28 pl-9 text-right text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="space-y-3">
                    {budget.cards.map((card, index) => (
                      <div key={card.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{card.name}</p>
                          <p className="text-xs text-muted-foreground">Limite: R$ {card.limit.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 text-right">Teto mensal</p>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                            <Input
                              type="number"
                              value={card.budgetLimit}
                              onChange={(e) => handleUpdateCard(index, Number(e.target.value))}
                              className="w-32 pl-9 text-right"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                      <p className="text-2xl font-bold text-secondary">
                        R$ {budget.cards.reduce((acc, c) => acc + c.budgetLimit, 0).toLocaleString('pt-BR')}
                      </p>
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
                      Fechar Mês de Janeiro
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
                    Janeiro 2025 está definido. Agora é só subir os prints e OFX toda quarta-feira!
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary font-medium">
                    <Lock className="w-4 h-4" />
                    Orçamento fechado em 8 minutos
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
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card rounded-2xl shadow-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Fechar Janeiro 2025?</h3>
                  <p className="text-muted-foreground mb-6">
                    O orçamento será definido como referência. Você ainda poderá editá-lo depois.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setShowConfirmModal(false)}>
                      Cancelar
                    </Button>
                    <Button variant="hero" className="flex-1" onClick={handleCloseMonth}>
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
