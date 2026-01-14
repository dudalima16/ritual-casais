import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Inbox, 
  Filter,
  Check,
  AlertTriangle,
  ArrowLeftRight,
  Image,
  FileSpreadsheet,
  Home,
  ShoppingCart,
  Car,
  Heart,
  Gamepad2,
  GraduationCap,
  Shirt,
  MoreHorizontal,
  X
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: string | null;
  confidence: "high" | "medium" | "low";
  source: "print" | "ofx";
  isInternal: boolean;
  needsAction: boolean;
}

const mockTransactions: Transaction[] = [
  { id: "1", merchant: "PIX - Maria Santos", amount: 150.00, date: "2025-01-13", category: null, confidence: "low", source: "ofx", isInternal: false, needsAction: true },
  { id: "2", merchant: "TED Conta Conjunta", amount: 500.00, date: "2025-01-12", category: null, confidence: "low", source: "ofx", isInternal: true, needsAction: true },
  { id: "3", merchant: "Supermercado Extra", amount: 285.50, date: "2025-01-12", category: "Alimentação", confidence: "high", source: "print", isInternal: false, needsAction: false },
  { id: "4", merchant: "Uber", amount: 32.90, date: "2025-01-11", category: "Transporte", confidence: "high", source: "print", isInternal: false, needsAction: false },
  { id: "5", merchant: "Netflix", amount: 55.90, date: "2025-01-10", category: "Lazer", confidence: "high", source: "print", isInternal: false, needsAction: false },
  { id: "6", merchant: "Farmácia Drogasil", amount: 89.90, date: "2025-01-10", category: "Saúde", confidence: "medium", source: "print", isInternal: false, needsAction: false },
  { id: "7", merchant: "Pagamento Fatura Nubank", amount: 2500.00, date: "2025-01-09", category: null, confidence: "medium", source: "ofx", isInternal: true, needsAction: true },
];

const categories = [
  { name: "Moradia", icon: Home, color: "bg-blue-500" },
  { name: "Alimentação", icon: ShoppingCart, color: "bg-orange-500" },
  { name: "Transporte", icon: Car, color: "bg-purple-500" },
  { name: "Saúde", icon: Heart, color: "bg-red-500" },
  { name: "Lazer", icon: Gamepad2, color: "bg-pink-500" },
  { name: "Educação", icon: GraduationCap, color: "bg-indigo-500" },
  { name: "Vestuário", icon: Shirt, color: "bg-teal-500" },
  { name: "Outros", icon: MoreHorizontal, color: "bg-gray-500" },
];

type FilterType = "all" | "pending" | "internal";

export default function Transactions() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showCategoryModal, setShowCategoryModal] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "pending") return tx.needsAction;
    if (filter === "internal") return tx.isInternal;
    return true;
  });

  const pendingCount = transactions.filter((tx) => tx.needsAction).length;

  const handleCategorize = (transactionId: string, category: string) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === transactionId
          ? { ...tx, category, confidence: "high" as const, needsAction: false }
          : tx
      )
    );
    setShowCategoryModal(null);
    toast({
      title: "Categorizado!",
      description: `Transação marcada como ${category}`,
    });
  };

  const handleMarkAsInternal = (transactionId: string) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === transactionId
          ? { ...tx, isInternal: true, needsAction: false, category: "Movimentação Interna" }
          : tx
      )
    );
    setShowCategoryModal(null);
    toast({
      title: "Marcado como interno",
      description: "Esta transação não entrará no relatório Real",
    });
  };

  const getConfidenceBadge = (confidence: Transaction["confidence"]) => {
    switch (confidence) {
      case "high":
        return <Badge variant="secondary" className="bg-secondary/20 text-secondary">Alta</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-accent text-accent-foreground">Média</Badge>;
      case "low":
        return <Badge variant="destructive" className="bg-destructive/20 text-destructive">Baixa</Badge>;
    }
  };

  const selectedTransaction = transactions.find((tx) => tx.id === showCategoryModal);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Transações</h1>
            <p className="text-muted-foreground">
              {pendingCount > 0 ? `${pendingCount} transações precisam de ação` : "Todas as transações categorizadas"}
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 flex-wrap"
        >
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Todas
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
            className="gap-1"
          >
            <AlertTriangle className="w-4 h-4" />
            Pendentes
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-destructive text-destructive-foreground">
                {pendingCount}
              </span>
            )}
          </Button>
          <Button
            variant={filter === "internal" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("internal")}
            className="gap-1"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Internas
          </Button>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-primary" />
                Inbox
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {filteredTransactions.map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.03 }}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                        tx.needsAction ? "bg-accent/10 border border-accent/30" : "bg-muted/30"
                      }`}
                    >
                      {/* Source Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.source === "print" ? "bg-primary/10" : "bg-secondary/10"
                      }`}>
                        {tx.source === "print" ? (
                          <Image className="w-5 h-5 text-primary" />
                        ) : (
                          <FileSpreadsheet className="w-5 h-5 text-secondary" />
                        )}
                      </div>

                      {/* Transaction Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground truncate">{tx.merchant}</p>
                          {tx.isInternal && (
                            <Badge variant="outline" className="text-xs">Interna</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground">{tx.date}</span>
                          {tx.category && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              tx.category === "Movimentação Interna" 
                                ? "bg-muted text-muted-foreground"
                                : "bg-primary/10 text-primary"
                            }`}>
                              {tx.category}
                            </span>
                          )}
                          {getConfidenceBadge(tx.confidence)}
                        </div>
                      </div>

                      {/* Amount */}
                      <p className={`font-semibold text-right shrink-0 ${
                        tx.isInternal ? "text-muted-foreground" : "text-foreground"
                      }`}>
                        -R$ {tx.amount.toFixed(2).replace(".", ",")}
                      </p>

                      {/* Action Button */}
                      {tx.needsAction && (
                        <Button
                          variant="hero"
                          size="touch"
                          onClick={() => setShowCategoryModal(tx.id)}
                          className="shrink-0"
                        >
                          Categorizar
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredTransactions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Check className="w-12 h-12 mx-auto mb-3 text-secondary" />
                    <p className="font-medium">Tudo em dia!</p>
                    <p className="text-sm">Nenhuma transação pendente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Modal */}
        <AnimatePresence>
          {showCategoryModal && selectedTransaction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
              onClick={() => setShowCategoryModal(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-card rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div>
                    <h3 className="font-semibold text-foreground">Categorizar Transação</h3>
                    <p className="text-sm text-muted-foreground truncate">{selectedTransaction.merchant}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowCategoryModal(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Categories Grid */}
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">Selecione uma categoria:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category, index) => {
                      const Icon = category.icon;
                      return (
                        <motion.button
                          key={category.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.04 }}
                          onClick={() => handleCategorize(selectedTransaction.id, category.name)}
                          className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-primary/10 transition-colors text-left min-h-[56px] active:scale-[0.98]"
                        >
                          <div className={`w-10 h-10 rounded-lg ${category.color} bg-opacity-20 flex items-center justify-center`}>
                            <Icon className="w-5 h-5" style={{ color: category.color.replace("bg-", "") }} />
                          </div>
                          <span className="font-medium text-foreground text-sm">{category.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Internal Movement Option */}
                  {selectedTransaction.confidence === "low" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 pt-4 border-t border-border"
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3"
                        onClick={() => handleMarkAsInternal(selectedTransaction.id)}
                      >
                        <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
                        <span>Marcar como movimentação interna</span>
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Transferências entre contas e pagamentos de cartão não entram no Real
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
